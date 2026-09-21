# 政策智能匹配 Implementation Plan

> **执行方式：** 由当前会话直接完成，不使用子代理。步骤使用 checkbox（`- [ ]`）记录完成状态。

**Goal:** 在现有 App Portfolio 中交付一个无 TabBar、可嵌入载体的政策智能匹配全栈模块，支持个人/企业画像、规则匹配、政策解释、站内模拟申报和外部办理引导。

**Architecture:** 前端新增 `policy-match` 独立 H5 模块，页面只编排业务组件，通过模块 Service 调用统一 API。后端新增同名业务模块和 Prisma 领域模型，匹配引擎使用可单测的确定性规则，所有匹配结果保存画像、政策与规则版本快照。

**Tech Stack:** React 18、React Router、Zustand、Ant Design Mobile、Axios、Express 5、Prisma 6、PostgreSQL、Node.js test runner、Vite、ESLint。

**Spec:** `docs/policy-match/requirement.md`

## Global Constraints

- 产品是嵌入载体的移动端 H5 服务模块，不使用底部 TabBar。
- 首版只使用明确标注的通用演示政策数据，不绑定具体地区或伪造真实政务结果。
- 匹配使用确定性结构化规则，不接入大模型。
- 个人与企业画像、匹配快照和申请记录相互隔离。
- PostgreSQL 是业务数据唯一事实来源；文件内容走现有统一文件能力。
- 前端遵守 `apps/web/AGENTS.md`，后端遵守 `apps/api/AGENTS.md`。
- 修改现有已变更文件时保留工作区中的用户改动，只追加本模块所需内容。
- 开发开始前必须完成 `docs/policy-match/ui-design.md` 和关键页面视觉稿确认。

## Review Focus

- 画像中出现 `null`、空字符串或“不确定”时，匹配引擎应返回 `missing`，不能误判为满足或不满足；Task 3 的单元测试覆盖。
- 硬性条件不满足但评分条件很高时，结论仍必须为 `ineligible`；Task 3 的单元测试覆盖。
- 同一用户切换个人与企业身份后，只能读取对应主体的数据；Task 4 的接口测试覆盖。
- 重复点击提交或使用同一幂等键时，只能产生一份申请；Task 5 的接口测试覆盖。
- 政策截止、规则版本变化或草稿版本冲突时，服务端必须拒绝旧操作并返回可恢复的业务错误；Task 5 的接口测试覆盖。

---

### Task 1: 视觉约束与关键页面视觉稿

**Files:**
- Create: `docs/policy-match/ui-design.md`
- Create: `docs/policy-match/images/entry.png`
- Create: `docs/policy-match/images/profile-personal.png`
- Create: `docs/policy-match/images/results.png`
- Create: `docs/policy-match/images/policy-detail.png`
- Create: `docs/policy-match/images/application.png`

**Interfaces:**
- Consumes: `docs/policy-match/requirement.md`
- Produces: 前端实现唯一视觉约束，以及五张覆盖入口、问卷、结果、详情和申报的 390×844 关键页面参考图。

- [ ] **Step 1: 使用 `stitch-design-taste` 生成详细约束**

文档必须明确主题、色彩、字体、密度、间距、形状、层级、图标、表单、政策卡、条件解释、状态、动效、响应式、安全区和反模式；必须写明无 TabBar、载体嵌入感、演示数据标识和可解释匹配的视觉表达。

- [ ] **Step 2: 校验设计约束覆盖需求**

Run: `rg -n '无 TabBar|个人|企业|匹配度|满足条件|待补条件|站内申报|外部办理|390|320' docs/policy-match/ui-design.md`

Expected: 每个关键词至少命中一处，且文档不存在 `TBD`、`TODO`、`待定`。

- [ ] **Step 3: 依据两份文档生成五张独立关键页面图**

每张图只展示一个完整移动端页面，不拼接多屏展示板；图片中的长段正文压缩为可读短文，关键按钮、状态与层级必须准确。

- [ ] **Step 4: 逐张视觉检查并获得用户确认**

检查入口页无独立 App 导航、问卷步骤清晰、结果解释可扫读、详情主操作唯一、申报材料状态明确。用户确认前不进入产品代码实现。

- [ ] **Step 5: 保存设计产物**

