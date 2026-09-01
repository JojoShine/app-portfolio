# 后端编码约束

本目录及其子目录的新增与修改代码必须遵循以下规则。

## 模块边界

- 通用平台能力放在 `src/system/<模块>`，H5 业务放在 `src/modules/<业务>`，公共基础设施放在 `src/common` 或 `src/config`。
- 每个业务按需使用 `routes`、`controllers`、`services`、`validations`、`domain`、`db`、`utils`；禁止创建空目录占位。
- 模块只能通过自身 `index.js` 暴露路由或公开能力，禁止其他模块深层引用内部实现。

## 分层职责

- Route 只负责路径、鉴权、中间件、校验和 Controller 绑定，不写业务逻辑。
- Controller 只读取请求、调用 Service、转换 HTTP 响应；一个业务实体或用例一份 Controller 文件，禁止单个聚合 Controller 无限增长。
- Service 按实体或明确业务能力拆为 `<entity>.service.js`，负责业务规则、事务和跨数据表协作；不得依赖 `req`、`res`。
- Validation 负责所有外部输入校验；Controller 和 Service 不重复散落字段校验。
- Prisma 查询和事务通过模块 `db` 提供的客户端执行；不得重新引入 Sequelize，也不得维护重复 Model 类。

## 数据与接口

- Prisma schema 按领域归档在 `prisma/schema`，迁移统一放在 `prisma/migrations`；字段、表和枚举需要清晰中文注释。
- 日期时间统一按项目约定的时区读写，禁止在业务代码中零散修正时区。
- 接口统一使用公共成功响应、错误类型和错误处理中间件，禁止 Controller 自行创造不一致的返回结构。
- 认证和权限必须由统一中间件处理；业务代码不得相信前端传入的用户身份或权限字段。
- 上传文件只保存文件标识和业务关系，文件内容经统一 MinIO 能力处理。

## 命名与质量

- 一个文件只承担一个清晰业务边界；`index.js` 只负责组装和导出，不承载业务实现。
- 禁止无含义的通用文件和把多个实体继续堆入单个 Controller、Service 或 Validation 文件。
- 新接口的命名、参数和错误码须与对应 H5 Service 一致；修改后执行相关测试或启动验证。
