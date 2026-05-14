# AGENTS.md

这是本仓库给 Codex 使用的项目级工作说明。

## 项目定位

- 这是一个开源的虚拟电厂（VPP）展示平台，当前会基于它做公司内部的二次改造。
- 近期目标是对外展示用的大屏/门户，不强调真实业务闭环和生产可用性。
- 改造时优先做低成本调整：页面文案、品牌名称、配色、布局、图片、图表和静态数据。
- 保持整体风格贴近中文虚拟电厂场景，偏展示、偏大屏、偏可视化。

## 技术栈

- Vue 3.5 + TypeScript + Vite 6。
- Element Plus 作为基础 UI 组件库，`src/main.ts` 中已配置中文语言包。
- Pinia 已安装，但目前仅保留默认示例 `src/stores/counter.ts`。
- ECharts 通过 `src/components/chart/chart.vue` 和 `src/components/chart/baseOptions.ts` 统一封装。
- 地图类页面使用 AntV L7 + 高德地图。
- 页面中大量使用 UnoCSS 工具类。
- 全局样式通过 `src/assets/main.css` 和 `src/assets/element.scss` 统一控制。
- 多数页面使用 `autofit.js` 适配 1440 x 780 的大屏布局。

## 常用命令

- 安装依赖：`pnpm install`
- 启动开发服务：`pnpm serve`
- 生产构建（含类型检查）：`pnpm build`
- 仅构建：`pnpm build-only`
- 本地预览构建结果：`pnpm preview`
- 代码检查：`pnpm lint`
- 代码格式化：`pnpm format`

## 构建与部署

- Vite 开发端口是 `3333`，并配置了自动打开浏览器。
- 生产构建输出目录是 `docs/`。
- 当前 `base` 配置为 `/vpp`，如果部署路径不是这个前缀，需要提前调整。

## 目录说明

- `index.html`：Vite 入口页，挂载 `#app` 并加载 `src/main.ts`。
- `src/main.ts`：应用入口，注册路由、Pinia、Element Plus、UnoCSS 和 SVG 图标。
- `src/App.vue`：根容器，渲染顶部导航和路由内容。
- `src/router/index.ts`：全站路由定义。
- `src/components/nav/index.vue`：顶部导航和平台标题。
- `src/components/exteriorShell/index.vue`：通用面板外壳。
- `src/components/chart/`：ECharts 封装和图表配置工具。
- `src/views/`：各业务页面。
- `src/assets/`：图片、背景、图标和样式资源。
- `public/`：静态资源目录。
- `docs/`：构建产物目录，不直接手改。
- `auto-imports.d.ts`、`components.d.ts`：自动生成文件，通常不要手动改。

## 路由概览

- `/`：首页大屏。
- `/resources/metaAnalysis`：资源综合分析。
- `/resources/metaOverview`：资源管理总览。
- `/resources/metaEnroll`：资源注册。
- `/realTimeMonitor`：实时状态监测。
- `/forecast/DataQuery`：负荷预测数据查询。
- `/forecast/multiDimension`：多维度负荷预测。
- `/generationTask/priceSignal`：价格信号。
- `/generationTask/excitationSignal`：激励信号。
- `/task/motivational`：激励型信息。
- `/task/demandResponse`：需求响应详情。
- `/task/orderElectric`：有序用电详情。
- `/effect/technical`：技术参数考核。
- `/effect/deviation`：偏差率考核。

## 页面结构习惯

- 多数页面以 `index.vue` 作为布局壳，再拆成 `left.vue`、`center.vue`、`right.vue` 等局部组件。
- 地图类页面会在 `id="container"` 的节点上初始化 L7 `Scene`。
- 非地图页通常使用背景图 + 面板组件组合展示。
- 页面数据大多是静态写死的，这很适合做展示型改造。
- 修改文案时要注意大屏固定尺寸，避免中文过长导致溢出。

## 改造优先级

如果只是为了快速做成公司展示版，优先改这些地方：

- `src/components/nav/index.vue`：平台名称、导航菜单、顶栏文案。
- `src/router/index.ts`：页面入口、菜单结构、路由名称。
- `src/views/**/index.vue`、`left.vue`、`center.vue`、`right.vue`：各页面内容和静态数据。
- `src/assets/**`：背景图、图标、装饰图、地图叠加图。
- `README.md`：项目说明文档。

## 编辑约定

- 读写中文文件时统一使用 UTF-8。
- 优先沿用现有 Vue SFC 写法：`<script setup lang="ts">`、局部引入、`scoped` 样式。
- 保持现有的大屏科技感风格，除非用户明确要求整体重做。
- 不要直接改 `docs/` 来实现功能变化，应该改 `src/` 后重新构建。
- 尽量不要引入后端接口工作，当前代码里也没有真正使用中的 `axios/fetch` 业务链路。
- `docs/`、`node_modules/`、自动生成文件一般不要纳入常规业务修改。
- 地图页里写死的高德 token 和坐标，后续如果要公开展示，记得单独检查。

## 验证方式

- 对于较大的源码改动，优先跑 `pnpm build-only`。
- 牵涉公共逻辑或类型的改动，跑 `pnpm build` 更稳妥。
- 改页面后，启动 `pnpm serve` 看实际效果。
- 对于用户可以直接看到页面变化的修改，不必每次都重新构建；说明未跑构建即可。

## 额外说明

- 如果 Git 再次报 `dubious ownership`，可使用：

```powershell
git config --global --add safe.directory D:/GithubProject/AI-PBB
```

## 当前改造倾向

把这个项目当作一个静态、精致、可信的 VPP 展示平台来处理。优先保证：

- 品牌感统一
- 导航清晰
- 画面完整
- 数据看起来合理
- 演示流程稳定

先把“看起来像样”做到位，再考虑“能不能接真实业务系统”。
