import { CRYPTOPANIC_FIXTURES, GOOGLE_TRENDS_FIXTURES } from "../data/sourceFixtures";
import type {
  CryptoPanicItem,
  GoogleTrendsItem,
  Hotspot,
  HotspotQuery,
  HotspotSource,
  SourcePullResult,
} from "../types";
import { SOURCE_POLICIES } from "../types";

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function withRetry<T>(task: () => Promise<T>, retries: number, backoffMs: number): Promise<{ value: T; attempts: number }> {
  let attempt = 0;
  let lastError: unknown;

  while (attempt < retries) {
    attempt += 1;
    try {
      const value = await task();
      return { value, attempts: attempt };
    } catch (error) {
      lastError = error;
      if (attempt >= retries) break;
      await delay(undefined, backoffMs * attempt);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("热点拉取失败");
}

async function pullGoogleTrends(): Promise<SourcePullResult<GoogleTrendsItem>> {
  const policy = SOURCE_POLICIES["Google Trends"];
  const { value, attempts } = await withRetry(
    async () => delay(GOOGLE_TRENDS_FIXTURES, 180),
    policy.retryAttempts,
    policy.retryBackoffMs,
  );

  return {
    source: "Google Trends",
    fetchedAt: new Date().toISOString(),
    items: value,
    attempts,
  };
}

async function pullCryptoPanic(): Promise<SourcePullResult<CryptoPanicItem>> {
  const policy = SOURCE_POLICIES.CryptoPanic;
  const { value, attempts } = await withRetry(
    async () => delay(CRYPTOPANIC_FIXTURES, 180),
    policy.retryAttempts,
    policy.retryBackoffMs,
  );

  return {
    source: "CryptoPanic",
    fetchedAt: new Date().toISOString(),
    items: value,
    attempts,
  };
}

function normalizeText(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, " ").trim();
}

function toDedupeKey(title: string, keywords: string[]): string {
  const base = normalizeText(title) || normalizeText(keywords[0] ?? "");
  return base
    .split(" ")
    .filter(Boolean)
    .slice(0, 4)
    .join("-");
}

function formatTrend(delta: number): string {
  if (delta > 0) return `↑ ${delta}%`;
  if (delta < 0) return `↓ ${Math.abs(delta)}%`;
  return "→ 持平";
}

function mapGoogleTrends(item: GoogleTrendsItem): Hotspot {
  const keywords = [...new Set([item.keyword, ...item.relatedQueries])];
  const title = `Google Trends:'${item.keyword}' 搜索热度${item.trendDelta >= 0 ? "攀升" : "回落"}`;
  return {
    id: `google-trends:${item.id}`,
    title,
    source: "Google Trends",
    sources: ["Google Trends"],
    sourceRecords: [
      {
        source: "Google Trends",
        sourceItemId: item.id,
        fetchedAt: item.fetchedAt,
        url: item.articleUrl,
      },
    ],
    fetchedAt: item.fetchedAt,
    keywords,
    summary: item.summary,
    url: item.articleUrl,
    volume: item.traffic.toLocaleString("en-US"),
    trend: formatTrend(item.trendDelta),
    dedupeKey: toDedupeKey(item.keyword, keywords),
    status: item.trendDelta >= 50 ? "todo" : item.trendDelta < 0 ? "ignored" : "pending",
  };
}

function mapCryptoPanic(item: CryptoPanicItem): Hotspot {
  const keywords = [...new Set([...item.tags, ...item.currencies])];
  return {
    id: `cryptopanic:${item.id}`,
    title: `CryptoPanic:${item.title}`,
    source: "CryptoPanic",
    sources: ["CryptoPanic"],
    sourceRecords: [
      {
        source: "CryptoPanic",
        sourceItemId: item.id,
        fetchedAt: item.publishedAt,
        url: item.url,
      },
    ],
    fetchedAt: item.publishedAt,
    keywords,
    summary: item.summary,
    url: item.url,
    volume: item.votes.toLocaleString("en-US"),
    trend: item.sentiment === "positive" ? "↑ 情绪偏多" : item.sentiment === "negative" ? "↓ 情绪偏空" : "→ 情绪中性",
    dedupeKey: toDedupeKey(item.title, keywords),
    status: item.sentiment === "positive" && item.votes >= 180 ? "todo" : "pending",
  };
}

function pickPrimarySource(sources: HotspotSource[]): HotspotSource {
  return sources.includes("CryptoPanic") ? "CryptoPanic" : "Google Trends";
}

function aggregateHotspots(items: Hotspot[]): Hotspot[] {
  const merged = new Map<string, Hotspot>();

  for (const item of items) {
    const existing = merged.get(item.dedupeKey);
    if (!existing) {
      merged.set(item.dedupeKey, item);
      continue;
    }

    const primary = new Date(existing.fetchedAt).getTime() >= new Date(item.fetchedAt).getTime() ? existing : item;
    const secondary = primary === existing ? item : existing;

    const sources = [...new Set([...existing.sources, ...item.sources])];
    const sourceRecords = [...existing.sourceRecords, ...item.sourceRecords].sort(
      (a, b) => new Date(b.fetchedAt).getTime() - new Date(a.fetchedAt).getTime(),
    );
    const keywords = [...new Set([...existing.keywords, ...item.keywords])];

    merged.set(item.dedupeKey, {
      ...primary,
      source: pickPrimarySource(sources),
      sources,
      sourceRecords,
      keywords,
      fetchedAt: sourceRecords[0]?.fetchedAt ?? primary.fetchedAt,
      summary: primary.summary.length >= secondary.summary.length ? primary.summary : secondary.summary,
      volume: primary.volume,
      trend: primary.trend,
      url: primary.url,
      status: primary.status === "todo" || secondary.status === "todo" ? "todo" : primary.status,
    });
  }

  return [...merged.values()].sort((a, b) => new Date(b.fetchedAt).getTime() - new Date(a.fetchedAt).getTime());
}

interface HotspotStore {
  hotspots: Hotspot[];
  refreshedAt: string | null;
}

const store: HotspotStore = {
  hotspots: [],
  refreshedAt: null,
};

async function refreshStoreIfNeeded(): Promise<void> {
  const now = Date.now();
  const isGoogleExpired =
    !store.refreshedAt || now - new Date(store.refreshedAt).getTime() > SOURCE_POLICIES["Google Trends"].refreshIntervalMinutes * 60_000;
  const isCryptoExpired =
    !store.refreshedAt || now - new Date(store.refreshedAt).getTime() > SOURCE_POLICIES.CryptoPanic.refreshIntervalMinutes * 60_000;

  if (!isGoogleExpired && !isCryptoExpired && store.hotspots.length > 0) {
    return;
  }

  const [googleTrends, cryptoPanic] = await Promise.all([pullGoogleTrends(), pullCryptoPanic()]);
  const normalized = [
    ...googleTrends.items.map(mapGoogleTrends),
    ...cryptoPanic.items.map(mapCryptoPanic),
  ];

  store.hotspots = aggregateHotspots(normalized);
  store.refreshedAt = new Date().toISOString();
}

export async function fetchHotspots(query: HotspotQuery = {}): Promise<Hotspot[]> {
  await refreshStoreIfNeeded();

  const now = Date.now();
  const result = store.hotspots.filter((h) => {
    if (query.source && !h.sources.includes(query.source as HotspotSource)) return false;
    if (query.status && h.status !== query.status) return false;
    if (query.withinDays) {
      const days = (now - new Date(h.fetchedAt).getTime()) / 86_400_000;
      if (days > query.withinDays) return false;
    }
    if (query.keyword) {
      const hay = `${h.title} ${h.keywords.join(" ")} ${h.sources.join(" ")}`.toLowerCase();
      if (!hay.includes(query.keyword.toLowerCase())) return false;
    }
    return true;
  });

  return delay(result, 120);
}

export async function fetchHotspot(id: string): Promise<Hotspot | undefined> {
  await refreshStoreIfNeeded();
  return delay(store.hotspots.find((h) => h.id === id), 120);
}

export async function listSources(): Promise<HotspotSource[]> {
  await refreshStoreIfNeeded();
  return [...new Set(store.hotspots.flatMap((h) => h.sources))] as HotspotSource[];
}

export async function getRefreshMeta(): Promise<{ refreshedAt: string | null; policies: Record<HotspotSource, typeof SOURCE_POLICIES[HotspotSource]> }> {
  await refreshStoreIfNeeded();
  return {
    refreshedAt: store.refreshedAt,
    policies: SOURCE_POLICIES,
  };
}
