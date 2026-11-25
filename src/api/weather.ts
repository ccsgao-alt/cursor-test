import type { BeijingWeatherDto, WeatherScenario } from "../shared/beijingWeatherMock";
import { buildBeijingWeather, buildPartialBeijingWeather } from "../shared/beijingWeatherMock";

const DEFAULT_PATH = "/api/weather/beijing";

function resolveUrl(scenario?: WeatherScenario): string {
  const base = import.meta.env.VITE_WEATHER_API_URL?.trim() || DEFAULT_PATH;
  if (!scenario || scenario === "ok") return base;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}scenario=${scenario}`;
}

export class WeatherApiError extends Error {
  readonly status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "WeatherApiError";
    this.status = status;
  }
}

async function parseResponse(res: Response): Promise<BeijingWeatherDto> {
  if (!res.ok) {
    let message = `请求失败（${res.status}）`;
    try {
      const body = (await res.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      /* ignore */
    }
    throw new WeatherApiError(message, res.status);
  }
  return (await res.json()) as BeijingWeatherDto;
}

/** 从后端拉取北京天气；`scenario` 仅用于联调 mock */
export async function fetchBeijingWeather(scenario?: WeatherScenario): Promise<BeijingWeatherDto> {
  const url = resolveUrl(scenario);
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  return parseResponse(res);
}

/** 无后端时的本地回退（仅开发兜底，与 mock 数据结构一致） */
export function localBeijingWeather(partial = false): BeijingWeatherDto {
  return partial ? buildPartialBeijingWeather() : buildBeijingWeather();
}