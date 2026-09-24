import '../styles/pages/application.css';
import {useEffect,useRef,useState} from 'react';
import {Link,useNavigate,useParams} from 'react-router-dom';
import {CheckOutline,FileOutline,InformationCircleFill,CheckCircleOutline} from 'antd-mobile-icons';
import {Header,State,Notice} from '../components/UI';
import MaterialList from '../components/MaterialList';
import FilePreview from '../components/FilePreview';
import BenefitNotice from '../components/BenefitNotice';
import useApplication from '../hooks/useApplication';
import {applicationService} from '../services/application.service';
export default function ApplicationPage(){
  const{id}=useParams();const flow=useApplication(id);const row=flow.resource.data;const[step,setStep]=useState(0);const[payload,setPayload]=useState({applicant:'',phone:'',purpose:''});const[confirmed,setConfirmed]=useState(false);const navigate=useNavigate();const key=useRef(crypto.randomUUID());
  const initialized=useRef('');const {run,busy,error}=flow.action;const {setData}=flow.resource;
  useEffect(()=>{if(row&&initialized.current!==row.id){initialized.current=row.id;setPayload({applicant:row.payload.applicant||'',phone:row.payload.phone||'',purpose:row.payload.purpose||'',benefitDeclaration:row.payload.benefitDeclaration||'unknown'});}},[row]);
  useEffect(()=>{
    if(!row||step!==0||busy||error||!['draft','supplement_required'].includes(row.status))return;
    if(['applicant','phone','purpose','benefitDeclaration'].every(field=>payload[field]===(row.payload[field]||(field==='benefitDeclaration'?'unknown':''))))return;
    const timer=setTimeout(()=>run(async()=>setData(await applicationService.save(id,payload,row.version))),900);
    return()=>clearTimeout(timer);
  },[row,payload,step,busy,error,run,setData,id]);
  const validMaterials=row?.materials.filter(m=>['image/jpeg','image/png'].includes(m.file.mimeType)&&m.file.size<=10*1024*1024)||[];
  const completed=validMaterials.length;const required=row?.policy.materials.length||0;
  async function next(){await flow.action.run(async()=>{if(step===0){if(payload.benefitDeclaration!=='none')throw new Error('请先核实重复享受情况，再继续填报');if(!payload.applicant.trim()||!/^1[0-9]{10}$/.test(payload.phone))throw new Error('请填写申请人及有效手机号');flow.resource.setData(await applicationService.save(id,payload,row.version));setStep(1);}else if(step===1)setStep(2);else {const submitted=await applicationService.submit(id,row.version,key.current);navigate('/policy-match/success/'+submitted.id,{replace:true});}window.scrollTo(0,0);});}
  return <><Header title="站内申报" back={'/policy-match/policies/'+(row?.policyId||'youth')} action={<span className="pm-application-demo">演示数据</span>}/><div className="pm-content pm-page-application"><State {...flow.resource} retry={flow.resource.reload}>{row&&<>
    {!['draft','supplement_required'].includes(row.status)?<div className="pm-card"><Notice>该申请已提交，可查看办理记录。</Notice><Link className="pm-primary" to={'/policy-match/records/'+id}>查看申报详情</Link></div>:<>
    <ol className="pm-application-steps" aria-label="申报步骤">{['选择项目','填写信息','材料准备','提交申报'].map((label,index)=><li key={label} aria-current={index===step+1?'step':undefined} className={index<step+1?'is-complete':index===step+1?'is-current':''}><span>{index<step+1?<CheckOutline/>:'0'+(index+1)}</span><strong>{label}</strong></li>)}</ol><div className="pm-application-banner"><span className="pm-application-policy-icon"><FileOutline/></span><div><h2>{row.policy.title}</h2><p>{row.policy.subjectType==='company'?'企业':'个人'}申报 · 演示办理</p></div></div>
    {step===0&&<div className="pm-card pm-form"><h2>申请信息</h2>{[['applicant','申请人 / 联系人','text'],['phone','联系电话','tel']].map(([field,label,type])=><label className="pm-field" key={field}><span>{label}</span><input type={type} value={payload[field]} maxLength={field==='phone'?11:60} onChange={e=>setPayload(p=>({...p,[field]:e.target.value}))}/></label>)}<label className="pm-field"><span>申请说明</span><textarea rows="4" maxLength="2000" placeholder="简要说明申请用途及相关情况" value={payload.purpose} onChange={e=>setPayload(p=>({...p,purpose:e.target.value}))}/></label></div>}
    {step===0&&<BenefitNotice policy={row.policy} check={row.benefitCheck?{...row.benefitCheck,existing:null}:undefined} value={payload.benefitDeclaration||'unknown'} onChange={benefitDeclaration=>setPayload(p=>({...p,benefitDeclaration}))} disabled={busy}/>}
    {step===1&&<><h2 className="pm-big-title">已完成 <em>{completed}/{required}</em> 份材料</h2><p className="pm-muted">必需材料上传齐全后可继续预览并提交。</p><MaterialList requirements={row.policy.materials} materials={row.materials} onUpload={flow.upload} onPreview={flow.openPreview} busy={flow.action.busy}/></>}
    {step===2&&<BenefitNotice policy={row.policy}/>}
    {step===2&&<><div className="pm-card pm-review"><h2>请确认申请信息</h2><p><span>申请人</span><b>{payload.applicant}</b></p><p><span>联系电话</span><b>{payload.phone}</b></p><p><span>申请说明</span><b>{payload.purpose||'无'}</b></p></div><MaterialList requirements={row.policy.materials} materials={row.materials} onPreview={flow.openPreview}/><label className="pm-consent"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>我已核对申请信息及材料，知悉本次为模拟申报。</label></>}
    <Notice error>{flow.action.error}</Notice><div className="pm-application-privacy"><InformationCircleFill/><div><h3>资料仅用于本次申请</h3><p>此功能为演示办理，未接入真实政务平台。请勿上传真实敏感证件。</p></div></div><div className="pm-application-save" role="status"><CheckCircleOutline/><span>{busy?'正在保存…':error?'操作失败，请重试':step===0&&!['applicant','phone','purpose','benefitDeclaration'].every(field=>payload[field]===(row.payload[field]||(field==='benefitDeclaration'?'unknown':'')))?'等待自动保存…':'草稿已保存'}</span><small>自动保存，防止数据丢失</small></div><div className="pm-actionbar">{step>0&&<button className="pm-secondary" disabled={flow.action.busy} onClick={()=>{setStep(step-1);window.scrollTo(0,0);}}>上一步</button>}<button className="pm-primary" disabled={flow.action.busy||row.benefitCheck?.blocked||(step===0&&payload.benefitDeclaration!=='none')||(step===1&&completed<required)||(step===2&&!confirmed)} onClick={next}>{flow.action.busy?'正在保存…':step===2?'确认提交':step===1?(completed<required?'上传后继续':'预览申请'):'保存并继续'}</button></div></>}
  </>}</State><FilePreview url={flow.preview} onClose={flow.closePreview}/></div></>;
}
