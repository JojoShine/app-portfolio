import '../styles/pages/external.css';
import {useParams} from 'react-router-dom';
import {Header,Hero,State,Notice,Section,Icon} from '../components/UI';
import BenefitNotice from '../components/BenefitNotice';
import useApplication from '../hooks/useApplication';
import {applicationService} from '../services/application.service';
export default function ExternalPage(){
  const{id}=useParams();const flow=useApplication(id);const row=flow.resource.data;
  const update=(prepared,status)=>flow.action.run(async()=>flow.resource.setData(await applicationService.progress(id,{prepared,status,version:row.version})));
  const declare=value=>flow.action.run(async()=>flow.resource.setData(await applicationService.save(id,{benefitDeclaration:value},row.version)));
  const allowed=row?.payload.benefitDeclaration==='none'&&!row?.benefitCheck?.blocked;
  const url=row?.policy.externalUrl;
  const safeUrl=url&&/^https:\/\//.test(url)?url:null;
  return <><Header title="外部办理指南"/><div className="pm-content pm-page-external"><State {...flow.resource} retry={flow.resource.reload}>{row&&<><Hero title={row.policy.title} subtitle="外部办理 · 准备材料与流程指引" compact/><Notice>本服务提供准备指引，正式办理需前往指定渠道。办理进度由你自行记录。</Notice><BenefitNotice check={{...row.benefitCheck,existing:null}} value={row.payload.benefitDeclaration||'unknown'} onChange={['preparing','visited_external'].includes(row.status)?declare:undefined} disabled={flow.action.busy}/><Section title="办理所需材料"><div className="pm-card pm-checklist"><p>已准备 {row.prepared.length} / {row.policy.materials.length} 项</p>{row.policy.materials.map(m=><label key={m.code}><input type="checkbox" disabled={flow.action.busy} checked={row.prepared.includes(m.code)} onChange={()=>update(row.prepared.includes(m.code)?row.prepared.filter(c=>c!==m.code):[...row.prepared,m.code],row.status)}/><span><strong>{m.name}</strong><small>{m.description}</small></span></label>)}</div></Section><Section title="办理步骤"><div className="pm-card pm-simple-steps">{['准备并核对所需材料','进入指定办理渠道','填写申请并提交材料','保存受理凭证，关注后续通知'].map((s,i)=><div key={s}><b>{i+1}</b><span>{s}</span></div>)}</div></Section><Section title="渠道信息"><div className="pm-card"><div className="pm-inline"><Icon name="document"/><strong>{safeUrl?'外部办理入口':'演示入口'}</strong></div><p className="pm-muted">{safeUrl?'将打开外部办理网站，请核实渠道信息。':'暂未配置真实办理网址。'}</p>{safeUrl&&allowed?<a className="pm-primary" href={safeUrl} target="_blank" rel="noreferrer">前往外部办理 <Icon name="arrow"/></a>:<button className="pm-primary" disabled>{safeUrl?'请先核实重复享受情况':'演示入口暂不可用'}</button>}<button className="pm-secondary pm-full" disabled={flow.action.busy||!allowed||row.status==='visited_external'} onClick={()=>update(row.prepared,'visited_external')}>{row.status==='visited_external'?'已标记为前往办理':'标记为已前往办理'}</button><Notice>用户自行记录，不代表已受理或审核通过。</Notice></div></Section><Notice error>{flow.action.error}</Notice></>}</State></div></>;
}
