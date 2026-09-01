# 招生报名编辑页设计 QA

- source visual truth: `docs/enrollment/ui/06-student-edit.png`
- implementation screenshots:
  - `/private/tmp/enrollment-student-edit-passed.png`
  - `/private/tmp/enrollment-family-edit-passed.png`
  - `/private/tmp/enrollment-property-edit-passed.png`
  - `/private/tmp/enrollment-material-edit-final.png`
- comparison image: `/private/tmp/enrollment-student-edit-comparison-final.png`
- viewport: 430 × 900 CSS px；页面内容宽度 415 CSS px
- source pixels: 853 × 1844；按既定 App 壳规则裁去 106 px 原生标题区后缩放至 415 px 宽
- implementation pixels: 415 × 900；浏览器截图已按 CSS 像素归一化
- state: 幼升小、城区、市第一实验小学、已有草稿；四个编辑页均使用相同报名上下文

## Full-view comparison evidence

学生编辑页已与源图并排比较。页面横向边距、39 px 上下文条、提示条、字段节奏、46 px 控件高度、来源标签、证件照区域及固定操作栏一致。源图中的姓名、地址和修改原因与本地测试草稿不同，属于数据状态差异，不属于布局偏差。

家庭户籍、房产和材料页没有独立源图，按学生编辑页的同一设计系统复核：统一上下文区、字段容器、移动端 Picker、来源标签、分组标题、上传卡片和固定操作栏。

## Focused region comparison evidence

- 证件照：图片尺寸、左右双栏结构、两枚 38 px 操作按钮及说明文字已对齐。
- 下拉字段：来源标签位于箭头左侧，箭头固定在控件右缘。
- 修改字段：橙色“用户已修改”标签和橙色原因输入框与源图一致。
- 底部操作栏：自动保存提示位于左侧，主按钮宽约 201 px，白色文字居中。
- 材料上传：字段标题和“必传”状态位于控件上方，空状态使用整行 46 px 图片选择按钮；上传后由 Ant Design Mobile ImageUploader 展示缩略图网格。

## Comparison history

1. P1：来源标签原先位于字段标题旁，选择项使用按钮组。已将标签移入控件，并替换为移动端 Picker。
2. P1：底部保存按钮被通用样式压缩，按钮文字颜色受状态文字样式影响。已恢复约 52% 宽度并限定文字为白色。
3. P2：证件照按钮被网格拉高，修改标签颜色错误，下拉箭头顺序错误。已拆分照片操作区、改为 38 px 按钮、恢复橙色修改态并调整标签顺序。
4. P2：函数组件 defaultProps 产生控制台告警。已改用默认参数；最终交互未产生新的相关告警。
5. P2：材料上传原先使用独立大卡片和左侧小方块入口，留白过多且与编辑页表单规范不一致。已改为标签、上传控件、图片限制说明三层结构，空状态整行展示拍照或相册入口。

## Required fidelity surfaces

- Fonts and typography: passed；字号、字重、行高和信息层级与源图一致。
- Spacing and layout rhythm: passed；边距、字段间距、卡片圆角和固定栏比例一致。
- Colors and visual tokens: passed；蓝色主色、浅蓝提示、橙色修改态和绿色自动保存语义一致。
- Image quality and asset fidelity: passed；继续使用项目内原始学生证件照素材，无占位图或代码绘图。
- Copy and content: passed；页面文案与现有需求一致，测试数据差异已单独排除。

## Interaction verification

- Picker 可正常打开、取消并保留当前值。
- 四个“修改”入口均进入对应页面。
- 保存按钮文字、宽度和固定位置正常。
- 浏览器最终状态未发现新的页面错误。

final result: passed

## 信息预览与提交页

- source visual truth: `docs/enrollment/ui/08-review-submit.png`
- viewport: 430 × 900 CSS px；使用现有测试报名草稿完成整页截图检查
- shell constraint: 按已确认接入方式移除源图中的原生 Header；按已确认交互移除“修改”入口，仅保留分组折叠
- structure: passed；学校摘要 Banner、学生卡片、户主/监护人独立卡片、下滑提示、房产、材料、真实性声明和自然流提交按钮顺序一致
- typography and spacing: passed；20 px 分组标题、15 px 信息行、47 px 行高、9 px 卡片圆角及 16 px 页面边距已对齐
- privacy: passed；证件号码与联系电话在预览页脱敏展示
- regression: `npm run build`、`npm run lint` 已完成；lint 仅保留既有 Fast Refresh warning

final result: passed
