# 海融惠企模块开发计划

## 项目概述
海融惠企是一个金融服务聚合平台，用户可以浏览金融机构、查看产品、提交申请需求。用户信息从通用模块获取，无需单独登录。

## 开发范围
**仅包含移动端功能**，暂不包含后台管理功能（后台管理在另外项目实现）

## 移动端功能模块
1. 首页 - 品牌展示 + 分类导航
2. 机构查询 - 筛选、搜索、列表展示
3. 机构详情 - 机构信息 + 产品列表
4. 金融超市 - 场景化产品展示
5. 产品详情 - 产品信息 + 提供机构列表
6. 产品说明 - 单个机构产品详细说明
7. 我的收藏 - 收藏管理
8. 金融政策 - 政策列表和详情

## 开发计划

### Phase 1: 项目初始化和基础配置
- [ ] 安装前端依赖（Zustand、Axios、React Router、shadcn/ui、Tailwind CSS）
- [ ] 配置 Vite、Tailwind CSS、PostCSS
- [ ] 创建项目目录结构
- [ ] 配置 .env.example 和环境变量
- [ ] 创建 .gitignore

### Phase 2: 通用基础设施
- [ ] 创建 services/api.js（Axios 实例、拦截器、错误处理）
- [ ] 创建 services/userService.js（获取用户信息）
- [ ] 创建 services/locationService.js（获取定位信息）
- [ ] 创建 services/fileService.js（文件上传）
- [ ] 创建 store/userStore.js（用户全局状态）
- [ ] 创建 store/appStore.js（应用全局状态）
- [ ] 创建 hooks/useUser.js（用户 Hook）
- [ ] 创建 hooks/useLocation.js（定位 Hook）
- [ ] 创建 utils/constants.js（常量定义）
- [ ] 创建 utils/helpers.js（工具函数）

### Phase 3: 通用组件库
- [ ] 创建 components/common/Button.jsx
- [ ] 创建 components/common/Input.jsx
- [ ] 创建 components/common/Modal.jsx
- [ ] 创建 components/common/Toast.jsx
- [ ] 创建 components/common/Loading.jsx
- [ ] 创建 components/common/Empty.jsx
- [ ] 创建 components/common/Card.jsx
- [ ] 创建 components/common/Tabs.jsx
- [ ] 创建 components/layout/Header.jsx
- [ ] 创建 components/layout/Layout.jsx

### Phase 4: 海融惠企业务 Service 层
- [ ] 创建 modules/haironghuiqi/services/haironghuiqiService.js
  - 获取机构列表
  - 获取机构详情
  - 获取产品列表
  - 获取产品详情
  - 创建/更新申请需求
  - 获取政策列表
  - 收藏/取消收藏

### Phase 5: 海融惠企状态管理
- [ ] 创建 modules/haironghuiqi/store/haironghuiqiStore.js
  - 机构列表状态
  - 产品列表状态
  - 收藏状态
  - 申请需求状态
  - 政策列表状态

### Phase 6: 海融惠企页面开发 - 第一批
- [ ] 创建 modules/haironghuiqi/pages/Home.jsx（首页）
  - 品牌展示
  - 5个分类导航按钮
  - 静默登录逻辑

- [ ] 创建 modules/haironghuiqi/pages/InstitutionList.jsx（机构查询）
  - 分类筛选
  - 搜索功能
  - 机构列表展示
  - 收藏功能

- [ ] 创建 modules/haironghuiqi/pages/InstitutionDetail.jsx（机构详情）
  - 机构基本信息
  - 产品列表
  - 立即咨询按钮

### Phase 7: 海融惠企页面开发 - 第二批
- [ ] 创建 modules/haironghuiqi/pages/FinancialSupermarket.jsx（金融超市）
  - 场景标签分类
  - 产品卡片展示
  - 多标签筛选

- [ ] 创建 modules/haironghuiqi/pages/ProductDetail.jsx（产品详情）
  - 产品基本信息
  - 提供机构列表
  - 选择机构申请

- [ ] 创建 modules/haironghuiqi/pages/ProductDescription.jsx（产品说明）
  - 产品详细信息
  - 申请条件
  - 办理流程
  - 立即申请按钮

### Phase 8: 海融惠企页面开发 - 第三批
- [ ] 创建 modules/haironghuiqi/pages/MyCollections.jsx（我的收藏）
  - 收藏机构列表
  - 收藏产品列表
  - 取消收藏功能

