import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Arrow, Header, Icon, Tabs, Empty, ProductCard, Rules } from '../components/UI';
import { useMallContext, dateText } from '../components/MallContext';
import { claimCoupon } from '../services/coupon.service';
import { saveAddress, deleteAddress } from '../services/address.service';
import { submitSupport } from '../services/support.service';
import { SupportForm, FeedbackList } from '../components/SupportContent';

export function CouponsPage() {
  const { data, reload } = useMallContext();
  const [params] = useSearchParams();
  const [tab, setTab] = useState(params.get('tab') === 'wallet' ? '可使用' : '领券中心');
  const [busy, setBusy] = useState(''), [message, setMessage] = useState('');
  const coupons = tab === '领券中心' ? data.coupons : data.wallet.filter(c => tab === '已使用' ? c.usedBy : tab === '已过期' ? !c.usedBy && c.expiresAt <= Date.now() : !c.usedBy && c.expiresAt > Date.now());
  const claim = async id => { setBusy(id); try { await claimCoupon(id); await reload(); setMessage('领取成功，兑换时可选择抵扣'); } catch(e) { setMessage(e.message); } finally { setBusy(''); } };
  return <><Header title="领券与券包" /><div className="gp-content"><section className="gp-intro"><span className="gp-eyebrow">A LITTLE EXTRA</span><h2>让积分，再多换一点</h2><p>先领券再兑换，好物更划算</p></section><Tabs items={['领券中心', '可使用', '已使用', '已过期']} value={tab} onChange={setTab} />{message && <p className="gp-feedback" role="status">{message}</p>}{coupons.map(c => { const claimed = data.wallet.some(w => w.id === c.id); return <section className="gp-coupon" key={c.id}><div className="gp-coupon-value"><strong>{c.amount}</strong><span>积分抵扣</span></div><div><h3>{c.title}</h3><p>满 {c.minimum} 积分可用</p><small>{c.expiresAt ? `有效期至 ${dateText(c.expiresAt).split(' ')[0]}` : `领取后 ${c.days} 天有效`}</small></div>{tab === '领券中心' ? <button disabled={Boolean(busy) || claimed} onClick={() => claim(c.id)}>{claimed ? '已领取' : '领取'}</button> : tab === '可使用' ? <Link to="/green-points/products">去使用</Link> : <span>{tab}</span>}</section>; })}{!coupons.length && <Empty text="这里还没有抵扣券"><button className="gp-button" onClick={() => setTab('领券中心')}>去领券</button></Empty>}<section className="gp-panel"><h2>用券小贴士</h2><Rules items={['每张券限领一次，每笔兑换可使用一张', '使用门槛按商品总积分计算，不可叠加', '取消实物订单时退还实扣积分和抵扣券；券有效期不延长']} /></section></div></>;
}
export function CollectionPage() {
  const { data } = useMallContext();
  const [params] = useSearchParams();
  const tab = params.get('type') === 'history' ? 'history' : 'favorites';
  const products = data[tab].map(id => data.products.find(p => p.id === id)).filter(Boolean);
  return <><Header title={tab === 'history' ? '浏览足迹' : '我的收藏'} /><div className="gp-content"><div className="gp-section-heading"><h2>{tab === 'history' ? '最近看过' : '心动好物'}</h2><span>{products.length} 件商品</span></div><div className="gp-grid">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>{!products.length && <Empty text={tab === 'history' ? '逛逛商城，发现你的下一份好礼' : '在商品详情点亮爱心，留住喜欢的好物'} />}</div></>;
}
export function AddressesPage() {
  const { data, reload } = useMallContext();
  const [editing, setEditing] = useState(null), [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
  const save = async e => { e.preventDefault(); const form = new FormData(e.currentTarget); setBusy(true); try { await saveAddress({ ...Object.fromEntries(form), id: editing.id, isDefault: form.get('isDefault') === 'on' }); await reload(); setEditing(null); setMessage('地址已保存'); } catch(e) { setMessage(e.message); } finally { setBusy(false); } };
  const remove = async id => { setBusy(true); try { await deleteAddress(id); await reload(); setMessage('地址已删除'); } catch(e) { setMessage(e.message); } finally { setBusy(false); } };
  return <><Header title="收货地址" /><div className="gp-content"><p className="gp-muted">保存常用地址，兑换实物时可选择配送到家</p>{data.addresses.map(a => <section className="gp-panel" key={a.id}><div className="gp-section-heading"><h3>{a.name} <small>{a.phone}</small></h3>{a.isDefault && <span className="gp-badge">默认</span>}</div><p>{a.detail}</p><div className="gp-address-actions"><button onClick={() => {setEditing(a);setMessage('');}}>编辑</button><button disabled={busy} onClick={() => remove(a.id)}>删除</button></div></section>)}{!data.addresses.length && !editing && <Empty text="还没有收货地址"><span>也可以在兑换时选择定点自提</span></Empty>}{editing ? <form className="gp-panel gp-form" onSubmit={save} key={editing.id || 'new'}><h2>{editing.id ? '编辑地址' : '新增地址'}</h2><label>收货人<input name="name" required maxLength={30} defaultValue={editing.name} placeholder="请输入收货人姓名" /></label><label>手机号码<input name="phone" required inputMode="tel" maxLength={11} defaultValue={editing.phone} placeholder="11位手机号码" /></label><label>完整地址<textarea name="detail" required minLength={8} maxLength={200} defaultValue={editing.detail} placeholder="省、市、区、街道和门牌号" /></label><label className="gp-inline"><input type="checkbox" name="isDefault" defaultChecked={editing.isDefault} />设为默认地址</label><div className="gp-buttons"><button type="button" className="gp-button gp-outline" onClick={() => setEditing(null)}>取消</button><button className="gp-button" disabled={busy}>保存地址</button></div></form> : <button className="gp-button" onClick={() => {setEditing({});setMessage('');}}>＋ 新增收货地址</button>}{message && <p role="status" className="gp-feedback">{message}</p>}</div></>;
}
export function SupportPage() {
  const { data, reload } = useMallContext();
  const [params] = useSearchParams();
  const [message, setMessage] = useState(''), [error, setError] = useState('');
  const submit = async body => {
    setMessage(''); setError('');
    try {
      await submitSupport(body);
      await reload();
      setMessage('反馈已保存，可在下方“我的反馈”查看');
      return true;
    } catch (e) { setError(e.message); return false; }
  };
  return <><Header title="客服与售后" /><div className="gp-content gp-support-page">
    <section className="gp-support-intro"><span className="gp-support-intro-icon"><Icon name="support" /></span><div><h2>你的问题，我们用心对待</h2><p>兑换、配送与权益使用帮助</p></div><Link to="/green-points/help">常见问题<Arrow /></Link></section>
    <SupportForm orders={data.orders} initialOrderId={params.get('order') || ''} onSubmit={submit} />
    {message && <p className="gp-feedback" role="status">{message}</p>}{error && <p className="gp-error" role="alert">{error}</p>}
    <FeedbackList feedback={data.support} orders={data.orders} />
  </div></>;
}
