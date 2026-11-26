import type { Connect, Plugin } from "vite";
import {
  buildBeijingWeather,
  buildPartialBeijingWeather,
  parseWeatherScenario,
} from "./src/shared/beijingWeatherMock";

const API_PREFIX = "/api/weather/beijing";

function weatherHandler(
  req: Connect.IncomingMessage,
  res: Connect.ServerResponse,
  next: Connect.NextFunction,
): void {
  const raw = req.url ?? "";
  if (!raw.startsWith(API_PREFIX)) {
    next();
    return;
  }

  const url = new URL(raw, "http://localhost");
  const scenario = parseWeatherScenario(url);

  const send = (status: number, body: unknown) => {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.end(JSON.stringify(body));
  };

  setTimeout(() => {
    if (scenario === "fail") {
      send(503, { code: "WEATHER_UNAVAILABLE", message: "天气服务暂时不可用" });
      return;
    }
    const payload =
      scenario === "partial" ? buildPartialBeijingWeather() : buildBeijingWeather();
    send(200, payload);
  }, 450);
}

export function weatherApiPlugin(): Plugin {
  return {
    name: "beijing-weather-api",
    configureServer(server) {
      server.middlewares.use(weatherHandler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(weatherHandler);
    },
  };
}