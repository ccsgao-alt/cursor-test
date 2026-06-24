# 热点工作台（XMA-9）

统一热点工作台的列表浏览与初筛能力。React + Vite + TypeScript 前端,数据走本地 mock 接口层(`src/api/`),后续接入真实数据源(XMA-8)时仅替换 api 层即可,组件无需改动。

## 功能

- **热点列表**:标题、来源、抓取时间、关键词、摘要等核心字段
- **筛选**:按来源、时间范围、判断状态筛选 + 关键词搜索(联动)
- **状态**:加载中 / 报错 / 空结果
- **统计卡片**:热点总数、待评估、可跟进、当前筛选结果
- **详情面板**:点击行查看完整信息,并可(演示)创建内容任务

## 运行

```bash
npm install
npm run dev      # 本地开发
npm run build    # 类型检查 + 生产构建
```

## 结构

```
src/
  api/hotspots.ts      # mock 接口层(模拟延迟与服务端筛选)
  data/hotspots.ts     # 演示数据
  types.ts             # 类型定义
  components/          # StatCards / Filters / HotspotTable / DetailPanel
  App.tsx              # 页面容器与状态管理
```

> `prototype/index.html` 为最初的单文件静态原型,保留作参考。
