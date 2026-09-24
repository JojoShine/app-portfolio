import '../styles/pages/success.css';
import {useCallback} from 'react';
import {Link,useParams} from 'react-router-dom';
import {Header,State,Icon,Notice} from '../components/UI';
import useResource from '../hooks/useResource';
import {applicationService} from '../services/application.service';
import {time,statuses} from '../utils/format';
export default function SuccessPage(){const{id}=useParams();const resource=useResource(useCallback(()=>applicationService.get(id),[id]));const row=resource.data;return <><Header title="提交结果"/><div className="pm-content pm-page-success"><State {...resource} retry={resource.reload}>{row&&<><div className="pm-success"><span><Icon name="check" size={44}/></span><h1>{row.receipt?'演示申请已提交':'申请尚未提交'}</h1><p>申请信息已保存，可在申报记录查看进度</p></div><div className="pm-card pm-review"><h2>{row.policy.title}</h2>{[['申请人',row.payload.applicant],['受理编号',row.receipt||'尚未生成'],['当前状态',statuses[row.status]],['更新时间',time(row.updatedAt)]].map(([label,value])=><p key={label}><span>{label}</span><b>{value}</b></p>)}</div><Notice>本次为站内模拟申报，未提交至真实政务平台。</Notice><Link className="pm-primary" to={'/policy-match/records/'+id}>查看申报详情 <Icon name="arrow"/></Link><Link className="pm-secondary pm-full" to="/policy-match">返回政策服务</Link></>}</State></div></>;}
