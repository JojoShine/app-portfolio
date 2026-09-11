import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import QRCode from 'qrcode';
import { Dialog } from 'antd-mobile';
import { Arrow, Header, Art, ProductArt, Rows, Rules, Empty, Tabs, Icon } from '../components/UI';
import { useMallContext, dateText, statuses } from '../components/MallContext';
import { redemptionIssue } from '../utils/rules';
import { redeem, cancelOrder, completeOrder } from '../services/order.service';
export function CheckoutPage() {
  const {
    id
  } = useParams();
  const {
    data,
    reload
  } = useMallContext();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [couponId, setCouponId] = useState(null),
    [delivery, setDelivery] = useState('pickup'),
    [addressId, setAddressId] = useState(''),
    [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const p = data.products.find(p => p.id === id);
  if (!p) return <>
<Header title="确认兑换" />
<Empty text="商品不存在" />
</>;
  const eligibleCoupons = data.wallet.filter(c => !c.usedBy && c.expiresAt > Date.now() && p.price * quantity >= c.minimum);
  const coupon = couponId === null ? [...eligibleCoupons].sort((a,b) => b.amount - a.amount)[0] : eligibleCoupons.find(c => c.id === couponId);
  const total = Math.max(0, p.price * quantity - (coupon?.amount || 0));
  const selectedAddressId = addressId || data.addresses.find(a => a.isDefault)?.id || '';
  const issue = redemptionIssue({ ...data, wallet: [], balance: data.balance + (coupon?.amount || 0) }, p, quantity) || (delivery === 'shipping' && !data.addresses.some(a => a.id === selectedAddressId) ? '请先添加收货地址' : '');
  const cutoff = dateText(Date.now() + (p.type === 'physical' ? 7 : 30) * 86400000);
  const submit = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const o = await redeem({
        productId: p.id,
        quantity,
        requestId, couponId: coupon?.id || '', delivery, addressId: delivery === 'shipping' ? selectedAddressId : undefined
      });
      await reload();
      navigate(`/green-points/orders/${o.id}/result`, {
        replace: true
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return <>
<Header title="确认兑换" />
<div className="gp-content">
<section className="gp-panel gp-order-product">
<ProductArt product={p} />
<div>
<h2>{p.name}</h2>
<p>{p.spec}</p>
<strong>{p.price.toLocaleString()} 积分</strong>
</div>
</section>
<section className="gp-panel">
<div className="gp-row">
<span>兑换数量</span>
<div className="gp-stepper">
<button disabled={busy || quantity <= 1} aria-label="减少数量" onClick={() => {
              setQuantity(quantity - 1);
              setRequestId(crypto.randomUUID());
            }}>−</button>
<span>{quantity}</span>
<button disabled={busy || quantity >= Math.min(p.limit, p.stock)} aria-label="增加数量" onClick={() => {
              setQuantity(quantity + 1);
              setRequestId(crypto.randomUUID());
            }}>+</button>
</div>
</div>
<Rows items={[["商品积分", `${p.price * quantity}积分`], ["可用积分", `${data.balance}积分`]]} />
<div className="gp-form"><label>积分抵扣券<select value={coupon?.id || ''} disabled={busy} onChange={e => {setCouponId(e.target.value);setRequestId(crypto.randomUUID());}}><option value="">不使用抵扣券</option>{eligibleCoupons.map(c => <option key={c.id} value={c.id}>{c.title} · 减{c.amount}积分</option>)}</select></label></div><Link className="gp-menu" to="/green-points/coupons">{eligibleCoupons.length ? '查看更多抵扣券' : '暂无可用券，去领券中心看看'}<Arrow /></Link><Rows items={[["优惠抵扣", `−${coupon?.amount || 0}积分`], ["实付积分", `${total}积分`]]} />
</section>
<section className="gp-panel">
<h2>{p.type === 'physical' ? '选择领取方式' : '权益领取说明'}</h2>{p.type === 'physical' && <><Tabs items={['定点自提', '配送到家']} value={delivery === 'shipping' ? '配送到家' : '定点自提'} onChange={v => {setDelivery(v === '配送到家' ? 'shipping' : 'pickup');setRequestId(crypto.randomUUID());}} />{delivery === 'shipping' && <div className="gp-form"><label>收货地址<select value={selectedAddressId} onChange={e => {setAddressId(e.target.value);setRequestId(crypto.randomUUID());}}><option value="">请选择地址</option>{data.addresses.map(a => <option key={a.id} value={a.id}>{a.name} · {a.detail}</option>)}</select></label><Link to="/green-points/addresses">管理 / 新增地址<Arrow /></Link><p className="gp-muted">免运费 · 演示配送，7天内可模拟收货；收货前可取消。</p></div>}</>}{p.type === 'physical' ? delivery === 'pickup' && <>
<div className="gp-pickup-location">
<div><span className="gp-location-icon"><Icon name="pin" /></span><span>{p.site}</span></div>
<div><span className="gp-location-icon"><Icon name="building" /></span><span>{p.address}</span></div>
<div><span className="gp-location-icon"><Icon name="clock" /></span><span>{p.hours}</span></div>
</div>
<p className="gp-deadline">预计提货截止：{cutoff}<br />
<small>以兑换成功后的订单时间为准</small>
</p>
<Rules items={['兑换后7天内凭提货码领取', '提货前可取消，逾期自动退还积分']} />
</> : <>
<p className="gp-deadline">预计有效期至：{cutoff}</p>
<Rules items={['兑换成功后即时发放演示兑换码', '有效期30天，每码限用一次', '发放后不可取消，过期不退积分']} />
</>}</section>{error && <p className="gp-error" role="alert">{error}</p>}<button className="gp-button" disabled={busy || Boolean(issue)} onClick={submit}>{busy ? '兑换中…' : issue ? issue : `确认兑换 · ${total}积分`}</button>
<p className="gp-footnote">确认后将扣除相应积分</p>
</div>
</>;
}
export function ResultPage() {
  const {
    id
  } = useParams();
  const {
    data
  } = useMallContext();
  const o = data.orders.find(o => o.id === id);
  if (!o) return <>
<Header title="兑换结果" />
<Empty text="订单不存在" />
</>;
  return <>
<Header title="兑换结果" />
<div className="gp-content">
<section className="gp-result">
<Icon name="check" />
<h2>兑换成功</h2>
<p>一份绿色好礼，即将走进你的生活</p>
<ProductArt product={o.product} />
<h3>{o.product.name}</h3>
<strong>{o.total} 积分</strong>
<p>{o.product.type === 'physical' ? (o.delivery === 'shipping' ? '配送订单已创建，可在订单详情模拟收货' : '请在有效期内前往指定地点提货') : '电子凭证已发放，请在有效期内使用'}</p>
</section>
<Link className="gp-button" to={`/green-points/orders/${o.id}`}>查看{o.delivery === 'shipping' ? '配送订单' : o.product.type === 'physical' ? '提货凭证' : '电子凭证'}</Link>
<Link className="gp-button gp-outline" to="/green-points">继续逛商城</Link>
</div>
</>;
}
export function OrdersPage() {
  const {
    data
  } = useMallContext();
  const [params, setParams] = useSearchParams();
  const filter = params.get('status') || '全部';
  const [limit, setLimit] = useState(20);
  const list = data.orders.filter(o => filter === '全部' || filter === '已关闭' && ['cancelled', 'expired'].includes(o.status) || statuses[o.status] === filter);
  return <>
<Header title="兑换记录" />
<div className="gp-content">
<Tabs items={['全部', '待提货', '待收货', '待使用', '已完成', '已关闭']} value={filter} onChange={status => {
        setParams({
          status
        });
        setLimit(20);
      }} />{list.slice(0, limit).map(o => <Link className="gp-panel gp-order-card" key={o.id} to={`/green-points/orders/${o.id}`}>
<div className="gp-section-heading">
<span>{dateText(o.time)}</span>
<b>{statuses[o.status]}</b>
</div>
<div className="gp-order-product">
<ProductArt product={o.product} />
<div>
<h3>{o.product.name}</h3>
<p>{o.product.type === 'physical' ? (o.delivery === 'shipping' ? '实物 · 配送到家' : '实物 · 定点自提') : '虚拟 · 电子凭证'}</p>
<strong>{o.total} 积分 <small>×{o.quantity}</small>
</strong>
</div>
</div>
<footer>查看订单详情<Arrow /></footer>
</Link>)}{!list.length && <Empty text="还没有相关兑换记录" />}{list.length > limit && <button className="gp-button gp-outline" onClick={() => setLimit(limit + 20)}>加载更多</button>}</div>
</>;
}
export function OrderPage() {
  const {
    id
  } = useParams();
  const {
    data,
    reload
  } = useMallContext();
  const [qr, setQr] = useState(''),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState('');
  const o = data.orders.find(o => o.id === id);
  const valid = o && ['pending', 'shipping', 'available'].includes(o.status);
  useEffect(() => {
    let active = true;
    setQr('');
    if (o?.product.type === 'physical' && valid) QRCode.toDataURL(`green-points:demo:${o.id}:${o.code}`, {
      width: 240,
      margin: 4
    }).then(url => {
      if (active) setQr(url);
    }).catch(() => {
      if (active) setMessage('二维码暂不可用，请使用提货码');
    });
    return () => {
      active = false;
    };
  }, [o?.id, o?.code, o?.product.type, valid]);
  if (!o) return <>
<Header title="订单详情" />
<Empty text="订单不存在" />
</>;
  const physical = o.product.type === 'physical';
  const shipping = o.delivery === 'shipping';
  const action = async cancel => {
    const yes = await Dialog.confirm({
      title: cancel ? '取消兑换？' : physical ? shipping ? '确认模拟收货？' : '确认模拟提货？' : '确认模拟使用？',
      content: cancel ? `将退还${o.total}积分${o.couponId ? '及抵扣券' : ''}，订单将关闭。` : '完成后凭证不可再次使用。',
      confirmText: cancel ? '取消并退积分' : '确认完成',
      cancelText: '暂不操作'
    });
    if (!yes) return;
    setBusy(true);
    try {
      await (cancel ? cancelOrder : completeOrder)(o.id);
      await reload();
      setMessage(cancel ? '已取消，积分已退回' : '已完成，感谢你的绿色行动');
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(o.code);
      setMessage('兑换码已复制');
    } catch {
      setMessage('无法自动复制，请长按下方兑换码手动复制');
    }
  };
  return <>
<Header title="订单详情" />
<div className="gp-content gp-order-detail">
<section className="gp-status">
<Icon name={valid ? 'clock' : 'check'} />
<div>
<h2>{statuses[o.status]}</h2>
<p>{valid ? `${physical ? '请于' : '有效期至'}${dateText(o.expiresAt)}${physical ? shipping ? '前完成模拟收货' : '前领取' : ''}` : physical && o.status === 'completed' ? '商品已领取' : physical && ['cancelled', 'expired'].includes(o.status) ? '订单已关闭，积分已退还' : '凭证已失效，不可重复使用'}</p>
</div>
</section>
{!shipping && !(physical && o.status === 'completed') && <section className="gp-panel gp-credential">
<h2>{physical ? '提货凭证' : '电子凭证'}</h2>{valid ? <>{physical ? qr ? <img src={qr} className="gp-qr" alt="演示提货二维码" /> : <p>正在准备二维码…</p> : <Art name="voucher" className="gp-ticket" />}<small>演示凭证</small>
<p>{physical ? '提货码' : '兑换码'}</p>
<strong className="gp-code">{o.code.match(/.{1,4}/g).join(' ')}</strong>{!physical && <button className="gp-button gp-outline" onClick={copy}>复制兑换码</button>}<p>{physical ? '到店出示二维码或提货码' : '使用时出示兑换码'}</p>
</> : <div className="gp-invalid">
<Icon name="record" />
<h3>{statuses[o.status]}</h3>
<p>此凭证已失效</p>
</div>}</section>}
<section className="gp-panel">
<h2>兑换{physical ? '商品' : '权益'}</h2>
<div className="gp-order-product">
<ProductArt product={o.product} />
<div>
<h3>{o.product.name}</h3>
<p>{o.product.spec}</p>
<strong>{o.total.toLocaleString()} 积分 <small>×{o.quantity}</small>
</strong>
</div>
</div>
</section>
<section className="gp-panel">
<h2>{physical ? shipping ? '配送信息' : '提货地点' : '使用说明'}</h2>{shipping ? <><p>{o.address.name} · {o.address.phone}</p><p>{o.address.detail}</p><p className="gp-muted">{valid ? '等待收货 · 演示订单，不发出真实包裹；可模拟完成收货' : statuses[o.status]}</p></> : physical ? <>
<div className="gp-pickup-location">
<div><span className="gp-location-icon"><Icon name="pin" /></span><span>{o.product.site}</span></div>
<div><span className="gp-location-icon"><Icon name="building" /></span><span>{o.product.address}</span></div>
<div><span className="gp-location-icon"><Icon name="clock" /></span><span>{o.product.hours}</span></div>
</div>
</> : <Rules items={[o.product.usage || o.product.spec, '使用时出示兑换码，每码限用一次', '发放后不可取消，过期不退积分', '请在有效期内使用兑换码']} />}</section>
<section className="gp-panel">
<h2>订单信息</h2>
<Rows items={[["订单编号", o.id], ["兑换时间", dateText(o.time)], ["优惠抵扣", `${o.discount || 0}积分`], ["实扣积分", `${o.total}积分`]]} />
<p className="gp-order-note">{physical ? '完成领取前可取消并退还实扣积分；\n逾期自动关闭并退还积分。' : '虚拟商品发放后不可取消，过期不退积分。'}</p>
</section>{message && <p role="status" className="gp-feedback">{message}</p>}{valid && <>
<div className="gp-buttons">{physical && <button className="gp-button gp-outline" disabled={busy} onClick={() => action(true)}>取消兑换</button>}<button className="gp-button" disabled={busy} onClick={() => action(false)}>模拟{physical ? shipping ? '收货完成' : '提货完成' : '使用'}</button>
</div>
<p className="gp-footnote">演示操作，用于体验{physical ? shipping ? '收货' : '提货' : '权益使用'}流程</p>
</>}<Link className="gp-order-support" to={`/green-points/support?order=${o.id}`}><span className="gp-order-support-icon"><Icon name="support" /></span><span className="gp-order-support-copy"><b>联系客服 / 申请售后</b><small>兑换、配送及权益使用问题</small></span><Arrow /></Link></div>
</>;
}
