import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Popup, Radio } from 'antd-mobile';
import { Link } from 'react-router-dom';
import { Arrow, Icon, ProductArt, Tabs } from './UI';
import { dateText, statuses } from './MallContext';

const kinds = ['商品与兑换', '配送与收货', '权益使用', '退换与售后', '功能建议'];

export function SupportForm({ orders, initialOrderId, onSubmit }) {
  const [kind, setKind] = useState(kinds[0]);
  const [orderId, setOrderId] = useState(orders.some(o => o.id === initialOrderId) ? initialOrderId : '');
  const [description, setDescription] = useState('');
  const [field, setField] = useState(null);
  const [busy, setBusy] = useState(false);
  const order = orders.find(o => o.id === orderId);
  const options = field === 'kind' ? kinds.map(value => ({ value, label: value })) : [
    { value: '', label: '不关联订单', detail: '适用于通用问题或功能建议' },
    ...orders.map(o => ({ value: o.id, label: o.product.name, detail: `${statuses[o.status]} · ${dateText(o.time)} · 尾号 ${o.id.slice(-6)}` }))
  ];
  const submit = async event => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      if (await onSubmit({ kind, orderId, message: description.trim() })) setDescription('');
    } finally { setBusy(false); }
  };
  return <>
    <form className="gp-panel gp-support-form" onSubmit={submit}>
      <div className="gp-support-form-heading"><h2>提交问题</h2><span>请尽量描述完整</span></div>
      <div className="gp-support-field"><span id="gp-support-kind-label">问题类型</span>
        <Button type="button" fill="none" disabled={busy} className="gp-support-select" aria-label={`问题类型：${kind}`} aria-haspopup="dialog" aria-expanded={field === 'kind'} onClick={() => setField('kind')}><span>{kind}</span><Arrow direction="down" /></Button>
      </div>
      <div className="gp-support-field"><span>关联订单 <small>选填</small></span>
        <Button type="button" fill="none" disabled={busy} className="gp-support-select" aria-label={`关联订单：${order?.product.name || '不关联订单'}`} aria-haspopup="dialog" aria-expanded={field === 'order'} onClick={() => setField('order')}><span>{order?.product.name || '选择需要帮助的订单'}</span><Arrow direction="down" /></Button>
        {order && <small className="gp-support-order-hint">{statuses[order.status]} · 订单尾号 {order.id.slice(-6)}</small>}
      </div>
      <label className="gp-support-field">问题描述
        <textarea required minLength={10} maxLength={500} value={description} disabled={busy} onChange={event => setDescription(event.target.value)} placeholder="例如：兑换了哪件商品，在哪一步遇到了什么问题？（至少10字）" />
        <span className="gp-support-count">{description.length} / 500</span>
      </label>
      <Button block color="primary" type="submit" loading={busy} disabled={busy || description.trim().length < 10}>提交反馈</Button>
      <p className="gp-support-demo"><Icon name="shield" />演示反馈仅保存在当前浏览器，不发送至真实客服。</p>
    </form>
    <Popup visible={Boolean(field)} position="bottom" closeOnMaskClick showCloseButton destroyOnClose onClose={() => setField(null)} bodyClassName="gp-filter-sheet gp-support-sheet" getContainer={() => document.querySelector('.gp-app')}>
      {field && <section role="dialog" aria-modal="true" aria-label={field === 'kind' ? '选择问题类型' : '选择关联订单'}>
        <h2>{field === 'kind' ? '选择问题类型' : '选择关联订单'}</h2>
        <p className="gp-support-sheet-hint">{field === 'kind' ? '选择最接近的问题类型' : `共 ${orders.length} 笔订单，可选择一笔关联`}</p>
        <div className="gp-filter-options gp-support-options"><Radio.Group value={field === 'kind' ? kind : orderId} onChange={value => { if (field === 'kind') setKind(value); else setOrderId(value); setField(null); }}>
          {options.map(option => <Radio key={option.value} value={option.value} block><span>{option.label}</span>{option.detail && <small>{option.detail}</small>}</Radio>)}
        </Radio.Group></div>
        <div className="gp-sheet-footer"><Button block className="gp-sheet-cancel" onClick={() => setField(null)}>取消</Button></div>
      </section>}
    </Popup>
  </>;
}
SupportForm.propTypes = { orders: PropTypes.array.isRequired, initialOrderId: PropTypes.string, onSubmit: PropTypes.func.isRequired };

function FeedbackCard({ feedback, order }) {
  const [expanded, setExpanded] = useState(false);
  return <article className="gp-feedback-card">
    <header><span className="gp-feedback-kind"><Icon name="record" />{feedback.kind}</span><span className="gp-feedback-status">{feedback.status}</span></header>
    <time className="gp-feedback-time" dateTime={new Date(feedback.time).toISOString()}>{dateText(feedback.time)}</time>
    <p className={`gp-feedback-description${expanded ? ' is-expanded' : ''}`}>{feedback.message}</p>
    {(feedback.message.length > 45 || feedback.message.split('\n').length > 3) && <button className="gp-feedback-expand" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? '收起描述' : '展开描述'}<Arrow direction="down" /></button>}
    {order && <Link className="gp-feedback-order" to={`/green-points/orders/${order.id}`}><ProductArt product={order.product} /><span><small>关联订单 · {statuses[order.status]}</small><b>{order.product.name}</b></span><Arrow /></Link>}
    <footer><span className="gp-feedback-dot" />{feedback.status === '待处理' ? '反馈已提交 · 等待处理' : feedback.status}<small>编号 {feedback.id.slice(-6).toUpperCase()}</small></footer>
  </article>;
}
FeedbackCard.propTypes = { feedback: PropTypes.object.isRequired, order: PropTypes.object };

export function FeedbackList({ feedback, orders }) {
  const [filter, setFilter] = useState('全部反馈');
  const visible = feedback.filter(item => filter === '全部反馈' || (filter === '订单相关' ? Boolean(item.orderId) : !item.orderId));
  return <section className="gp-support-history" aria-label="我的反馈">
    <div className="gp-section-heading"><h2>我的反馈 <span>{feedback.length}</span></h2><small>提交记录</small></div>
    {feedback.length > 0 && <Tabs items={['全部反馈', '订单相关', '其他反馈']} value={filter} onChange={setFilter} />}
    {visible.map(item => <FeedbackCard key={item.id} feedback={item} order={orders.find(o => o.id === item.orderId)} />)}
    {!visible.length && <div className="gp-support-empty"><span><Icon name="support" /></span><h3>{feedback.length ? '暂无此类反馈' : '还没有提交过反馈'}</h3><p>{feedback.length ? '可切换分类查看其他记录' : '遇到问题，填写上方表单\n提交后可在这里查看记录和关联订单'}</p>{feedback.length > 0 && <Button size="small" fill="outline" onClick={() => setFilter('全部反馈')}>查看全部反馈</Button>}</div>}
  </section>;
}
FeedbackList.propTypes = { feedback: PropTypes.array.isRequired, orders: PropTypes.array.isRequired };
