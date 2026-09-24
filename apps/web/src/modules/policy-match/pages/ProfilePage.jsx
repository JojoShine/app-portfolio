import '../styles/pages/profile.css';
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {usePolicy} from '../components/PolicyContext';
import {Header,Hero,State,Notice,Icon} from '../components/UI';
import ProfileFields from '../components/ProfileFields';
import {steps} from '../constants/questions';
import {displayValue} from '../utils/format';
import useProfileFlow from '../hooks/useProfileFlow';
import profileHero from '../assets/profile-hero.png';
export default function ProfilePage(){
  const {subjectType}=usePolicy();
  const [step,setStep]=useState(0);
  const flow=useProfileFlow(subjectType);
  const navigate=useNavigate();
  const items=steps[subjectType];
  function goToStep(index){setStep(index);window.scrollTo(0,0);}
  async function next(){const row=await flow.save();if(row){if(step===4)navigate('/policy-match/analyze',{state:{confirmedProfile:subjectType}});else {setStep(step+1);window.scrollTo(0,0);}}}
  return <><Header title={subjectType==='personal'?'个人画像':'企业画像'} action={<button disabled={flow.busy} onClick={async()=>{if(await flow.save())navigate('/policy-match');}}>保存退出</button>}/><div className="pm-content pm-page-profile"><State {...flow.resource} retry={flow.resource.reload}>
    <div className="pm-stepbar"><strong>0{step+1}<small> / 05</small></strong><progress aria-label="画像填写进度" value={step+1} max="5"/><span>{items[step].title}</span></div>
    {subjectType==='personal'?<section className="pm-profile-hero" style={{backgroundImage:`url(${profileHero})`}}><h1>{step===4?<>确认个人信息<br/>准备开始智能匹配</>:<>完善个人信息<br/>获得更精准的政策匹配</>}</h1><p>{step===4?'核对以下信息，获得可靠的匹配结果':'这些信息用于匹配人才与就业政策'}</p><span className="pm-demo">演示数据 <Icon name="info" size={12}/></span></section>:<Hero title={<>完善企业画像<br/>发现创新发展机会</>} subtitle={items[step].title+' · 不确定的信息可稍后补充'} compact/>}
    {step<4?<div className="pm-card"><ProfileFields fields={items[step].fields} payload={flow.payload} onChange={(key,value)=>{flow.setPayload(p=>({...p,[key]:value}));}}/></div>:<div className="pm-card pm-review">{items.slice(0,4).map((s,i)=><section key={s.title}><h3>{s.title}<button onClick={()=>goToStep(i)} aria-label={'修改'+s.title}>修改</button></h3>{s.fields.map(f=><p key={f.key}><span>{f.label}</span><b>{displayValue(flow.payload[f.key])}</b></p>)}</section>)}</div>}
    <Notice>信息仅用于政策条件匹配。缺失的条件会在结果中明确提示。</Notice><Notice error>{flow.error}</Notice><small className="pm-save"><Icon name="check" size={14}/>{flow.saved||'点击下一步保存当前信息'}</small>
    <div className="pm-actionbar" role="group" aria-label="画像填写操作"><button className="pm-secondary" disabled={step===0||flow.busy} onClick={()=>goToStep(step-1)}>上一步</button><button className="pm-primary" disabled={flow.busy} onClick={next}>{flow.busy?'正在保存…':step===4?'开始智能匹配':'下一步'}</button></div>
  </State></div></>;
}
