import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { eventStatus } from '../utils/format';
export function Icon({ name = 'flag' }) {
  const paths = {
    back: 'm15 5-7 7 7 7', chevron: 'm9 5 7 7-7 7', flag: 'M5 22V3m0 0c5-4 9 4 15 0v10c-6 4-10-4-15 0',
    clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18m0 4v6l4 2',
    check: 'm5 12 5 5L20 7', close: 'm6 6 12 12M18 6 6 18',
    book: 'M12 5C8 2 4 3 2 4v16c4-2 7-1 10 1m0-16c4-3 7-2 10-1v16c-4-2-7-1-10 1V5',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 22v-3c0-7 16-7 16 0v3',
    trophy: 'M7 3h10v8a5 5 0 0 1-10 0V3ZM7 5H3v3a4 4 0 0 0 4 4m10-7h4v3a4 4 0 0 1-4 4m-5 4v5m-4 0h8',
    calendar: 'M4 5h16v16H4ZM8 2v6M16 2v6M4 10h16',
    bulb: 'M9 18h6m-6 3h6M8 15C1 8 7 2 12 2s11 6 4 13l-1 3H9Z',
    science: 'M8 3h8M10 3v7l-6 9c-1 2 1 2 2 2h12c2 0 3 0 2-2l-6-9V3M8 15h8',
    culture: 'm3 9 9-6 9 6H3Zm2 3v7m5-7v7m4-7v7m5-7v7M3 22h18',
    safety: 'm12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6Zm-4 9 3 3 5-6',
  };
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] || paths.flag} /></svg>;
}
Icon.propTypes = { name: PropTypes.string };
export function Header({ title, back = '/quiz', home = false }) {
  return <header className="q-header"><Link to={home ? '/' : back} aria-label={home ? '返回主页' : '返回'}><Icon name="back" /></Link><h1>{title}</h1>{home ? <Link className="q-my" to="/quiz/mine">我的参与</Link> : <span />}</header>;
}
Header.propTypes = { title: PropTypes.string.isRequired, back: PropTypes.string, home: PropTypes.bool };
export function Art({ type = 'city', hero = false }) {
  if (hero) return <div className={`q-banner-art q-banner-${type}`} aria-hidden="true" />;
  return <div className={type === 'city' ? 'q-thumbnail q-city-thumb' : `q-thumbnail q-art-${type}`} aria-hidden="true" />;
}
Art.propTypes = { type: PropTypes.string, hero: PropTypes.bool };
export function Hero({ event, recommended = false }) {
  return <section className={`q-hero ${recommended ? 'q-hero-featured' : ''}`}><Art type={event.type} hero /><div className="q-hero-copy">{recommended && <span className="q-recommend">本周推荐</span>}<h2>{event.title === '城市知识挑战' ? <>城市知识<br />挑战</> : event.title === '生活科学知多少' ? <>生活科学<br />知多少</> : event.title === '传统文化趣味答题' ? <>传统文化<br />趣味答题</> : event.title === '安全知识小挑战' ? <>安全知识<br />小挑战</> : event.title}</h2><p>{event.description}</p><span className="q-badge">{eventStatus(event)}</span></div></section>;
}
Hero.propTypes = { event: PropTypes.object.isRequired, recommended: PropTypes.bool };
export function CelebrationArt() {
  return <div className="q-celebration-art" aria-hidden="true" />;
}
export function Stats({ items }) {
  return <div className="q-stats">{items.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>;
}
Stats.propTypes = { items: PropTypes.array.isRequired };
export function Rules({ items }) {
  return <ol className="q-rules">{items.map((text, i) => <li key={text}><span>{i + 1}</span><p>{text}</p></li>)}</ol>;
}
Rules.propTypes = { items: PropTypes.array.isRequired };
export function ActivityCard({ event }) {
  const status = eventStatus(event);
  const shortDate = value => new Date(value).toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai', month: 'numeric', day: 'numeric' }).replace('/', '月') + '日';
  return <Link className="q-activity-card" to={`/quiz/activities/${event.id}`}>
    <Art type={event.type} />
    <div className="q-activity-copy">
      <div className="q-activity-heading"><h3>{event.title}</h3><span className={`q-badge ${status === '已结束' ? 'q-muted-badge' : ''}`}>{status}</span></div>
      <p>{event.count}道题 · 限时{event.minutes}分钟</p>
      <small>{status === '未开始' ? `${shortDate(event.start)}开始` : status === '已结束' ? <span className="q-activity-review">查看活动回顾</span> : `${shortDate(event.start)}—${shortDate(event.end)}`}</small>
    </div>
    <span className="q-chevron" aria-hidden="true"><Icon name="chevron" /></span>
  </Link>;
}
ActivityCard.propTypes = { event: PropTypes.object.isRequired };
export function Empty({ text = '暂时没有记录' }) { return <div className="q-empty"><Icon name="book" /><p>{text}</p><Link to="/quiz">发现更多活动 ›</Link></div>; }
Empty.propTypes = { text: PropTypes.string };
export function Filters({ items, value, onChange }) { return <div className="q-filters">{items.map(item => <button key={item} aria-pressed={item === value} className={item === value ? 'selected' : ''} onClick={() => onChange(item)}>{item}</button>)}</div>; }
Filters.propTypes = { items: PropTypes.array.isRequired, value: PropTypes.string.isRequired, onChange: PropTypes.func.isRequired };
