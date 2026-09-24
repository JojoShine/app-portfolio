import '../styles/pages/policy-detail.css';
import {useCallback,useState} from 'react';
import {Link,useNavigate,useParams,useSearchParams} from 'react-router-dom';
import {ProgressCircle} from 'antd-mobile';
import {StarFill,StarOutline,CheckCircleFill,ExclamationCircleFill,CloseCircleFill,FileOutline,DownOutline,RightOutline,InformationCircleOutline} from 'antd-mobile-icons';
import {Header,State,Notice} from '../components/UI';
import hero from '../assets/detail-hero.png';
import {usePolicy} from '../components/PolicyContext';
import useResource from '../hooks/useResource';
import useAction from '../hooks/useAction';
import {policyService,getBenefitCheck} from '../services/policy.service';
import BenefitNotice from '../components/BenefitNotice';
import {applicationPath} from '../utils/format';
import {matchingService} from '../services/matching.service';
import {applicationService} from '../services/application.service';
import {date,eligibility,displayValue} from '../utils/format';
export default function PolicyDetailPage(){
  const{id}=useParams();const[params]=useSearchParams();const snapshot=params.get('match');const{authenticated,login,setSubjectType}=usePolicy();const navigate=useNavigate();const action=useAction();
  const[declaration,setDeclaration]=useState({policyId:id,value:'unknown'});const declared=declaration.policyId===id?declaration.value:'unknown';
  const resource=useResource(useCallback(async()=>{const policy=await policyService.get(id);const favorites=authenticated?await policyService.favorites():[];const result=snapshot&&authenticated?(await matchingService.get(snapshot)).results.find(p=>p.id===id):null;const benefitCheck=authenticated?await getBenefitCheck(id):null;return {policy,result,benefitCheck,saved:favorites.some(f=>f.policyId===id)};},[id,snapshot,authenticated]));
  const data=resource.data;
  const start=()=>action.run(async()=>{if(!authenticated){await login();return;}setSubjectType(data.policy.subjectType);const row=await applicationService.create(id,declared);navigate(applicationPath({...row,channel:row.policy.channel}));});
  return <><Header title="政策详情" action={<button aria-label={data?.saved?'取消收藏':'收藏政策'} aria-pressed={Boolean(data?.saved)} disabled={action.busy||!data} onClick={()=>action.run(async()=>{if(!authenticated){await login();return;}await policyService.favorite(id,!data.saved);resource.setData({...data,saved:!data.saved});})}>{data?.saved?<StarFill/>:<StarOutline/>}</button>}/><div className="pm-content pm-page-policy-detail"><State {...resource} retry={resource.reload}>{data&&<>
    <section className="pm-detail-hero" style={{backgroundImage:`url(${hero})`}}><span className="pm-detail-demo">演示政策</span><h1>{data.policy.title}</h1><p>{data.policy.category} · {data.policy.subjectType==='company'?'企业发展支持':'个人成长支持'}</p><span className="pm-detail-audience">适用：{data.policy.subjectType==='company'?'符合条件的企业':'符合条件的个人'}</span></section>
    <div className="pm-detail-facts"><div><b>{data.policy.benefit}</b><small>支持标准</small></div><div><b>{date(data.policy.endsAt)}</b><small>申报截止</small></div><div><b>{data.policy.channel==='internal'?'站内申报':'外部办理'}</b><small>{data.policy.channel==='internal'?'全程在线办理':'查看办理指引'}</small></div></div>
    {data.result?<>
      <section className="pm-detail-section"><div className="pm-detail-heading"><h2>智能匹配结果</h2><span>演示数据 <InformationCircleOutline/></span></div><div className="pm-result-summary">
        <ProgressCircle percent={data.result.score}><strong>{data.result.score}<small>%</small></strong><span>{eligibility[data.result.eligibility]}</span></ProgressCircle>
        <div><h3>{data.result.eligibility==='eligible'?<>资格条件已满足，<br/>申报材料请另行核对</>:eligibility[data.result.eligibility]}</h3><p>根据当次画像进行智能匹配，结果仅供参考，具体以正式审核为准。</p></div>
      </div></section>
      <details className="pm-detail-section pm-conditions" open><summary className="pm-detail-heading"><h2>为什么匹配</h2><span>{data.result.explanations.filter(r=>r.status==='matched').length} / {data.result.explanations.length} 项条件符合 <DownOutline/></span></summary>
        <div className="pm-condition-list">{data.result.explanations.map((r,i)=><div className={'pm-condition-row '+r.status} key={i}>
          <span className="pm-condition-icon" aria-label={r.status==='matched'?'已满足':r.status==='missing'?'信息待补充':'暂不满足'}>{r.status==='matched'?<CheckCircleFill/>:r.status==='missing'?<ExclamationCircleFill/>:<CloseCircleFill/>}</span>
          <strong>{r.label}</strong><p>你的情况：<em>{displayValue(r.actual)}{typeof r.actual==='number'?(r.field==='age'?'岁':r.field==='socialMonths'?'个月':''):''}</em>{r.status!=='matched'&&<small>{r.status==='missing'?'信息待补充':'暂不满足'}</small>}</p>
        </div>)}</div><Link className="pm-detail-profile" to="/policy-match/profile" onClick={()=>setSubjectType(data.policy.subjectType)}>补充或修改画像 <RightOutline/></Link>
      </details>
    </>:<Notice>使用已保存的画像执行匹配，查看逐项判断依据；信息不足时再补充。<Link to="/policy-match/analyze" onClick={()=>setSubjectType(data.policy.subjectType)}> 去匹配 →</Link></Notice>}
    <BenefitNotice policy={data.policy} check={data.benefitCheck} value={declared} onChange={authenticated&&!data.benefitCheck?.existing?value=>setDeclaration({policyId:id,value}):undefined} disabled={action.busy}/>
    <section className="pm-detail-section"><div className="pm-detail-heading"><h2>申报材料</h2><span>共 {data.policy.materials.length} 项材料</span></div><div className="pm-material-list">{data.policy.materials.map(m=><div key={m.code}><span className="pm-material-icon"><FileOutline/></span><section><h3>{m.name}</h3><p>{m.description}</p></section><small className="pm-material-required">{m.required?'必需':'选填'}</small></div>)}</div><p className="pm-material-hint">上传与准备状态请在申报页面查看。</p></section>
    <section className="pm-detail-section"><div className="pm-detail-heading"><h2>政策内容与支持标准</h2><span>演示数据</span></div><p className="pm-detail-prose">{data.policy.description}</p></section>
    <section className="pm-detail-section"><div className="pm-detail-heading"><h2>申报流程</h2></div><div className="pm-detail-steps">{[
      ['填写申请','在线填写申请信息','按页面提示填写并核对申请信息，确保信息完整、准确。'],
      ['准备材料','按要求上传相关材料','根据材料清单准备证明文件，支持的格式和大小以材料说明为准。'],
      [data.policy.channel==='internal'?'提交申请':'前往办理',data.policy.channel==='internal'?'确认无误后提交':'前往指定外部渠道',data.policy.channel==='internal'?'核对填写内容和必需材料后，提交演示申请。':'按照办理指南前往指定渠道，实际办理要求以外部平台为准。'],
      ['查看进度','在申报记录中查看','在申报记录中查看审核进度，或记录外部办理进展。'],
    ].map(([title,hint,text],i)=><details key={title}><summary><b>{i+1}</b><strong>{title}</strong><span>{hint}</span><DownOutline/></summary><p>{text}</p></details>)}</div></section>
    <section className="pm-detail-section pm-detail-source"><div className="pm-detail-heading"><h2><InformationCircleOutline/>政策来源</h2><span>通用演示政策库 · v{data.policy.version}</span></div><p>本页面为演示数据，仅供体验。具体政策内容、申报条件和支持标准请以正式发布为准。</p></section><Notice error>{action.error}</Notice>
    <div className="pm-actionbar"><button className="pm-primary" disabled={action.busy||(!data.benefitCheck?.existing&&(!data.policy.active||new Date(data.policy.endsAt)<=new Date()||(authenticated&&(declared!=='none'||data.benefitCheck?.blocked))))} onClick={start}>{action.busy?'正在处理…':data.benefitCheck?.existing?(['draft','supplement_required','preparing'].includes(data.benefitCheck.existing.status)?'继续办理':'查看办理记录'):!data.policy.active?'政策已下架':new Date(data.policy.endsAt)<=new Date()?'政策已截止':!authenticated?'登录后办理':data.benefitCheck?.blocked?'存在互斥办理记录':declared!=='none'?'请先核实享受情况':data.policy.channel==='internal'?'开始申报':'查看办理指南'}</button></div>
  </>}</State></div></>;
}
