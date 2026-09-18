# 书香海安图书馆服务应用设计文档

> 文档状态：视觉稿生成依据  
> 版本：1.0  
> 更新日期：2026-09-17  
> 关联需求：[requirement.md](./requirement.md)

## 1. 设计目标

本设计将“书香海安”建设为与现有 App Portfolio 基础设施一致的独立全栈模块。产品应同时具备公共服务的清晰可靠和城市阅读品牌的人文气质。

设计采用以下边界：

- 业务数据使用真实 PostgreSQL，不在页面中维护 Mock 业务状态。
- 图书封面、活动图片和专题图片使用 MinIO 与现有文件服务。
- 本地和后续部署使用同一套业务代码、数据结构与 API，仅替换环境配置。
- 复用现有认证、统一响应、错误处理中间件、请求客户端和应用注册机制。
- 不引入与当前项目风格不一致的新框架、状态层或接口抽象。

## 2. 项目结构

前期材料与视觉资产统一放在：

```text
docs/library/
├── requirement.md
├── design.md
├── ui-design.md
└── images/
    ├── home.png
    ├── catalog.png
    ├── book-detail.png
    ├── borrowing-service.png
    ├── book-reservations.png
    ├── seat-selection.png
    ├── reading-events.png
    ├── event-detail.png
    ├── reading-plan.png
    ├── branch-detail.png
    ├── messages.png
    └── profile.png
```

前端模块按现有应用规范新增：

```text
apps/web/src/modules/library/
├── index.jsx
├── LibraryApp.jsx
├── library.css
├── components/
├── hooks/
├── pages/
├── services/
└── utils/
```

后端模块按现有分层规范新增：

```text
apps/api/src/modules/library/
├── index.js
├── routes/
│   └── index.js
├── controllers/
├── services/
├── validations/
└── db/
    └── index.js
```

Prisma 模型放在：

```text
apps/api/prisma/schema/modules/library/schema.prisma
```

数据库变更继续使用：

```text
apps/api/prisma/migrations/<timestamp>_add_library/
```

## 3. 系统架构

```text
移动端页面
  ↓ hooks / page state
library services
  ↓ shared axios client
/api/library 路由
  ↓ controller → validation → service
Prisma / PostgreSQL
  ↘ system file service → MinIO
```

### 3.1 前端职责

- 页面负责布局、交互状态、加载状态和错误反馈。
- hooks 负责请求生命周期、分页、防抖和刷新。
- services 只封装 API 路径与参数，不包含业务规则。
- 认证继续使用共享 session store 与 identity capability。
- 需要跨页面保留的短期 UI 状态优先使用路由参数或局部状态；不为该模块新增全局状态框架。

### 3.2 后端职责

- controller 读取请求并输出统一响应。
- validation 校验参数、分页和枚举。
- service 执行业务规则、权限检查和事务。
- db 统一暴露 Prisma 客户端，与现有模块保持一致。
- 所有关键写操作以数据库当前状态为准，不信任前端计算结果。

### 3.3 认证策略

- 首页、馆藏、图书详情、活动和分馆查询为公开接口。
- 借阅、预约、收藏、活动报名、阅读记录和消息接口要求 `requireAuth`。
- 前端收到 401 后沿用现有机制清理会话并显示登录入口。
- 开发环境可复用现有 development token 能力，但真实业务接口不因开发模式绕过权限规则。

## 4. 前端路由与页面组成

`LibraryApp` 内部使用 `/library/*` 子路由：

| 路径 | 页面 | 权限 |
| --- | --- | --- |
| `/library` | 首页 | 公开 |
| `/library/catalog` | 馆藏搜索与分类 | 公开 |
| `/library/books/:id` | 图书详情 | 公开 |
| `/library/services` | 借阅与预约服务 | 登录后完整可用 |
| `/library/services/loans` | 当前/历史借阅 | 登录 |
| `/library/services/book-reservations` | 图书预约 | 登录 |
| `/library/services/seats` | 座位预约 | 登录 |
| `/library/events` | 活动发现 | 公开 |
| `/library/events/:id` | 活动详情 | 公开，报名需登录 |
| `/library/reading-plan` | 阅读挑战与打卡 | 登录 |
| `/library/profile` | 我的 | 游客/登录双态 |
| `/library/messages` | 消息中心 | 登录 |

