import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import postcss from 'postcss';

const base = new URL('../src/modules/policy-match/', import.meta.url);
test('匹配动画仅使用合成属性，并在减少动态效果、完成或出错时停止',()=>{
  const sheet=postcss.parse(readFileSync(new URL('styles/pages/analysis.css',base),'utf8'));
  const keyframes=[];
  sheet.walkAtRules('keyframes',rule=>keyframes.push(rule));
  assert.ok(keyframes.length>0,'匹配页应有独立动效');
  for(const rule of keyframes)rule.walkDecls(decl=>assert.ok(['transform','opacity'].includes(decl.prop),'动画不能反复触发布局'));
  const reduced=[];
  sheet.walkAtRules('media',rule=>{if(rule.params.includes('prefers-reduced-motion'))rule.walkDecls('animation',decl=>reduced.push(decl.value));});
  assert.ok(reduced.includes('none'));
  const stopped=[];
  sheet.walkRules(rule=>{if(rule.selector.includes('.is-settled'))rule.walkDecls('animation-play-state',decl=>stopped.push(decl.value));});
  assert.ok(stopped.includes('paused'));
});
test('我的资料使用双列画像卡，身份切换有足够触控区域', () => {
  const rules=new Map();
  postcss.parse(readFileSync(new URL('styles/pages/account.css',base),'utf8')).walkRules(rule=>{if(rule.parent.type==='root')rules.set(rule.selector,Object.fromEntries(rule.nodes.filter(n=>n.type==='decl').map(n=>[n.prop,n.value])));});
  assert.equal(rules.get('.pm-page-personal-account .pm-account-profiles')?.['grid-template-columns'],'repeat(2,minmax(0,1fr))');
  assert.ok(parseFloat(rules.get('.pm-page-personal-account .pm-account-switch')?.['min-height'])>=44);
  assert.equal(rules.get('.pm-page-personal-account .pm-account-history-row')?.['grid-template-columns'],'24px minmax(0,1fr) auto 16px');
});
test('申报指南将问题与说明放在同一卡片，正文有足够行距', () => {
  const rules=new Map();
  postcss.parse(readFileSync(new URL('styles/pages/guide.css',base),'utf8')).walkRules(rule=>{if(rule.parent.type==='root')rules.set(rule.selector,Object.fromEntries(rule.nodes.filter(n=>n.type==='decl').map(n=>[n.prop,n.value])));});
  assert.equal(rules.get('.pm-page-guide .pm-guide-card h2')?.['font-size'],'17px');
  assert.equal(rules.get('.pm-page-guide .pm-guide-card p')?.['font-size'],'14px');
  assert.ok(parseFloat(rules.get('.pm-page-guide .pm-guide-card p')?.['line-height'])>=1.8);
  assert.equal(rules.get('.pm-page-guide .pm-guide-links')?.['grid-template-columns'],'repeat(2,minmax(0,1fr))');
});
test('收藏页延续首页切换样式，卡片标题可换行且右侧箭头独立对齐', () => {
  const read=page=>{
    const rules=new Map();
    postcss.parse(readFileSync(new URL(`styles/pages/${page}.css`,base),'utf8')).walkRules(rule=>{if(rule.parent.type==='root')rules.set(rule.selector,Object.fromEntries(rule.nodes.filter(n=>n.type==='decl').map(n=>[n.prop,n.value])));});
    return rules;
  };
  const home=read('home'),favorites=read('favorites');
  for(const suffix of [' button',' button.active',' svg'])assert.deepEqual(favorites.get('.pm-page-favorites .pm-segments'+suffix),home.get('.pm-page-home .pm-segments'+suffix));
  assert.equal(favorites.get('.pm-page-favorites .pm-favorite-row')?.['grid-template-columns'],'40px minmax(0,1fr) 16px');
  assert.equal(favorites.get('.pm-page-favorites .pm-favorite-copy h3')?.['overflow-wrap'],'anywhere');
});
test('历史匹配顶部切换与首页保持相同的尺寸及选中样式', () => {
  const readRules=page=>{
    const rules=new Map();
    postcss.parse(readFileSync(new URL(`styles/pages/${page}.css`,base),'utf8')).walkRules(rule=>{if(rule.parent.type==='root')rules.set(rule.selector,Object.fromEntries(rule.nodes.filter(n=>n.type==='decl').map(n=>[n.prop,n.value])));});
    return rules;
  };
  const home=readRules('home'),history=readRules('history');
  for(const suffix of [' button',' button.active',' svg'])assert.deepEqual(history.get('.pm-page-history .pm-segments'+suffix),home.get('.pm-page-home .pm-segments'+suffix));
  for(const prop of ['padding','gap','background'])assert.equal(history.get('.pm-page-history .pm-segments')[prop],home.get('.pm-page-home .pm-segments')[prop]);
});
test('历史匹配记录采用独立四列布局，时间与结果数量不会互相挤压', () => {
  const sheet=postcss.parse(readFileSync(new URL('styles/pages/history.css',base),'utf8'));
  const rules=new Map();
  sheet.walkRules(rule=>{if(rule.parent.type==='root')rules.set(rule.selector,Object.fromEntries(rule.nodes.filter(n=>n.type==='decl').map(n=>[n.prop,n.value])));});
  assert.equal(rules.get('.pm-page-history .pm-history-row')?.['grid-template-columns'],'28px minmax(0,1fr) auto 16px');
  assert.ok(parseFloat(rules.get('.pm-page-history .pm-history-row')?.['min-height'])>=64);
  assert.equal(rules.get('.pm-page-history .pm-history-count')?.['white-space'],'nowrap');
});
test('申报流程使用固定等宽底栏，图片上传入口适合移动端触控', () => {
  const sheet=postcss.parse(readFileSync(new URL('styles/pages/application.css',base),'utf8'));
  const rules=new Map();
  sheet.walkRules(rule=>{if(rule.parent.type==='root')rules.set(rule.selector,Object.fromEntries(rule.nodes.filter(n=>n.type==='decl').map(n=>[n.prop,n.value])));});
  assert.equal(rules.get('.pm-page-application .pm-actionbar')?.position,'fixed');
  assert.equal(rules.get('.pm-page-application .pm-actionbar>button')?.flex,'1 1 0');
  assert.ok(parseFloat(rules.get('.pm-page-application .pm-image-upload-add')?.width)>=48);
  assert.ok(parseFloat(rules.get('.pm-page-application .pm-image-upload-add')?.height)>=48);
  assert.ok(rules.get('.pm-app .pm-page-application')?.padding.includes('106px + env(safe-area-inset-bottom)'));
});

