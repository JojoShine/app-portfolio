import '../styles/pages/account.css';
import '../styles/pages/history.css';
import '../styles/pages/favorites.css';
import {useCallback} from 'react';
import {Link,useLocation} from 'react-router-dom';
import {Header,State,Empty} from '../components/UI';
import {usePolicy} from '../components/PolicyContext';
import useResource from '../hooks/useResource';
import {profileService} from '../services/profile.service';
import {policyService} from '../services/policy.service';
import {matchingService} from '../services/matching.service';
import AccountOverview from '../components/AccountOverview';
import {ClockCircleOutline,RightOutline,UserContactOutline,TeamFill,FileOutline} from 'antd-mobile-icons';
export default function AccountPage(){
  const {subjectType,setSubjectType}=usePolicy();const{pathname}=useLocation();const mode=pathname.split('/').pop();
  const resource=useResource(useCallback(async()=>{const[personal,company,favorites,matches]=await Promise.all([profileService.get('personal'),profileService.get('company'),policyService.favorites(),matchingService.list(subjectType)]);return {personal,company,favorites:favorites.filter(f=>f.policy.subjectType===subjectType),matches};},[subjectType]));
  const data=resource.data;const title=mode==='favorites'?'我的收藏':mode==='history'?'历史匹配':'我的资料';
  if(mode==='account')return <><Header title="我的资料"/><div className="pm-content pm-page-account pm-page-personal-account"><State {...resource} retry={resource.reload}>{data&&<AccountOverview data={data}/>}</State></div></>;
  return <><Header title={title}/><div className={'pm-content pm-page-account'+(mode==='history'?' pm-page-history':' pm-page-favorites')}><div className="pm-segments" role="group" aria-label="匹配身份">{['personal','company'].map(t=><button key={t} aria-pressed={t===subjectType} className={t===subjectType?'active':''} onClick={()=>setSubjectType(t)}>{t==='personal'?<UserContactOutline/>:<TeamFill/>}{t==='personal'?'个人匹配':'企业匹配'}</button>)}</div><State {...resource} retry={resource.reload}>{data&&<>
    {mode==='favorites'&&<section className="pm-favorites-panel" aria-labelledby="pm-favorites-title"><div className="pm-favorites-heading"><h2 id="pm-favorites-title">我的收藏</h2><span>共 {data.favorites.length} 项政策</span></div><div className="pm-favorites-list">{data.favorites.length?data.favorites.map(({policy})=><Link className="pm-favorite-row" key={policy.id} to={'/policy-match/policies/'+policy.id}><span className="pm-favorite-icon" aria-hidden="true">{policy.category==='人才'?<TeamFill/>:<FileOutline/>}</span><div className="pm-favorite-copy"><h3>{policy.title}</h3><p>{policy.category} · {policy.channel==='internal'?'站内申报':'外部办理'}</p></div><RightOutline className="pm-favorite-arrow"/></Link>):<Empty title="还没有收藏政策" text="点击政策详情右上角星标即可收藏" to="/policy-match/policies" label="浏览政策"/>}</div></section>}
    {mode==='history'&&<section className="pm-history-panel" aria-labelledby="pm-history-title"><div className="pm-history-heading"><h2 id="pm-history-title">历史匹配</h2><span>共 {data.matches.length} 条记录</span></div><div className="pm-history-list">{data.matches.length?data.matches.map(m=><Link className="pm-history-row" key={m.id} to={'/policy-match/results/'+m.id}><ClockCircleOutline className="pm-history-clock"/><span className="pm-history-copy"><time dateTime={m.createdAt}>{new Date(m.createdAt).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',year:new Date(m.createdAt).getFullYear()!==new Date().getFullYear()?'numeric':undefined,month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false})}</time><small>{m.subjectType==='personal'?'个人':'企业'}匹配</small></span><span className="pm-history-count"><strong>{m.results.length}</strong> 项结果</span><RightOutline className="pm-history-arrow"/></Link>):<Empty title="暂无匹配记录" text={'完善'+(subjectType==='personal'?'个人':'企业')+'画像，开始首次政策匹配'}/>}</div></section>}
  </>}</State></div></>;
}
