/**
 * 编译期应用注册表。数据库目录决定“展示什么”，此处决定“前端真正能运行什么”。
 * 新应用必须显式注册，避免后端数据可以注入任意前端路由。
 *
 * 示例：
 * {
 *   id: 'sample',
 *   path: '/sample',
 *   load: () => import('../../modules/sample'),
 * }
 */
export const applicationModules = Object.freeze([
  {
    id: 'enrollment',
    path: '/enrollment',
    load: () => import('../../modules/enrollment'),
  },
]);

export const registeredApplicationPaths = new Set(
  applicationModules.map((application) => application.path)
);
