# 平台架构边界

## 设计原则

1. 使用编译期注册与懒加载，不引入微前端运行时。
2. 应用之间不直接依赖，共享需求通过 `shared/capabilities` 下沉。
3. 数据库应用目录只控制展示与状态，不控制前端代码加载。
4. 身份由后端验证后的 JWT claims 产生，业务数据不信任 URL 或请求体中的用户 ID。
5. 默认最小权限：查询是否公开由领域明确决定，写操作必须显式授权。

## 新应用接入

1. 在 `frontend/src/modules/<app-id>` 创建独立模块。
2. 模块默认导出顶层 React 组件。
3. 在 `frontend/src/app/registry/applications.js` 注册 `id`、`path` 和 `load`。
4. 在数据库 `apps` 表增加相同 `path` 的目录记录。
5. 后端业务放入 `backend/src/modules/<app-id>`，使用 route/controller/service/model 分层。
6. 为应用路由声明公开、已登录或角色权限，并增加接口测试。

## 通用能力

- `identityCapability`：宿主令牌注入、当前用户和会话清理。
- `locationCapability`：浏览器定位能力与统一默认参数。
- `fileCapability`：受权文件上传、流式读取和 Blob URL 释放。

新能力只有在两个及以上应用需要，或明确属于宿主平台边界时，才下沉到 `shared`。
