import { ContentOutline, ExclamationCircleOutline, UserOutline } from 'antd-mobile-icons';
import { PersonalPageHeader } from '../components/LibraryLayout';

const rules = [
  { number: '壹', title: '办理读者证', icon: UserOutline, lines: ['凭本人有效身份证件办理读者证。', '未成年人办证须由监护人陪同并提供相关证件。', '读者证仅限本人使用，请妥善保管。'] },
  { number: '贰', title: '借阅与归还', icon: ContentOutline, lines: ['借阅数量与期限以读者证类型及馆内公示为准。', '图书可在服务台或自助设备办理借还。', '请在到期日前归还；符合条件的图书可在线续借一次。'] },
  { number: '叁', title: '预约与续借', icon: ContentOutline, lines: ['借出图书可在线预约，到馆后将通过消息中心通知。', '收到到馆通知后，请在提示期限内到指定分馆取书。', '已有他人预约、逾期或证件异常时不可续借。'] },
  { number: '肆', title: '逾期、遗失与损坏', icon: ExclamationCircleOutline, lines: ['请爱护馆藏，不折页、涂画、污损或拆卸书标。', '发生遗失或损坏时，请及时联系工作人员处理。', '具体赔偿与信用管理规则以各馆最新公告为准。'] },
];

export default function BorrowingRulesPage() {
  return <main className="lib-page lib-personal-subpage lib-rules">
    <PersonalPageHeader title="办证与借阅规则" />
    <section className="lib-rule-list">{rules.map(({ number, title, icon: Icon, lines }) => <article key={number}><header><i>{number}</i><Icon /><h2>{title}</h2></header><ol>{lines.map((line) => <li key={line}>{line}</li>)}</ol></article>)}</section>
    <aside className="lib-rules-note"><b>温馨提示</b><p>开放时间、办证材料和服务规则可能调整，请以海安市图书馆现场公告为准。如需帮助，可前往一楼总服务台咨询。</p></aside>
    <footer className="lib-personal-signoff">阅读，让一座城市更温暖</footer>
  </main>;
}
