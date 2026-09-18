import { useNavigate } from 'react-router-dom';
import { BellOutline, CalendarOutline, ContentOutline, DownOutline, FileOutline, HeartOutline, HistogramOutline, RightOutline, SetOutline, TeamOutline, UserOutline } from 'antd-mobile-icons';
import useSessionStore from '../../../shared/auth/sessionStore';
import useLibraryQuery from '../hooks/useLibraryQuery';
import { getProfile } from '../services/library.service';
import { BottomNav, PageState } from '../components/LibraryLayout';
import profileHeader from '../assets/profile-header.png';
import profileReaderCard from '../assets/profile-reader-card.png';
import profileFooter from '../assets/profile-footer.png';

const profileArtwork = {
  '--profile-header-art': `url("${profileHeader}")`,
  '--profile-card-art': `url("${profileReaderCard}")`,
  '--profile-footer-art': `url("${profileFooter}")`,
};

function BooksIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true"><path d="M3 3h4v18H3zM8 2h4v19H8zM14 4l4-1 4 17-4 1z" /></svg>;
}

function SeatIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 14V5a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v9M5 14h14a2 2 0 0 1 2 2v2H3v-2a2 2 0 0 1 2-2ZM5 18l-1 4m15-4 1 4" /></svg>;
}

function ReaderCodeIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden="true"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM20 14v7h-6v-1" /></svg>;
}

export default function ProfilePage() {
  const navigate = useNavigate(); const token = useSessionStore((state) => state.accessToken); const hasReaderSession = token && token !== 'mock-parent-access-token';
  const query = useLibraryQuery(() => hasReaderSession ? getProfile() : Promise.resolve(null), [hasReaderSession]); const profile = query.data;
  if (!hasReaderSession) return <main className="lib-page lib-profile"><header className="lib-profile-brand"><h1>书香海安</h1><p>登录后绑定读者证，使用借阅与预约服务</p></header><section className="lib-guest"><UserOutline /><h2>游客模式</h2><p>馆藏和活动可以直接浏览，办理业务时需要登录。</p><button onClick={() => navigate('/library/login')}>登录并绑定读者证</button></section><BottomNav /></main>;
  return <main className="lib-page lib-profile" style={profileArtwork}>
    <header className="lib-profile-brand"><h1>书香海安</h1><button aria-label="设置"><SetOutline /><small>设置</small></button><p>阅读，让江海更美好</p></header>
    <PageState {...query} onRetry={query.reload} />
    {profile && <>
      <section className="lib-reader-card">
        <aside><span>海安市图书馆</span><small>I<br />247.57<br />HA</small></aside>
        <div className="lib-reader-card-content">
          <small className="lib-card-title">读者证<em>READER CARD</em></small>
          <p className="lib-card-motto">以书为舟<br />共赴更宽广的江海</p>
          <div className="lib-card-inscription" aria-hidden="true">书卷海安<br />阅见美好<i>书香</i></div>
          <h2>{profile.displayName}</h2>
          <p className="lib-card-detail"><span>读者证号</span>{profile.cardNumber}</p>
          <p className="lib-card-detail"><span>有效至</span>2027.12</p>
          <button><ReaderCodeIcon /><span>展开借阅码</span><DownOutline /></button>
        </div>
      </section>
      <section className="lib-profile-counts">
        <span><BooksIcon /><small>当前借阅</small><b>{profile.counts.loans}</b></span>
        <span><CalendarOutline /><small>图书预约</small><b>{profile.counts.bookReservations}</b></span>
        <span><SeatIcon /><small>座位预约</small><b>{profile.counts.seatReservations}</b></span>
        <span><TeamOutline /><small>活动报名</small><b>{profile.counts.eventRegistrations}</b></span>
      </section>
      <section className="lib-profile-links">
        <button><HeartOutline /><span>收藏与想读</span><RightOutline /></button>
        <button><FileOutline /><span>阅读记录</span><RightOutline /></button>
        <button onClick={() => navigate('/library/reading-plan')}><HistogramOutline /><span>2026 海安共读计划</span><small>已读 12/24 本</small><RightOutline /></button>
        <button onClick={() => navigate('/library/messages')}><BellOutline /><span>消息中心</span><small>{profile.counts.unreadMessages} 条未读</small><RightOutline /></button>
        <button><ContentOutline /><span>办证与借阅规则</span><RightOutline /></button>
        <button><SetOutline /><span>设置</span><RightOutline /></button>
      </section>
      <footer className="lib-profile-footer"><p>书香润海安<br />阅读见未来</p><i aria-hidden="true">书香</i></footer>
    </>}
    <BottomNav /></main>;
}
