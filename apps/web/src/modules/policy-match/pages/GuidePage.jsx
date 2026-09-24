import '../styles/pages/guide.css';
import {Link} from 'react-router-dom';
import {InformationCircleFill,FileOutline,RightOutline} from 'antd-mobile-icons';
import {Header,Footer} from '../components/UI';
import hero from '../assets/policy-hero.png';

const questions=[
  ['如何获得匹配结果？','先选择个人或企业身份，填写对应画像。系统逐项核对政策条件，显示匹配度、已满足、待补充和不满足的条件。'],
  ['匹配度等于申报资格吗？','匹配度帮助排序，不能替代资格判断。任何硬性条件不满足，均不会显示为可申报。缺失信息需要补充后重新匹配。'],
  ['如何站内申报？','进入政策详情，填写申请人及联系方式，上传全部必需材料，预览确认后提交。材料仅支持 JPG、PNG 图片，单张不超过 10MB。草稿和提交记录保存在当前账户下。'],
  ['如何外部办理？','按照外部办理指南准备材料，通过已配置的渠道办理。你可以勾选材料并记录已前往办理，系统不自动获取外部审核结果。'],
  ['可以切换身份吗？','可以从首页或我的资料切换。个人和企业画像、匹配及申报记录分别维护。'],
];
export default function GuidePage(){
  return <><Header title="申报指南"/><div className="pm-content pm-page-guide">
    <section className="pm-guide-hero" style={{backgroundImage:`url(${hero})`}}><h1>从找到政策<br/>到准备好每一步</h1><p>填写画像 · 查看匹配 · 选择办理方式</p><span>政策服务 · 演示指南</span></section>
    <div className="pm-guide-notice" role="note"><InformationCircleFill/><p>本服务提供匹配与准备指引，正式申报资格及办理要求以主管部门规定为准。</p></div>
    <div className="pm-guide-questions">{questions.map(([title,body])=><section className="pm-guide-card" key={title}><h2>{title}</h2><p>{body}</p></section>)}</div>
    <section className="pm-guide-tips"><h2>温馨提示</h2><div><FileOutline/><p>所有政策均为通用演示数据。请勿上传真实敏感资料进行体验。</p></div></section>
    <nav className="pm-guide-links" aria-label="申报服务入口"><Link className="pm-secondary" to="/policy-match/records">申报记录<RightOutline/></Link><Link className="pm-primary" to="/policy-match/profile">完善画像<RightOutline/></Link></nav>
    <Footer/>
  </div></>;
}
