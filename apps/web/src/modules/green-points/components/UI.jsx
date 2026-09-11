import { useState } from 'react';
import { Button, Checkbox, Popup, Radio } from 'antd-mobile';
import PropTypes from 'prop-types';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import cup from '../assets/cup.png';
import bag from '../assets/bag.png';
import ticket from '../assets/ticket.png';
import book from '../assets/book.png';
import park from '../assets/park.png';
import voucher from '../assets/voucher.png';
const pictures = {
  voucher,
  cup,
  bag,
  ticket,
  book,
  park
};
export function Art({
  name,
  className = ''
}) {
  return <img className={className} src={pictures[name] || cup} alt="" />;
}
Art.propTypes = {
  name: PropTypes.string,
  className: PropTypes.string
};
export function ProductArt({ product, className = '' }) {
  const artwork = {
    coffee: ['COFFEE BREAK', '午后咖啡', 'cup', 'coffee'],
    tea: ['TEA MOMENT', '一杯清欢', 'leaf', 'tea'],
    bakery: ['FRESHLY BAKED', '街角烘焙', 'gift', 'bakery'],
    music: ['MUSIC EVERYDAY', '随心畅听', 'music', 'music'],
    reading: ['READ & RELAX', '好书相伴', 'record', 'reading'],
    museum: ['CITY EXHIBITION', '城市特展', 'building', 'museum'],
    garden: ['A DAY IN GREEN', '漫游植物园', 'leaf', 'garden']
  }[product.id];
  if (!artwork) return <Art name={product.image} className={className} />;
  return <div className={`gp-product-art gp-product-art--${artwork[3]} ${className}`} role="img" aria-label={product.name}><span>{artwork[0]}</span><Icon name={artwork[2]} /><b>{artwork[1]}</b><small>青禾 · 精选权益</small></div>;
}
ProductArt.propTypes = { product: PropTypes.object.isRequired, className: PropTypes.string };
export function Icon({
  name = 'leaf'
}) {
  const paths = {
    music: 'M9 18V5l11-2v13M9 5v4l11-2M9 18a3 3 0 1 1-3-3c2 0 3 1 3 3ZM20 16a3 3 0 1 1-3-3c2 0 3 1 3 3Z',
    ticket: 'M3 5h18v5a2 2 0 0 0 0 4v5H3v-5a2 2 0 0 0 0-4ZM15 5v3m0 3v2m0 3v3',
    heart: 'M20 5c-3-3-6-1-8 1-2-2-5-4-8-1s0 8 8 15c8-7 11-12 8-15Z',
    grid: 'M3 3h7v7H3ZM14 3h7v7h-7ZM3 14h7v7H3ZM14 14h7v7h-7Z',
    support: 'M4 14v-3a8 8 0 0 1 16 0v3M4 12H2v7h4v-7ZM20 12h2v7h-4v-7ZM20 19c0 3-4 3-8 3',
    building: 'M5 21V3h10v18M15 10h4v11M3 21h18M8 7h1m2 0h1M8 11h1m2 0h1M8 15h1m2 0h1M9 21v-3h2v3',
    cup: 'M6 3h12l-1 18H7ZM8 7h8',
    shield: 'm12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6Zm-4 9 3 3 5-6',
    palette: 'M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 0-4h-1a2 2 0 0 1 0-4h5a4 4 0 0 0 4-4c0-3-5-6-9-6ZM7 9h.01M11 6h.01M16 7h.01M6 14h.01',
    leaf: 'M20 3C8 2 3 7 5 14c2 7 14 6 15-11ZM5 20 15 9',
    back: 'm15 5-7 7 7 7',
    search: 'M20 20l-5-5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
    user: 'M8 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0M4 21v-3c0-7 16-7 16 0v3Z',
    calendar: 'M5 5h14v16H5ZM8 2v6M16 2v6M5 10h14m-10 5 2 2 4-4',
    clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18m0 4v6l4 2',
    gift: 'M3 8h18v5H3ZM5 13v8h14v-8M12 8v13M12 8C2 8 5 0 9 4Zm0 0c10 0 7-8 3-4Z',
    tag: 'm3 3 9 0 9 9-9 9-9-9ZM7 7h.01',
    record: 'M6 3h12v18H6ZM9 8h6M9 12h6M9 16h4',
    check: 'm5 12 5 5L20 7',
    pin: 'M12 22s8-8 8-13A8 8 0 0 0 4 9c0 5 8 13 8 13Zm0-17a4 4 0 1 0 0 8 4 4 0 0 0 0-8'
  };
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d={paths[name] || paths.leaf} />
</svg>;
}
Icon.propTypes = {
  name: PropTypes.string
};
export function Arrow({ direction = 'right', className = '' }) {
  const paths = {
    right: 'm9 6 6 6-6 6',
    left: 'm15 6-6 6 6 6',
    down: 'm6 9 6 6 6-6',
    forward: 'M5 12h14m-6-6 6 6-6 6',
    diagonal: 'M6 18 18 6M7 6h11v11'
  };
  return <svg className={`gp-arrow gp-arrow--${direction} ${className}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={paths[direction]} /></svg>;
}
Arrow.propTypes = { direction: PropTypes.oneOf(['right', 'left', 'down', 'forward', 'diagonal']), className: PropTypes.string };
export function Header({
  title,
  home = false
}) {
  const navigate = useNavigate();
  return <header className={`gp-header${home ? ' gp-header--home' : ''}`}>
{!home && <button className="gp-back" onClick={() => window.history.state?.idx > 0 ? navigate(-1) : navigate('/green-points')} aria-label="返回上一页"><Arrow direction="left" /></button>}
{home && <Link className="gp-home-return" to="/"><Arrow direction="left" />返回主页</Link>}
<h1>{title}</h1></header>;
}
Header.propTypes = {
  title: PropTypes.string,
  home: PropTypes.bool
};
export function ProductCard({
  product
}) {
  return <Link className="gp-product" to={`/green-points/products/${product.id}`}>
<ProductArt product={product} />
<div>
<h3>{product.name}</h3>
<p>{product.type === 'physical' ? '实物 · 包邮 / 自提' : '虚拟 · 即时领取'}</p>
<footer>
<strong>{product.price.toLocaleString()} <small>积分</small>
</strong>
<span>{product.original ? '限时折扣' : `剩余${product.stock}件`}</span>
</footer>
</div>
</Link>;
}
ProductCard.propTypes = {
  product: PropTypes.object.isRequired
};
export function Rows({
  items
}) {
  return <div className="gp-rows">{items.map(([key, value]) => <div className="gp-row" key={key}>
<span>{key}</span>
<span>{value}</span>
</div>)}</div>;
}
Rows.propTypes = {
  items: PropTypes.array.isRequired
};
export function Rules({
  items
}) {
  return <ol className="gp-rules">{items.map((item, i) => <li key={item}>
<span>{i + 1}</span>
<p>{item}</p>
</li>)}</ol>;
}
Rules.propTypes = {
  items: PropTypes.array.isRequired
};
export function Empty({
  text = '暂无记录',
  children
}) {
  return <div className="gp-empty">
<Icon name="leaf" />
<h3>{text}</h3>{children || <Link to="/green-points">去商城看看</Link>}</div>;
}
Empty.propTypes = {
  text: PropTypes.string,
  children: PropTypes.node
};
export function Tabs({
  items,
  value,
  onChange
}) {
  return <div className="gp-tabs">{items.map(item => <button key={item} className={value === item ? 'selected' : ''} aria-pressed={value === item} onClick={() => onChange(item)}>{item}</button>)}</div>;
}
Tabs.propTypes = {
  items: PropTypes.array.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired
};

export function BottomNav() {
  return <nav className="gp-bottom-nav" aria-label="商城导航">{[['', 'leaf', '商城'], ['/products', 'grid', '分类'], ['/activities', 'gift', '好礼'], ['/me', 'user', '我的']].map(([path, icon, label]) => <NavLink key={label} to={`/green-points${path}`} end={path === ''} className={({isActive}) => isActive ? 'active' : ''}><Icon name={icon} /><span>{label}</span></NavLink>)}</nav>;
}

export function ProductFilters({ type, sort, only, onTypeChange, onSortChange, onOnlyChange }) {
  const [activeKey, setActiveKey] = useState(null);
  const filters = [
    { key: 'type', label: '商品类型', value: type, onChange: onTypeChange, options: ['全部类型', '实物', '虚拟'].map(value => ({ label: value, value })) },
    { key: 'sort', label: '积分排序', value: sort, onChange: onSortChange, options: [{ label: '默认排序', value: 'default' }, { label: '库存优先', value: 'stock' }, { label: '积分从低到高', value: 'asc' }, { label: '积分从高到低', value: 'desc' }] }
  ];
  const activeFilter = filters.find(filter => filter.key === activeKey);
  return <div className="gp-filters">
    <div className="gp-filter-triggers">
      {filters.map(filter => <Button key={filter.key} fill="none" size="small" data-filtered={filter.key === 'type' ? type !== '全部类型' : sort !== 'default'} aria-label={`${filter.label}：${filter.options.find(option => option.value === filter.value)?.label}`} aria-haspopup="dialog" aria-expanded={activeKey === filter.key} onClick={() => setActiveKey(filter.key)}><span className="gp-filter-label">{filter.options.find(option => option.value === filter.value)?.label}</span><Arrow direction="down" className="gp-filter-arrow" /></Button>)}
    </div>
    <Checkbox className="gp-filter-checkbox" checked={only} onChange={onOnlyChange}>可兑换</Checkbox>
    <Popup visible={Boolean(activeFilter)} position="bottom" closeOnMaskClick showCloseButton onClose={() => setActiveKey(null)} destroyOnClose bodyClassName="gp-filter-sheet" getContainer={() => document.querySelector('.gp-app')}>
      {activeFilter && <section role="dialog" aria-modal="true" aria-label={activeFilter.label}>
        <h2>{activeFilter.label}</h2>
        <div className="gp-filter-options">
          <Radio.Group value={activeFilter.value} onChange={value => { activeFilter.onChange(value); setActiveKey(null); }}>
            {activeFilter.options.map(option => <Radio key={option.value} value={option.value} block>{option.label}</Radio>)}
          </Radio.Group>
        </div>
        <div className="gp-sheet-footer"><Button block className="gp-sheet-cancel" onClick={() => setActiveKey(null)}>取消</Button></div>
      </section>}
    </Popup>
  </div>;
}
ProductFilters.propTypes = {
  type: PropTypes.string.isRequired,
  sort: PropTypes.string.isRequired,
  only: PropTypes.bool.isRequired,
  onTypeChange: PropTypes.func.isRequired,
  onSortChange: PropTypes.func.isRequired,
  onOnlyChange: PropTypes.func.isRequired
};
