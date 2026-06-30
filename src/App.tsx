import { useEffect, useMemo, useState } from "react";
import type { Hotspot, HotspotQuery, HotspotSource } from "./types";
import { fetchHotspots, getRefreshMeta } from "./api/hotspots";
import { StatCards } from "./components/StatCards";
import { Filters } from "./components/Filters";
import { HotspotTable } from "./components/HotspotTable";
import { DetailPanel } from "./components/DetailPanel";

function fmtTime(iso: string | null): string {
  if (!iso) return "-";
  return iso.replace("T", " ").slice(0, 16);
}

export function App() {
  const [query, setQuery] = useState<HotspotQuery>({});
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sources, setSources] = useState<HotspotSource[]>([]);
  const [refreshedAt, setRefreshedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([fetchHotspots(query), getRefreshMeta()])
      .then(([data, meta]) => {
        if (cancelled) return;
        setHotspots(data);
        setSources(Object.keys(meta.policies) as HotspotSource[]);
        setRefreshedAt(meta.refreshedAt);
        setActiveId((prev) => (prev && data.some((h) => h.id === prev) ? prev : data[0]?.id ?? null));
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "未知错误");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  const active = activeId == null ? null : hotspots.find((h) => h.id === activeId) ?? null;
  const total = useMemo(() => hotspots.length, [hotspots]);

  return (
    <>
      <header>
        <h1>热点工作台</h1>
        <p>统一查看与初筛多源热点</p>
        <p>最近聚合时间：{fmtTime(refreshedAt)}</p>
      </header>

      <StatCards all={hotspots} filteredCount={total} />

      <Filters
        sources={sources}
        query={query}
        onChange={setQuery}
        onReset={() => setQuery({})}
      />

      <div className="layout">
        <div className="list-wrap">
          <HotspotTable
            hotspots={hotspots}
            loading={loading}
            error={error}
            activeId={activeId}
            onSelect={setActiveId}
          />
        </div>
        <DetailPanel hotspot={active} />
      </div>
    </>
  );
}
