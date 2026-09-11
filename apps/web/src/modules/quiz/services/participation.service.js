import api from '../../../shared/api/api';
export const startChallenge = id => api.post('/quiz/start', { id });
export const answerQuestion = (id, index, choices) => api.post('/quiz/answer', { id, index, choices });
export const nextQuestion = (id, index) => api.post('/quiz/next', { id, index });
