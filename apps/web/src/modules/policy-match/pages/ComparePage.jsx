import '../styles/pages/compare.css';
import {useCallback} from 'react';
import {Link,useParams,useSearchParams} from 'react-router-dom';
import {CheckCircleOutline,BankcardOutline,UserOutline,FileOutline,CalendarOutline,SendOutline,TeamFill,ShopbagOutline,LeftOutline} from 'antd-mobile-icons';
import {Header,State,Notice} from '../components/UI';
import useResource from '../hooks/useResource';
import {matchingService} from '../services/matching.service';
import {date,eligibility} from '../utils/format';
import hero from '../assets/compare-hero.png';
import {benefitLabel} from '../utils/format';
const fields = [
  {key:'stacking',title:'叠加与互斥',hint:'按当前规则核对，与条件匹配分开判断',Icon:CheckCircleOutline,
    render:p=><><strong>{benefitLabel(p.benefitCheck)}</strong><p>{p.benefitCheck?.description||'规则未配置，需向办理部门核实'}</p><small>{p.benefitCheck?.source||'来源待核实'}</small></>},
  {key:'match',title:'匹配结论',hint:'根据你的画像信息和政策条件进行匹配',Icon:CheckCircleOutline,
    render:p=><><strong className="pm-compare-score">{p.score}<small>%</small></strong><span className={'pm-badge '+p.eligibility}>{eligibility[p.eligibility]}</span><p>{p.explanations.filter(r=>r.status==='matched').length} 项条件已满足{p.explanations.some(r=>r.status==='missing')?'，仍需补充信息':''}</p></>},
  {key:'benefit',title:'支持内容',hint:'可获得的资金支持和主要扶持内容',Icon:BankcardOutline,
    render:p=><><strong className="pm-compare-benefit">{p.benefit}</strong><p>具体标准及发放方式以政策说明为准</p></>},
  {key:'conditions',title:'适用条件',hint:'申请该政策需要满足的主要条件',Icon:UserOutline,
    render:p=><ul className="pm-compare-conditions">{p.explanations.map((rule,index)=><li key={index}><span>{rule.label}</span>{rule.status!=='matched'&&<small className="pm-compare-warning">{rule.status==='missing'?'待补充':'未满足'}</small>}</li>)}</ul>},
  {key:'materials',title:'材料准备',hint:'申请所需的材料与准备要求',Icon:FileOutline,
    render:p=><><strong>{p.materials?.length?`需准备 ${p.materials.length} 项`:'查看材料要求'}</strong><p>{p.materials?.map(m=>m.name).join('、')||'请查看政策详情'}</p><small className="pm-compare-material-note">准备状态以申报记录为准</small></>},
  {key:'deadline',title:'截止时间',hint:'政策申报的截止日期',Icon:CalendarOutline,
    render:p=><><strong>{date(p.endsAt)}</strong><p>{p.eligibility==='expired'?'本次申报已截止':'请尽快准备相关材料'}</p></>},
  {key:'channel',title:'办理方式',hint:'通过什么渠道进行申请办理',Icon:SendOutline,
    render:p=><><strong>{p.channel==='internal'?'站内申报':'外部办理'}</strong><p>{p.channel==='internal'?'在本平台在线提交申请材料':'前往指定单位或平台进行办理'}</p></>},
];
export default function ComparePage(){
  const{id}=useParams();const[params]=useSearchParams();const ids=[...new Set((params.get('ids')||'').split(',').filter(Boolean))];
  const resource=useResource(useCallback(()=>matchingService.get(id),[id]));
  const rows=ids.map(policyId=>(resource.data?.results||[]).find(p=>p.id===policyId)).filter(Boolean).map(p=>({...p,benefitCheck:resource.data?.benefitChecks?.[p.id]}));
  const exclusive=rows.length===2&&rows.some(p=>(p.benefitCheck?.exclusiveWith||[]).includes(rows.find(other=>other.id!==p.id).id));
  const resultsUrl='/policy-match/results/'+id;
  return <><Header title="政策对比" back={resultsUrl} action={<span className="pm-compare-demo">演示数据</span>}/>
    <div className="pm-content pm-page-compare">
      <section className="pm-compare-hero" style={{backgroundImage:`url(${hero})`}}>
        <h1>两项政策，<br/>逐项看清差异</h1><p>从匹配结论、支持内容到办理方式，<br/>帮你快速做出选择。</p>
      </section>
      <State {...resource} retry={resource.reload}>
        {rows.length===2?<>
          <Notice>{exclusive?'这两项政策存在互斥规则，不可重复享受；是否可同时申报及适用周期请核对下方规则。':'未发现已配置的直接互斥关系，不代表可以叠加享受；仍需核实各政策规定。'}</Notice>
          <div className="pm-compare-policies">{rows.map((p,index)=><Link key={p.id} className={`pm-compare-summary is-${index?'b':'a'}`} to={'/policy-match/policies/'+p.id+'?match='+id}>
            <div className="pm-compare-summary-heading"><span className="pm-compare-letter">{index?'B':'A'}</span><div><h2>{p.title}</h2><small>{p.category} · {p.subjectType==='company'?'企业发展':'个人支持'}</small></div></div>
            <div className="pm-compare-summary-description"><p>{p.description}</p><span className="pm-compare-policy-icon">{p.category==='人才'?<TeamFill/>:<ShopbagOutline/>}</span></div>
          </Link>)}</div>
          <div className="pm-compare-table" role="table" aria-label="两项政策逐项对比">
            {fields.map(({key,title,hint,Icon,render})=><section className="pm-compare-row" role="row" key={key}>
              <div className="pm-compare-label" role="rowheader"><h2><span><Icon/></span>{title}</h2><p>{hint}</p></div>
              {rows.map((p,index)=><div role="cell" aria-label={`${index?'B':'A'}：${p.title}，${title}`} className={`pm-compare-cell is-${index?'b':'a'}`} key={p.id}>
                <span className="pm-compare-letter" aria-hidden="true">{index?'B':'A'}</span><div className="pm-compare-value">{render(p)}</div>
              </div>)}
            </section>)}
          </div>
        </>:<Notice error>请选择两项不同的政策进行对比。</Notice>}
      </State>
      <Link className="pm-primary pm-compare-back" to={resultsUrl}><LeftOutline/>返回匹配结果</Link>
      <footer className="pm-compare-footer">演示数据，仅供体验参考<br/>具体政策内容请以官方发布为准。</footer>
    </div>
  </>;
}
