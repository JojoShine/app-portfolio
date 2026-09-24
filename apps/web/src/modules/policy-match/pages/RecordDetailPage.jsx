import '../styles/pages/record-detail.css';
import {Link,useParams} from 'react-router-dom';
import {FileOutline,UserOutline,AppOutline,ClockCircleOutline,CheckCircleFill,ExclamationCircleFill,RightOutline,LeftOutline} from 'antd-mobile-icons';
import {Header,State,Notice} from '../components/UI';
import hero from '../assets/policy-hero.png';
import FilePreview from '../components/FilePreview';
import useApplication from '../hooks/useApplication';
import {time,statuses} from '../utils/format';
import {withdrawApplication} from '../services/application.service';
export default function RecordDetailPage(){
  const{id}=useParams();const flow=useApplication(id);const row=flow.resource.data;
  const external=row?.policy.channel==='external';
  const editable=row&&!external&&['draft','supplement_required'].includes(row.status);
  const missing=row?.policy.materials.filter(m=>m.required&&!row.materials.some(file=>file.code===m.code))||[];
  const submitted=row?.events.find(event=>event.status==='submitted');
  return <><Header title="申报详情" back="/policy-match/records" action={<span className="pm-record-detail-demo">演示数据</span>}/><div className="pm-content pm-page-record-detail"><State {...flow.resource} retry={flow.resource.reload}>{row&&<>
    <section className="pm-record-detail-hero" style={{backgroundImage:`url(${hero})`}}><div className="pm-record-detail-hero-top"><span>演示数据</span><strong className={'status-'+row.status}>{statuses[row.status]}</strong></div><h1>{row.policy.title}</h1><p>{row.policy.category} · {external?'外部渠道办理':'站内模拟申报'}</p><div className="pm-record-detail-receipt"><small>演示受理编号</small><b>{row.receipt||'尚未提交，暂无编号'}</b></div></section>
    {(editable||external)&&<section className="pm-record-detail-next"><span className="pm-record-detail-next-icon"><FileOutline/></span><div><h2>{external?'查看外部办理指引':row.status==='draft'?'申请尚未提交':missing.length===1?'请补充'+missing[0].name:'请补充申报材料'}</h2><p>{external?'请按指定渠道的要求办理，可自行记录办理进度。':row.status==='draft'?'继续填写申请信息，准备所需材料后提交。':missing.length?'待补充：'+missing.map(m=>m.name).join('、'):'请查看下方进度中的补充要求，核对并更新材料。'}</p></div><Link className="pm-primary" to={'/policy-match/'+(external?'external/':'apply/')+id}>{external?'查看指南':row.status==='draft'?'继续填写':'补充材料'}</Link></section>}
    <section className="pm-record-detail-section"><div className="pm-record-detail-heading"><h2>申请信息</h2><span>演示数据</span></div><div className="pm-record-detail-info">{[
      ['申请人',row.payload.applicant||'尚未填写',UserOutline],
      ['办理方式',external?'外部办理':'站内模拟申报',AppOutline],
      [submitted?'提交时间':'创建时间',time(submitted?.at||row.createdAt||row.events[0]?.at),ClockCircleOutline],
    ].map(([label,value,ItemIcon])=><div key={label}><ItemIcon/><span>{label}</span><strong>{value}</strong></div>)}</div></section>
    {!external&&<section className="pm-record-detail-section"><div className="pm-record-detail-heading"><h2>材料清单</h2><span>演示数据</span></div><div className="pm-record-detail-materials">{row.policy.materials.map(material=>{
      const attached=row.materials.find(file=>file.code===material.code);
      const content=<><FileOutline/><strong>{material.name}</strong><span>{attached?<CheckCircleFill/>:<ExclamationCircleFill/>}{attached?'已上传':row.status==='supplement_required'?'待补充':'未上传'}</span>{(attached||editable)&&<RightOutline/>}</>;
      const className='pm-record-detail-material '+(attached?'is-uploaded':'is-missing');
      return attached?<button type="button" key={material.code} className={className} disabled={flow.action.busy} onClick={()=>flow.openPreview(attached.fileId)} aria-label={'预览'+material.name}>{content}</button>:editable?<Link key={material.code} className={className} to={'/policy-match/apply/'+id} aria-label={'上传'+material.name}>{content}</Link>:<div key={material.code} className={className}>{content}</div>;
    })}</div></section>}
    <section className="pm-record-detail-section"><div className="pm-record-detail-heading"><h2>申报进度</h2><span>演示流程</span></div><ol className="pm-record-detail-timeline">{[...row.events].reverse().map((event,index)=><li key={index} className={event.status==='supplement_required'?'needs-action':''}><i aria-hidden="true"/><time>{time(event.at)}</time><div><strong>{event.status==='draft'?'草稿已创建':statuses[event.status]||event.status}</strong><p>{event.note}</p></div></li>)}</ol>{!row.events.length&&<p className="pm-record-detail-no-events">暂无进度记录</p>}</section>
    <Notice error>{flow.action.error}</Notice>
    {row.status==='draft'&&<button className="pm-record-detail-withdraw" disabled={flow.action.busy} onClick={()=>flow.action.run(async()=>flow.resource.setData(await withdrawApplication(id,row.version)))}>撤回草稿（保留记录）</button>}
    <Link className="pm-secondary pm-record-detail-back" to="/policy-match/records"><LeftOutline/>返回申报记录</Link><p className="pm-record-detail-footer">演示办理记录不代表真实政务受理或审核结果。</p>
  </>}</State><FilePreview url={flow.preview} onClose={flow.closePreview}/></div></>;
}
