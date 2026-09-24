import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {FileOutline,ClockCircleOutline,CheckCircleFill,ExclamationCircleFill,RightOutline} from 'antd-mobile-icons';
import {statuses,time,isActive} from '../utils/format';

export default function RecordCard({application:row}) {
  const external=row.policy.channel==='external';
  const editable=['draft','supplement_required'].includes(row.status)&&!external;
  const needsAction=['draft','supplement_required','preparing'].includes(row.status);
  const finished=!isActive(row);
  const missing=(row.policy.materials||[]).filter(m=>m.required&&!(row.materials||[]).some(f=>f.code===m.code));
  const note=row.status==='supplement_required'?(missing.length?'待补充：'+missing.map(m=>m.name).join('、'):'请根据申报详情中的补充要求处理'):
    row.status==='draft'?'申请尚未提交，请继续完善信息':row.status==='preparing'?'请按指南准备材料后前往办理':statuses[row.status];
  const target=editable?'apply/':external&&!finished?'external/':'records/';
  const label=editable?(row.status==='draft'?'继续填写':'继续补充'):external&&!finished?'查看指南':'查看详情';
  return <article className={'pm-record-card '+(needsAction?'needs-action':finished?'is-finished':'is-progress')}>
    <div className="pm-record-heading"><span className="pm-record-icon"><FileOutline/></span><div><Link to={'/policy-match/records/'+row.id}><h3>{row.policy.title}</h3></Link><p>{row.policy.category} · {external?'外部办理':'站内申报'}</p></div><span className={'pm-record-status status-'+row.status}>{statuses[row.status]||row.status}</span></div>
    <div className={'pm-record-note '+(needsAction?'is-warning':'')}>{needsAction?<ExclamationCircleFill/>:finished&&row.status!=='approved'?<FileOutline/>:<CheckCircleFill/>}<span>{note}</span></div>
    <p className="pm-record-time"><ClockCircleOutline/>{time(row.updatedAt)}</p>
    <div className="pm-record-bottom"><span>{external?'外部渠道':'网上申报'}<i/>{finished?'已结束':needsAction?'等待你处理':'正在办理中'}</span><Link className={needsAction?'pm-primary':'pm-record-secondary'} to={'/policy-match/'+target+row.id}>{label}<RightOutline/></Link></div>
  </article>;
}
RecordCard.propTypes={application:PropTypes.object.isRequired};
