import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchBeijingWeather } from "../api/weather";
import type { BeijingWeatherDto, DemoWeatherState } from "../types/weather";
import type { WeatherScenario } from "../shared/beijingWeatherMock";
import { formatForecastDate, formatMockTime, WEATHER_ICONS } from "../weather/format";
import "../weather/weather.css";

type Phase = "idle" | "loading";

function parseDemoState(raw: string | null): DemoWeatherState | null {
  const allowed: DemoWeatherState[] = [
    "normal",
    "first-load",
    "first-fail",
    "refreshing",
    "refresh-success",
    "refresh-fail",
    "partial",
  ];
  if (raw && (allowed as string[]).includes(raw)) return raw as DemoWeatherState;
  return null;
}

function scenarioForDemo(state: DemoWeatherState | null, isRefresh: boolean): WeatherScenario {
  if (state === "first-fail" && !isRefresh) return "fail";
  if (state === "refresh-fail" && isRefresh) return "fail";
  if (state === "partial") return "partial";
  return "ok";
}

function CurrentWeather({ data }: { data: BeijingWeatherDto }) {
  const timeStr = data.mockTime
    ? `模拟数据时间：${formatMockTime(data.mockTime)}`
    : "模拟数据时间：暂无数据";
  const showIcon = data.condition != null;
  return (
    <>
      <p className="current-city">{data.city || "北京"}</p>
      <div className="current-main">
        {showIcon ? (
          <span className="weather-icon" aria-hidden="true">
            {WEATHER_ICONS[data.condition!] || "·"}
          </span>
        ) : null}
        <div>
          {data.condition == null ? (
            <span className="no-data">暂无数据</span>
          ) : (
            <span className="condition-text">{data.condition}</span>
          )}
        </div>
      </div>
      {data.temp == null ? (
        <span className="no-data temp-now">暂无数据</span>
      ) : (
        <p className="temp-now">{data.temp}℃</p>
      )}
      <p className="mock-time">{timeStr}</p>
    </>
  );
}

