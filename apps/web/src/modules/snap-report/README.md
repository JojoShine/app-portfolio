# 随手拍本地与部署配置

前端使用真实 API，应用超市及招生可继续使用其现有 Mock。随手拍不会注册业务 Mock。

1. 启动项目现有 PostgreSQL、MinIO，执行后端 `prisma:generate`、`db:migrate`。
2. 启动后端和前端。进入 `/snap-report` 自动复用外层身份，不提供独立登录页或短信弹层。
3. 本地没有真实令牌时，使用与图书馆相同的 `test-parent-001` 预置身份获取开发令牌；请求仍经统一 API 客户端，后端检查 `ENABLE_DEV_AUTH` 与回环地址。生产构建不自动签发开发身份，复用宿主传入的令牌。
4. 主页面宽度为外层容器的 100%，没有 390/430px 上限；底部操作栏和弹层通过容器尺寸同步，随窗口变化重新计算。
5. AI 配置 `SNAP_AI_URL`（完整 chat/completions 地址）、`SNAP_AI_KEY`、`SNAP_AI_MODEL`。模型须兼容 messages 中的 image_url/base64 图片输入及文本 JSON 输出。未配置时显示暂不可用，支持手动完成上报。
6. 地图：后端配置 `AMAP_REST_KEY`；前端配置 `VITE_AMAP_JS_KEY` 和 `VITE_AMAP_SECURITY_CODE`（高德 JS API 的浏览器配置，并配置域名白名单）。未配置时地图选点不可用，但文字地址可正常确认。浏览器 GPS 由后端转换后进行逆地理编码，仅接受海安市行政区。
7. 手机访问相机和定位通常需要 HTTPS 或 localhost 安全上下文。

公网部署必须关闭开发认证、使用独立强 JWT/存储密钥和 HTTPS。当前请求频率限制为单进程，横向扩容时在网关统一限流。

地图接入依据：[JS 地图事件](https://lbs.amap.com/api/javascript-api-v2/guide/events/map_overlay)、[地理/逆地理编码](https://developer.amap.com/api/webservice/guide/api/georegeo)。

视觉依据：`docs/snap-report/images/report-confirmation-v3.png`。页面使用真实表单和用户照片，不以效果图充当页面。
