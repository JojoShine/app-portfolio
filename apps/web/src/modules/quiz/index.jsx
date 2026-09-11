import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { QuizContext } from './components/QuizContext';
import { Header, Empty } from './components/UI';
import { useActivities } from './hooks/useActivities';
import { HomePage, ActivityPage } from './pages/ActivityPages';
import AnswerPage from './pages/AnswerPage';
import { MinePage, RankingPage, ResultPage, ReviewPage } from './pages/RecordPages';
import './quiz.css';
export default function QuizApp() {
  const state = useActivities(), location = useLocation();
  useEffect(() => { window.scrollTo(0, 0); document.title = '答题挑战'; }, [location.pathname]);
  return <div className="q-app"><QuizContext.Provider value={state}>{!state.data ? <><Header title="答题挑战" home />{state.error ? <div className="q-content"><p role="alert">{state.error}</p><button className="q-button" onClick={state.reload}>重新加载</button></div> : <div className="q-loading" aria-label="活动加载中"><div /><div /><div /></div>}</> : <>{state.error && <div className="q-global-error" role="alert">{state.error}<button onClick={state.reload}>重试</button></div>}<Routes><Route index element={<HomePage />} /><Route path="activities/:id" element={<ActivityPage />} /><Route path="activities/:id/answer" element={<AnswerPage />} /><Route path="activities/:id/result" element={<ResultPage />} /><Route path="activities/:id/ranking" element={<RankingPage />} /><Route path="activities/:id/review" element={<ReviewPage />} /><Route path="mine" element={<MinePage />} /><Route path="*" element={<><Header title="页面不存在" /><Empty text="这个页面暂时找不到了" /></>} /></Routes></>}</QuizContext.Provider></div>;
}
