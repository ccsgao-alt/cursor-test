import type { Hotspot } from "../types";
import { STATUS_LABEL } from "../types";

interface Props {
  hotspots: Hotspot[];
  loading: boolean;
  error: string | null;
  activeId: string | null;
  onSelect: (id: string) => void;
}

function fmtTime(iso: string): string {
  return iso.replace("T", " ").slice(0, 16);
}

export function HotspotTable({ hotspots, loading, error, activeId, onSelect }: Props) {
  let body;
  if (loading) {
    body = <tr className="state-row"><td colSpan={5}>加载中…</td></tr>;
  } else if (error) {
    body = <tr className="state-row"><td colSpan={5}>加载失败:{error}</td></tr>;
  } else if (hotspots.length === 0) {
    body = <tr className="state-row"><td colSpan={5}>没有符合条件的热点</td></tr>;
  } else {
    body = hotspots.map((h) => (
      <tr
        key={h.id}
        className={h.id === activeId ? "active" : ""}
        onClick={() => onSelect(h.id)}
      >
        <td>
          <div className="title">{h.title}</div>
          <div className="summary">{h.summary}</div>
        </td>
        <td>{h.sources.join(" / ")}</td>
        <td>{fmtTime(h.fetchedAt)}</td>
        <td>{h.keywords.map((k) => <span className="tag" key={k}>{k}</span>)}</td>
        <td><span className={`badge ${h.status}`}>{STATUS_LABEL[h.status]}</span></td>
      </tr>
    ));
  }

  return (
    <table>
      <thead>
        <tr>
          <th>标题 / 摘要</th>
          <th>来源</th>
          <th>抓取时间</th>
          <th>关键词</th>
          <th>状态</th>
        </tr>
      </thead>
      <tbody>{body}</tbody>
    </table>
  );
}
