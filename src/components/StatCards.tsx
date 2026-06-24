import type { Hotspot } from "../types";

interface Props {
  all: Hotspot[];
  filteredCount: number;
}

export function StatCards({ all, filteredCount }: Props) {
  const by = (s: Hotspot["status"]) => all.filter((h) => h.status === s).length;
  const cards = [
    { num: all.length, label: "热点总数" },
    { num: by("pending"), label: "待评估" },
    { num: by("todo"), label: "可跟进" },
    { num: filteredCount, label: "当前筛选结果" },
  ];
  return (
    <section className="stats">
      {cards.map((c) => (
        <div className="stat-card" key={c.label}>
          <div className="num">{c.num}</div>
          <div className="label">{c.label}</div>
        </div>
      ))}
    </section>
  );
}
