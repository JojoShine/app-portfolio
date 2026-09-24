import PropTypes from 'prop-types';
import {useId} from 'react';
import {Link} from 'react-router-dom';
import {benefitLabel,applicationPath} from '../utils/format';
export default function BenefitNotice({check,policy,value,onChange,disabled=false}){
  const name=useId();const rules=check||policy?.benefitRules||{};
  return <section className="pm-benefits" aria-label="重复享受与叠加规则"><h2>重复享受与叠加规则 <small>{benefitLabel(rules)}</small></h2><p>{rules.description||'尚未配置叠加与重复享受规则，请先向办理部门核实。'}</p><p className="pm-benefits-meta">申报周期：{rules.period||'待核实'} · 来源：{rules.source||'未配置正式规则'}</p>
    {check?.exclusivePolicies?.length>0&&<p>互斥政策：{check.exclusivePolicies.map(p=>p.title).join('、')}</p>}
    {check?.existing&&<p>本主体已有记录，不重复新建。<Link to={applicationPath(check.existing)}>继续办理 / 查看记录</Link></p>}
    {check?.conflicts?.map(item=><p key={item.id}>{item.title}：已有办理记录，{item.blocksApplication?'按规则不可同时申报':'需核实是否重复享受'}。<Link to={'/policy-match/records/'+item.id}>查看记录</Link></p>)}
    <p>已提交、已审核通过均不代表已领取；未接入外部领取记录，查不到不代表未享受。</p>
    {onChange&&<fieldset disabled={disabled}><legend>本周期本政策及上述互斥政策的享受情况</legend>{[['none','已核实：未享受，且符合所列叠加规则'],['received','已享受过相关支持，需核实重复或补差额规则'],['unknown','不确定，需向办理部门核实']].map(([choice,label])=><label key={choice}><input type="radio" name={name} value={choice} checked={value===choice} onChange={()=>onChange(choice)}/><span>{label}</span></label>)}</fieldset>}
  </section>;
}
BenefitNotice.propTypes={check:PropTypes.object,policy:PropTypes.object,value:PropTypes.string,onChange:PropTypes.func,disabled:PropTypes.bool};