底部导航只在五个一级页面显示；详情和流程页使用返回导航，避免同时出现两套主导航。

## 5. 页面布局设计

### 5.1 首页

- 顶部品牌区不使用传统政务 App 的大色块导航栏。
- 首屏由品牌、当前分馆、馆藏搜索和一个编辑式阅读视觉构成。
- 搜索框是首屏唯一主操作，宽度占满内容区。
- 快捷服务使用四个简洁入口，不使用四张独立悬浮卡片。
- 登录用户的借阅提醒使用横向纸签式模块；游客显示克制的登录引导。
- “今日一书”采用一本重点书封与短推荐语，不展示电商价格或促销语言。
- “海安共读”使用错落书架式布局，避免三等分卡片。
- 活动、分馆和公告使用分隔线与留白组织，减少卡片嵌套。

### 5.2 馆藏页

- 顶部固定搜索，筛选通过底部抽屉展开。
- 分类导航可横向滚动，但页面本身不得横向溢出。
- 搜索结果使用封面 + 文字 + 馆藏状态的纵向列表。
- 可借数量使用朱砂色强调，其他标签保持中性。
- 图书详情以书封和书目信息为视觉中心，馆藏列表采用结构化行，不做商品规格卡片。
- 底部操作区最多一个主按钮，次操作使用文字或描边按钮。

### 5.3 服务页

- 首屏优先展示当前借阅和到期风险，不做统计仪表盘。
- 每本借阅图书保持封面、到期日、状态和操作的清晰层级。
- 不可续借时按钮禁用，并在按钮附近直接说明原因。
- 图书预约和座位预约作为后续服务分区，不与借阅信息争夺首屏焦点。
- 座位图采用稳定网格，状态由填充、边框和文字/图例共同表达。

### 5.4 活动页

- 顶部主题视觉使用真实阅读场景图片，并以纸张蒙版保证文字可读性。
- 活动列表交替使用图片条带和分隔列表，避免重复等宽卡片。
- 日期切换保持简洁，不模拟复杂日历应用。
- 活动详情的主操作随报名状态变化：报名、候补、查看凭证或已结束。

### 5.5 我的页面

- 游客态以登录和读者证说明为主，不展示大量空模块。
- 登录态以读者证、四项业务摘要和阅读计划为核心。
- 设置类入口使用分组列表，不使用独立卡片矩阵。
- 借阅二维码只在用户主动展开时显示，避免首屏暴露。

## 6. 数据模型

以下模型使用 `Library` 前缀，数据库表使用 `library_` 前缀，避免与其他模块冲突。

### 6.1 基础内容

#### LibraryBranch

- `id`：UUID
- `name`：分馆名称
- `address`：地址
- `phone`：联系电话
- `openingHours`：开放时间说明
- `status`：open / closed / temporary_closed
- `facilities`：JSON 设施标签
- `latitude`、`longitude`：可选，仅用于后续地图能力
- `imageFileId`：可选文件引用
- `sort`、`createdAt`、`updatedAt`

#### LibraryBook

- `id`：UUID
- `title`、`subtitle`
- `author`、`publisher`
- `publishedYear`
- `isbn`：唯一
- `category`
- `description`、`catalogSummary`
- `coverFileId`：文件引用
- `localTopic`：是否为海安地方专题
- `popularity`：排序权重
- `createdAt`、`updatedAt`

#### LibraryHolding

- `id`：UUID
- `bookId`、`branchId`
- `floor`、`area`、`callNumber`
- `totalCopies`、`availableCopies`
- `accessType`：lendable / reading_room_only
- 对 `bookId + branchId + callNumber` 建唯一约束

### 6.2 读者业务

#### LibraryReader

