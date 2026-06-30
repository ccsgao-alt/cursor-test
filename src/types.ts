export type JudgementStatus = "pending" | "todo" | "ignored";
export type HotspotSource = "Google Trends" | "CryptoPanic";
export type Sentiment = "positive" | "neutral" | "negative";

export interface SourcePolicy {
  refreshIntervalMinutes: number;
  retryAttempts: number;
  retryBackoffMs: number;
}

export interface HotspotSourceRecord {
  source: HotspotSource;
  sourceItemId: string;
  fetchedAt: string;
  url: string;
}

export interface Hotspot {
  id: string;
  title: string;
  source: HotspotSource;
  sources: HotspotSource[];
  sourceRecords: HotspotSourceRecord[];
  /** ISO 抓取时间 */
  fetchedAt: string;
  keywords: string[];
  summary: string;
  url: string;
  /** 搜索量/热度分数(展示用字符串) */
  volume: string;
  /** 趋势变化(展示用字符串) */
  trend: string;
  /** 用于基础去重 */
  dedupeKey: string;
  status: JudgementStatus;
}

export interface HotspotQuery {
  source?: string;
  /** 近 N 天,空为不限 */
  withinDays?: number;
  status?: JudgementStatus;
  keyword?: string;
}

export interface GoogleTrendsItem {
  id: string;
  keyword: string;
  traffic: number;
  trendDelta: number;
  fetchedAt: string;
  articleUrl: string;
  relatedQueries: string[];
  summary: string;
  geo: string;
}

export interface CryptoPanicItem {
  id: string;
  title: string;
  url: string;
  publishedAt: string;
  votes: number;
  sentiment: Sentiment;
  currencies: string[];
  tags: string[];
  summary: string;
}

export interface SourcePullResult<T> {
  source: HotspotSource;
  fetchedAt: string;
  items: T[];
  attempts: number;
}

export const STATUS_LABEL: Record<JudgementStatus, string> = {
  pending: "待评估",
  todo: "可跟进",
  ignored: "忽略",
};

export const SOURCE_POLICIES: Record<HotspotSource, SourcePolicy> = {
  "Google Trends": {
    refreshIntervalMinutes: 30,
    retryAttempts: 3,
    retryBackoffMs: 200,
  },
  CryptoPanic: {
    refreshIntervalMinutes: 10,
    retryAttempts: 3,
    retryBackoffMs: 200,
  },
};
