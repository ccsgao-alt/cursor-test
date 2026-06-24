import { useEffect, useMemo, useState } from "react";
import type { Hotspot, HotspotQuery } from "./types";
import { fetchHotspots, listSources } from "./api/hotspots";
import { HOTSPOTS } from "./data/hotspots";
import { StatCards } from "./components/StatCards";
import { Filters } from "./components/Filters";
import { HotspotTable } from "./components/HotspotTable";
import { DetailPanel } from "./components/DetailPanel";

export function App() {
  const [query, setQuery] = useState<HotspotQuery>({});
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);

  const sources = useMemo(() => listSources(), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchHotspots(query)
      .then((data) => {
        if (!cancelled) setHotspots(data);
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

  return (
    <>
      <header>
        <h1>热点工作台</h1>
        <p>统一查看与初筛多源热点</p>
      </header>

      <StatCards all={HOTSPOTS} filteredCount={hotspots.length} />

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
