module.exports = {
  apps: [
    {
      // 应用名称
      name: 'app-portfolio-backend',

      // 启动脚本
      script: 'src/index.js',

      // 工作目录（相对于 ecosystem.config.js 所在目录）
      cwd: '.',

      // 环境变量
      env: {
        NODE_ENV: 'production',
        PORT: 8000,
      },

      // 日志文件（使用相对路径）
      out: './logs/out.log',
      error: './logs/error.log',

      // 日志格式
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // 实例数量（集群模式）
      instances: 1,

      // 执行模式：cluster 或 fork
      exec_mode: 'fork',

      // 自动重启
      autorestart: true,

      // 监听文件变化自动重启（生产环境建议关闭）
      watch: false,

      // 忽略监听的文件
      ignore_watch: ['node_modules', 'logs', 'dist'],

      // 最大内存限制
      max_memory_restart: '500M',

      // 优雅关闭超时时间（毫秒）
      kill_timeout: 5000,

      // 等待启动时间（毫秒）
      listen_timeout: 3000,

      // 启动失败重试次数
      max_restarts: 10,

      // 启动失败重试间隔（秒）
      min_uptime: '10s',

      // 环境变量文件
      env_file: '.env',
    }
  ],

  // 部署配置
  deploy: {
    production: {
      user: 'root',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'your-git-repo-url',
      path: '/app/backend',
      'post-deploy': 'npm install --production && pm2 reload ecosystem.config.js --env production',
      'pre-deploy-local': 'echo "Deploying to production"'
    }
  }
};
