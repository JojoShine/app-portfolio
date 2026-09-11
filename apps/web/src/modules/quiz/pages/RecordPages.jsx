import { useState } from 'react';
import PropTypes from 'prop-types';
import reviewOverviewArt from '../assets/review-overview.png';
import { Link, useParams } from 'react-router-dom';
import { useQuiz } from '../components/QuizContext';
import { Header, Icon, Art, Empty, Filters, CelebrationArt } from '../components/UI';
import { duration, eventStatus, typeName } from '../utils/format';
export function ResultPage() {
  const { id } = useParams(), { data } = useQuiz();
  const e = data.events.find(e => e.id === id), a = e?.attempt;
  if (!a || a.status !== 'completed') return <><Header title="挑战结果" /><Empty text="完成挑战后即可查看结果" /></>;
  return <div className="q-result-shell"><Header title="挑战结果" back={`/quiz/activities/${id}`} /><main className="q-content q-result"><div className="q-celebrate"><CelebrationArt /><h2>挑战完成！</h2><p>{a.reason === 'timeout' ? '时间到，已为你保存本次答题结果' : '又收获了一份新知识'}</p></div><section className="q-panel q-score"><h2>{e.title}</h2><div className="q-score-number">{a.score}<small>分</small></div><p>满分100分</p><div className="q-result-stats"><span>答对<strong>{a.correctCount}</strong>题</span><span>用时<strong>{duration(Math.ceil((a.finishedAt - a.startedAt) / 1000))}</strong></span><span>当前第<strong>{a.rank}</strong>名</span></div><small>排名随活动参与情况更新</small></section><section className="q-panel"><h2>本次答题</h2><dl className="q-rows"><div><dt>题目数量</dt><dd>{e.count}题</dd></div><div><dt>完成时间</dt><dd><time className="q-completed-time" dateTime={new Date(a.finishedAt).toISOString()}>{new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(a.finishedAt).replace(/^(\d+)\/(\d+)\/(\d+)/, '$1年$2月$3日')}</time></dd></div><div><dt>参与状态</dt><dd>已完成</dd></div></dl></section><Link className="q-review-entry" to={`/quiz/activities/${id}/review`}><span className="q-result-review-icon"><Icon name="book" /></span><div><h3>回顾这次的收获</h3><p>查看每题答案与解析</p></div><span><Icon name="chevron" /></span></Link><Link className="q-button" to={`/quiz/activities/${id}/ranking`}>查看排行榜</Link><Link className="q-button q-outline" to="/quiz">返回活动首页</Link><p className="q-footnote">每个活动仅可参加1次</p></main></div>;
}
function RankingAvatar({ id }) {
  const index = id === 'me' ? 8 : Number(id.replace('demo-', '')) % 9;
  return <span className="q-avatar q-cartoon-avatar" aria-hidden="true" style={{ backgroundPosition: `${index % 3 * 50}% ${Math.floor(index / 3) * 50}%` }} />;
}
RankingAvatar.propTypes = { id: PropTypes.string.isRequired };
export function RankingPage() {
  const { id } = useParams(), { data } = useQuiz();
  const [limit, setLimit] = useState(8);
  const e = data.events.find(e => e.id === id);
  if (!e) return <><Header title="排行榜" /><Empty text="活动不存在" /></>;
  const rows = e.ranking, me = rows.find(r => r.id === 'me');
  return <><Header title="排行榜" back={`/quiz/activities/${id}`} /><main className="q-content"><div className="q-ranking-title"><CelebrationArt /><h2>{e.title}</h2><span className="q-badge">{eventStatus(e)}</span><p>按得分排序，同分用时更短者在前</p></div><section className="q-panel q-podium">{[rows[1], rows[0], rows[2]].map(r => <div key={r.id} className={r.rank === 1 ? 'first' : ''}><b className="q-medal">{r.rank}</b><RankingAvatar id={r.id} /><h3>{r.name}</h3><strong>{r.score}<small>分</small></strong><p>{duration(r.seconds)}</p></div>)}</section><div className="q-personal-rank"><RankingAvatar id="me" /><div>我的排名<strong>{me ? `第${me.rank}名` : '等待你的挑战'}</strong></div><span>{me ? `${me.score}分 · ${duration(me.seconds)}` : e.attempt ? '完成后进入排行' : '参与后记录成绩'}</span></div><section className="q-panel"><h2>全部排名</h2><div className="q-rank-head"><span>排名 / 参与者</span><span>得分 · 用时</span></div>{rows.slice(3, limit).map(r => <div key={r.id} className={`q-rank-row ${r.id === 'me' ? 'is-me' : ''}`}><span>{r.rank}</span><RankingAvatar id={r.id} /><span>{r.name}</span><div><strong>{r.score}分</strong><small>{duration(r.seconds)}</small></div></div>)}</section>{limit < rows.length && <button className="q-button q-outline" onClick={() => setLimit(n => n + 8)}>查看更多</button>}<p className="q-footnote">活动结束后，排名将最终确定<br />当前为本地演示排行</p></main></>;
}
export function MinePage() {
  const { data } = useQuiz();
  const [filter, setFilter] = useState('全部');
  const joined = data.events.filter(e => e.attempt), completed = joined.filter(e => e.attempt.status === 'completed');
  const list = joined.filter(e => filter === '全部' || (filter === '已完成') === (e.attempt.status === 'completed')).sort((a, b) => b.attempt.startedAt - a.attempt.startedAt);
  return <div className="q-mine-shell"><Header title="我的参与" /><main className="q-content q-mine">
    <section className="q-panel q-mine-summary"><div className="q-stats">{[[joined.length, '参与'], [completed.length, '已完成'], [joined.length - completed.length, '待完成']].map(([value, label]) => <div key={label}><strong>{value}<small>场</small></strong><span>{label}</span></div>)}</div></section>
    <Filters items={['全部', '待完成', '已完成']} value={filter} onChange={setFilter} />
    {list.map(e => {
      const a = e.attempt, done = a.status === 'completed';
      const day = new Date(done ? a.finishedAt : a.startedAt).toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai', month: 'numeric', day: 'numeric' }).replace('/', '月') + '日';
      return <section className={`q-panel q-mine-record ${done ? 'is-completed' : 'is-active'}`} key={e.id}>
        <Art type={e.type} />
        <div className="q-mine-record-body">
          <div className="q-mine-record-heading"><h2>{e.title}</h2><span className={`q-badge ${done ? 'q-muted-badge' : ''}`}>{done ? '已完成' : '答题中'}</span></div>
          <p className="q-mine-date">{day}{done ? '完成' : '参与'}</p>
          {done ? <><div className="q-mine-result"><span><strong>{a.score}</strong> 分</span><span>用时 <b>{duration(Math.ceil((a.finishedAt - a.startedAt) / 1000))}</b></span></div><p className="q-mine-review-note"><Icon name="book" />答案与解析已开放</p></> : <><div className="q-record-progress"><span>已答 {a.answers.length} / {e.count} 题</span><span><Icon name="clock" />剩余 {duration(Math.ceil((a.deadline - Date.now()) / 1000))}</span></div><progress max={e.count} value={a.answers.length} /><p className="q-notice">退出后仍在计时，请及时完成</p></>}
        </div>
        <Link className={`q-button ${done ? 'q-outline' : ''}`} to={`/quiz/activities/${e.id}/${done ? 'result' : 'answer'}`}>{done ? '查看结果与回顾' : '继续答题'}</Link>
      </section>;
    })}
    {!list.length && <Empty text={filter === '全部' ? '还没参加活动，挑一个开始吧' : '暂无相关参与记录'} />}
    <div className="q-mine-footer"><p className="q-footnote">每个活动仅可参加1次</p><Link className="q-discover" to="/quiz">发现更多活动 <Icon name="chevron" /></Link></div>
  </main></div>;
}
export function ReviewPage() {
  const { id } = useParams(), { data } = useQuiz();
  const [filter, setFilter] = useState('全部题目'), [position, setPosition] = useState(0);
  const e = data.events.find(e => e.id === id), a = e?.attempt;
  if (!a || a.status !== 'completed') return <><Header title="答案回顾" /><Empty text="完成后即可回顾答案" /></>;
  const indices = e.questions.map((_, i) => i).filter(i => filter !== '只看错题' || !a.answers[i]?.correct);
  const index = indices[Math.min(position, indices.length - 1)], q = e.questions[index], answer = a.answers[index];
  return <div className="q-review-shell"><Header title="答案回顾" back={`/quiz/activities/${id}/result`} />
    <main className="q-content q-review">
      <section className="q-review-overview">
        <img className="q-review-overview-art" src={reviewOverviewArt} alt="" aria-hidden="true" />
        <div className="q-review-overview-heading"><h2>{e.title}</h2><span className="q-badge q-muted-badge">已完成</span></div>
        <div className="q-review-overview-stats"><div><strong>{a.score}<small>分</small></strong><span>本次得分</span></div><div><strong>{a.correctCount}<small> / {e.count}</small></strong><span>答对题数</span></div></div>
      </section>
      <Filters items={['全部题目', '只看错题']} value={filter} onChange={v => { setFilter(v); setPosition(0); }} />
      {q ? <>
        <section className="q-panel q-question">
          <div className="q-question-meta"><span className="q-type">{typeName(q.type)}</span><span>第 {index + 1} / {e.count} 题</span><span className={`q-review-status ${answer?.correct ? 'correct' : answer ? 'wrong' : ''}`}>{answer?.correct ? '已答对' : answer ? '未答对' : '未作答'}</span></div>
          <h2>{q.title}</h2>
          <div className="q-options">{q.options.map((option, i) => {
            const correct = q.correct.includes(i), wrong = answer?.choices.includes(i) && !correct;
            return <div className={`q-option ${correct ? 'correct' : wrong ? 'wrong' : ''}`} key={i}><span className="q-letter">{'ABCD'[i]}</span><span>{option}</span>{(correct || wrong) && <Icon name={correct ? 'check' : 'close'} />}</div>;
          })}</div>
          <div className="q-answer-summary"><p>你的答案：<strong className={answer?.correct ? 'correct' : 'wrong'}>{answer ? answer.choices.map(i => 'ABCD'[i]).join('、') : '未作答'}</strong></p><p>正确答案：<strong className="correct">{q.correct.map(i => 'ABCD'[i]).join('、')}</strong></p></div>
        </section>
        <section className="q-panel q-explanation"><h2><Icon name="book" />一起了解一下</h2><p>{q.explanation}</p>{q.type === 'multi' && <p className="q-notice">多选题需全部选对才得分</p>}</section>
        <div className="q-button-pair"><button className="q-button q-outline" disabled={position === 0} onClick={() => { setPosition(n => n - 1); window.scrollTo(0, 0); }}>上一题</button><button className="q-button" disabled={position >= indices.length - 1} onClick={() => { setPosition(n => n + 1); window.scrollTo(0, 0); }}>下一题</button></div>
      </> : <Empty text="全部答对了，继续保持这份好奇心！" />}
      <Link className="q-discover" to={`/quiz/activities/${id}/result`}>返回挑战结果 <Icon name="chevron" /></Link>
    </main>
  </div>;
}
