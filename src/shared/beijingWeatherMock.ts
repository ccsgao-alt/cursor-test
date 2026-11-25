/**
 * 北京天气 Mock 数据与 DTO（联调约定见 docs/weather-api.md）。
 */

export type WeatherCondition = "晴" | "多云" | "阴" | "雨" | "雪";

export interface ForecastDayDto {
  date: string;
  dayLabel: string;
  condition: WeatherCondition | null;
  high: number | null;
  low: number | null;
}

export interface BeijingWeatherDto {
  city: string;
  condition: WeatherCondition | null;
  temp: number | null;
  mockTime: string | null;
  forecast: ForecastDayDto[];
}

export type WeatherScenario = "ok" | "fail" | "partial";

function beijingNow(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" }));
}

function toDateOnly(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toMockTimeIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}:${s}+08:00`;
}

export function buildBeijingWeather(at: Date = beijingNow()): BeijingWeatherDto {
  const base = new Date(at);
  const days = [0, 1, 2].map((offset) => {
    const d = new Date(base);
    d.setDate(d.getDate() + offset);
    return d;
  });
  const labels = ["今天", "明天", "后天"];
  const conditions: WeatherCondition[] = ["晴", "多云", "阴"];
  const highs = [10, 9, 7];
  const lows = [2, 1, 0];
  return {
    city: "北京",
    condition: "晴",
    temp: 8,
    mockTime: toMockTimeIso(base),
    forecast: days.map((d, i) => ({
      date: toDateOnly(d),
      dayLabel: labels[i],
      condition: conditions[i],
      high: highs[i],
      low: lows[i],
    })),
  };
}

export function buildPartialBeijingWeather(at: Date = beijingNow()): BeijingWeatherDto {
  const data = buildBeijingWeather(at);
  data.condition = null;
  data.temp = null;
  data.mockTime = null;
  data.forecast[1].condition = null;
  data.forecast[2].high = null;
  return data;
}

export function parseWeatherScenario(url: URL): WeatherScenario {
  const s = url.searchParams.get("scenario");
  if (s === "fail" || s === "partial") return s;
  return "ok";
}