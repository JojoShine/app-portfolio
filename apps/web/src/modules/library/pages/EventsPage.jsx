import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarOutline, ContentOutline, DownOutline, LocationFill, TeamOutline } from 'antd-mobile-icons';
import useSessionStore from '../../../shared/auth/sessionStore';
import { useLibraryEventRegistrations, useLibraryEvents } from '../hooks/useEventData';
import AssetImage from '../components/AssetImage';
import LibraryDialog from '../components/LibraryDialog';
import { BottomNav, PageState } from '../components/LibraryLayout';
import { filterLibraryEvents, formatLibraryEventDate } from '../utils/format';

const categories = ['全部活动', '读书会', '亲子阅读', '文化讲座', '地方文献'];
const periods = [{ value: 'recent', label: '近期', description: '未来 30 天' }, { value: 'today', label: '今天', description: '今天举办的活动' }, { value: 'week', label: '本周', description: '今天至本周日' }, { value: 'month', label: '本月', description: '今天至本月底' }, { value: 'all', label: '全部', description: '不限活动日期' }];

export default function EventsPage() {
  const navigate = useNavigate();
  const token = useSessionStore((state) => state.accessToken);
  const hasReaderSession = token && token !== 'mock-parent-access-token';
  const query = useLibraryEvents();
  const registrationsQuery = useLibraryEventRegistrations(hasReaderSession);
  const [category, setCategory] = useState('全部活动');
  const [period, setPeriod] = useState('recent');
  const [draftPeriod, setDraftPeriod] = useState('recent');
  const [periodOpen, setPeriodOpen] = useState(false);
  const events = filterLibraryEvents(query.data, category, period);
  const registrations = useMemo(() => new Map((registrationsQuery.data || []).map((item) => [item.eventId, item])), [registrationsQuery.data]);
  return <main className="lib-page lib-events"><header className="lib-events-head">
    <div className="lib-events-brand"><div><ContentOutline /><span><b>书香海安</b><small>海安市图书馆服务应用</small></span></div><button onClick={() => navigate('/library/my-events')}><CalendarOutline />我的活动</button></div>
    <div className="lib-events-title"><h1>阅读活动</h1><i /><p>在文字里<br />遇见更大的海安</p></div>
    <AssetImage className="lib-events-hero-image" fallback="readingEventsHero" alt="读者围桌交流" />
    <aside className="lib-events-motto"><i />阅读<br />让一座城市<br />更温暖<i /></aside>
    <div className="lib-events-campaign"><i /><h2>秋日共读季</h2><p>在海安，与一本好书相遇</p></div>
  </header>
    <nav className="lib-event-tabs" aria-label="活动分类"><div className="lib-event-categories">{categories.map((item) => <button key={item} aria-pressed={category === item} className={category === item ? 'is-active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div><button className="lib-event-period" aria-label="筛选活动日期" aria-haspopup="dialog" aria-expanded={periodOpen} onClick={() => { setDraftPeriod(period); setPeriodOpen(true); }}>{periods.find((item) => item.value === period).label}<DownOutline /></button></nav><PageState {...query} onRetry={query.reload} />
    {!query.loading && !query.error && query.data && events.length === 0 && <p className="lib-event-empty" role="status">当前分类和日期范围内暂无活动，可切换筛选查看。</p>}
    <LibraryDialog open={periodOpen} title="活动日期" confirmText="确认筛选" cancelText="取消" onClose={() => setPeriodOpen(false)} onConfirm={() => { setPeriod(draftPeriod); setPeriodOpen(false); }}><fieldset className="lib-event-period-options"><legend>选择活动日期范围</legend>{periods.map((item) => <label key={item.value}><input type="radio" name="event-period" value={item.value} checked={draftPeriod === item.value} onChange={() => setDraftPeriod(item.value)} /><span>{item.label}<small>{item.description}</small></span></label>)}</fieldset></LibraryDialog>
    <section className="lib-event-list">{events?.map((event) => {
      const date = formatLibraryEventDate(event.startsAt);
      const isFeatured = event.category === '读书会';
      const isFamily = event.category === '亲子阅读';
      const registration = registrations.get(event.id);
      const registrationLabel = registration?.status === 'registered' ? '已报名' : registration?.status === 'waitlisted' ? '候补中' : '';
      return <button className={isFeatured ? 'is-featured' : ''} key={event.id} onClick={() => navigate(`/library/events/${event.id}`)}>
        {!isFeatured && <AssetImage remote={event.coverUrl} alt={event.title} />}
        <time><small className={!isFeatured ? 'is-date-mark' : ''}>{isFeatured ? date.year : ''}</small><b><span>{date.month}</span><i aria-hidden="true">/</i><span>{date.day}</span></b><em>{date.weekday} {date.time}</em></time>
        <span className="lib-event-copy"><em>{isFeatured ? '重点活动' : ''}</em><h2>{event.title}</h2><p>{event.summary}</p><small><LocationFill /><span>{event.branchName}{isFeatured ? ' · 三楼阅读空间' : isFamily ? ' · 少儿阅读区' : ' · 四楼多功能厅'}</span></small><strong className={registrationLabel ? 'is-registered' : ''}>{isFeatured && <TeamOutline />}{registrationLabel || `剩余 ${event.remaining} 席`}</strong></span>
        {isFeatured && <span className="lib-event-book"><AssetImage className="lib-event-book-photo" remote={event.coverUrl} alt={event.title} /></span>}</button>;
    })}</section>
    <footer className="lib-events-footer"><span>读一座城 · 从书开始</span><span>HAIAN LIBRARY | NO.2026-09</span></footer>
    <BottomNav />
  </main>;
}