Run: `git add -f docs/policy-match/ui-design.md docs/policy-match/images && git commit -m "docs: add policy matching visual direction"`

Expected: 只提交本模块设计文档和确认后的视觉稿。

### Task 2: Prisma 数据模型、迁移与演示种子数据

**Files:**
- Create: `apps/api/prisma/schema/modules/policy-match/schema.prisma`
- Create: `apps/api/prisma/migrations/20260921000800_policy_match/migration.sql`
- Create: `apps/api/prisma/seed/policy-match.js`
- Modify: `apps/api/prisma/seed.js`
- Modify: `apps/api/package.json`
- Test: `apps/api/test/policy-match.seed.test.js`

**Interfaces:**
- Consumes: 现有 `User`、`File` 模型和 seed runner。
- Produces: `PolicyMatchProfile`、`PolicyDefinition`、`PolicyFavorite`、`PolicyMatchSnapshot`、`PolicyApplication`、`PolicyApplicationMaterial`、`PolicyApplicationEvent` 模型，以及 `seedPolicyMatch(tx)`。

- [ ] **Step 1: 写种子选择失败测试**

```js
test('policy-match 是可单独选择的种子模块', () => {
  assert.deepEqual(selectModules(['policy-match']), ['policy-match']);
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm --filter @app-portfolio/api test --test-name-pattern="policy-match 是可单独选择的种子模块"`

Expected: FAIL，提示未知 seed 模块。

- [ ] **Step 3: 添加领域模型与数据库约束**

模型使用 JSONB 保存灵活画像、条件规则、匹配解释和申请 payload；所有表与字段添加中文注释。数据库约束至少包含：画像 `@@unique([ownerUserId, subjectType])`、收藏 `@@unique([ownerUserId, policyId])`、活动申请唯一索引、快照的用户和创建时间索引、材料与事件的申请索引。

- [ ] **Step 4: 添加演示政策与状态种子**

`seedPolicyMatch(tx)` 使用稳定 ID 和 `upsert`，至少写入 12 条政策，覆盖六个类别、个人/企业、`internal`/`external`、高匹配、缺失信息、硬性不符合、即将截止和已截止；同时写入一个可体验用户的个人画像、企业画像、匹配快照、草稿和需补材料记录。

- [ ] **Step 5: 注册种子模块并增加脚本**

```js
'policy-match': () => ({ seedData: require('./seed/policy-match').seedPolicyMatch }),
```

```json
"db:seed:policy-match": "node prisma/seed.js policy-match"
```

- [ ] **Step 6: 验证模型与种子选择**

Run: `pnpm --filter @app-portfolio/api prisma:validate && pnpm --filter @app-portfolio/api test --test-name-pattern="policy-match 是可单独选择的种子模块"`

Expected: Prisma schema valid，测试 PASS。

- [ ] **Step 7: 提交数据层**

Run: `git add apps/api/prisma apps/api/package.json apps/api/test/policy-match.seed.test.js && git commit -m "feat: add policy matching data model"`

### Task 3: 可解释规则匹配引擎

**Files:**
- Create: `apps/api/src/modules/policy-match/domain/matching.js`
- Create: `apps/api/src/modules/policy-match/domain/constants.js`
- Test: `apps/api/test/policy-match.matching.test.js`

**Interfaces:**
- Consumes: `profile.payload` 与 `policy.rules` JSON。
- Produces: `evaluatePolicy({ profile, policy, now }) -> { eligibility, score, confidence, explanations, materialReadiness }`；`rankPolicies({ profile, policies, now }) -> result[]`。

- [ ] **Step 1: 写硬性条件与未知字段测试**

```js
test('硬性条件优先，未知字段返回 missing', () => {
  const policy = { rules: [
    { code: 'age', kind: 'required', operator: 'between', value: [18, 35], weight: 0 },
    { code: 'degree', kind: 'scored', operator: 'in', value: ['本科', '硕士'], weight: 40 },
  ], materials: [{ code: 'identity', required: true }] };
  assert.equal(evaluatePolicy({ profile: { age: 42, degree: '硕士' }, policy, now }).eligibility, 'ineligible');
  assert.equal(evaluatePolicy({ profile: { age: null, degree: '硕士' }, policy, now }).explanations[0].status, 'missing');
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm --filter @app-portfolio/api test --test-name-pattern="硬性条件优先"`

Expected: FAIL，模块不存在。