function ForecastList({ forecast }: { forecast: BeijingWeatherDto["forecast"] }) {
  return (
    <div className="forecast-list">
      {forecast.map((row) => {
        const cond =
          row.condition == null ? (
            <span className="no-data">暂无数据</span>
          ) : (
            row.condition
          );
        const high = row.high != null ? `最高 ${row.high}℃` : "最高 暂无数据";
        const low = row.low != null ? `最低 ${row.low}℃` : "最低 暂无数据";
        const day =
          row.dayLabel && row.date ? (
            formatForecastDate(row.date, row.dayLabel)
          ) : (
            <span className="no-data">暂无数据</span>
          );
        return (
          <article className="forecast-item" key={`${row.date}-${row.dayLabel}`}>
            <div className="forecast-day">{day}</div>
            <div className="forecast-condition">{cond}</div>
            <div className="forecast-temp">
              {high} / {low}
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function WeatherPage() {
  const [searchParams] = useSearchParams();
  const demoState = useMemo(() => parseDemoState(searchParams.get("state")), [searchParams]);

  const [data, setData] = useState<BeijingWeatherDto | null>(null);
  const [lastGood, setLastGood] = useState<BeijingWeatherDto | null>(null);
  const [lastGoodTime, setLastGoodTime] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>(demoState === "first-load" ? "loading" : "idle");
  const [firstLoadFailed, setFirstLoadFailed] = useState(false);
  const [refreshFailed, setRefreshFailed] = useState(demoState === "refresh-fail");
  const [refreshOkBanner, setRefreshOkBanner] = useState(demoState === "refresh-success");
  const liveRef = useRef<HTMLParagraphElement>(null);
  const booted = useRef(false);

  const announce = useCallback((msg: string) => {
    const el = liveRef.current;
    if (!el) return;
    el.textContent = "";
    requestAnimationFrame(() => {
      el.textContent = msg;
    });
  }, []);

  const load = useCallback(
    async (opts: { isRefresh: boolean; forceOk?: boolean }) => {
      const { isRefresh, forceOk } = opts;
      if (demoState === "first-load") return;

      setPhase("loading");
      if (!lastGood && !data) setFirstLoadFailed(false);
      if (isRefresh) {
        setRefreshOkBanner(false);
        setRefreshFailed(false);
      }

      const scenario: WeatherScenario = forceOk
        ? "ok"
        : scenarioForDemo(demoState, isRefresh);

      try {
        const next = await fetchBeijingWeather(scenario);
        if (demoState === "refresh-fail" && isRefresh && !forceOk) {
          throw new Error("refresh fail");
        }
        setData(next);
        setLastGood(next);
        setLastGoodTime(next.mockTime);
        setFirstLoadFailed(false);
        setRefreshFailed(false);
        setPhase("idle");
        if (isRefresh && demoState === "refresh-success") {
          setRefreshOkBanner(true);
          announce("刷新成功");
        } else if (isRefresh) {
          announce("天气数据已刷新");
        } else {
          announce("天气数据已加载");
        }
      } catch {
        setPhase("idle");
        if (!lastGood && !isRefresh) {
          setData(null);
          setFirstLoadFailed(true);
          announce("加载失败");
        } else {
          setRefreshFailed(true);
          if (lastGood) {
            setData({ ...lastGood, mockTime: lastGoodTime ?? lastGood.mockTime });
          }
          announce("刷新失败，当前展示上次数据");
        }
      }
    },
    [announce, data, demoState, lastGood, lastGoodTime],
  );

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    if (demoState === "first-load") return;
    if (
      demoState === "refreshing" ||
      demoState === "refresh-fail" ||
      demoState === "refresh-success"
    ) {
      void fetchBeijingWeather("ok").then((seed) => {
        setData(seed);
        setLastGood(seed);
        setLastGoodTime(seed.mockTime);
        if (demoState === "refreshing") setPhase("loading");
      });
      return;
    }
    void load({ isRefresh: false });
  }, [demoState, load]);

  const refreshing = phase === "loading" && !!lastGood;
  const initialLoading = phase === "loading" && !lastGood && !firstLoadFailed;

  const refreshDisabled =
    initialLoading ||
    refreshing ||
    demoState === "first-load" ||
    (firstLoadFailed && !lastGood);

  const refreshLabel = refreshing ? "刷新中…" : "刷新";

  return (
    <>
      <nav className="weather-top-nav" aria-label="应用导航">
        <Link to="/">热点工作台</Link>
        <Link to="/weather" aria-current="page">
          北京天气
        </Link>
      </nav>

      <main className="weather-page">
        <header className="page-header">
          <div className="title-block">
            <h1>北京天气</h1>
            <span className="mock-badge" role="status">
              模拟数据
            </span>
          </div>
          <button
            type="button"
            className="btn-refresh"
            aria-label="刷新天气数据"
            disabled={refreshDisabled}
            onClick={() => void load({ isRefresh: true })}
          >
            {refreshLabel}
          </button>
        </header>

        {refreshFailed ? (
          <div className="banner error" role="alert">
            <span>刷新失败，当前展示上次数据</span>
            <button
              type="button"
              className="btn-primary"
              onClick={() => void load({ isRefresh: true, forceOk: true })}
            >
              重新刷新
            </button>
          </div>
        ) : null}

        {refreshOkBanner ? (
          <div className="banner success" role="status" aria-live="polite">
            刷新成功
          </div>
        ) : null}

        <section className="card" aria-labelledby="current-heading">
          <h2 className="section-title" id="current-heading">
            当前天气
          </h2>
          {demoState === "first-load" || initialLoading ? (
            <>
              <div className="skeleton-block sk-line short" />
              <div className="skeleton-block sk-line wide" />
              <div className="skeleton-block sk-temp" />
              <div className="skeleton-block sk-line" />
              <p className="loading-hint" role="status">
                天气加载中…
              </p>
            </>
          ) : firstLoadFailed ? (
            <div className="empty-state">
              <p role="alert">天气加载失败，请重试</p>
              <button type="button" className="btn-primary" onClick={() => void load({ isRefresh: false, forceOk: true })}>
                重试
              </button>
            </div>
          ) : data ? (
            <CurrentWeather data={data} />
          ) : null}
        </section>

        <section className="card" aria-labelledby="forecast-heading">
          <h2 className="section-title" id="forecast-heading">
            3 天天气预报（含今天）
          </h2>
          {demoState === "first-load" || initialLoading ? (
            <div className="forecast-list">
              {[1, 2, 3].map((k) => (
                <div className="forecast-item" key={k}>
                  <div className="skeleton-block sk-line short" />
                  <div className="skeleton-block sk-line" style={{ width: "50%" }} />
                </div>
              ))}
            </div>
          ) : firstLoadFailed ? (
            <div className="empty-state">
              <p className="no-data" style={{ color: "var(--wx-muted)" }}>
                —
              </p>
            </div>
          ) : data ? (
            <ForecastList forecast={data.forecast} />
          ) : null}
        </section>

        <p className="disclaimer">仅用于协作演练，不作为真实天气决策依据</p>
        <p className="sr-only" ref={liveRef} aria-live="polite" aria-atomic="true" />
      </main>
    </>
  );
}