- [ ] 创建 modules/haironghuiqi/pages/FinancialPolicy.jsx（金融政策）
  - 政策列表展示
  - 政策详情
  - 搜索和筛选
  - 相关产品推荐

### Phase 9: 海融惠企业务组件
- [ ] 创建 modules/haironghuiqi/components/InstitutionCard.jsx
- [ ] 创建 modules/haironghuiqi/components/ProductCard.jsx
- [ ] 创建 modules/haironghuiqi/components/PolicyCard.jsx
- [ ] 创建 modules/haironghuiqi/components/ApplicationForm.jsx（申请表单）
- [ ] 创建 modules/haironghuiqi/components/FilterBar.jsx（筛选条件栏）

### Phase 10: 路由配置和应用入口
- [ ] 配置 React Router
- [ ] 创建 App.jsx（应用主组件）
- [ ] 创建 main.jsx（React 入口）
- [ ] 配置模块路由
- [ ] 创建 styles/globals.css（全局样式）

### Phase 11: 集成和优化
- [ ] 集成所有页面和组件
- [ ] 测试各个功能流程
- [ ] 性能优化（代码分割、懒加载）
- [ ] 响应式设计调整
- [ ] 错误处理和异常提示

### Phase 12: 文档和部署
- [ ] 创建 README.md（项目文档）
- [ ] 创建 .env.example（环境变量模板）
- [ ] 创建 .gitignore
- [ ] 更新 package.json（启动脚本）

## 关键设计原则

1. **模块化**：每个页面独立，易于维护和扩展
2. **通用能力**：Service 层封装所有业务逻辑
3. **状态管理**：使用 Zustand 管理全局和模块状态
4. **组件规范**：使用 shadcn/ui + Tailwind CSS 保证一致性
5. **请求规范**：统一的 Axios 实例和拦截器
6. **简洁性**：代码尽量简洁，避免过度设计

## 技术栈

- **框架**：React 18+
- **构建工具**：Vite
- **状态管理**：Zustand
- **HTTP 客户端**：Axios
- **UI 组件**：shadcn/ui
- **样式**：Tailwind CSS
- **路由**：React Router v6

## 开发顺序建议

1. **优先级 1**（核心功能）：Phase 1-5 + Phase 6 + Phase 10
   - 完成基础设施和首页、机构查询、机构详情
   - 可以进行基本的功能测试

2. **优先级 2**（主要功能）：Phase 7 + Phase 9
   - 完成金融超市、产品详情、产品说明
   - 完成业务组件

3. **优先级 3**（辅助功能）：Phase 8
   - 完成我的收藏、金融政策

4. **优先级 4**（完善）：Phase 11-12
   - 集成、优化、文档

## 审核状态
- [ ] 计划已确认
- [ ] 开发进行中
- [ ] 开发完成

---

## 海融惠企首页开发计划（2026-05-19）

### 首页设计需求
- **背景**：全高、全宽背景图片（bg.png）
- **Logo**：距离顶部60px，尺寸484*88px，水平居中（logo.png）
- **产品分类入口**：
  - 开始位置：距离顶部686px
  - 尺寸：340*168px每个
  - 布局：2列5行（共5个）
  - 间距：上下40px，左右26px，两侧各24px
  - 资源：1.png - 5.png

### 响应式设计方案
- **方案**：基于视口宽度的相对布局
- **实现方式**：
  - 使用百分比和相对单位（rem、em）
  - 保持设计稿的比例关系
  - Logo、间距、卡片尺寸都基于视口宽度计算
  - 使用Flexbox/Grid实现自适应布局
  - 在不同屏幕尺寸下自动调整

### 首页开发任务清单

#### 第一阶段：创建首页组件
- [ ] 创建 `modules/haironghuiqi/pages/Home.jsx`
- [ ] 实现背景图片全屏展示
- [ ] 实现Logo定位和展示（相对单位）
- [ ] 实现产品分类网格布局（自适应）

#### 第二阶段：路由配置
- [ ] 在海融惠企模块配置首页路由
- [ ] 确保导航路径正确

#### 第三阶段：测试
- [ ] 验证布局和间距
- [ ] 验证资源文件加载
- [ ] 确保响应式表现

## 修订记录
| 版本 | 日期 | 修改内容 |
|------|------|--------|
| 1.0 | 2026-05-13 | 初版：海融惠企模块开发计划（仅移动端功能） |
| 1.1 | 2026-05-19 | 添加：海融惠企首页具体开发计划和设计需求 |
