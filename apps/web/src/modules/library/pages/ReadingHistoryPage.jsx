import { useMemo, useState } from 'react';
import { ClockCircleOutline, RightOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import { useLibraryLoans } from '../hooks/useReaderData';
import { formatLibraryDate } from '../utils/format';
import AssetImage from '../components/AssetImage';
import { PersonalPageHeader, PageState } from '../components/LibraryLayout';

const activeStatuses = new Set(['borrowed', 'overdue']);

export default function ReadingHistoryPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('all');
  const query = useLibraryLoans();
  const records = useMemo(() => (query.data || []).filter((item) => tab === 'all' || (tab === 'reading' ? activeStatuses.has(item.status) : !activeStatuses.has(item.status))), [query.data, tab]);
  const finished = (query.data || []).filter((item) => !activeStatuses.has(item.status)).length;

  return <main className="lib-page lib-personal-subpage lib-personal-list lib-history">
    <PersonalPageHeader title="阅读记录" />
    <header className="lib-history-summary"><p>我的阅读足迹</p><h1><b>{query.data?.length || 0}</b> 本</h1><span>已读完 {finished} 本</span></header>
    <nav className="lib-personal-tabs" aria-label="阅读记录分类">
      <button className={tab === 'all' ? 'is-active' : ''} onClick={() => setTab('all')}>全部</button>
      <button className={tab === 'reading' ? 'is-active' : ''} onClick={() => setTab('reading')}>在读</button>
      <button className={tab === 'finished' ? 'is-active' : ''} onClick={() => setTab('finished')}>已归还</button>
    </nav>
    <PageState {...query} onRetry={query.reload} />
    {!query.loading && !query.error && records.length === 0 && <section className="lib-personal-empty"><ClockCircleOutline /><h2>这里还没有阅读记录</h2><p>借阅过的图书会按时间保存在这里。</p><button onClick={() => navigate('/library/catalog')}>去找一本书</button></section>}
    {records.length > 0 && <section className="lib-personal-books lib-history-list">{records.map((item) => <button key={item.id} onClick={() => navigate(`/library/books/${item.book.id}`)}><AssetImage remote={item.book.coverUrl} fallback={item.book.title.includes('长安') ? 'changan' : 'humanWorld'} alt={`${item.book.title}封面`} /><span><small>{activeStatuses.has(item.status) ? '正在借阅' : '已归还'}</small><h2>{item.book.title}</h2><p>{item.book.author} 著</p><b>{activeStatuses.has(item.status) ? `应还日期 ${formatLibraryDate(item.dueAt)}` : `借阅于 ${formatLibraryDate(item.borrowedAt || item.createdAt)}`}</b></span><RightOutline /></button>)}</section>}
  </main>;
}
