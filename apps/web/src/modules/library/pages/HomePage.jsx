import { Link, useNavigate } from 'react-router-dom';
import { AppstoreOutline, BellOutline, ContentOutline, LeftOutline, LoopOutline, RightOutline, ScanCodeOutline, SearchOutline } from 'antd-mobile-icons';
import useLibraryQuery from '../hooks/useLibraryQuery';
import { getHome } from '../services/library.service';
import AssetImage from '../components/AssetImage';
import { BottomNav, PageState } from '../components/LibraryLayout';

export default function HomePage() {
  const navigate = useNavigate();
  const query = useLibraryQuery(getHome, []);
  const { data } = query;
  return <main className="lib-page lib-home">
    <nav className="lib-home-return" aria-label="返回应用主页"><Link to="/"><LeftOutline /><span>返回主页</span></Link></nav>
    <section className="lib-hero">
      <div className="lib-brand-row">
        <div><strong><i />书香海安</strong><small>{data?.currentBranch?.name || '海安市图书馆'}</small></div>
        <p className="lib-brand-motto">阅读<br /><span>让一座城更温暖</span></p>
        <button type="button" aria-label="消息中心" onClick={() => navigate('/library/messages')}><BellOutline /></button>
      </div>
      <div className="lib-hero-copy"><h1>在阅读中<br /><span>遇见更好的海安</span></h1><p>书页翻动，<br />城市也在向前。</p></div>
      <AssetImage className="lib-hero-image" fallback="hero" alt="自然光下的公共图书馆阅读空间" />
      <button className="lib-search-entry" type="button" onClick={() => navigate('/library/catalog')}><SearchOutline /><span>搜索书名、作者或 ISBN</span><i className="lib-long-arrow" aria-hidden="true">→</i></button>
    </section>
    <section className="lib-quick" aria-label="快捷服务">
      <button onClick={() => navigate('/library/profile')}><ScanCodeOutline /><span>借阅码</span></button>
      <button onClick={() => navigate('/library/services')}><ContentOutline /><span>我的借阅</span></button>
      <button onClick={() => navigate('/library/services')}><LoopOutline /><span>图书续借</span></button>
      <button onClick={() => navigate('/library/seats')}><AppstoreOutline /><span>座位预约</span></button>
    </section>
    <PageState {...query} onRetry={query.reload} />
    {data && <>
      <button className="lib-reminder" type="button" onClick={() => navigate('/library/services')}>
        <span className="lib-reminder-book"><AssetImage remote={data.books[1]?.coverUrl} fallback="changan" alt="长安的荔枝封面" /><span className="lib-reminder-callno">D 895.6/2877</span></span>
        <span><b><span>《长安的荔枝》</span> <span><em>3</em> 天后到期</span></b><small>阅读持续发生，美好从不缺席。</small></span><i className="lib-long-arrow" aria-hidden="true">→</i><span className="lib-reminder-ticket">借阅提醒<small>READING<br />REMINDER</small></span>
      </button>
      <div className="lib-home-grid">
        <section className="lib-featured-book"><div className="lib-section-heading"><h2>今日一书</h2><button onClick={() => navigate('/library/catalog')}><span>查看全部</span><RightOutline className="lib-chevron" /></button></div><div className="lib-book-editorial"><AssetImage fallback="homeFeatured" alt="人间值得" /><div><h3>人间值得</h3><p>中村恒子 著</p><blockquote>认真生活，就是对生命最好的回答。</blockquote><small>01 / 365</small></div></div></section>
        <section className="lib-community"><button className="lib-community-visual" type="button" onClick={() => navigate('/library/reading-plan')}><AssetImage fallback="homeCommunity" alt="海安共读湖景" /><div className="lib-community-copy"><h2>海安共读</h2><p>在书中，遇见同频的你</p></div><p className="lib-community-quote">以阅读，<br />共建更温暖的海安</p></button>
          <div className="lib-event-peek"><div className="lib-event-heading"><h3>近期活动</h3><button type="button" onClick={() => navigate('/library/events')}><span>查看全部</span><RightOutline className="lib-chevron" /></button></div>{data.events[0] && <button onClick={() => navigate(`/library/events/${data.events[0].id}`)}><AssetImage fallback="homeEvent" alt="春日阅读分享会" /><span><b>春日阅读分享会</b><small>4月12日 14:00–16:00<br />海安市图书馆 · 报告厅</small></span></button>}</div>
        </section>
      </div>
    </>}
    <BottomNav />
  </main>;
}
