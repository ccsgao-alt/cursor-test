import type { Hotspot, HotspotQuery } from "../types";
import { HOTSPOTS } from "../data/hotspots";

/**
 * Mock 接口层。模拟网络延迟与服务端筛选。
 * 接入真实后端(XMA-8)时,把这里替换为 fetch 调用即可,组件无需改动。
 */
function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function fetchHotspots(query: HotspotQuery = {}): Promise<Hotspot[]> {
  const now = Date.now();
  const result = HOTSPOTS.filter((h) => {
    if (query.source && h.source !== query.source) return false;
    if (query.status && h.status !== query.status) return false;
    if (query.withinDays) {
      const days = (now - new Date(h.fetchedAt).getTime()) / 86_400_000;
      if (days > query.withinDays) return false;
    }
    if (query.keyword) {
      const hay = (h.title + " " + h.keywords.join(" ")).toLowerCase();
      if (!hay.includes(query.keyword.toLowerCase())) return false;
    }
    return true;
  });
  return delay(result);
}

export function fetchHotspot(id: number): Promise<Hotspot | undefined> {
  return delay(HOTSPOTS.find((h) => h.id === id));
}

export function listSources(): string[] {
  return [...new Set(HOTSPOTS.map((h) => h.source))];
}