test('申报详情材料入口按真实附件区分，草稿不显示虚构受理编号', () => {
  const page=readFileSync(new URL('pages/RecordDetailPage.jsx',base),'utf8');
  assert.ok(page.includes('row.materials.find(file=>file.code===material.code)'));
  assert.ok(page.includes('flow.openPreview(attached.fileId)'));
  assert.ok(page.includes('尚未提交，暂无编号'));
  assert.ok(page.includes("row?.events.find(event=>event.status==='submitted')"));
  const sheet=postcss.parse(readFileSync(new URL('styles/pages/record-detail.css',base),'utf8'));
  const rules=new Map();
  sheet.walkRules(rule=>{if(rule.parent.type==='root')rules.set(rule.selector,Object.fromEntries(rule.nodes.filter(n=>n.type==='decl').map(n=>[n.prop,n.value])));});
  assert.equal(rules.get('.pm-page-record-detail .pm-record-detail-material')?.['min-height'],'52px');
  assert.equal(rules.get('.pm-page-record-detail .pm-record-detail-back')?.width,'100%');
  assert.equal(rules.get('.pm-page-record-detail .pm-record-detail-timeline li')?.['grid-template-columns'],'20px 88px minmax(0,1fr)');
  assert.equal(rules.get('.pm-page-record-detail .pm-record-detail-timeline i')?.width,'20px');
  assert.equal(rules.get('.pm-page-record-detail .pm-record-detail-timeline li:not(:last-child)::before')?.height,'100%');
});

