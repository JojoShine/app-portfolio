import { createContext, useContext } from 'react';
export const QuizContext = createContext(null);
export const useQuiz = () => useContext(QuizContext);
