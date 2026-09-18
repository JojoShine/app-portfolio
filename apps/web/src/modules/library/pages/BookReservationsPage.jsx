import { useState } from 'react';
import { Toast } from 'antd-mobile';
import { RightOutline } from 'antd-mobile-icons';
import useLibraryQuery from '../hooks/useLibraryQuery';
import { cancelBookReservation, getBookReservations } from '../services/library.service';
import AssetImage from '../components/AssetImage';
import LibraryDialog from '../components/LibraryDialog';
import { PageHeader, PageState } from '../components/LibraryLayout';
import { formatLibraryDate, formatLibraryDateTime } from '../utils/format';
import humanCover from '../assets/reservation-human.png';
import ditanCover from '../assets/reservation-ditan.png';
import cloudCover from '../assets/reservation-cloud.png';

const covers = { 人间值得: humanCover, 我与地坛: ditanCover, 云边有个小卖部: cloudCover };

const labels = { ready: '待取书', queued: '排队中', cancelled: '已取消', expired: '已失效' };
export default function BookReservationsPage() {
  const query = useLibraryQuery(getBookReservations, []);
  const [cancelling, setCancelling] = useState(null);
  const [dialog, setDialog] = useState(null);
  const reservations = query.data ? [...query.data].sort((a, b) => ({ ready: 0, queued: 1, cancelled: 2 }[a.status] ?? 3) - ({ ready: 0, queued: 1, cancelled: 2 }[b.status] ?? 3)) : [];
  const cancel = async (id) => {
    if (cancelling) return;
    setCancelling(id);
    try { await cancelBookReservation(id); setDialog(null); Toast.show('预约已取消'); query.reload(); } catch (error) { Toast.show(error.message); } finally { setCancelling(null); }
  };
  const showPickup = (item) => setDialog({ title: '取书信息', content: <div className="lib-pickup-info"><h3>{item.book.title}</h3><p>取书地点：{item.pickupBranchName}</p><p className="lib-dialog-notice">{item.expiresAt ? `请在 ${formatLibraryDateTime(item.expiresAt)} 前取书` : '取书期限请咨询分馆工作人员'}</p><p>请携带读者证，到馆向工作人员出示预约记录。</p></div> });
  const showRules = () => setDialog({ title: '预约规则', content: <><p>预约后可在本页查看排队状态。</p><p>图书到馆后，请按待取书记录中的截止时间到指定分馆取书。</p><p>不再需要的排队预约可在本页取消，具体规则以分馆公告为准。</p></> });
  const confirmCancel = (item) => setDialog({ title: '取消预约', content: <><p>确定取消《{item.book.title}》的预约吗？</p><p className="lib-dialog-notice">取消后将失去当前排队位置。</p></>, confirmText: '取消预约', cancelText: '保留预约', onConfirm: () => cancel(item.id) });
  return <main className="lib-page lib-reservations"><PageHeader title="图书预约" action={<button onClick={showRules}>预约规则</button>} /><header className="lib-reservation-masthead"><h1>书香海安</h1><p>让阅读连接更好的生活</p><span>江海书卷<br />阅见美好</span></header><PageState {...query} onRetry={query.reload} />
    {!query.loading && !query.error && !reservations.length && <p className="lib-reservation-empty">暂无图书预约，去馆藏挑选想读的书吧。</p>}
    <section className="lib-reservation-list">{reservations.map((item) => <article key={item.id} className={`is-${item.status}`}><div className={`lib-reservation-cover ${covers[item.book.title] ? 'is-product' : ''}`}>{covers[item.book.title] ? <img src={covers[item.book.title]} alt={`${item.book.title}立体封面`} /> : <AssetImage remote={item.book.coverUrl} fallback={item.book.title.includes('地坛') ? 'ditan' : 'humanWorld'} alt={`${item.book.title}封面`} />}</div><div className="lib-reservation-info"><em>{labels[item.status] || item.status}</em><h2>{item.book.title}</h2><p>{item.pickupBranchName}</p>{item.status === 'ready' && <><strong className="lib-pickup-deadline">{item.expiresAt ? `请在 ${formatLibraryDateTime(item.expiresAt)} 前取书` : '图书已到馆，请及时取书'}</strong><button className="lib-pickup-button" onClick={() => showPickup(item)}>查看取书信息 <RightOutline /></button></>}{item.status === 'queued' && <div className="lib-reservation-queue"><div><strong>当前第 <b>{item.queuePosition}</b> 位</strong><small>{item.estimatedWaitDays ? `预计等待 ${item.estimatedWaitDays} 天` : '取书时间以到馆通知为准'}</small></div><button disabled={Boolean(cancelling)} onClick={() => confirmCancel(item)}>{cancelling === item.id ? '取消中…' : '取消预约'}</button></div>}{item.status === 'cancelled' && <small className="lib-reservation-cancelled-at">{item.cancelledAt ? `已于 ${formatLibraryDate(item.cancelledAt)} 取消预约` : '已取消预约'}</small>}</div></article>)}</section>
    <footer className="lib-reservation-footer"><span>腹有诗书气自华</span><i /><span>01</span></footer>
    <LibraryDialog open={Boolean(dialog)} title={dialog?.title} confirmText={dialog?.confirmText} cancelText={dialog?.cancelText} onConfirm={dialog?.onConfirm} busy={Boolean(cancelling)} onClose={() => setDialog(null)}>{dialog?.content}</LibraryDialog>
  </main>;
}
