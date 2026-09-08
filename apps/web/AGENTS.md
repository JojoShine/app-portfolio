# H5 前端编码约束

本目录及其子目录的新增与修改代码必须遵循以下规则。

## 目录与依赖

- 每个 H5 业务放在 `src/modules/<业务名>`；应用超市等独立功能放在 `src/features/<功能名>`。
- 业务按需使用 `pages`、`components`、`services`、`store`、`hooks`、`utils`、`assets`、`constants`，禁止创建空目录占位。
- 依赖方向固定为：页面 → 业务组件/Hook/Store/Service → `shared`。业务模块之间不得深层引用内部文件。
- 每个 H5 可以维护自己的组件体系和视觉样式；只有真正与业务及视觉无关的能力才放入 `shared`。

## 组件与页面

- 按业务职责拆分组件：独立、复杂或复用的区块应拆为组件；同一业务区块内高度相关的小组件可以放在同一文件，不强制组件与文件一一对应。
- 页面只负责路由参数、页面状态和组件编排。重复区块、复杂表单段、卡片、弹窗、筛选器应拆为业务组件。
- 组件不得直接请求接口；通用数据处理放 Hook 或工具文件，禁止持续扩张单个聚合页面文件。
- 不为一次性、三五行且无独立语义的结构机械拆组件，保持拆分边界清晰。

## 请求与 Service

- Axios 只能在 `src/shared/api/api.js` 中创建和配置；该文件统一处理基础地址、超时、Token、请求/响应拦截和标准错误。
- 页面、组件、Store 不得直接引入 Axios 或 `api.js`，必须通过所属业务的 Service 调用。
- Service 放在业务目录的 `services` 下，按后端业务实体或能力拆为 `<实体>.service.js`，一个文件只负责一个业务边界。
- Service 保持薄层：声明路径、参数和必要的接口数据映射；不得包含页面状态、提示文案、视图兜底或跨实体流程编排。
- `services/index.js` 只做导出；禁止把所有接口重新堆进单个“大 Service”文件。
- Token 由 `api.js` 自动携带，Service 不得手工拼接 `Authorization`。
- Mock 必须放在所属业务模块的 `mocks` 目录，并与真实接口保持相同请求、响应和错误契约；`shared` 不得保存任何业务 Mock 数据或业务接口实现。
- 应用启动层只负责按环境注册各业务 Mock 适配器，切换后端时不得修改页面和 Service 调用方式。

## 命名与质量

- 组件使用 PascalCase，Hook 使用 `useXxx`，Service 文件使用 `<entity>.service.js`，Store 使用 `<domain>Store.js`。
- 禁止无含义的 `common.js`、`utils2.js`、`service.js` 和超大 `index.jsx`。
- 修改后至少执行前端 lint 和 build；不得通过关闭规则或吞掉错误来通过检查。
