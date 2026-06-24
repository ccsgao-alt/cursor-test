import type { HotspotQuery, JudgementStatus } from "../types";
import { STATUS_LABEL } from "../types";

interface Props {
  sources: string[];
  query: HotspotQuery;
  onChange: (next: HotspotQuery) => void;
  onReset: () => void;
}

const TIME_OPTIONS = [
  { value: 1, label: "近 24 小时" },
  { value: 3, label: "近 3 天" },
  { value: 7, label: "近 7 天" },
];

export function Filters({ sources, query, onChange, onReset }: Props) {
  return (
    <section className="filters">
      <div className="field">
        <label>来源</label>
        <select
          value={query.source ?? ""}
          onChange={(e) => onChange({ ...query, source: e.target.value || undefined })}
        >
          <option value="">全部</option>
          {sources.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>时间范围</label>
        <select
          value={query.withinDays ?? ""}
          onChange={(e) =>
            onChange({ ...query, withinDays: e.target.value ? Number(e.target.value) : undefined })
          }
        >
          <option value="">全部</option>
          {TIME_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>判断状态</label>
        <select
          value={query.status ?? ""}
          onChange={(e) =>
            onChange({ ...query, status: (e.target.value || undefined) as JudgementStatus | undefined })
          }
        >
          <option value="">全部</option>
          {(Object.keys(STATUS_LABEL) as JudgementStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>关键词搜索</label>
        <input
          type="text"
          placeholder="标题 / 关键词"
          value={query.keyword ?? ""}
          onChange={(e) => onChange({ ...query, keyword: e.target.value || undefined })}
        />
      </div>

      <button onClick={onReset}>重置</button>
    </section>
  );
}