- `id`：UUID
- `userId`：平台用户 ID，唯一
- `cardNumber`：读者证号，唯一
- `displayName`
- `status`：active / suspended / expired
- `validUntil`
- `annualGoal`
- `createdAt`、`updatedAt`

#### LibraryLoan

- `id`：UUID
- `readerId`、`holdingId`
- `borrowedAt`、`dueAt`、`returnedAt`
- `renewalCount`
- `status`：borrowed / returned / overdue
- 对 reader、status 和 dueAt 建索引

#### LibraryBookReservation

- `id`：UUID
- `readerId`、`bookId`、`pickupBranchId`
- `status`：queued / ready / fulfilled / cancelled / expired
- `queuePosition`
- `readyAt`、`expiresAt`
- `createdAt`、`updatedAt`
- 服务层保证同一读者与图书只有一个有效预约

#### LibraryShelfItem

- `id`：UUID
- `readerId`、`bookId`
- `type`：favorite / want_to_read / reading / finished
- `createdAt`、`updatedAt`
- `readerId + bookId + type` 唯一

### 6.3 座位

#### LibrarySeat

- `id`：UUID
- `branchId`
- `floor`、`area`、`label`
- `type`：standard / powered / accessible
- `status`：active / unavailable
- `branchId + label` 唯一

#### LibrarySeatSlot

- `id`：UUID
- `branchId`
- `date`
- `startsAt`、`endsAt`
- 用于固定预约时段和可用性查询

#### LibrarySeatReservation

- `id`：UUID
- `readerId`、`seatId`、`slotId`
- `status`：reserved / checked_in / completed / cancelled / missed
- `checkInCode`
- `createdAt`、`checkedInAt`、`completedAt`
- `seatId + slotId` 对有效预约保持唯一

### 6.4 活动与阅读

#### LibraryEvent

- `id`：UUID
- `title`、`summary`、`description`
- `category`
- `branchId`
- `startsAt`、`endsAt`、`registrationEndsAt`
- `capacity`
- `ageGroup`
- `status`：draft / published / completed / cancelled
- `coverFileId`
- `agenda`、`guestInfo`、`notice`：JSON 或文本

#### LibraryEventRegistration

- `id`：UUID
- `eventId`、`readerId`
- `status`：registered / waitlisted / checked_in / cancelled
- `checkInCode`
- `createdAt`、`checkedInAt`
- `eventId + readerId` 唯一

#### LibraryReadingCheckIn

- `id`：UUID
- `readerId`
- `bookId`：可选
- `readingDate`
- `minutes`
- `note`
- `createdAt`

#### LibraryMessage

- `id`：UUID
- `readerId`
- `type`
- `title`、`content`
- `targetType`、`targetId`
- `priority`：normal / high
- `readAt`
- `createdAt`

## 7. API 设计

所有路径挂载在 `/api/library`，成功响应使用现有 `{ code: 0, message, data }` 格式。

### 7.1 公开查询

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| GET | `/home` | 首页聚合内容；登录时附带个人提醒 |
| GET | `/branches` | 分馆列表 |
| GET | `/branches/:id` | 分馆详情 |
| GET | `/books` | 馆藏搜索、筛选、排序、分页 |
| GET | `/books/:id` | 图书与各分馆馆藏详情 |
| GET | `/categories` | 馆藏分类 |
| GET | `/events` | 活动筛选、日历与分页 |
| GET | `/events/:id` | 活动详情 |
| GET | `/seats/availability` | 指定分馆、日期和时段的座位余量 |

`GET /books` 参数：

- `q`
- `branchId`
- `category`
- `availability`
- `publishedFrom`、`publishedTo`
- `sort`
- `page`、`pageSize`

### 7.2 登录后查询

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| GET | `/profile` | 读者信息与业务摘要 |
| GET | `/loans` | 当前/历史借阅 |
| GET | `/book-reservations` | 图书预约列表 |
| GET | `/seat-reservations` | 座位预约列表 |
| GET | `/event-registrations` | 活动报名列表 |
| GET | `/shelf` | 收藏和阅读状态 |
| GET | `/reading/summary` | 年度目标和阅读统计 |
| GET | `/reading/check-ins` | 阅读打卡 |
| GET | `/messages` | 消息列表 |