- [ ] **Step 3: 实现操作符与结论计算**

支持 `equals`、`in`、`between`、`gte`、`lte`、`includesAny`、`truthy` 操作符；未知字段返回 `missing`。硬性条件存在 `unmatched` 时结论为 `ineligible`，只有缺失硬性信息时为 `potential`，否则为 `eligible`。分数只按评分规则权重归一化，并限制为 0–100 整数。

- [ ] **Step 4: 增加截止时间与材料准备度测试**

```js
test('截止政策不可申报且材料准备度独立计算', () => {
  const result = evaluatePolicy({
    profile: { scale: 'small', preparedMaterials: ['license'] },
    policy: { endsAt: '2026-01-01T00:00:00.000Z', rules: [], materials: [{ code: 'license', required: true }, { code: 'report', required: true }] },
    now: new Date('2026-09-21T00:00:00.000Z'),
  });
  assert.equal(result.eligibility, 'expired');
  assert.equal(result.materialReadiness, 50);
});
```

- [ ] **Step 5: 运行匹配引擎测试**

Run: `node --test apps/api/test/policy-match.matching.test.js`

Expected: 全部 PASS。

- [ ] **Step 6: 提交匹配引擎**

Run: `git add apps/api/src/modules/policy-match/domain apps/api/test/policy-match.matching.test.js && git commit -m "feat: add explainable policy matcher"`

### Task 4: 画像、政策与匹配 API

**Files:**
- Create: `apps/api/src/modules/policy-match/index.js`
- Create: `apps/api/src/modules/policy-match/db/index.js`
- Create: `apps/api/src/modules/policy-match/routes/index.js`
- Create: `apps/api/src/modules/policy-match/controllers/profile.controller.js`
- Create: `apps/api/src/modules/policy-match/controllers/policy.controller.js`
- Create: `apps/api/src/modules/policy-match/controllers/matching.controller.js`
- Create: `apps/api/src/modules/policy-match/services/profile.service.js`
- Create: `apps/api/src/modules/policy-match/services/policy.service.js`
- Create: `apps/api/src/modules/policy-match/services/matching.service.js`
- Create: `apps/api/src/modules/policy-match/validations/policy-match.validation.js`
- Modify: `apps/api/src/app.js`
- Test: `apps/api/test/policy-match.test.js`

**Interfaces:**
- Consumes: `evaluatePolicy`、Prisma models、`requireAuth`、公共成功响应与错误中间件。
- Produces: `GET/PUT /profiles/:subjectType`、`GET /policies`、`GET /policies/:id`、`POST/DELETE /policies/:id/favorite`、`POST /matches`、`GET /matches`、`GET /matches/:id`、`POST /matches/compare`。

- [ ] **Step 1: 写身份隔离与匹配接口测试**

```js
const personal = await request('/profiles/personal', { method: 'PUT', body: JSON.stringify({ payload: { age: 28, degree: '本科' } }) });
assert.equal(personal.status, 200);
const company = await request('/profiles/company');
assert.notDeepEqual(company.data?.payload, personal.data.payload);
const matched = await request('/matches', { method: 'POST', body: JSON.stringify({ subjectType: 'personal' }) });
assert.ok(matched.data.results.every((item) => Number.isInteger(item.score)));
assert.ok(matched.data.results[0].explanations.length > 0);
```

- [ ] **Step 2: 运行接口测试确认失败**

Run: `pnpm --filter @app-portfolio/api test --test-name-pattern="政策画像与匹配"`

Expected: FAIL，路由返回 404。

- [ ] **Step 3: 实现输入校验与服务**

只接受 `personal`、`company`；筛选只接受白名单 category、eligibility、sort；画像 payload 去除未声明字段并限制字符串、数组和对象深度；匹配服务读取当前用户对应画像和当前有效政策，在事务中创建快照与结果 JSON。

- [ ] **Step 4: 组装控制器与鉴权路由**

公开政策列表与详情可以匿名读取；画像、收藏、匹配与历史记录必须在 `router.use(requireAuth)` 之后注册。控制器只提取输入、调用服务并返回公共响应结构。

- [ ] **Step 5: 注册 API 模块并运行测试**

```js
const policyMatch = require('./modules/policy-match');
app.use('/api/policy-match', policyMatch.routes);
```

