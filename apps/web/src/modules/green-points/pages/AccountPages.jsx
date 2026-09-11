import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Arrow, Header, Icon, ProductArt, Rules, Tabs, Empty } from '../components/UI';
import { useMallContext, dateText, shortDate, statuses } from '../components/MallContext';
import { checkIn } from '../services/account.service';
import { checkInSummary } from '../utils/rules';
export function CheckInPage() {
  const {
    data,
    reload
  } = useMallContext();
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState('');
  const {
    signed,
    streak,
    position,
    bonus,
    reward
  } = checkInSummary(data);
  const handle = async () => {
    setBusy(true);
    try {
      const r = await checkIn();
      await reload();
      setMessage(`签到成功！${r.amount}积分已到账`);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  };
  return <>
<div className="gp-check-top">
<Header title="每日签到" />
<div className="gp-check-hero">
<div>
<span>可用积分</span>
<strong>{data.balance.toLocaleString()}</strong>
</div>
</div>
</div>
<div className="gp-content">
<section className="gp-panel gp-check-card">
<h2 className="gp-streak">连续签到 <strong>{streak}</strong> 天</h2>
<p className="gp-muted">{position === 7 ? '本轮奖励已领取，明天开启新一轮' : `再连续签到${7 - position}天，额外获得30积分`}</p>
<div className="gp-days">{Array.from({
            length: 7
          }, (_, i) => {
            const done = i < position;
            const active = !signed && i === position;
            return <div key={i} className={active ? 'today' : done ? 'done' : ''}>
<span>第{i + 1}天</span>
<Icon name={done ? 'check' : active ? 'calendar' : 'gift'} />
<strong>{active ? '今日未签' : '+10'}</strong>{i === 6 && <b>额外+30</b>}<small>{shortDate(Date.now() + (i - position + (signed ? 1 : 0)) * 86400000)}</small>
</div>;
          })}</div>
<button className={`gp-button${signed ? ' gp-signed' : ''}`} disabled={signed || busy} onClick={handle}>{busy ? '领取中…' : signed ? '今日已签到' : '立即签到'}</button>
<p className="gp-footnote">{signed ? '今日奖励已到账，明天再来吧' : `基础10积分 + 活动加赠${bonus}积分，今日共${reward}积分`}</p>{message && <p role="status" className="gp-feedback">{message}</p>}</section>{bonus > 0 && <Link className="gp-bonus" to="/green-points/activities/bonus">
<Icon name="gift" />
<div>
<h3>签到加赠进行中</h3>
<span>今日签到额外 +{bonus}积分</span>
</div>
<span>查看活动<Arrow /></span>
</Link>}<section className="gp-panel">
<h2>签到规则</h2>
<Rules items={['每日签到获得10积分', '每连续7天额外奖励30积分', '漏签后重新累计，不支持补签', '活动加赠与日常奖励叠加']} />
</section>
<section className="gp-panel">
<div className="gp-section-heading">
<h2>最近签到</h2>
<Link to="/green-points/points">查看全部<Arrow /></Link>
</div>{data.ledger.filter(r => r.title.startsWith('每日签到')).slice(0, 3).map(r => <div className="gp-row" key={r.id}>
<span>{dateText(r.time).split(' ')[0]}</span>
<strong>+{r.amount} 积分</strong>
</div>)}</section>
</div>
</>;
}
export function PointsPage() {
  const {
    data
  } = useMallContext();
  const [filter, setFilter] = useState('全部'),
    [limit, setLimit] = useState(20);
  const records = data.ledger.filter(r => filter === '全部' || (filter === '收入' ? r.amount > 0 : r.amount < 0));
  return <>
<Header title="积分明细" />
<div className="gp-content">
<section className="gp-balance">
<div>
<span>可用积分</span>
<strong>{data.balance.toLocaleString()}</strong>
</div>
<Icon />
</section>
<Tabs items={['全部', '收入', '支出']} value={filter} onChange={f => {
        setFilter(f);
        setLimit(20);
      }} />
<section className="gp-panel">{records.slice(0, limit).map(r => <div className="gp-ledger" key={r.id}>
<div>{r.orderId ? <Link to={`/green-points/orders/${r.orderId}`}>{r.title}<Arrow /></Link> : <h3>{r.title}</h3>}<small>{dateText(r.time)}</small>
</div>
<strong className={r.amount < 0 ? 'debit' : ''}>{r.amount > 0 ? '+' : ''}{r.amount}</strong>
</div>)}{!records.length && <Empty text="暂无积分记录" />}</section>{records.length > limit && <button className="gp-button gp-outline" onClick={() => setLimit(limit + 20)}>加载更多</button>}<p className="gp-footnote">绿色行为奖励由城市服务记录同步展示</p>
</div>
</>;
}
export function MePage() {
  const { data } = useMallContext();
  const { signed } = checkInSummary(data);
  const pendingCount = data.orders.filter(o => ['pending', 'shipping', 'available'].includes(o.status)).length;
  const recentOrder = data.orders.reduce((latest, order) => !latest || order.time > latest.time ? order : latest, null);
  return <>
    <Header title="我的" />
    <div className="gp-content gp-me-page">
      <section className="gp-profile">
        <span className="gp-avatar"><Icon name="user" /></span>
        <div><h2>绿色生活同行者</h2><p>每一份行动，都值得奖励</p></div>
        <Link className="gp-me-checkin" to="/green-points/check-in"><Icon name={signed ? 'check' : 'calendar'} />{signed ? '已签到' : '去签到'}</Link>
      </section>
      <section className="gp-me-wallet" aria-label="我的资产">
        <Link className="gp-me-points" to="/green-points/points"><div><span>我的可用积分</span><strong>{data.balance.toLocaleString()}<small>积分</small></strong><p>积攒生活的小美好</p></div><span>积分明细<Arrow /></span></Link>
        <div className="gp-member-stats">{[['我的券包', data.wallet.filter(c => !c.usedBy && c.expiresAt > Date.now()).length, 'coupons?tab=wallet'], ['我的收藏', data.favorites.length, 'collection'], ['浏览足迹', data.history.length, 'collection?type=history']].map(([label, count, path]) => <Link key={label} to={`/green-points/${path}`}><strong>{count}</strong><span>{label}</span></Link>)}</div>
      </section>
      <section className="gp-panel gp-me-orders">
        <div className="gp-section-heading"><h2>我的兑换</h2><Link to="/green-points/orders">全部订单<Arrow /></Link></div>
        <div className="gp-order-shortcuts">{[['待提货', 'pending', 'gift'], ['待收货', 'shipping', 'building'], ['待使用', 'available', 'ticket'], ['已完成', 'completed', 'check']].map(([label, status, icon]) => <Link key={status} to={`/green-points/orders?status=${label}`}><span className="gp-me-order-icon"><Icon name={icon} /><b>{data.orders.filter(o => o.status === status).length}</b></span><span>{label}</span></Link>)}</div>
        <Link className="gp-me-reminder" to="/green-points/orders"><Icon name="clock" /><span>{pendingCount ? `有 ${pendingCount} 笔兑换待领取、收货或使用` : '好物兑换后，可在这里查看进度'}</span><Arrow /></Link>
        {recentOrder && <Link className="gp-me-recent" to={`/green-points/orders/${recentOrder.id}`}><ProductArt product={recentOrder.product} className="gp-me-recent-art" /><div><small>最近兑换 · {shortDate(recentOrder.time)}</small><h3>{recentOrder.product.name}</h3><span>{recentOrder.total} 积分 · {statuses[recentOrder.status]}</span></div><Arrow /></Link>}
      </section>
      <section className="gp-panel gp-me-services"><div className="gp-section-heading"><h2>我的服务</h2><span>兑换前后，都有照应</span></div><div className="gp-me-service-grid">{[['pin', '收货地址', '管理配送信息', 'addresses'], ['tag', '领券中心', '兑换好物更划算', 'coupons'], ['support', '客服与售后', '问题反馈与记录', 'support'], ['calendar', '每日签到', signed ? '今日已签到' : '积攒每日小奖励', 'check-in'], ['record', '积分明细', '查看积分收支', 'points'], ['leaf', '规则与帮助', '了解兑换与使用', 'help']].map(([icon, label, detail, path]) => <Link key={path} to={`/green-points/${path}`}><span className="gp-me-service-icon"><Icon name={icon} /></span><div><b>{label}</b><small>{detail}</small></div><Arrow /></Link>)}</div></section>
      <p className="gp-footnote gp-me-signature"><Icon name="leaf" />青禾好物 · 让每一分都有好去处</p>
    </div>
  </>;
}
export function HelpPage() {
  return <>
<Header title="规则与帮助" />
<div className="gp-content">{[['积分与签到', ['积分只能用于兑换，不涉及现金', '每天签到获得10积分，连续7天额外30积分', '漏签重新累计，不支持补签；活动加赠可叠加']], ['配送到家', ['实物可选择免运费配送或定点自提', '配送订单可在7天内模拟完成收货，逾期关闭退还实扣积分', '当前为演示体验，不会发出真实包裹']], ['抵扣券与售后', ['每笔订单限用一张抵扣券，满足门槛后扣减所需积分', '取消实物订单退回实扣积分及抵扣券，券有效期不延长', '可从订单详情提交售后问题，反馈仅保存在当前浏览器']], ['实物兑换与自提', ['每件商品绑定固定提货点，请提前查看开放时间', '兑换后7天内到店出示提货码或二维码', '提货前可取消，逾期自动关闭，积分原额退回']], ['虚拟权益使用', ['兑换后即发放演示兑换码，30天内有效', '使用前请核对适用范围，每码限用一次', '发放后不可取消，过期不退积分']], ['演示体验', ['可模拟完成提货或使用虚拟权益', '签到、积分及订单记录会保存在当前浏览器', '更换浏览器或清除站点数据后记录不会保留']]].map(([title, items]) => <section className="gp-panel" key={title}>
<h2>{title}</h2>
<Rules items={items} />
</section>)}</div>
</>;
}
