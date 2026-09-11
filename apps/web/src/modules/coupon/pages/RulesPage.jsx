import PageHeader from '../components/PageHeader';
import Artwork from '../components/Artwork';
export default function RulesPage() {
  return <div><PageHeader title="活动规则" /><Artwork name="detail-banner" /><section className="cv-page-padding"><article className="cv-rule-panel"><h2>领取规则</h2><p>活动期内按批次开放领取，先到先得，领完即止。同一用户在同一活动中，每种券限领一张，跨批次生效。</p><h2>使用规则</h2><p>消费券仅限本人在指定区域及适用门店使用，请以券面优惠规则与有效期为准。每次使用一张，不支持拆分、转赠或叠加。</p><h2>门店核销</h2><p>向商家出示60秒有效的动态券码，商家校验后再次确认。确认核销后整张券标记为已使用，不能撤销。</p><h2>演示说明</h2><p>本项目不代表官方活动，不涉及真实支付与资金发放。演示数据保存在当前浏览器中。</p></article></section><Artwork name="detail-footer" className="cv-footer" /></div>;
}
