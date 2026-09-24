import '../styles/pages/analysis.css';
import {useEffect,useRef,useState} from 'react';
import {useNavigate,useLocation} from 'react-router-dom';
import {Header,Icon,Notice} from '../components/UI';
import {usePolicy} from '../components/PolicyContext';
import {matchingService} from '../services/matching.service';
import {profileService} from '../services/profile.service';

export default function AnalysisPage(){
  const {subjectType}=usePolicy();
  const navigate=useNavigate();
  const request=useRef(null);
  const [phase,setPhase]=useState(0);
  const [error,setError]=useState('');
  const [attempt,setAttempt]=useState(0);
  const allowPartial=useLocation().state?.confirmedProfile===subjectType;
  const subject=subjectType==='personal'?'个人':'企业';
  useEffect(()=>{
    let active=true;
    const timers=[];
    const started=Date.now();
    const later=(fn,ms)=>timers.push(setTimeout(()=>{if(active)fn();},ms));
    setError('');setPhase(0);
    // StrictMode 及重复渲染复用本轮请求，避免产生两份匹配记录。
    const key=subjectType+':'+allowPartial+':'+attempt;
    if(request.current?.key!==key)request.current={key,profile:profileService.get(subjectType)};
    const current=request.current;
    async function match(){
      try{
        const profile=await current.profile;
        if(!active)return;
        if(profile.completeness<100&&!allowPartial){navigate('/policy-match/profile',{replace:true});return;}
        setPhase(1);
        current.match ||= matchingService.create(subjectType);
        const row=await current.match;
        if(!active)return;
        later(()=>{
          setPhase(2);
          later(()=>{
            setPhase(3);
            later(()=>navigate('/policy-match/results/'+row.id,{replace:true}),300);
          },300);
        },Math.max(0,1400-(Date.now()-started)));
      }catch(e){if(active)setError(e.message);}
    }
    match();
    return()=>{active=false;timers.forEach(clearTimeout);};
  },[subjectType,navigate,attempt,allowPartial]);

  const titles=['正在读取你的画像','正在寻找适合你的政策','正在整理匹配结果','匹配完成'];
  const steps=['读取主体画像','核对政策条件','整理匹配依据'];
  const descriptions=['使用已保存的'+subject+'资料','逐项核对资格条件与有效期','整理条件解释与重复享受提示'];
  return <><Header title="智能匹配"/><div className={'pm-content pm-page-analysis'+(phase===3||error?' is-settled':'')+(phase===3?' is-complete':'')}>
    <div className="pm-match-visual" aria-hidden="true">
      <div className="pm-match-halo"/>
      <div className="pm-match-orbit"><i/><i/></div>
      <div className="pm-match-profile"><Icon name={subjectType==='personal'?'user':'company'} size={24}/><span>{subject}画像</span><i/><i/></div>
      <div className="pm-match-document"><div className="pm-match-document-heading"><Icon name="document" size={20}/><span>政策条件</span></div><div className="pm-match-document-lines"><i/><i/><i/></div><div className="pm-match-scan"/></div>
      <span className="pm-match-seal"><Icon name={error?'info':phase===3?'check':'search'} size={28}/></span>
      <span className="pm-match-note"><Icon name="check" size={14}/>逐项核对</span>
    </div>
    <div className="pm-match-heading" role="status" aria-live="polite" aria-atomic="true">
      <span className="pm-match-eyebrow">{subject}政策匹配</span>
      <h1>{error?'匹配暂未完成':titles[phase]}</h1>
      <p>{error?'已保存的画像仍然保留，请稍后重试':phase===3?'结果已就绪，即将为你展开':'从你的情况出发，让每一项匹配都有依据'}</p>
    </div>
    <ol className="pm-analysis" aria-label="匹配流程" aria-busy={!error&&phase<3}>
      {steps.map((title,i)=><li className={i<phase?'is-done':i===phase?'is-current':''} aria-current={i===phase?'step':undefined} key={title}>
        <span className="pm-analysis-marker">{i<phase?<Icon name="check" size={16}/>:<Icon name={['user','search','document'][i]} size={18}/>}</span>
        <div><h2>{title}</h2><p>{descriptions[i]}</p></div>
        <span className="pm-analysis-status">{i<phase?'已完成':i===phase?(error?'未完成':<span className="pm-match-dots" aria-label="处理中"><i/><i/><i/></span>):'待处理'}</span>
      </li>)}
    </ol>
    {error?<div className="pm-match-error"><Notice error>{error}</Notice><button className="pm-primary" onClick={()=>setAttempt(a=>a+1)}>重新匹配</button></div>:<p className="pm-match-footnote"><Icon name="info" size={15}/>匹配仅供参考，享受资格以政策审核为准</p>}
  </div></>;
}
