# 北京天气 API 契约（前后端联调）

## 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/weather/beijing` | 当前天气 + 3 日预报（含今天） |

### 查询参数（联调 / 测试）

| 参数 | 值 | 行为 |
|------|-----|------|
| `scenario` | `fail` | 返回 HTTP 503 |
| `scenario` | `partial` | 返回 200，部分字段为 `null` |

正式环境不应依赖 `scenario`；仅用于本地 mock 与验收。

## 响应 200

```json
{
  "city": "北京",
  "condition": "晴",
  "temp": 8,
  "mockTime": "2026-11-25T10:31:00+08:00",
  "forecast": [
    {
      "date": "2026-11-25",
      "dayLabel": "今天",
      "condition": "晴",
      "high": 10,
      "low": 2
    }
  ]
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `city` | string | 固定「北京」 |
| `condition` | string \| null | 晴 / 多云 / 阴 / 雨 / 雪 |
| `temp` | number \| null | 当前气温（℃） |
| `mockTime` | string \| null | 模拟数据时间（ISO 8601，+08:00） |
| `forecast` | array | 固定 3 条，含今天 |
| `forecast[].date` | string | `YYYY-MM-DD` |
| `forecast[].dayLabel` | string | 今天 / 明天 / 后天 |
| `forecast[].condition` | string \| null | 同上 |
| `forecast[].high` / `low` | number \| null | 最高 / 最低温（℃） |

## 错误响应

```json
{
  "code": "WEATHER_UNAVAILABLE",
  "message": "天气服务暂时不可用"
}
```

HTTP 503。

## 前端配置

- 默认请求同源 `/api/weather/beijing`（Vite 插件在 `dev` / `preview` 提供 mock）。
- 覆盖后端地址：`VITE_WEATHER_API_URL`（完整 URL，可带查询参数）。

## 联调记录

| 日期 | 问题 | 结论 |
|------|------|------|
| 2026-11-25 | 后端未单独部署 | 使用 `vite.weatherApi.ts` 中间件对齐契约；生产由网关转发至真实服务 |
| 2026-11-26 | 同路由切换 `?state=` 验收态不更新 | `WeatherPage` 监听 `state` 查询参数并整页重置后重新 bootstrap |
| 2026-11-26 | 正常刷新无「刷新成功」横幅 | 任意成功刷新统一展示 success banner |
| 2026-11-26 | 顶栏链接色失效（`--wx-primary` 在 `.weather-page` 内） | 变量上提到 `.weather-shell` 包裹导航与内容 |