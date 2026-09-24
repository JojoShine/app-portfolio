import { useMemo, useState } from 'react';
import { CalendarOutline, LocationFill, RightOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import useSessionStore from '../../../shared/auth/sessionStore';
import { useLibraryEventRegistrations } from '../hooks/useEventData';
import AssetImage from '../components/AssetImage';
import LibraryDialog from '../components/LibraryDialog';
import { PersonalPageHeader, PageState } from '../components/LibraryLayout';
import { formatLibraryEventDate } from '../utils/format';

const statusLabels = { registered: '已报名', waitlisted: '候补中', cancelled: '已取消' };

export default function MyEventsPage() {
  const navigate = useNavigate();
  const token = useSessionStore((state) => state.accessToken);
  const hasReaderSession = token && token !== 'mock-parent-access-token';
  const [tab, setTab] = useState('upcoming');
  const [selected, setSelected] = useState(null);
  const query = useLibraryEventRegistrations(hasReaderSession);
  const registrations = useMemo(() => (query.data || []).filter((item) => {
    if (tab === 'all') return true;
    const ended = new Date(item.event.endsAt) < new Date();
    return tab === 'finished' ? ended : !ended && item.status !== 'cancelled';
  }), [query.data, tab]);

  return <main className="lib-page lib-personal-subpage lib-my-events">
    <PersonalPageHeader title="我的活动" />
    {!hasReaderSession ? <section className="lib-personal-empty"><CalendarOutline /><h2>登录后查看我的活动</h2><p>已报名、候补及参加过的活动会保存在这里。</p><button onClick={() => navigate('/library/login', { state: { from: '/library/my-events' } })}>登录并查看</button></section> : <>
      <nav className="lib-personal-tabs" aria-label="我的活动分类">
        <button className={tab === 'upcoming' ? 'is-active' : ''} onClick={() => setTab('upcoming')}>待参加</button>
        <button className={tab === 'finished' ? 'is-active' : ''} onClick={() => setTab('finished')}>已结束</button>
        <button className={tab === 'all' ? 'is-active' : ''} onClick={() => setTab('all')}>全部</button>
      </nav>
      <PageState {...query} onRetry={query.reload} />
      {!query.loading && !query.error && registrations.length === 0 && <section className="lib-personal-empty"><CalendarOutline /><h2>这里还没有活动</h2><p>去活动广场看看近期的阅读活动吧。</p><button onClick={() => navigate('/library/events')}>浏览活动</button></section>}
      <section className="lib-my-event-list">{registrations.map((item) => {
        const date = formatLibraryEventDate(item.event.startsAt);
        const finished = new Date(item.event.endsAt) < new Date();
        return <button key={item.id} onClick={() => setSelected(item)}>
          <AssetImage remote={item.event.coverUrl} fallback={item.event.category === '亲子阅读' ? 'eventFamilyList' : 'ditanEvent'} alt={item.event.title} />
          <span><em className={`is-${item.status}`}>{finished ? '已结束' : statusLabels[item.status] || item.status}</em><h2>{item.event.title}</h2><p>{date.month}月{date.day}日 {date.weekday} {date.time}</p><small><LocationFill />{item.event.branchName}</small><strong className="lib-my-event-entry">{finished ? '查看参加记录' : item.status === 'registered' ? '查看报名 · 签到凭证' : '查看候补'}</strong></span>
          <RightOutline />
        </button>;
      })}</section>
    </>}
    <LibraryDialog open={Boolean(selected)} variant="event-registration" title="报名详情" confirmText="查看活动详情" cancelText="关闭" onClose={() => setSelected(null)} onConfirm={() => navigate(`/library/events/${selected.event.id}`)}>
      {selected && <section className="lib-event-registration-detail">
        <em>{selected.checkedInAt ? '已签到' : statusLabels[selected.status] || selected.status}</em>
        <h3>{selected.event.title}</h3>
        <p><CalendarOutline />{formatLibraryEventDate(selected.event.startsAt).month}月{formatLibraryEventDate(selected.event.startsAt).day}日 {formatLibraryEventDate(selected.event.startsAt).weekday} {formatLibraryEventDate(selected.event.startsAt).time}</p>
        <p><LocationFill />{selected.event.branchName}</p>
        {selected.status === 'registered' && <div className="lib-event-checkin-code"><small>{selected.checkedInAt ? '签到状态' : '签到凭证'}</small><strong>{selected.checkedInAt ? '已完成签到' : selected.checkInCode}</strong><span>{selected.checkedInAt ? '感谢参与本次阅读活动' : '到场后请向工作人员出示此签到码'}</span></div>}
      </section>}
    </LibraryDialog>
  </main>;
}
