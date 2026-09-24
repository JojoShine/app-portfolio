import '../styles/pages/records.css';
import {useCallback,useState} from 'react';
import {FileOutline,UserOutline,AppOutline as BuildingsOutline,SearchOutline,DownOutline} from 'antd-mobile-icons';
import {Header,State,Empty} from '../components/UI';
import RecordCard from '../components/RecordCard';
import {isActive} from '../utils/format';
import hero from '../assets/records-hero.png';
import {usePolicy} from '../components/PolicyContext';
import useResource from '../hooks/useResource';
import {applicationService} from '../services/application.service';
export default function RecordsPage(){
  const{subjectType,setSubjectType}=usePolicy();const resource=useResource(useCallback(()=>applicationService.list(subjectType),[subjectType]));
  const[query,setQuery]=useState('');
  const groups=[['需要你处理',['draft','supplement_required','preparing']],['进行中',['submitted','under_review','visited_external']],['已结束',['approved','rejected','withdrawn','stopped']]];
  const records=resource.data||[];
  const filtered=records.filter(row=>(row.policy.title+' '+row.policy.category+' '+(row.receipt||'')).includes(query.trim()));
  const ongoing=records.filter(isActive).length;
  const loaded=!resource.loading&&!resource.error;
  return <><Header title="申报记录" action={<span className="pm-records-demo">演示数据</span>}/><div className="pm-content pm-page-records">
    <section className="pm-records-hero" style={{backgroundImage:`url(${hero})`}}><h1>我的申报记录</h1><p>一站式查看申报进度<br/>及时处理，高效办成</p></section>
    <section className="pm-records-overview"><div className="pm-records-heading"><h2>我的办理进度</h2><small>演示数据</small></div><div className="pm-records-stats"><div><strong>{loaded?ongoing:'—'}</strong><span>项办理中</span><p>正在办理的申报</p></div><div><strong>{loaded?records.length-ongoing:'—'}</strong><span>项已结束</span><p>已结束的申报</p></div><div className="pm-records-stats-note"><FileOutline/><span>高效申报<br/>便捷查询</span></div></div></section>
    <div className="pm-segments" role="group" aria-label="申报主体">{['personal','company'].map(t=><button aria-pressed={t===subjectType} className={t===subjectType?'active':''} key={t} onClick={()=>{setSubjectType(t);setQuery('');}}>{t==='personal'?<UserOutline/>:<BuildingsOutline/>}{t==='personal'?'个人':'企业'}</button>)}</div>
    <div className="pm-search"><SearchOutline/><input aria-label="搜索申报记录" placeholder="搜索申报政策、事项名称" value={query} onChange={event=>setQuery(event.target.value)}/></div>
    <State {...resource} retry={resource.reload}>{filtered.length?groups.map(([title,states],index)=>{const rows=filtered.filter(a=>states.includes(a.status));return rows.length?<details open className={'pm-records-group group-'+index} key={title}><summary><h2>{title}<b>{rows.length}</b></h2><span>共 {rows.length} 项<DownOutline/></span></summary><div>{rows.map(a=><RecordCard key={a.id} application={a}/>)}</div></details>:null;}):query.trim()?<div className="pm-records-empty"><Empty title="没有找到相关记录" text="试试其他政策名称或申报编号" to={null}/><button className="pm-secondary" onClick={()=>setQuery('')}>清空搜索</button></div>:<Empty title="暂无申报记录" text="找到适合的政策后，可保存草稿并开始办理" to="/policy-match/policies" label="查看政策"/>}</State>
    <footer className="pm-records-footer">演示数据，仅供体验参考<br/>具体申报进度请以实际办理为准。</footer>
  </div></>;
}