test('申报记录提供真实统计、搜索和状态对应的操作入口', () => {
  const page=readFileSync(new URL('pages/RecordsPage.jsx',base),'utf8');
  const card=readFileSync(new URL('components/RecordCard.jsx',base),'utf8');
  assert.ok(page.includes('records.filter(isActive).length'));
  assert.ok(page.includes('搜索申报记录'));
  assert.ok(page.includes('没有找到相关记录'));
  assert.ok(card.includes("editable?'apply/':external&&!finished?'external/':'records/'"));
  assert.ok(card.includes('row.materials||[]'));
  assert.ok(existsSync(new URL('assets/records-hero.png',base)));
});

test('政策详情有固定全宽申报栏和底部安全留白', () => {
  const sheet = postcss.parse(readFileSync(new URL('styles/pages/policy-detail.css', base), 'utf8'));
  const rules = new Map();
  sheet.walkRules(rule => rules.set(rule.selector, Object.fromEntries(rule.nodes.filter(node => node.type === 'decl').map(node => [node.prop,node.value]))));
  assert.equal(rules.get('.pm-page-policy-detail .pm-actionbar')?.position, 'fixed');
  assert.equal(rules.get('.pm-page-policy-detail .pm-actionbar')?.width, 'min(100%,760px)');
  assert.equal(rules.get('.pm-page-policy-detail .pm-actionbar .pm-primary')?.width, '100%');
  assert.ok(rules.get('.pm-app .pm-page-policy-detail')?.padding.includes('90px + env(safe-area-inset-bottom)'));
  const page=readFileSync(new URL('pages/PolicyDetailPage.jsx',base),'utf8');
  assert.ok(page.includes('<ProgressCircle percent={data.result.score}>'));
  assert.ok(page.includes('上传与准备状态请在申报页面查看'));
});

test('政策对比使用两张摘要卡和三列对齐布局，材料状态不冒充条件匹配状态', () => {
  const sheet = postcss.parse(readFileSync(new URL('styles/pages/compare.css', base), 'utf8'));
  const rules = new Map();
  sheet.walkRules(rule => {
    if (rule.parent.type === 'root') rules.set(rule.selector, Object.fromEntries(rule.nodes.filter(node => node.type === 'decl').map(node => [node.prop,node.value])));
  });
  assert.equal(rules.get('.pm-page-compare .pm-compare-policies')?.['grid-template-columns'], 'repeat(2,minmax(0,1fr))');
  assert.equal(rules.get('.pm-page-compare .pm-compare-row')?.['grid-template-columns'], '1.12fr 1fr 1fr');
  assert.equal(rules.get('.pm-page-compare .pm-compare-back')?.width, '100%');
  const page = readFileSync(new URL('pages/ComparePage.jsx', base), 'utf8');
  assert.ok(page.includes('准备状态以申报记录为准'));
  assert.ok(!page.includes('材料已齐全'));
  assert.ok(existsSync(new URL('assets/compare-hero.png', base)));
});

test('匹配结果页有独立卡片信息层级和固定对比底栏', () => {
  const sheet = postcss.parse(readFileSync(new URL('styles/pages/policies.css', base), 'utf8'));
  const rules = new Map();
  sheet.walkRules(rule => rules.set(rule.selector, {...rules.get(rule.selector),...Object.fromEntries(rule.nodes.filter(node => node.type === 'decl').map(node => [node.prop,node.value]))}));
  assert.equal(rules.get('.pm-page-results .pm-actionbar')?.position, 'fixed');
  assert.equal(rules.get('.pm-page-results .pm-result-facts')?.display, 'grid');
  assert.equal(rules.get('.pm-page-results .pm-result-facts')?.['grid-template-columns'], 'repeat(3,minmax(0,1fr))');
  assert.ok(rules.get('.pm-app .pm-page-results')?.['padding-bottom'].includes('safe-area-inset-bottom'));
});

