export function formatMockTime(iso: string | null | undefined): string {
  if (!iso) return "暂无数据";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "暂无数据";
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${m}月${day}日 ${h}:${min}`;
}

export function formatForecastDate(date: string, label: string): string {
  const d = new Date(`${date}T12:00:00+08:00`);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${label} ${m}/${day}`;
}

export const WEATHER_ICONS: Record<string, string> = {
  晴: "☀️",
  多云: "⛅",
  阴: "☁️",
  雨: "🌧️",
  雪: "❄️",
};