export type {
  BeijingWeatherDto,
  ForecastDayDto,
  WeatherCondition,
  WeatherScenario,
} from "../shared/beijingWeatherMock";

export type DemoWeatherState =
  | "normal"
  | "first-load"
  | "first-fail"
  | "refreshing"
  | "refresh-success"
  | "refresh-fail"
  | "partial";