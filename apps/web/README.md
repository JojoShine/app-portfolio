# App Portfolio Frontend

React + Vite 移动端聚合容器，使用 Ant Design Mobile 承载标准交互组件，Tailwind CSS 承载布局和品牌样式。

## 分层规则

- `app`：只处理容器级配置、路由和模块注册。
- `features`：聚合平台自身功能，例如应用目录。
- `shared`：可被所有应用复用的请求、会话、能力和组件。
- `modules`：业务应用，不得直接依赖其他业务应用。

应用目录由后端数据控制，应用路由必须在 `src/app/registry/applications.js` 显式注册。这样可以动态管理展示状态，同时不允许后端数据注入未经审核的前端代码。
