import {createContext,useContext} from 'react';
export const PolicyContext=createContext(null);
export const usePolicy=()=>useContext(PolicyContext);
