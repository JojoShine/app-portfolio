import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuiz } from '../components/QuizContext';
import { Header, Hero, Icon, ActivityCard, Rules, Empty, Filters } from '../components/UI';
import { dateTime, eventStatus } from '../utils/format';
import { startChallenge } from '../services/participation.service';
export function HomePage() {
  const { data } = useQuiz();
  const [filter, setFilter] = useState('全部');
  const featured = data.events[0];
  const list = data.events.filter(e => e.id !== featured.id && (filter === '全部' || eventStatus(e) === filter));
  return <div className="q-home-shell"><Header title="答题挑战" home /><main className="q-content q-home"><Hero event={featured} recommended /><div className="q-highlights"><span><Icon name="book" />{featured.count}道题</span><span><Icon name="clock" />{featured.minutes}分钟</span><span><Icon name="user" />每人限参加1次</span></div><Link className="q-button" to={`/quiz/activities/${featured.id}`}>查看活动 <Icon name="chevron" /></Link><div className="q-section-title"><h2>发现活动</h2><span>更多主题，等你挑战</span></div><Filters items={['全部', '进行中', '未开始', '已结束']} value={filter} onChange={setFilter} /><div className="q-list">{list.map(e => <ActivityCard key={e.id} event={e} />)}{!list.length && <Empty text="暂无此状态的活动" />}</div></main></div>;
}
export function ActivityPage() {
  const { id } = useParams(), { data, update } = useQuiz();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const event = data.events.find(e => e.id === id);
  if (!event) return <><Header title="活动详情" /><Empty text="活动不存在" /></>;
  const status = eventStatus(event), a = event.attempt;
  const start = async () => {
    setBusy(true); setError('');
    try { const next = await startChallenge(id); update(next); navigate(`/quiz/activities/${id}/${next.attempt.status === 'completed' ? 'result' : 'answer'}`); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  return <div className="q-detail-shell"><Header title="活动详情" /><main className={`q-content q-activity-detail${error ? ' has-error' : ''}`}><Hero event={event} /><section className="q-panel"><h2>{event.type === 'city' ? '探索城市，发现新知' : event.title}</h2><p className="q-muted">{event.type === 'city' ? '从城市地理到日常生活，看看你了解多少。' : `${event.description}。`}</p><div className="q-highlights q-inner-highlights"><span><Icon name="book" />{event.count}道题</span><span><Icon name="clock" />{event.minutes}分钟</span><span><Icon name="trophy" />100分</span></div><div className="q-time-row"><Icon name="calendar" /><div>活动时间<p>{dateTime(event.start)} — {dateTime(event.end)}</p></div></div><Link className="q-menu" to={`/quiz/activities/${id}/ranking`}><Icon name="trophy" />查看排行榜<span><Icon name="chevron" /></span></Link></section><section className="q-panel"><h2>参与方式</h2><Rules items={['随时参加，独立完成', '每人只有1次参与机会', '单选、判断即选即判，多选确认后判定', '答对自动下一题，答错查看反馈后继续', '中途退出可继续，倒计时不中断']} /></section><section className="q-panel"><h2>成绩与排行</h2><Rules items={['多选需全部选对才得分，判定后不能修改', '完成后查看得分、用时和答案回顾', '得分越高排名越靠前，同分用时更短者在前']} /></section><p className="q-footnote">每一次探索，都有新发现</p></main><footer className="q-activity-action"><p className="q-notice"><Icon name="clock" />{a ? a.status === 'completed' ? '本次挑战已完成，看看你的收获' : '倒计时仍在继续，请及时完成' : status === '进行中' ? '准备好再开始，点击后立即计时' : status === '未开始' ? '活动还未开始，届时再来挑战' : '活动已结束，期待下次相遇'}</p>{error && <p role="alert" className="q-error">{error}</p>}<button className="q-button" disabled={busy || (!a && status !== '进行中')} onClick={start}>{busy ? '正在准备…' : a ? a.status === 'completed' ? '查看结果' : '继续答题' : status === '进行中' ? '开始挑战' : status}</button></footer></div>;
}
