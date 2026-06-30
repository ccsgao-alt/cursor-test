import type { Hotspot } from "../types";
import { STATUS_LABEL } from "../types";

interface Props {
  hotspot: Hotspot | null;
}

function fmtTime(iso: string): string {
  return iso.replace("T", " ").slice(0, 16);
}

export function DetailPanel({ hotspot }: Props) {
  if (!hotspot) {
    return (
      <aside className="detail">
        <div className="placeholder">点击左侧任意热点查看详情</div>
      </aside>
    );
  }

  return (
    <aside className="detail">
      <h2>{hotspot.title}</h2>
      <div className="meta">{hotspot.sources.join(" / ")} · {fmtTime(hotspot.fetchedAt)}</div>

      <div className="row">
        <div className="k">摘要</div>
        <div>{hotspot.summary}</div>
      </div>
      <div className="row">
        <div className="k">关键词</div>
        <div>{hotspot.keywords.map((k) => <span className="tag" key={k}>{k}</span>)}</div>
      </div>
      <div className="row">
        <div className="k">热度 / 趋势</div>
        <div>{hotspot.volume} · {hotspot.trend}</div>
      </div>
      <div className="row">
        <div className="k">判断状态</div>
        <div><span className={`badge ${hotspot.status}`}>{STATUS_LABEL[hotspot.status]}</span></div>
      </div>
      <div className="row">
        <div className="k">来源保留</div>
        <div>
          {hotspot.sourceRecords.map((record) => (
            <div key={`${record.source}:${record.sourceItemId}`}>
              {record.source} · {fmtTime(record.fetchedAt)} · <a href={record.url} target="_blank" rel="noopener">查看来源 ↗</a>
            </div>
          ))}
        </div>
      </div>

      <button
        className="primary"
        onClick={() => alert(`(Demo)已为「${hotspot.title}」创建内容任务`)}
      >
        创建内容任务
      </button>
    </aside>
  );
}
