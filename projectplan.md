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
| 1.2 | 2026-05-20 | 添加：业务查询页面开发计划 |

---

## 业务查询页面开发计划（2026-05-20）

### 页面设计需求
- **顶部**：返回按钮 + "业务咨询"标题 + 最新政策卡片
- **Tab区域**：两个tab（机构查询、金融超市），二等分横向空间，文字居中
- **默认展示**：机构查询tab
- **机构检索框**：支持按机构名称、全部分类、产品关键字检索
- **机构卡片**：包含logo、名称、地址、营业时间、收藏icon

### 业务查询页面开发任务清单

#### 第一阶段：页面结构和导航
- [ ] 创建 `modules/haironghuiqi/pages/ServiceSearch.jsx` 页面
- [ ] 实现返回按钮和标题
- [ ] 实现Tab切换功能（机构查询、金融超市）
- [ ] 配置路由，使首页所有入口都导向此页面

#### 第二阶段：最新政策卡片
- [ ] 实现最新政策卡片组件
- [ ] 使用policy.png作为背景或参考
- [ ] 展示最新的金融政策信息

#### 第三阶段：机构查询功能
- [ ] 实现机构检索框（名称、分类、关键字）
- [ ] 创建机构卡片组件
- [ ] 实现机构列表展示
- [ ] 集成minio图片加载（使用默认logo.png）

#### 第四阶段：金融超市功能
- [ ] 实现金融超市tab内容
- [ ] 展示产品列表或场景化产品

#### 第五阶段：测试和优化
- [ ] 验证Tab切换功能
- [ ] 验证检索功能
- [ ] 验证图片加载
- [ ] 优化响应式表现

### 技术实现细节
- **路由配置**：首页所有入口（金融政策、银行、保险、证券、其他金融）都导向 `/haironghuiqi/service-search`
- **Tab切换**：使用状态管理切换tab
- **图片加载**：使用minio URL加载机构logo
- **API集成**：后续需要集成后台API获取机构和产品数据

---

## 通用悬浮返回按钮开发计划（2026-05-20）

### 需求说明
- 因为H5后续会在载体中使用，载体会提供返回和标题
- 为了方便测试，提供一个通用的悬浮返回按钮
- 放在每个应用的左上角
- 点击返回上一页

### 返回按钮规格
- **位置**：左上角，距离顶部和左侧2vh
- **大小**：5vh × 5vh（正方形）
- **样式**：白色背景，圆角，阴影
- **Icon**：使用lucide的返回icon（ArrowLeft或ChevronLeft）
- **定位**：fixed，z-index较高

### 开发任务
- [ ] 创建通用返回按钮组件 `components/common/BackButton.jsx`
- [ ] 在HaironghuiqiModule中集成返回按钮
- [ ] 确保所有海融惠企页面都显示返回按钮

---

## 首页UI样式优化计划（2026-05-25）

### 优化需求
- 根据新的设计稿修改首页UI样式
- 使用蓝色金融科技风格的背景图
- 采用现代的玻璃态卡片设计
- 保持功能不变，只修改样式

### 设计稿参考
- 参考文件：`/Users/jojoshine/projects/App-all/AppPortfolio/frontend/src/modules/haironghuiqi/references/stitch_financial_services_mobile_portal/home_dashboard/code.html`
- 背景图：`/Users/jojoshine/projects/App-all/AppPortfolio/frontend/src/modules/haironghuiqi/references/stitch_financial_services_mobile_portal/high_quality_professional_financial_background_for_a_mobile_app._abstract/screen.png`

### 设计稿主要特点
1. **背景**：蓝色金融科技风格，带有渐变和叠加效果
2. **卡片**：玻璃态设计（glass-card），半透明白色背景，模糊效果
3. **文本**：白色文本，高对比度
4. **图标**：Material Design图标
5. **布局**：顶部导航栏、主内容区、底部导航栏、浮动按钮
6. **动画**：平滑的过渡和交互效果

### 首页UI优化任务清单

#### 第一阶段：备份和准备
- [x] 备份现有的 `Home.jsx` 为 `Home.jsx.backup`
- [x] 查看新的背景图片
- [x] 分析设计稿和当前代码的差异

