import { useEffect, useState } from 'react';
import { Checkbox } from 'antd-mobile';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Art, ProductArt, Arrow, Header, Icon, ProductCard, ProductFilters, Tabs, Empty, Rules, Rows } from '../components/UI';
import { useMallContext, shortDate } from '../components/MallContext';
import { checkInSummary, redemptionIssue } from '../utils/rules';
import { toggleFavorite, recordView } from '../services/collection.service';
import homeLifestyleBanner from '../assets/home-lifestyle-banner.jpg';
const categories = ['全部', '生活好物', '电子权益', '餐饮美食', '影音会员', '出行休闲', '文创周边'];
export function HomePage() {
  const {
    data
  } = useMallContext();
  const navigate = useNavigate();
  const [category, setCategory] = useState('全部'),
    [only, setOnly] = useState(false);
  const visibleProducts = data.products.filter(p => (category === '全部' || p.category === category) && (!only || !redemptionIssue(data,p)));
  return <>
<Header title="青禾 · 积分商城" home />
<div className="gp-content gp-home-content">
<form className="gp-search" onSubmit={e => {
        e.preventDefault();
        navigate(`/green-points/products?q=${encodeURIComponent(new FormData(e.currentTarget).get('q'))}`);
      }}>
<Icon name="search" />
<input name="q" placeholder="搜索好物与权益" aria-label="搜索好物与权益" />
<button>搜索</button>
</form>
<section className="gp-balance gp-home-balance">
<div><span>我的可用积分</span><strong>{data.balance.toLocaleString()}<small> 积分</small></strong></div>
<nav className="gp-balance-actions" aria-label="积分与券包"><Link to="/green-points/points"><Icon name="record" /><span>收支明细</span><Arrow /></Link><Link to="/green-points/coupons?tab=wallet"><Icon name="tag" /><span>我的券包</span><b>{data.wallet.filter(c => !c.usedBy && c.expiresAt > Date.now()).length} 张</b><Arrow /></Link></nav>
</section>
<nav className="gp-shortcuts gp-category-shortcuts">{[['cup', '生活好物', 'products?category=生活好物'], ['ticket', '电子权益', 'products?category=电子权益'], ['gift', '餐饮美食', 'products?category=餐饮美食'], ['palette', '文创周边', 'products?category=文创周边'], ['tag', '领券中心', 'coupons'], ['clock', '限时兑换', 'activities?type=限时兑换'], ['record', '兑换订单', 'orders'], ['heart', '我的收藏', 'collection']].map(([icon, label, path]) => <Link key={label} to={`/green-points/${path}`}><Icon name={icon} /><span>{label}</span></Link>)}</nav>
<Link to="/green-points/products?category=生活好物" className="gp-editorial-banner"><div><span className="gp-eyebrow">青禾 · 生活好物提案</span><h2>把绿色日常<br />兑成心动好礼</h2><p>把心意，装进每一天</p><b>探索生活精选 <Arrow direction="diagonal" /></b></div><img src={homeLifestyleBanner} alt="" fetchPriority="high" /></Link>
<div className="gp-service-strip"><span><Icon name="shield" />品质好物</span><span><Icon name="gift" />纯积分兑换</span><span><Icon name="support" />贴心售后</span></div>
<div className="gp-section-heading"><h2>先领券 · 更划算</h2><Link to="/green-points/coupons">全部优惠<Arrow /></Link></div>
<div className="gp-mini-coupons">{data.coupons.slice(0,2).map(c => <Link to="/green-points/coupons" key={c.id}><strong>{c.amount}<small>积分</small></strong><span>满{c.minimum}可用<br /><b>立即领取<Arrow /></b></span></Link>)}</div>
<div className="gp-section-heading">
<h2>限时好礼 <em>精选特惠</em></h2>
<Link to="/green-points/activities">查看活动<Arrow /></Link>
</div>
<div className="gp-offers">{data.products.filter(p => ['bag', 'ticket'].includes(p.id)).map(p => <Link key={p.id} to={`/green-points/products/${p.id}`}>
<ProductArt product={p} />
<div>
<h3>{p.id === 'bag' ? '环保帆布袋' : '城市观影券'}</h3>
<strong>{p.price} <small>积分</small>
</strong>{p.original ? <del>{p.original}积分</del> : <small>限量兑换</small>}</div>
</Link>)}</div>
<section className="gp-low-section" aria-label="小积分大满足"><div className="gp-section-heading"><h2>小积分 · 大满足</h2><Link to="/green-points/products?max=300">300积分以内<Arrow /></Link></div>
<div className="gp-low-points">{data.products.filter(p => p.price <= 300).slice(0,3).map(p => <Link to={`/green-points/products/${p.id}`} key={p.id}><ProductArt product={p} /><h3>{p.name}</h3><strong>{p.price}<small> 积分</small></strong></Link>)}</div></section>
<div className="gp-topic-grid"><Link to="/green-points/products?category=影音会员"><span>一人也精彩</span><h3>影音阅读时光</h3><p>把空闲留给热爱<Arrow direction="forward" /></p><Icon name="ticket" /></Link><Link to="/green-points/products?category=出行休闲"><span>周末去走走</span><h3>城市漫游计划</h3><p>发现身边的美好<Arrow direction="forward" /></p><Icon name="pin" /></Link></div>
<div className="gp-section-heading">
<h2>为你精选</h2>
<Checkbox className="gp-redeem-filter" checked={only} onChange={setOnly}>只看可兑换</Checkbox>
</div>
<Tabs items={categories} value={category} onChange={setCategory} />
<div className="gp-grid">{visibleProducts.map(p => <ProductCard key={p.id} product={p} />)}</div>{!visibleProducts.length && <Empty text="暂时没有可兑换的商品" />}
<p className="gp-footnote">青禾好物 · 让每一分都有好去处<br />演示商城，商品与权益仅用于功能体验</p></div>
</>;
}
export function ProductsPage() {
  const {
    data
  } = useMallContext();
  const [search, setSearch] = useSearchParams();
  const category = search.get('category') || '全部';
  const setCategory = category => setSearch(previous => { const next = new URLSearchParams(previous); next.set('category', category); return next; });
  const [type, setType] = useState('全部类型'),
    [sort, setSort] = useState('default'),
    [only, setOnly] = useState(false);
  const products = data.products.filter(p => (!search.get('q') || p.name.includes(search.get('q'))) && (!search.get('max') || p.price <= Number(search.get('max'))) && (category === '全部' || p.category === category) && (type === '全部类型' || p.type === (type === '实物' ? 'physical' : 'virtual')) && (!only || !redemptionIssue(data, p))).sort((a, b) => sort === 'asc' ? a.price - b.price : sort === 'desc' ? b.price - a.price : sort === 'stock' ? b.stock - a.stock : 0);
  return <>
<Header title="全部好物" />
<div className="gp-content">
<div className="gp-search">
<Icon name="search" />
<input placeholder="搜索商品" aria-label="搜索商品" value={search.get('q') || ''} onChange={e => setSearch(previous => { const next = new URLSearchParams(previous); next.set('q', e.target.value); return next; }, { replace: true })} />
</div>
<Tabs items={categories} value={category} onChange={setCategory} />
<ProductFilters type={type} sort={sort} only={only} onTypeChange={setType} onSortChange={setSort} onOnlyChange={setOnly} />
<div className="gp-section-heading"><span className="gp-muted">共 {products.length} 件好物{search.get('max') ? ` · ${search.get('max')}积分以内` : ''}</span><button onClick={() => {setSearch({});setType('全部类型');setOnly(false);setSort('default');}}>重置筛选</button></div><div className="gp-grid">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>{!products.length && <Empty text="没有符合条件的商品">
<button onClick={() => {
          setSearch({});
            setType('全部类型');
          setOnly(false);
        }}>清空筛选</button>
</Empty>}</div>
</>;
}
export function ProductPage() {
  const {
    id
  } = useParams();
  const {
    data, reload
  } = useMallContext();
  const p = data.products.find(p => p.id === id);
  const [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
  const productExists = Boolean(p);
  useEffect(() => { if (productExists) recordView(id).then(reload).catch(e => setMessage(e.message)); }, [id, productExists, reload]);
  const favorite = async () => { setBusy(true); try { await toggleFavorite(id); await reload(); } catch(e) { setMessage(e.message); } finally { setBusy(false); } };
  if (!p) return <>
<Header title="商品详情" />
<Empty text="商品不存在" />
</>;
  const physical = p.type === 'physical';
  const reason = redemptionIssue(data, p);
  return <>
<Header title="商品详情" />
<div className="gp-content gp-product-detail">
<ProductArt product={p} className="gp-detail-photo" />
<section className="gp-panel">
<div className="gp-section-heading"><h2>{p.name}</h2><button className={`gp-favorite${data.favorites.includes(id) ? ' active' : ''}`} onClick={favorite} disabled={busy} aria-label={data.favorites.includes(id) ? '取消收藏' : '收藏商品'} aria-pressed={data.favorites.includes(id)}><Icon name="heart" /></button></div>{message && <p role="status">{message}</p>}
<p className="gp-muted">{physical ? '实物商品 · 自提 / 包邮配送' : '虚拟权益 · 即时领取'}</p>
<div className="gp-price-line">
<strong>{p.price.toLocaleString()} <small>积分</small>
</strong>
<span>剩余 {p.stock} 件<br />每人限兑 {p.limit} 件</span>
</div>
</section>
<section className="gp-product-specs" aria-label="商品规格">
{p.spec.split(' · ').map((spec, i) => <div key={spec}><Icon name={['cup', 'shield', 'palette'][i] || 'gift'} /><span>{spec}</span></div>)}
</section>
<section className="gp-panel">
<h2>{physical ? '提货地点' : '使用说明'}</h2>{physical ? <>
<div className="gp-detail-info"><Icon name="pin" /><div><h3>{p.site}</h3>
<p>{p.address}</p>
<p><Icon name="clock" /> {p.hours}</p></div></div>
</> : <Rules items={[p.usage || p.spec, '每码限用一次，兑换后30天内有效', '发放后不可取消，过期不退积分']} />}</section>{physical && <section className="gp-panel">
<h2>兑换说明</h2>
<div className="gp-detail-info"><Icon name="record" /><ol><li>兑换后7天内凭提货码领取</li><li>提货前可取消，积分原路退回</li><li>逾期自动关闭并退还积分</li></ol></div>
</section>}<section className="gp-panel"><h2>好物详情</h2><p className="gp-muted">{p.description}</p><p className="gp-muted">{p.spec}</p><div className="gp-service-strip"><span><Icon name="shield" />品质甄选</span><Link to="/green-points/support">客服与售后<Arrow /></Link></div></section><Link className="gp-coupon-entry" to="/green-points/coupons"><Icon name="tag" /> 兑换前先领券，最高抵扣200积分 <Arrow /></Link><div className="gp-section-heading"><h2>你可能还喜欢</h2><Link to="/green-points/products">更多<Arrow /></Link></div><div className="gp-grid">{data.products.filter(item => item.id !== p.id && item.category === p.category).slice(0,2).map(item => <ProductCard key={item.id} product={item} />)}</div><div className="gp-action">
<span>可用积分 <strong>{data.balance.toLocaleString()}</strong>
</span>{reason ? <button className="gp-button" disabled>{reason}</button> : <Link className="gp-button" to={`/green-points/checkout/${p.id}`}>立即兑换</Link>}</div>
</div>
</>;
}
export function ActivitiesPage() {
  const {
    data
  } = useMallContext();
  const [params, setParams] = useSearchParams();
  const type = params.get('type') || '全部';
  const {
    signed,
    reward,
    bonus
  } = checkInSummary(data);
  return <>
<Header title="商城活动" />
<div className="gp-content">
<div className="gp-intro">
<h2>把绿色积分，换成生活好礼</h2>
<p>用行动点亮更美好的城市生活</p>
<Icon />
</div>
<Tabs items={['全部', '限时兑换', '折扣兑换', '签到加赠']} value={type} onChange={type => setParams({
        type
      })} />{data.activities.filter(a => type === '全部' || a.type === type).map(a => <section className={`gp-panel gp-activity gp-activity--${a.id}`} key={a.id}>
<h2><Link to={`/green-points/activities/${a.id}`}>{a.title}</Link></h2>
<span className="gp-badge">{Date.now() < a.start ? '即将开始' : Date.now() >= a.end ? '已结束' : '进行中'}</span>
<p className="gp-muted">活动时间：{shortDate(a.start)} — {shortDate(a.end)}</p>{a.id !== 'bonus' ? <>
<Art name={a.image} className="gp-activity-photo" />
<p>{a.description}</p>
<strong className="gp-large-price">{a.id === 'discount' ? '360' : '1,280'} <small>积分{a.id === 'limited' ? '起' : ''}</small>
</strong>{a.id === 'discount' && <p>
<del>450积分</del> <span className="gp-badge">积分8折</span>
</p>}</> : <Rows items={[["每日基础奖励", "10积分"], ["活动额外加赠", `+${bonus}积分`], [signed ? "今日签到状态" : "今日签到可得", signed ? "已领取" : `${reward}积分`]]} />}<Link className={a.id === 'bonus' ? `gp-button${signed ? ' gp-signed' : ''}` : 'gp-button gp-outline'} to={a.id === 'bonus' ? '/green-points/check-in' : `/green-points/activities/${a.id}`}>{a.id === 'bonus' ? (signed ? '已签到' : '去签到') : <>查看活动<Arrow direction="forward" /></>}</Link>
</section>)}<p className="gp-footnote">活动奖励与兑换规则以详情页为准<br />所有商品仅使用积分兑换</p>
</div>
</>;
}
export function ActivityPage() {
  const {
    id
  } = useParams();
  const {
    data
  } = useMallContext();
  const { signed } = checkInSummary(data);
  const a = data.activities.find(a => a.id === id);
  if (!a) return <>
<Header title="活动详情" />
<Empty text="活动不存在" />
</>;
  return <>
<Header title="活动详情" />
<div className="gp-content">
<section className="gp-intro">
<h2>{a.title}</h2>
<p>{a.description}</p>
<p>{shortDate(a.start)} — {shortDate(a.end)}</p>
</section>
<section className="gp-panel">
<h2>活动规则</h2>
<Rules items={a.id === 'bonus' ? ['活动期间每日签到额外奖励5积分', '基础与连续签到奖励正常叠加', '每天只可领取一次签到奖励'] : ['活动期间开放兑换，数量有限兑完为止', '每人限兑数量以商品详情为准', '只使用积分兑换，不涉及现金']} />
</section>{a.id === 'bonus' ? <Link className={`gp-button${signed ? ' gp-signed' : ''}`} to="/green-points/check-in">{signed ? '已签到' : '去签到'}</Link> : <div className="gp-grid">{data.products.filter(p => a.productIds.includes(p.id)).map(p => <ProductCard key={p.id} product={p} />)}</div>}</div>
</>;
}
