import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header, Icon, Empty } from '../components/UI';
import { useQuiz } from '../components/QuizContext';
import { answerQuestion, nextQuestion } from '../services/participation.service';
import { duration, typeName } from '../utils/format';
export default function AnswerPage() {
  const { id } = useParams(), { data, update, reload } = useQuiz(), navigate = useNavigate();
  const event = data.events.find(e => e.id === id), a = event?.attempt;
  const [choices, setChoices] = useState([]), [busy, setBusy] = useState(false), [error, setError] = useState(''), [now, setNow] = useState(Date.now());
  const index = a?.index || 0, response = a?.answers[index], q = event?.questions[index];
  const next = async () => {
    if (busy) return;
    if (a.status === 'completed') { navigate(`/quiz/activities/${id}/result`, { replace: true }); return; }
    setBusy(true); setError('');
    try { const e = await nextQuestion(id, index); update(e); setChoices([]); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(t); }, []);
  useEffect(() => {
    if (!a) return;
    if (a.reason === 'timeout') navigate(`/quiz/activities/${id}/result`, { replace: true });
    else if (a.status === 'active' && now >= a.deadline) reload();
  }, [a, now, id, navigate, reload]);
  useEffect(() => {
    if (!response?.correct || error) return;
    const timer = setTimeout(async () => {
      if (a.status === 'completed') { navigate(`/quiz/activities/${id}/result`, { replace: true }); return; }
      try { const e = await nextQuestion(id, index); update(e); setChoices([]); }
      catch (e) { setError(e.message); }
    }, Math.max(0, response.time + 1100 - Date.now()));
    return () => clearTimeout(timer);
  }, [response, a?.status, id, index, update, navigate, error]);
  const choose = async selected => {
    if (busy || response || now >= a.deadline) return;
    setBusy(true); setError('');
    try { update(await answerQuestion(id, index, selected)); setChoices([]); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  if (!event || !a) return <><Header title="答题挑战" back={`/quiz/activities/${id}`} /><Empty text="请从活动详情开始挑战" /></>;
  const locked = Boolean(response) || a.status === 'completed' || now >= a.deadline;
  return <><Header title={event.title} back={`/quiz/activities/${id}`} /><main className="q-content q-answer"><section className="q-panel q-progress"><div><span>第 <strong>{index + 1}</strong> / {event.count} 题</span><span className={a.deadline - now < 60000 ? 'q-urgent' : ''}><Icon name="clock" /> 剩余 {duration(Math.ceil((a.deadline - now) / 1000))}</span></div><progress max={event.count} value={a.answers.length} /><p>已答 {a.answers.length} 题</p></section><section className="q-panel q-question"><div className="q-question-meta"><span className="q-type">{typeName(q.type)}</span><span>每题{Number((100 / event.count).toFixed(2))}分</span></div><h2>{q.title}</h2><div className="q-options">{q.options.map((option, i) => {
    const correct = response && q.correct.includes(i), wrong = response && response.choices.includes(i) && !correct;
    return <button key={`${index}-${i}`} disabled={locked || busy} aria-pressed={response ? response.choices.includes(i) : choices.includes(i)} className={`q-option ${correct ? 'correct' : wrong ? 'wrong' : choices.includes(i) ? 'chosen' : ''}`} onClick={() => q.type === 'multi' ? setChoices(previous => previous.includes(i) ? previous.filter(n => n !== i) : [...previous, i]) : choose([i])}><span className="q-letter">{'ABCD'[i]}</span><span>{option}</span>{(correct || wrong) && <Icon name={correct ? 'check' : 'close'} />}</button>;
  })}</div></section>{response && <section className={`q-panel q-feedback ${response.correct ? 'correct' : ''}`} role="status"><span className="q-feedback-icon"><Icon name={response.correct ? 'check' : 'bulb'} /></span><div><h3>{response.correct ? '答对了！' : `差一点，正确答案是${q.correct.map(i => 'ABCD'[i]).join('、')}`}</h3><p>{q.explanation}</p>{q.type === 'multi' && !response.correct && <small>多选题需全部选对才得分{q.correct.some(i => !response.choices.includes(i)) && `，本题漏选了${q.correct.filter(i => !response.choices.includes(i)).map(i => 'ABCD'[i]).join('、')}`}</small>}</div></section>}{error && <p role="alert" className="q-error">{error}</p>}{response?.correct && !error ? <p className="q-auto" role="status">{a.status === 'completed' ? '正在汇总你的挑战结果…' : '即将进入下一题…'}</p> : response ? <button className="q-button" disabled={busy} onClick={next}>{a.status === 'completed' ? '查看结果' : '下一题'}</button> : q.type === 'multi' ? <button className="q-button" disabled={!choices.length || busy || locked} onClick={() => choose(choices)}>{busy ? '正在确认…' : '确认答案'}</button> : <p className="q-footnote">选择后立即显示结果，答案不可修改</p>}{response && !response.correct && <p className="q-footnote">答案已记录</p>}</main></>;
}