### 7.3 写操作

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| POST | `/loans/:id/renew` | 单本续借 |
| POST | `/loans/renew` | 批量续借 |
| POST | `/book-reservations` | 创建图书预约 |
| DELETE | `/book-reservations/:id` | 取消图书预约 |
| PUT | `/shelf/:bookId` | 设置收藏/阅读状态 |
| DELETE | `/shelf/:bookId` | 移除收藏/阅读状态 |
| POST | `/seat-reservations` | 创建座位预约 |
| POST | `/seat-reservations/:id/check-in` | 座位签到 |
| POST | `/seat-reservations/:id/complete` | 结束使用 |
| DELETE | `/seat-reservations/:id` | 取消座位预约 |
| POST | `/events/:id/registrations` | 活动报名或候补 |
| DELETE | `/events/:id/registrations/me` | 取消活动报名 |
| POST | `/events/:id/check-in` | 活动签到 |
| PUT | `/reading/goal` | 设置年度目标 |
| POST | `/reading/check-ins` | 新增阅读打卡 |
| PATCH | `/messages/:id/read` | 标记单条已读 |
| POST | `/messages/read-all` | 全部已读 |

### 7.4 并发与事务

- 续借在事务中重新读取借阅、读者和有效预约状态。
- 图书预约创建检查库存和重复有效预约。
- 座位预约必须用数据库唯一约束兜底，冲突返回 409。
- 活动报名在事务中计算已报名人数，容量已满时写入候补状态。
- 重复请求不得造成同一预约或报名重复创建。

## 8. 文件与 MinIO 设计

- 复用 `system/file` 模块，不建设 library 专用上传服务。
- 图书封面、活动主图和分馆图片作为公开文件记录保存。
- library 表只保存 `File.id`，API 映射为可访问的文件地址。
- seed 阶段导入的图片统一放入 MinIO，再写入对应文件记录。
- 删除仍被图书、活动或分馆引用的文件时由数据库外键或服务层拒绝。
- 视觉稿文件不上传 MinIO，保存在 `docs/library/images/`，仅作为设计依据。

## 9. 视觉系统：江海书卷

### 9.1 氛围参数

- 视觉主题：当代图书馆与独立出版物的结合。
- 密度：5/10，日常服务信息完整但不拥挤。
- 版式变化：7/10，使用错位网格与不对称留白。
- 动效：4/10，克制、安静、有纸页翻动的节奏。
- 关键词：温润、安静、可信、编辑感、地方文化、纸张触感。

### 9.2 色彩

全应用只使用一个有彩强调色，不混入政务蓝或紫色。

| 名称 | 色值 | 用途 |
| --- | --- | --- |
| 宣纸底 | `#F5F0E6` | 页面主背景 |
| 纯纸面 | `#FFFDF8` | 输入、弹层和必要的抬升表面 |
| 深墨 | `#22211E` | 主文字和主要图标，替代纯黑 |
| 淡墨 | `#6F6A61` | 次级文字、元数据 |
| 纸边 | `#D8D0C2` | 分隔线与控件边界 |
| 朱砂 | `#A84F3D` | 唯一品牌强调色、主按钮、选中状态 |
| 朱砂浅 | `#EAD8D1` | 选中背景和低强度提示 |
| 琥珀提示 | `#9A6B24` | 即将到期等警告信息 |
| 错误红 | `#9B3A32` | 逾期、错误和破坏性操作 |

朱砂色只用于有明确操作或状态意义的元素，同一屏幕不应大面积铺满。

### 9.3 字体

