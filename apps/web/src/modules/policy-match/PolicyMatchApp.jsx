import {useCallback,useEffect,useMemo,useState} from 'react';
import PropTypes from 'prop-types';
import {Navigate,Route,Routes,useLocation} from 'react-router-dom';
import {identityCapability} from '../../shared/capabilities/identity';
import {PolicyContext} from './components/PolicyContext';
import {Header,Notice,Icon} from './components/UI';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import AnalysisPage from './pages/AnalysisPage';
import PoliciesPage from './pages/PoliciesPage';
import PolicyDetailPage from './pages/PolicyDetailPage';
import ComparePage from './pages/ComparePage';
import ApplicationPage from './pages/ApplicationPage';
import ExternalPage from './pages/ExternalPage';
import SuccessPage from './pages/SuccessPage';
import RecordsPage from './pages/RecordsPage';
import RecordDetailPage from './pages/RecordDetailPage';
import AccountPage from './pages/AccountPage';
import GuidePage from './pages/GuidePage';
import './styles/index.css';
function Gate({children,authenticated,ready,login,error}){if(!ready)return <div className="pm-content pm-skeleton"><i/><i/></div>;return authenticated?children:<><Header title="登录后继续"/><div className="pm-content"><div className="pm-card pm-empty"><Icon name="user" size={40}/><h2>保存你的政策服务进度</h2><p>请通过外层载体登录后继续，画像与申报记录仅本人可查看。</p><Notice error>{error}</Notice><button className="pm-primary" onClick={login}>检查登录状态</button></div></div></>;}
Gate.propTypes={children:PropTypes.node,authenticated:PropTypes.bool,ready:PropTypes.bool,login:PropTypes.func,error:PropTypes.string};
export default function PolicyMatchApp(){
  const[subjectType,setSubjectType]=useState('personal');const[authenticated,setAuthenticated]=useState(false);const[ready,setReady]=useState(false);const[error,setError]=useState('');const{pathname}=useLocation();
  const login=useCallback(async()=>{setError('');try{await identityCapability.ensureLocalSession();setAuthenticated(true);}catch(e){setAuthenticated(false);setError(e.message);}finally{setReady(true);}},[]);
  useEffect(()=>{login();},[login]);useEffect(()=>{window.scrollTo(0,0);},[pathname]);
  const context=useMemo(()=>({subjectType,setSubjectType,authenticated,login}),[subjectType,authenticated,login]);
  const protect=(page)=><Gate authenticated={authenticated} ready={ready} login={login} error={error}>{page}</Gate>;
  return <PolicyContext.Provider value={context}><div className="pm-app"><Routes>
    <Route index element={<HomePage/>}/><Route path="policies" element={<PoliciesPage/>}/><Route path="policies/:id" element={<PolicyDetailPage/>}/>
    <Route path="profile" element={protect(<ProfilePage key={subjectType}/>)}/><Route path="analyze" element={protect(<AnalysisPage/>)}/><Route path="results/:id" element={protect(<PoliciesPage/>)}/><Route path="compare/:id" element={protect(<ComparePage/>)}/>
    <Route path="apply/:id" element={protect(<ApplicationPage/>)}/><Route path="external/:id" element={protect(<ExternalPage/>)}/><Route path="success/:id" element={protect(<SuccessPage/>)}/>
    <Route path="records" element={protect(<RecordsPage/>)}/><Route path="records/:id" element={protect(<RecordDetailPage/>)}/>
    <Route path="account" element={protect(<AccountPage/>)}/><Route path="favorites" element={protect(<AccountPage/>)}/><Route path="history" element={protect(<AccountPage/>)}/><Route path="guide" element={<GuidePage/>}/><Route path="*" element={<Navigate to="/policy-match" replace/>}/>
  </Routes></div></PolicyContext.Provider>;
}