Run: `node --test apps/api/test/policy-match.test.js`

Expected: 未授权请求 401，个人/企业画像隔离，匹配结果含得分和解释，测试全部 PASS。

- [ ] **Step 6: 提交查询与匹配 API**

Run: `git add apps/api/src apps/api/test/policy-match.test.js && git commit -m "feat: add policy matching APIs"`

### Task 5: 站内申报与外部办理 API

**Files:**
- Create: `apps/api/src/modules/policy-match/controllers/application.controller.js`
- Create: `apps/api/src/modules/policy-match/services/application.service.js`
- Modify: `apps/api/src/modules/policy-match/routes/index.js`
- Modify: `apps/api/src/modules/policy-match/validations/policy-match.validation.js`
- Test: `apps/api/test/policy-match.application.test.js`

**Interfaces:**
- Consumes: 当前用户、政策办理方式、匹配快照、统一文件记录。
- Produces: `GET/POST /applications`、`GET/PATCH /applications/:id`、`POST /applications/:id/materials`、`DELETE /applications/:id/materials/:materialId`、`POST /applications/:id/submit`、`POST /applications/:id/external-progress`。

- [ ] **Step 1: 写幂等提交与截止政策测试**

```js
const first = await request(`/applications/${draftId}/submit`, { method: 'POST', headers: { 'Idempotency-Key': 'submit-1' } });
const second = await request(`/applications/${draftId}/submit`, { method: 'POST', headers: { 'Idempotency-Key': 'submit-1' } });
assert.equal(first.data.id, second.data.id);
assert.equal(first.data.receipt, second.data.receipt);
assert.equal((await request('/applications', { method: 'POST', body: JSON.stringify({ policyId: expiredPolicyId }) })).status, 409);
```

- [ ] **Step 2: 运行申请测试确认失败**

Run: `pnpm --filter @app-portfolio/api test --test-name-pattern="政策申请"`

Expected: FAIL，申请接口不存在。

- [ ] **Step 3: 实现草稿、材料和提交状态机**

创建草稿时校验办理方式、政策状态和同主体活动申请；更新使用 `draftVersion` 乐观锁；提交时重新读取政策与画像、执行硬性规则、校验必需材料，并在同一事务中写申请状态和事件时间线。相同幂等键返回原提交结果。

- [ ] **Step 4: 实现外部办理进度**

外部政策只接受 `preparing`、`visited_external`、`stopped`，记录材料勾选和时间线；拒绝写入 `approved`、`rejected` 等不可验证状态。

- [ ] **Step 5: 运行申请和安全测试**

Run: `node --test apps/api/test/policy-match.application.test.js apps/api/test/security-boundaries.test.js`

Expected: 幂等、截止、材料缺失、跨用户访问、版本冲突和外部状态白名单测试全部 PASS。

- [ ] **Step 6: 提交申请 API**

Run: `git add apps/api/src/modules/policy-match apps/api/test/policy-match.application.test.js && git commit -m "feat: add policy application workflow"`

### Task 6: 前端模块骨架、注册与数据层

**Files:**
- Create: `apps/web/src/modules/policy-match/index.jsx`
- Create: `apps/web/src/modules/policy-match/PolicyMatchApp.jsx`
- Create: `apps/web/src/modules/policy-match/services/profile.service.js`
- Create: `apps/web/src/modules/policy-match/services/policy.service.js`
- Create: `apps/web/src/modules/policy-match/services/matching.service.js`
- Create: `apps/web/src/modules/policy-match/services/application.service.js`
- Create: `apps/web/src/modules/policy-match/services/index.js`
- Create: `apps/web/src/modules/policy-match/store/policyMatchStore.js`
- Create: `apps/web/src/modules/policy-match/domain/constants.js`
- Create: `apps/web/src/modules/policy-match/styles/tokens.css`
- Create: `apps/web/src/modules/policy-match/styles/shared.css`
- Create: `apps/web/src/modules/policy-match/styles/pages.css`
- Create: `apps/web/src/modules/policy-match/styles/index.css`
- Modify: `apps/web/src/app/registry/applications.js`
- Test: `apps/web/test/policy-match.test.js`

**Interfaces:**
- Consumes: `/api/policy-match/*`、统一 `api`、`identityCapability`。
- Produces: `/policy-match/*` 懒加载模块、薄 Service、仅保存非敏感 UI 状态的 Store。

