# Frontend deployment

```bash
npm ci
npm run lint
npm run build
```

`dist/` 为可部署静态文件。Nginx 配置需要同时处理 `/app-portfolio/` 的 SPA 回退和 `/app-portfolio/api/` 到后端 `/api/` 的路径转换。
