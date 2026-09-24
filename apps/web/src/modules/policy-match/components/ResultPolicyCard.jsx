import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {TeamFill,ShopbagOutline,FileOutline,PayCircleOutline,ClockCircleFill,RightOutline} from 'antd-mobile-icons';
import {date,eligibility} from '../utils/format';
import {benefitLabel} from '../utils/format';

export default function ResultPolicyCard({policy,snapshot,selected,selectionFull,onSelect,benefitCheck}) {
  const to='/policy-match/policies/'+policy.id+'?match='+snapshot;
  const conditions=policy.explanations||[];
  const matched=conditions.filter(r=>r.status==='matched').length;
  const missing=conditions.filter(r=>r.status==='missing').length;
  const unmatched=conditions.filter(r=>r.status==='unmatched').length;
  const PolicyIcon=policy.category==='人才'?TeamFill:policy.category==='就业'?ShopbagOutline:FileOutline;
  return <article className={'pm-result-card'+(selected?' is-selected':'')}>
    <Link className="pm-result-main" to={to}>
      <span className="pm-result-icon"><PolicyIcon/></span>
      <div className="pm-result-copy"><h2>{policy.title}</h2><div className="pm-result-tags"><span>{policy.category}</span><span>{policy.channel==='internal'?'站内申报':'外部办理'}</span></div><p>{policy.description}</p></div>
      <div className="pm-result-score"><span className={'pm-badge '+policy.eligibility}>{eligibility[policy.eligibility]}</span><strong>{policy.score}<small>%</small></strong><span>匹配度</span></div>
    </Link>
    <div className="pm-result-facts">
      <div><PayCircleOutline/><section><strong>{policy.benefit}</strong><small>资金支持</small></section></div>
      <div><FileOutline/><section><b>满足 {matched} 项</b><small>{missing?`信息待补 ${missing} 项`:unmatched?`未满足 ${unmatched} 项`:'条件已核对'}</small></section></div>
      <div><ClockCircleFill/><section><strong>{date(policy.endsAt)}</strong><small>申报截止</small></section></div>
    </div>
    <Link className="pm-benefit-tag" to={to}>{benefitLabel(benefitCheck)} · {benefitCheck?.existing?'可查看已有申请':benefitCheck?.blocked?'请先查看冲突记录':'申报前核实享受情况'}</Link>
    <div className="pm-result-actions"><label><input type="checkbox" checked={selected} disabled={!selected&&selectionFull} onChange={onSelect} aria-label={'加入对比：'+policy.title}/>加入对比</label><Link to={to}>查看判断依据 <RightOutline/></Link></div>
  </article>;
}
ResultPolicyCard.propTypes={policy:PropTypes.object.isRequired,snapshot:PropTypes.string.isRequired,selected:PropTypes.bool.isRequired,selectionFull:PropTypes.bool.isRequired,onSelect:PropTypes.func.isRequired,benefitCheck:PropTypes.object};