- [ ] **Step 1: 写注册与无 TabBar 测试**

```js
test('政策匹配应用被注册且不声明底部导航', async () => {
  const source = await readFile(new URL('../src/app/registry/applications.js', import.meta.url), 'utf8');
  assert.match(source, /id: 'policy-match'/);
  const appSource = await readFile(new URL('../src/modules/policy-match/PolicyMatchApp.jsx', import.meta.url), 'utf8');
  assert.doesNotMatch(appSource, /TabBar/);
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `node --test apps/web/test/policy-match.test.js`

Expected: FAIL，模块不存在或未注册。

- [ ] **Step 3: 创建模块路由与应用注册**

路由包含入口、画像、分析、结果、政策详情、站内申报、外部指南、记录、记录详情和账户轻页面；未知路径重定向 `/policy-match`。注册表新增名称“政策智能匹配”、路径 `/policy-match` 和与需求一致的简介及功能点。

- [ ] **Step 4: 创建 Service 与 UI Store**

Service 只声明 API 路径和必要映射；Store 只保存当前身份、问卷当前步骤、临时筛选和选中的对比政策 ID，不持久化完整画像或材料地址。

- [ ] **Step 5: 落地设计 Token 与公共布局**

把 `ui-design.md` 中的色值、字体、间距、圆角、阴影、动效和安全区转换为 `--policy-*` CSS 变量；根容器使用 `min-height: 100dvh`，不定义底部主导航。

- [ ] **Step 6: 运行注册测试和 lint**

Run: `node --test apps/web/test/policy-match.test.js && pnpm --filter @app-portfolio/web lint`

Expected: 测试 PASS，ESLint 无错误。

- [ ] **Step 7: 提交模块骨架**

Run: `git add apps/web/src/modules/policy-match apps/web/src/app/registry/applications.js apps/web/test/policy-match.test.js && git commit -m "feat: scaffold policy matching frontend"`

### Task 7: 入口、画像与匹配结果页面

**Files:**
- Create: `apps/web/src/modules/policy-match/pages/EntryPage.jsx`
- Create: `apps/web/src/modules/policy-match/pages/ProfileFlowPage.jsx`
- Create: `apps/web/src/modules/policy-match/pages/AnalysisPage.jsx`
- Create: `apps/web/src/modules/policy-match/pages/ResultsPage.jsx`
- Create: `apps/web/src/modules/policy-match/components/PolicyHeader.jsx`
- Create: `apps/web/src/modules/policy-match/components/IdentityChoice.jsx`
- Create: `apps/web/src/modules/policy-match/components/ProfileStep.jsx`
- Create: `apps/web/src/modules/policy-match/components/MatchSummary.jsx`
- Create: `apps/web/src/modules/policy-match/components/PolicyCard.jsx`
- Create: `apps/web/src/modules/policy-match/components/PolicyCompare.jsx`
- Create: `apps/web/src/modules/policy-match/hooks/useProfileFlow.js`
- Create: `apps/web/src/modules/policy-match/hooks/useMatchResults.js`
- Modify: `apps/web/src/modules/policy-match/PolicyMatchApp.jsx`
- Modify: `apps/web/src/modules/policy-match/styles/pages.css`
- Test: `apps/web/test/policy-match-flow.test.js`

**Interfaces:**
- Consumes: profile、policy、matching Service 与模块 Store。
- Produces: 身份选择、分步画像、三阶段分析、筛选排序、政策卡和双政策纵向对比。

- [ ] **Step 1: 写纯函数与结构测试**

```js
test('个人与企业步骤互不复用敏感字段', () => {
  assert.deepEqual(PERSONAL_STEPS.map((item) => item.id), ['basic', 'talent', 'employment', 'startup', 'confirm']);
  assert.deepEqual(COMPANY_STEPS.map((item) => item.id), ['basic', 'operation', 'innovation', 'employment-project', 'confirm']);
});
```

同时检查入口主按钮、画像进度、分析阶段、三种匹配结论和对比入口存在。

- [ ] **Step 2: 运行测试确认失败**

Run: `node --test apps/web/test/policy-match-flow.test.js`

Expected: FAIL，步骤常量或页面不存在。

- [ ] **Step 3: 实现入口与画像流程**

入口优先展示个人/企业双入口；登录后加载画像完成度、最近匹配与进行中申请。问卷每步保存到服务端，“不确定”映射为 `null`，失败保留本地当前步骤并显示重试。

- [ ] **Step 4: 实现分析与结果**

提交画像后进入分析页，依次显示读取画像、核对条件、生成解释；匹配完成后导航到快照结果。结果页支持类别、结论和排序筛选，政策卡同时显示得分、结论、截止时间以及满足/待补数量。

- [ ] **Step 5: 实现移动端纵向对比**

最多选择两项政策；按支持内容、硬性条件、待补信息、材料和办理方式逐组展示，不创建横向滚动表格。

- [ ] **Step 6: 运行测试、lint 和 build**

Run: `node --test apps/web/test/policy-match-flow.test.js && pnpm --filter @app-portfolio/web lint && pnpm --filter @app-portfolio/web build`

Expected: 测试 PASS，lint 无错误，Vite build 成功。

- [ ] **Step 7: 提交匹配体验**

Run: `git add apps/web/src/modules/policy-match apps/web/test/policy-match-flow.test.js && git commit -m "feat: build policy matching journey"`

### Task 8: 政策详情、站内申报与外部办理页面

**Files:**
- Create: `apps/web/src/modules/policy-match/pages/PolicyDetailPage.jsx`
- Create: `apps/web/src/modules/policy-match/pages/ApplicationFlowPage.jsx`
- Create: `apps/web/src/modules/policy-match/pages/ExternalGuidePage.jsx`
- Create: `apps/web/src/modules/policy-match/components/ConditionBreakdown.jsx`
- Create: `apps/web/src/modules/policy-match/components/MaterialChecklist.jsx`
- Create: `apps/web/src/modules/policy-match/components/ApplicationStep.jsx`
- Create: `apps/web/src/modules/policy-match/hooks/useApplicationDraft.js`
- Modify: `apps/web/src/modules/policy-match/PolicyMatchApp.jsx`
- Modify: `apps/web/src/modules/policy-match/styles/pages.css`
- Test: `apps/web/test/policy-match-application.test.js`

**Interfaces:**
- Consumes: policy detail、match snapshot、application Service、统一文件能力。
- Produces: 条件解释、补充画像跳转、材料准备、申请预览提交、外部步骤与进度标记。

- [ ] **Step 1: 写办理方式分流测试**

```js
test('站内与外部政策显示不同主操作', () => {
  assert.equal(getPrimaryAction({ channel: 'internal' }).label, '开始申报');
  assert.equal(getPrimaryAction({ channel: 'external' }).label, '查看办理指南');
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `node --test apps/web/test/policy-match-application.test.js`

Expected: FAIL，主操作映射不存在。

- [ ] **Step 3: 实现政策详情与条件解释**

按摘要、匹配结论、已满足、待补、不满足、材料、流程和声明的顺序展示；条件解释必须显示用户依据和政策要求；“补充信息”跳转到对应画像步骤。

- [ ] **Step 4: 实现站内申请流程**

按主体确认、补充信息、材料、预览、结果五步组织；草稿逐步保存，上传使用统一文件能力，提交时携带幂等键；服务端返回材料缺失或版本冲突时定位到对应步骤。

- [ ] **Step 5: 实现外部办理指南**

显示演示入口提示、步骤、材料勾选和注意事项；只有用户点击后才记录 `visited_external`，页面不产生真实审核结论。

- [ ] **Step 6: 运行页面测试和构建**

Run: `node --test apps/web/test/policy-match-application.test.js && pnpm --filter @app-portfolio/web lint && pnpm --filter @app-portfolio/web build`

Expected: 测试 PASS，lint 与 build 成功。

- [ ] **Step 7: 提交办理流程**

Run: `git add apps/web/src/modules/policy-match apps/web/test/policy-match-application.test.js && git commit -m "feat: add policy application pages"`

### Task 9: 记录、轻量个人中心与恢复状态

**Files:**
- Create: `apps/web/src/modules/policy-match/pages/RecordsPage.jsx`
- Create: `apps/web/src/modules/policy-match/pages/RecordDetailPage.jsx`
- Create: `apps/web/src/modules/policy-match/pages/AccountPage.jsx`
- Create: `apps/web/src/modules/policy-match/components/ApplicationTimeline.jsx`
- Create: `apps/web/src/modules/policy-match/components/PolicyEmptyState.jsx`
- Modify: `apps/web/src/modules/policy-match/pages/EntryPage.jsx`
- Modify: `apps/web/src/modules/policy-match/PolicyMatchApp.jsx`
- Test: `apps/web/test/policy-match-records.test.js`

**Interfaces:**
- Consumes: 画像、匹配历史、收藏和申请接口。
- Produces: 申报分组列表、详情时间线、身份切换、收藏与历史匹配入口、错误恢复状态。

- [ ] **Step 1: 写状态分组测试**

```js
test('申请按用户可理解的状态分组', () => {
  assert.equal(groupApplication({ status: 'draft' }), 'active');
  assert.equal(groupApplication({ status: 'supplement_required' }), 'attention');
  assert.equal(groupApplication({ status: 'approved' }), 'completed');
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `node --test apps/web/test/policy-match-records.test.js`

Expected: FAIL，分组函数或页面不存在。

- [ ] **Step 3: 实现记录与时间线**

列表显示状态、主体、办理方式、更新时间和下一步；详情显示材料、事件时间线和可执行操作。需补材料置于高优先级，但不使用持续闪烁或大面积错误色。

- [ ] **Step 4: 实现轻量个人中心与身份切换**

只提供画像维护、收藏、历史匹配和身份切换；切换身份前保存当前草稿，不加入底部导航，不复制入口页的信息卡片。

- [ ] **Step 5: 覆盖恢复状态**

画像为空跳转身份选择；匹配失败保留画像并重试；政策失效禁用主操作；上传失败保留已成功材料；网络错误提供原地重试。

- [ ] **Step 6: 运行测试与构建**

Run: `node --test apps/web/test/policy-match-records.test.js && pnpm --filter @app-portfolio/web lint && pnpm --filter @app-portfolio/web build`

Expected: 测试 PASS，lint 与 build 成功。

- [ ] **Step 7: 提交记录体验**

Run: `git add apps/web/src/modules/policy-match apps/web/test/policy-match-records.test.js && git commit -m "feat: add policy matching records"`

### Task 10: 全链路验证与视觉还原检查

**Files:**
- Modify: `README.md`
- Modify: `apps/web/README.md`
- Modify: `apps/api/README.md`
- Test: `apps/api/test/policy-match.test.js`
- Test: `apps/api/test/policy-match.application.test.js`
- Test: `apps/web/test/policy-match.test.js`
- Test: `apps/web/test/policy-match-flow.test.js`
- Test: `apps/web/test/policy-match-application.test.js`
- Test: `apps/web/test/policy-match-records.test.js`

**Interfaces:**
- Consumes: 完整前后端模块与确认后的视觉稿。
- Produces: 可启动、可构建、可通过真实 API 完成演示闭环的政策智能匹配应用。

- [ ] **Step 1: 运行后端完整验证**

Run: `pnpm --filter @app-portfolio/api check && pnpm --filter @app-portfolio/api prisma:validate && pnpm --filter @app-portfolio/api test`

Expected: 语法检查、Prisma 校验和全部后端测试通过。

- [ ] **Step 2: 运行前端完整验证**

Run: `pnpm --filter @app-portfolio/web lint && pnpm --filter @app-portfolio/web build && node --test apps/web/test/*.test.js`

Expected: lint、build 和全部前端测试通过。

- [ ] **Step 3: 执行真实 API 冒烟流程**

依次验证：个人身份进入、画像暂存、匹配、查看解释、站内草稿、材料上传、预览提交、记录时间线；随后切换企业身份，确认个人数据不混入；再验证一条外部政策的材料勾选和 `visited_external` 记录。

- [ ] **Step 4: 对照视觉稿检查五个关键页面**

在 390×844 和 320×568 视口检查入口、个人问卷、结果、详情和申报页；要求无 TabBar、无横向滚动、固定操作不遮挡内容、文字可读、状态不只依赖颜色、主操作每屏唯一。

- [ ] **Step 5: 更新运行说明**

README 增加 `/policy-match` 入口、`db:seed:policy-match` 命令、演示身份说明和“所有政策及审核结果均为演示数据”的声明。

- [ ] **Step 6: 提交最终集成**

Run: `git add README.md apps/web/README.md apps/api/README.md && git commit -m "docs: document policy matching module"`