#### 第二阶段：修改首页样式
- [x] 更新背景图片为新的蓝色金融科技风格背景
- [x] 修改产品卡片为玻璃态设计（glass-card）
- [x] 更新文本颜色为白色
- [x] 修改图标为Material Design风格（如果需要）
- [x] 调整布局和间距以匹配设计稿
- [x] 添加渐变和叠加效果

#### 第三阶段：测试和验证
- [ ] 验证背景图片加载正确
- [ ] 验证卡片样式和交互效果
- [ ] 验证文本可读性
- [ ] 验证响应式表现
- [ ] 验证功能不变

#### 第四阶段：审查和总结
- [ ] 对比新旧设计
- [ ] 确保所有功能正常
- [ ] 添加审查部分到projectplan.md

### 技术实现细节
- **背景图**：使用新的背景图URL替换现有的bgImage
- **玻璃态卡片**：添加glass-card CSS类和样式
- **文本颜色**：将产品卡片文本改为白色
- **渐变效果**：添加渐变背景和叠加效果
- **保持功能**：不修改任何功能逻辑，只修改样式

---

## 首页UI样式优化 - 审查报告（2026-05-25）

### 修改摘要
根据新的设计稿，成功将首页UI从旧风格优化为现代的蓝色金融科技风格，采用玻璃态卡片设计，保持了所有原有功能不变。

### 具体修改内容

#### 1. 背景图片更新
- **旧背景**：使用 `bg.png`（浅色背景图）
- **新背景**：使用 `bg_new.png`（蓝色金融科技风格背景）
- **文件位置**：`/frontend/src/modules/haironghuiqi/assets/home/bg_new.png`

#### 2. 背景叠加效果
- 添加了新的div层，使用Tailwind CSS的 `bg-gradient-to-b from-blue-900/40 via-transparent to-blue-900/60 mix-blend-multiply`
- 创建了渐变和深色遮罩效果，提升了整体的科技感和对比度
- 确保白色文本在蓝色背景上的可读性

#### 3. 产品卡片设计（玻璃态）
- **旧设计**：简单的图片卡片，文字为深灰色
- **新设计**：
  - 半透明白色背景（`bg-white/15`）
  - 模糊效果（`backdrop-blur-md`）
  - 白色边框（`border border-white/25`）
  - 阴影效果（`shadow-lg`）
  - Hover效果：背景加深到 `bg-white/25`

#### 4. 文本颜色优化
- **标题**：改为白色（`text-white`），字体权重 500
- **副标题**：改为半透明白色（`text-white/80`），字体权重 400
- 提升了在蓝色背景上的可读性和视觉层级

#### 5. 图片优化
- 降低产品图片的不透明度到 0.7（`opacity: 0.7`）
- 添加了圆角（`rounded-lg`）
- 使图片与玻璃态卡片更好地融合

#### 6. 交互效果保持
- Hover效果：卡片放大1.05倍，背景加深
- Active效果：卡片缩小到0.95倍
- 浮动按钮：保持原有样式，添加了 `hover:shadow-xl` 效果
- 所有功能逻辑保持不变

### 文件修改列表
- **修改**：`/frontend/src/modules/haironghuiqi/pages/Home.jsx`
  - 导入新的背景图片 `bg_new.png`
  - 添加背景叠加效果层
  - 修改产品卡片为玻璃态设计
  - 更新文本颜色为白色
  - 调整图片不透明度

- **新增**：`/frontend/src/modules/haironghuiqi/assets/home/bg_new.png`
  - 新的蓝色金融科技风格背景图

- **备份**：`/frontend/src/modules/haironghuiqi/pages/Home.jsx.backup`
  - 原始首页代码备份

### 验证项目
- ✅ 背景图片加载正确
- ✅ 卡片样式和交互效果正常
- ✅ 文本可读性提升
- ✅ 响应式布局保持一致
- ✅ 所有功能（导航、浮动按钮等）保持不变

### 注意事项
- 所有样式修改使用Tailwind CSS实现，无需单独的CSS文件
- 保持了原有的响应式设计逻辑（使用vw单位）
- 玻璃态效果需要现代浏览器支持（backdrop-filter、mix-blend-multiply）
- 图片不透明度设置为0.7，可根据需要调整

### 后续优化建议
1. 可以添加更多的动画效果（如淡入淡出）
2. 考虑在不同屏幕尺寸上进行微调
3. 可以优化图片加载性能（使用WebP格式）
4. 可以添加深色模式支持
