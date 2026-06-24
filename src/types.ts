export type JudgementStatus = "pending" | "todo" | "ignored";

export interface Hotspot {
  id: number;
  title: string;
  source: string;
  /** ISO 抓取时间 */
  fetchedAt: string;
  keywords: string[];
  summary: string;
  url: string;
  /** 搜索量(展示用字符串) */
  volume: string;
  /** 趋势变化(展示用字符串) */
  trend: string;
  status: JudgementStatus;
}

export interface HotspotQuery {
  source?: string;
  /** 近 N 天,空为不限 */
  withinDays?: number;
  status?: JudgementStatus;
  keyword?: string;
}

export const STATUS_LABEL: Record<JudgementStatus, string> = {
  pending: "待评估",
  todo: "可跟进",
  ignored: "忽略",
};
