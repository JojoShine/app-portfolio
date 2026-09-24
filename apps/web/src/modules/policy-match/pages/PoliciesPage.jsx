import '../styles/pages/policies.css';
import {useCallback,useState} from 'react';
import {Link,useParams,useSearchParams} from 'react-router-dom';
import {Header,Hero,Icon,State,PolicyCard,Empty,Notice} from '../components/UI';
import {usePolicy} from '../components/PolicyContext';
import {policyService} from '../services/policy.service';
import {matchingService} from '../services/matching.service';
import useResource from '../hooks/useResource';
import {ClockCircleOutline,UserContactOutline,RightOutline} from 'antd-mobile-icons';
import ResultPolicyCard from '../components/ResultPolicyCard';
import PolicySortSelect from '../components/PolicySortSelect';
import hero from '../assets/home-hero.png';
import {time} from '../utils/format';
export default function PoliciesPage(){
  const {id}=useParams();const[params]=useSearchParams();const{subjectType,setSubjectType}=usePolicy();
  const resource=useResource(useCallback(()=>id?matchingService.get(id):policyService.list(subjectType),[id,subjectType]));
  const [query,setQuery]=useState(params.get('q')||'');const[category,setCategory]=useState('全部');const[sort,setSort]=useState('score');const[selected,setSelected]=useState([]);const[showIneligible,setShowIneligible]=useState(false);
  const rows=id?resource.data?.results||[]:resource.data||[];
  const filtered=rows.filter(p=>(category==='全部'||p.category===category)&&(p.title+' '+p.category+' '+p.description).includes(query.trim())&&(!id||showIneligible||!['ineligible','expired'].includes(p.eligibility))).sort((a,b)=>sort==='deadline'?new Date(a.endsAt)-new Date(b.endsAt):sort==='amount'?b.amount-a.amount:(b.score||0)-(a.score||0));
  const profile=resource.data?.profile||{};
  const profileSummary=(resource.data?.subjectType==='company'?[profile.industry,profile.projectStage]:[profile.education,profile.employment,profile.qualification]).filter(Boolean).join(' · ');
  const toggleSelection=policyId=>setSelected(s=>s.includes(policyId)?s.filter(v=>v!==policyId):s.length<2?[...s,policyId]:s);
  return <><Header title={id?'匹配结果':'政策库'} action={id?<Link to="/policy-match/history" className="pm-results-history"><ClockCircleOutline/>历史记录</Link>:undefined}/><div className={'pm-content pm-page-policies'+(id?' pm-page-results':'')}>
    {id?<><section className="pm-results-hero" style={{backgroundImage:`url(${hero})`}}><h1>找到 <em>{resource.loading?'—':rows.filter(p=>['eligible','potential'].includes(p.eligibility)).length}</em> 项<br/>值得优先查看的政策</h1><p>基于当次画像，智能匹配相关政策<br/>助你把握发展机会</p><span className="pm-demo">演示数据 <Icon name="info" size={12}/></span></section>{resource.data&&<div className="pm-results-profile"><span className="pm-iconbox"><UserContactOutline/></span><div><strong>{resource.data.subjectType==='company'?'企业':'个人'}画像 <small>· {time(resource.data.createdAt)}</small></strong><p>{profileSummary||'补充画像，获得更准确的匹配'}</p></div><Link to="/policy-match/profile" onClick={()=>setSubjectType(resource.data.subjectType)}>修改画像 <RightOutline/></Link></div>}</>:<Hero title={<>发现好政策<br/>连接新机会</>} subtitle="人才、就业、创业与企业发展支持" compact/>}
    <div className="pm-filters"><div className="pm-search"><Icon name="search" size={20}/><input placeholder="搜索政策名称" aria-label="搜索政策名称" value={query} onChange={e=>setQuery(e.target.value)}/></div><PolicySortSelect value={sort} onChange={setSort}/></div>
    <div className="pm-chips" role="group" aria-label="政策分类">{['全部','人才','就业','创业','补贴','惠企','科技创新'].map(c=><button aria-pressed={category===c} className={category===c?'active':''} key={c} onClick={()=>setCategory(c)}>{c}</button>)}</div>
    <State {...resource} retry={resource.reload}>{id?<div className="pm-results-count"><strong>为你匹配到 <em>{filtered.length}</em> 项政策</strong><span>{showIneligible?'展示全部资格状态':'仅展示相关结果'}</span></div>:<p className="pm-muted">{filtered.length}项政策 · 演示数据</p>}{filtered.length?filtered.map(p=>id?<ResultPolicyCard key={p.id} policy={p} snapshot={id} benefitCheck={resource.data?.benefitChecks?.[p.id]} selected={selected.includes(p.id)} selectionFull={selected.length===2} onSelect={()=>toggleSelection(p.id)}/>:<PolicyCard key={p.id} policy={p}/>):<Empty title="没有找到符合筛选的政策" text="试试其他关键词，或完善画像后重新匹配" to="/policy-match/profile"/>}{id&&<label className="pm-unsure"><input type="checkbox" checked={showIneligible} onChange={e=>setShowIneligible(e.target.checked)}/>同时查看暂不符合和已截止政策</label>}</State>
    {id&&<><Notice>匹配度是条件满足程度的辅助指标，申报资格请以逐项判断为准。</Notice><div className="pm-actionbar"><div className="pm-results-selection" aria-live="polite"><strong>已选 <em>{selected.length}</em> 项</strong><small>{selected.length===2?'可进行横向对比，辅助选择':'选择两项政策进行对比'}</small></div>{selected.length===2?<Link className="pm-primary" to={'/policy-match/compare/'+id+'?ids='+selected.join(',')}>对比政策 <Icon name="arrow"/></Link>:<button className="pm-primary" disabled>对比政策 <Icon name="arrow"/></button>}</div></>}
  </div></>;
}
