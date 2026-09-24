import { useState } from 'react';
import { Toast } from 'antd-mobile';
import { ContentOutline, RightOutline } from 'antd-mobile-icons';
import { useLibraryReadingSummary } from '../hooks/useReaderData';
import { addReadingCheckIn } from '../services/library.service';
import AssetImage from '../components/AssetImage';
import LibraryDialog from '../components/LibraryDialog';
import { PersonalPageHeader, PageState } from '../components/LibraryLayout';

const recordDate = (value) => new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Shanghai', month: '2-digit', day: '2-digit' }).format(new Date(value)).split('/').reverse().join('.');

export default function ReadingPlanPage() {
  const query = useLibraryReadingSummary();
  const data = query.data;
  const [dialog, setDialog] = useState(null);
  const [minutes, setMinutes] = useState('30');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const checkIn = async () => {
    if (busy) return;
    if (!Number.isInteger(Number(minutes)) || Number(minutes) < 1 || Number(minutes) > 1440) { Toast.show('请输入 1–1440 分钟'); return; }
    setBusy(true);
    try { await addReadingCheckIn({ bookId: data.current.id, minutes: Number(minutes), note: note.trim() }); setDialog(null); setNote(''); Toast.show('今日打卡成功'); query.reload(); }
    catch (error) { Toast.show(error.message); }
    finally { setBusy(false); }
  };
  const progress = Math.min(100, Math.max(0, Number(data?.progress) || 0));
  const records = data?.checkIns || [];
  return <main className="lib-page lib-personal-subpage lib-reading">
    <PersonalPageHeader title="阅读计划" />
    <PageState {...query} onRetry={query.reload} />
    {data && <>
      <section className="lib-goal">
        <div><h2>今年读完 <em>{data.annualGoal}</em> 本</h2><p>已读 <strong>{data.finished}</strong> 本</p></div>
        <div className="lib-bookshelf" role="img" aria-label={`年度目标 ${data.annualGoal} 本，已读 ${data.finished} 本`} style={{ gridTemplateColumns: `repeat(${Math.max(1, data.annualGoal)}, minmax(0, 1fr))` }}>{Array.from({ length: Math.max(0, data.annualGoal) }, (_, index) => <i key={index} className={index < data.finished ? 'is-read' : ''} />)}</div>
        <footer><span>连续阅读 <b>{data.streak}</b> 天</span><span>本月 <b>{data.monthly}</b> 本</span><span>今年剩余 <b>{Math.max(0, data.annualGoal - data.finished)}</b> 本</span></footer>
      </section>
      {data.current && <section className="lib-current-book">
        <AssetImage remote={data.current.coverUrl} fallback="humanWorld" alt={`${data.current.title}封面`} />
        <div><h2>{data.current.title}</h2><p>{data.current.author} 著</p><blockquote>{data.current.description}</blockquote>
          <div className="lib-reading-progress"><progress value={progress} max="100" aria-label="当前书籍阅读进度" /><span>已读 <b>{progress}%</b></span></div>
          <button onClick={() => setDialog('checkin')}>今日打卡 <small>记录阅读时光</small></button>
        </div>
      </section>}
      <section className="lib-checkins"><header><h2>最近打卡记录</h2>{records.length > 4 && <button onClick={() => setShowAll(!showAll)}>{showAll ? '收起记录' : '查看更多'}<RightOutline /></button>}</header>
        {(showAll ? records : records.slice(0, 4)).map((item) => <article key={item.id}><time>{recordDate(item.readingDate)}</time><b><em>{item.minutes}</em> 分钟</b><p>{item.note || '记录了一段安静的阅读时光。'}</p></article>)}
        {records.length === 0 && <p className="lib-reading-empty">还没有打卡记录，开始记录今天的阅读吧。</p>}
      </section>
      <footer className="lib-reading-footer"><button onClick={() => setDialog('goal')}><ContentOutline />调整目标<RightOutline /></button><span>读一本书<br />点亮一座城</span></footer>
    </>}
    <LibraryDialog open={dialog === 'checkin'} title="记录阅读时光" confirmText="确认打卡" cancelText="取消" busy={busy} onClose={() => setDialog(null)} onConfirm={checkIn}><div className="lib-reading-form"><label>阅读时长（分钟）<input inputMode="numeric" type="number" min="1" max="1440" value={minutes} onChange={(event) => setMinutes(event.target.value)} /></label><label>阅读感想<textarea rows="3" maxLength="500" placeholder="记下今天读到的一句话或感受" value={note} onChange={(event) => setNote(event.target.value)} /></label></div></LibraryDialog>
    <LibraryDialog open={dialog === 'goal'} title="年度阅读目标" onClose={() => setDialog(null)}><p>当前目标：{data?.annualGoal} 本。</p><p>目标调整服务暂未开放，当前阅读记录不受影响。</p></LibraryDialog>
  </main>;
}