- 中文展示标题：优先使用具有现代宋体气质且可合法加载的中文字体；未引入字体资源时使用系统宋体回退。
- 中文正文：使用清晰的中文无衬线系统字体栈。
- 英文和数字展示：`Satoshi` 或同类 refined grotesk；未安装时回退系统无衬线。
- 索书号、ISBN、日期和编号：`Geist Mono` 或等宽系统字体。
- 禁止使用 Inter 作为品牌字体。
- 正文最小 14px，主要正文推荐 16px；辅助文字不得因视觉稿压缩到不可读。
- 标题通过字重、间距和颜色建立层级，不使用夸张超大字号。

建议字号：

| 层级 | 尺寸 | 行高 |
| --- | --- | --- |
| 品牌/首屏标题 | `clamp(28px, 8vw, 38px)` | 1.15 |
| 页面标题 | 24px | 1.25 |
| 区块标题 | 19px | 1.35 |
| 正文 | 16px | 1.65 |
| 元数据 | 14px | 1.5 |
| 索书号/辅助编号 | 12px | 1.4 |

### 9.4 网格与间距

- 页面内容宽度继承现有 760px H5 容器。
- 移动端左右安全边距 16px；宽屏 H5 使用 24–28px。
- 间距基准为 4px，主要间距使用 8、12、16、24、32、48px。
- 区块之间优先使用留白或顶部细分隔线，而不是全部包裹成卡片。
- 多列内容在 768px 以下全部折叠为单列。
- 禁止通过 `calc()` 百分比技巧拼装主要布局，优先 CSS Grid。
- 禁止内容重叠和绝对定位堆叠。

### 9.5 组件

#### 按钮

- 主按钮使用朱砂底、纯纸面文字、10px 圆角。
- 次按钮使用深墨文字和纸边描边。
- 按下时 `translateY(1px)`，无外发光。
- 禁用状态必须同时降低对比度并显示原因。

#### 卡片与分区

- 只有需要表达层级或可点击整体时使用卡片。
- 圆角范围 8–14px，不使用所有元素统一的大圆角。
- 阴影仅用于抽屉、底部操作区和浮层，使用背景色调的柔和阴影。
- 高频列表使用分隔线、留白和排版层级，不使用卡片套卡片。

#### 搜索与输入

- 标签置于输入框上方，不使用浮动标签。
- 搜索框高度至少 48px。
- 聚焦使用朱砂色内描边，不使用霓虹外发光。
- 错误信息紧贴控件下方展示。

#### 图片

- 书封固定使用 2:3 比例。
- 活动条带使用 16:9 或 3:2 比例，不混用随机裁切。
- 图片加载前使用同尺寸骨架，避免布局跳动。
- 首屏图片可使用纸张遮罩或渐隐，但文字不得直接压在复杂图像上。

#### 状态反馈

- 加载使用匹配布局的骨架，不使用全页旋转图标。
- 空状态说明原因，并提供下一步操作。
- 错误在对应模块内显示并提供重试。
- 业务冲突使用底部 sheet 或明确的内联提示，不只显示短暂 toast。

### 9.6 图形语言

- 使用书脊竖线、纸页切口、索书号、页码和细网格作为装饰语言。
- 图标采用统一、克制、略带书签切角的自定义感风格。
- 装饰资产只选择两类：细网格纹理、微型方向箭头。
- 不使用 emoji、随机贴纸、卡通气泡或通用开发者图标风格。

### 9.7 动效

- 页面切换和列表出现使用轻微淡入与纵向位移。
- 推荐列表使用短暂的级联出现，单项延迟不超过 50ms。
- 抽屉使用有重量感的上升动效。
- 按钮和卡片反馈使用 `transform` 与 `opacity`，不动画 `top/left/width/height`。
- 动效时长通常为 160–320ms，避免持续循环动画干扰阅读。
- `prefers-reduced-motion` 下关闭非必要动效。

### 9.8 明确禁止

