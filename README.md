# 热点工作台（XMA-8 / XMA-9）

统一热点工作台的列表浏览、数据源接入与基础聚合能力。React + Vite + TypeScript 前端，当前在 `src/api/` 内实现了可替换的数据源适配层、失败重试策略、统一字段映射与聚合存储；后续接入真实后端或正式 API 时，可保持页面组件不变，仅替换数据源拉取实现。

## 当前 MVP 能力

- **已接入数据源**：Google Trends、CryptoPanic
- **统一热点结构**：标题、来源、抓取时间、关键词、摘要、热度、趋势、状态、来源记录
- **基础聚合**：按标准化 `dedupeKey` 去重，合并多来源关键词与来源记录
- **来源保留**：聚合后仍保留每条热点的原始来源明细
- **拉取策略**：
  - Google Trends：30 分钟刷新一次
  - CryptoPanic：10 分钟刷新一次
  - 两个数据源均为 3 次重试 + 线性退避

## 运行

```bash
npm install
npm run dev
npm run build
```

## 结构

```text
src/
  api/hotspots.ts         # 数据源拉取、失败重试、统一映射、聚合存储
  data/sourceFixtures.ts  # Google Trends / CryptoPanic 模拟原始返回
  types.ts                # 统一热点结构、源数据结构、策略定义
  components/             # 列表、筛选、统计、详情
  App.tsx                 # 页面容器与状态管理
```

## 后续接真实源时建议

- 将 `sourceFixtures.ts` 替换为真实 API 调用
- 把当前内存 store 下沉到后端数据库或缓存层
- 将 `dedupeKey` 升级为更稳健的语义聚类或关键词归一化规则
- 为失败重试增加可观测性与错误上报