test('画像底栏固定且两个操作等宽，确认信息使用正文尺寸', () => {
  const sheet = postcss.parse(readFileSync(new URL('styles/pages/profile.css', base), 'utf8'));
  const rules = new Map();
  sheet.walkRules(rule => rules.set(rule.selector, {...rules.get(rule.selector), ...Object.fromEntries(rule.nodes.filter(node => node.type === 'decl').map(node => [node.prop, node.value]))}));
  assert.equal(rules.get('.pm-page-profile .pm-actionbar')?.position, 'fixed');
  assert.equal(rules.get('.pm-page-profile .pm-actionbar')?.width, 'min(100%, 760px)');
  assert.equal(rules.get('.pm-page-profile .pm-actionbar>button')?.flex, '1 1 0');
  assert.equal(rules.get('.pm-page-profile .pm-actionbar>button')?.['min-width'], '0');
  assert.equal(rules.get('.pm-page-profile .pm-review p')?.['font-size'], 'var(--pm-text-body)');
  assert.ok(rules.get('.pm-app .pm-page-profile')?.['padding-bottom'].includes('safe-area-inset-bottom'));
});

test('首页申报日程使用白色分区，时间轴只连接相邻节点', () => {
  const sheet = postcss.parse(readFileSync(new URL('styles/pages/home.css', base), 'utf8'));
  const rules = new Map();
  sheet.walkRules(rule => rules.set(rule.selector, Object.fromEntries(rule.nodes.filter(node => node.type === 'decl').map(node => [node.prop, node.value]))));
  assert.equal(rules.get('.pm-page-home .pm-home-schedule')?.background, 'var(--pm-surface)');
  assert.equal(rules.get('.pm-page-home .pm-timeline>a')?.['border-left'], '0');
  assert.equal(rules.get('.pm-page-home .pm-timeline>a')?.display, 'grid');
  assert.equal(rules.get('.pm-page-home .pm-timeline>a:not(:last-child)::before')?.height, '100%');
  assert.equal(rules.get('.pm-page-home .pm-timeline time')?.['white-space'], 'nowrap');
});

test('政策匹配输入焦点贴合边框，搜索框仅在容器显示焦点', () => {
  const css = ['styles/shell.css','styles/components.css'].map(file => readFileSync(new URL(file, base), 'utf8')).join('\n');
  const sheet = postcss.parse(css);
  sheet.walkDecls('outline-offset', decl => assert.ok(parseFloat(decl.value) <= 0, '焦点框不能与边框留缝'));
  const rules = new Map();
  sheet.walkRules(rule => rules.set(rule.selector, Object.fromEntries(rule.nodes.filter(node => node.type === 'decl').map(node => [node.prop, node.value]))));
  assert.equal(rules.get('.pm-search:focus-within')?.['border-color'], 'var(--pm-focus)');
  assert.equal(rules.get('.pm-app .pm-search input:focus')?.['box-shadow'], 'none');
  assert.ok(css.includes('textarea:focus'), '多行输入也必须使用统一焦点');
});

test('政策匹配页面样式可独立加载且所有设计变量均有定义', () => {
  const entry = new URL('styles/index.css', base);
  assert.ok(existsSync(entry), '需要独立样式入口，不能将所有页面混在一个文件');
  const nodes = [];
  const visit = url => {
    const sheet = postcss.parse(readFileSync(url, 'utf8'));
    sheet.walkAtRules('import', rule => visit(new URL(rule.params.replace(/['"]/g, ''), url)));
    sheet.walkDecls(decl => nodes.push(decl));
  };
  visit(entry);
  for (const page of ['home','profile','analysis','policies','policy-detail','compare','application','external','success','records','record-detail','account','history','favorites','guide']) {
    const file = new URL(`styles/pages/${page}.css`, base);
    assert.ok(existsSync(file), `${page} 缺少页面样式`);
    visit(file);
  }
  const definitions = new Map(nodes.filter(n => n.prop.startsWith('--pm-')).map(n => [n.prop,n.value]));
  assert.ok(definitions.size >= 15, '颜色、字体、间距、圆角必须由设计变量统一管理');
  for (const decl of nodes) for (const [, name] of decl.value.matchAll(/var\((--pm-[\w-]+)/g)) assert.ok(definitions.has(name), `${name} 没有定义`);
});
