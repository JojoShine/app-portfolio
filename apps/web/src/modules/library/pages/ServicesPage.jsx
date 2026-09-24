import { Navigate, useNavigate } from 'react-router-dom';
import { CalendarOutline, ContentOutline, FileOutline, RightOutline } from 'antd-mobile-icons';
import { Toast } from 'antd-mobile';
import useSessionStore from '../../../shared/auth/sessionStore';
import { useLibraryLoans } from '../hooks/useReaderData';
import { renewLoan } from '../services/library.service';
import AssetImage from '../components/AssetImage';
import { BottomNav, PageState } from '../components/LibraryLayout';
import { daysUntil, formatLibraryDate } from '../utils/format';
import serviceSketch from '../assets/service-library-sketch.png';
import seatIcon from '../assets/service-seat-icon.png';

const excerpts = {
  '长安的荔枝': '一骑红尘妃子笑，无人知是荔枝来。',
  '我与地坛': '生命的意义，在于与生活温柔地相处。',
};

export default function ServicesPage() {
  const navigate = useNavigate();
  const token = useSessionStore((state) => state.accessToken);
  const hasReaderSession = token && token !== 'mock-parent-access-token';
  const query = useLibraryLoans(hasReaderSession);
  const renew = async (id) => { try { await renewLoan(id); Toast.show('续借成功'); query.reload(); } catch (error) { Toast.show(error.message); } };

  if (!hasReaderSession) return <Navigate to="/library/login" replace state={{ from: '/library/services' }} />;

  return <main className="lib-page lib-services">
    <header className="lib-service-head">
      <img className="lib-service-sketch" src={serviceSketch} alt="" aria-hidden="true" />
      <i className="lib-service-brand-mark" aria-hidden="true" />
      <span>书香海安<small>HAIAN<br />LIBRARY</small></span>
      <aside>阅读让城市更美好</aside>
      <p className="lib-service-sketch-note">书卷常在<br />城市常新</p>
      <h1>借阅服务</h1>
      <p className="lib-service-subtitle">在书中，遇见更大的海安</p>
      <button onClick={() => navigate('/library/reservations')}>借阅记录 <RightOutline /></button>
    </header>
    <div className="lib-reader-strip">
      <FileOutline />
      <div><b>海安市图书馆读者证</b><small>读万卷书，行更远的路。</small></div>
      <em>有效</em>
      <p className="lib-reader-signature">HAIAN<br />PUBLIC<br />LIBRARY<small>书 / 人 / 城 / 共 / 生</small></p>
    </div>
    <PageState {...query} onRetry={query.reload} />
    {query.data?.map((loan) => <article className="lib-loan" key={loan.id}>
      <AssetImage remote={loan.book.coverUrl} fallback={loan.book.title.includes('长安') ? 'changan' : 'ditan'} alt={`${loan.book.title}封面`} />
      <div><h2>{loan.book.title}</h2><p>{loan.book.author} 著</p><code>索书号：{loan.callNumber}</code><p>馆藏地：{loan.book.title.includes('长安') ? '二楼 文学区' : '三楼 人文社科区'}</p>{loan.canRenew ? <><strong><CalendarOutline /> {daysUntil(loan.dueAt)} 天后到期</strong><small>到期日期：{formatLibraryDate(loan.dueAt)}</small></> : <><strong className="is-muted lib-loan-renewal-status">不可续借</strong><small className="lib-loan-renewal-reason">原因：{loan.renewalReason || '当前状态暂不支持续借'}</small></>}</div>
      <button disabled={!loan.canRenew} onClick={() => renew(loan.id)}>{loan.canRenew ? '续借' : '不可续借'}</button>
      <p className="lib-loan-excerpt">{excerpts[loan.book.title] || loan.book.description}</p>
    </article>)}
    <button className="lib-view-all" onClick={() => navigate('/library/reservations')}>查看全部借阅 <RightOutline /></button>
    <section className="lib-service-links">
      <div><button onClick={() => navigate('/library/reservations')}><ContentOutline /><span><b>图书预约</b><small>预约你感兴趣的图书</small></span><RightOutline /></button><button onClick={() => navigate('/library/seats')}><img className="lib-service-seat-icon" src={seatIcon} alt="" /><span><b>座位预约</b><small>今天 14:00–17:00 · 二楼静阅区</small></span><RightOutline /></button></div>
      <aside>阅读<br />是一座城市<br />最温柔的力量<i /></aside>
    </section>
    <BottomNav />
  </main>;
}
