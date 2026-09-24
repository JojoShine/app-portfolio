import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {UserOutline,AppOutline,LoopOutline,RightOutline,FileOutline,ClockCircleOutline,QuestionCircleOutline,LeftOutline,TeamFill} from 'antd-mobile-icons';
import useSessionStore from '../../../shared/auth/sessionStore';
import {usePolicy} from './PolicyContext';
import {Footer} from './UI';
import {time} from '../utils/format';
import hero from '../assets/account-hero.png';

export default function AccountOverview({data}){
  const{subjectType,setSubjectType}=usePolicy();
  const name=useSessionStore(state=>state.user?.displayName);
  return <>
    <section className="pm-account-hero" style={{backgroundImage:`url(${hero})`}}><h1>完善个人资料<br/>获得更精准的政策服务</h1><p>让好政策，主动找到你</p><span>演示数据</span></section>
    <section className="pm-account-identity"><span className="pm-account-avatar"><UserOutline/></span><div><h2>{name?`${Array.from(name)[0]}*`:'我的账户'}</h2><p>当前身份：{subjectType==='personal'?'个人':'企业'}</p></div><button className="pm-account-switch" onClick={()=>setSubjectType(subjectType==='personal'?'company':'personal')}><LoopOutline/>切换身份</button></section>
    <section className="pm-account-section"><div className="pm-account-heading"><h2>画像管理</h2><span>完善资料，精准匹配</span></div><div className="pm-account-profiles">{['personal','company'].map(type=>{
      const profile=data[type];const personal=type==='personal';
      return <article className="pm-account-profile" key={type}><div className="pm-account-profile-title"><span className={'pm-account-profile-icon'+(!personal?' is-company':'')}>{personal?<UserOutline/>:<AppOutline/>}</span><div><h3>{personal?'个人画像':'企业画像'}</h3><p>{personal?'完善教育、就业、创业等信息':'填写企业信息，获取相关政策推荐'}</p></div></div><div className="pm-account-completion">{profile.filled?<><p>完整度 <strong>{profile.completeness}%</strong></p><progress aria-label={(personal?'个人':'企业')+'画像完整度'} max="100" value={profile.completeness}/></>:<p className="pm-account-unfilled">尚未填写</p>}</div><Link className={personal?'pm-primary':'pm-secondary'} to={profile.completeness>=100?"/policy-match/analyze":"/policy-match/profile"} onClick={()=>setSubjectType(type)}>{profile.completeness>=100?'立即匹配':profile.filled?'继续完善':personal?'创建个人画像':'创建企业画像'}<RightOutline/></Link>{profile.completeness>=100&&<Link className="pm-account-edit" to="/policy-match/profile" onClick={()=>setSubjectType(type)}>编辑画像</Link>}</article>;
    })}</div></section>
    <section className="pm-account-section"><div className="pm-account-heading"><h2>我的收藏</h2><Link to="/policy-match/favorites">查看全部 {data.favorites.length} 项<RightOutline/></Link></div><div className="pm-account-list">{data.favorites.length?data.favorites.slice(0,2).map(({policy})=><Link className="pm-account-favorite-row" key={policy.id} to={'/policy-match/policies/'+policy.id}><span className="pm-account-list-icon">{policy.category==='人才'?<TeamFill/>:<FileOutline/>}</span><div><h3>{policy.title}</h3><p>{policy.category} · {policy.channel==='internal'?'站内申报':'外部办理'}</p></div><RightOutline/></Link>):<Link className="pm-account-empty" to="/policy-match/policies"><FileOutline/><span><strong>还没有收藏政策</strong><small>浏览政策，收藏感兴趣的申报机会</small></span><RightOutline/></Link>}</div></section>
    <section className="pm-account-section"><div className="pm-account-heading"><h2>历史匹配</h2><Link to="/policy-match/history">查看全部<RightOutline/></Link></div><div className="pm-account-list">{data.matches.length?data.matches.slice(0,2).map(match=><Link className="pm-account-history-row" key={match.id} to={'/policy-match/results/'+match.id}><ClockCircleOutline/><div><h3><time dateTime={match.createdAt}>{time(match.createdAt)}</time></h3><p>{match.subjectType==='personal'?'个人':'企业'}匹配</p></div><span><strong>{match.results.length}</strong> 项结果</span><RightOutline/></Link>):<Link className="pm-account-empty" to="/policy-match/analyze"><ClockCircleOutline/><span><strong>暂无匹配记录</strong><small>完善画像，开始首次政策匹配</small></span><RightOutline/></Link>}</div></section>
    <nav className="pm-account-menu" aria-label="政策服务">{[[FileOutline,'申报记录','records'],[QuestionCircleOutline,'服务说明','guide']].map(([ItemIcon,label,path])=><Link key={label} to={'/policy-match/'+path}><ItemIcon/><span>{label}</span><RightOutline/></Link>)}</nav>
    <Link className="pm-secondary pm-account-back" to="/policy-match"><LeftOutline/>返回政策服务</Link><Footer/>
  </>;
}
AccountOverview.propTypes={data:PropTypes.object.isRequired};