- 禁止纯黑 `#000000`。
- 禁止紫色、蓝紫渐变和霓虹外发光。
- 禁止玻璃拟态、随机环境光斑和无意义渐变文字。
- 禁止三张等宽卡片横排。
- 禁止所有内容都放入悬浮大圆角卡片。
- 禁止居中堆叠的通用 Hero。
- 禁止自定义鼠标指针。
- 禁止“无缝、赋能、焕新、下一代”等空泛文案。
- 禁止虚构官方统计、真实嘉宾和政府通知。
- 禁止小于可读尺寸的标签和拥挤的首屏组件。

## 10. 生图要求

视觉确认阶段生成十二张独立移动端高保真图，覆盖主导航和关键业务流程；不生成一张包含多个小屏幕的拼贴图：

1. `docs/library/images/home.png`：首页。
2. `docs/library/images/catalog.png`：馆藏搜索、分类与筛选结果。
3. `docs/library/images/book-detail.png`：图书详情和分馆馆藏状态。
4. `docs/library/images/borrowing-service.png`：当前借阅、续借和座位预约摘要。
5. `docs/library/images/book-reservations.png`：图书预约及排队状态。
6. `docs/library/images/seat-selection.png`：分馆、时段与座位选择。
7. `docs/library/images/reading-events.png`：阅读活动发现页。
8. `docs/library/images/event-detail.png`：活动详情与报名状态。
9. `docs/library/images/reading-plan.png`：年度阅读计划与打卡。
10. `docs/library/images/branch-detail.png`：分馆详情和服务设施。
11. `docs/library/images/messages.png`：消息中心。
12. `docs/library/images/profile.png`：登录读者的个人中心。

每张视觉稿必须：

- 使用同一款克制的手机边框，画布留白均匀。
- 使用“江海书卷”统一色彩、字体、纹理、圆角和图标语言。
- 保证中文标题、按钮和核心业务状态可读。
- 只表现一个完整屏幕，不裁切旧图作为新页面。
- 体现真实移动应用的安全区和底部导航。
- 不把手机界面做成缩小版桌面网站。

视觉稿只用于确定风格和布局。最终实现以本文档的组件、状态、响应式和可访问性要求为准，不机械复制生图中的文字错误或不合理细节。

## 11. 错误与边界状态

- API 加载失败：当前区块显示错误和重试，不清空其他已加载内容。
- 搜索无结果：显示相近词与分类入口。
- 会话失效：清理会话，显示登录入口，并保留当前返回地址。
- 续借冲突：展示服务端返回的具体原因和未变化的到期日。
- 座位冲突：刷新座位余量并提示重新选择。
- 活动满员：自动进入候补前必须获得用户确认。
- 文件不可用：显示稳定比例的书封或活动占位，不产生布局跳动。

## 12. 测试策略

### 12.1 后端

- 路由权限：公开接口和登录接口边界正确。
- 服务规则：续借、图书预约、座位冲突、活动容量和用户数据隔离。
- 事务并发：同一座位和最后一个活动名额不会被重复占用。
- 分页和筛选：边界值、非法枚举和最大页大小。
- 文件权限：公开媒体可读取，未授权私有文件不可读取。

### 12.2 前端

- 五栏导航和详情页返回关系正确。
- 搜索、防抖、分页和筛选状态正确。
- 游客受保护操作进入登录，完成后回到原上下文。
- 加载、空、错误、成功和冲突状态可见。
- 320px 宽度无横向滚动，触控目标满足 44px。

### 12.3 完整验证

- 前端 lint 与 build。
- 后端 check 与 test。
- Prisma schema 校验、migration 和 seed。
- Docker PostgreSQL、MinIO、API、Web 的本地联调。
- 关键流程人工走查：搜索 → 详情 → 预约；借阅 → 续借；座位 → 预约 → 签到；活动 → 报名。

## 13. 部署迁移约束

- 数据库连接只通过 `DATABASE_URL` 配置。
- MinIO 地址、Bucket、访问凭据只通过环境变量配置。
- 不在业务代码中写死 localhost、端口、Bucket 或公开域名。
- 数据库迁移使用 Prisma migration，文件迁移保持对象 key 不变。
- 从本地 Docker 迁移到服务器或云服务时，不修改业务接口和前端调用。
