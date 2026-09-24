import { useNavigate, useParams } from 'react-router-dom';
import {
  AppstoreOutline, ClockCircleOutline, GlobalOutline, LocationOutline, PhonebookOutline,
  RightOutline, ScanCodeOutline, TeamOutline, UserCircleOutline,
} from 'antd-mobile-icons';
import { useLibraryBranch } from '../hooks/useCatalogData';
import { useLibraryEvents } from '../hooks/useEventData';
import AssetImage from '../components/AssetImage';
import { PageHeader, PageState } from '../components/LibraryLayout';
import { formatLibraryEventDate } from '../utils/format';

const floors = [
  ['1F', '一楼 综合服务', '办证咨询 · 借还服务 · 信息查询'],
  ['2F', '二楼 文学与少儿', '文学图书 · 少儿读物 · 亲子阅读区'],
  ['3F', '三楼 阅读空间', '成人阅览 · 自习空间 · 文创展示'],
];

const facilityIcons = {
  自助借还: ScanCodeOutline,
  无障碍席: UserCircleOutline,
  饮水: GlobalOutline,
  母婴室: TeamOutline,
};

const facilityDescriptions = {
  自助借还: '自助服务',
  无障碍席: '平等阅读',
  饮水: '免费提供',
  母婴室: '关爱家庭',
};

export default function BranchDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const query = useLibraryBranch(id);
  const eventsQuery = useLibraryEvents();
  const branch = query.data;
  const recentEvent = eventsQuery.data?.find((event) => event.branchId === branch?.id) || eventsQuery.data?.[0];
  const recentDate = recentEvent ? formatLibraryEventDate(recentEvent.startsAt) : null;

  return <main className="lib-page lib-branch">
    <div className="lib-branch-hero">
      <PageHeader title="分馆详情" />
      {branch && <AssetImage className="lib-branch-image" remote={branch.imageUrl} fallback="branchInterior" alt="图书馆室内阅读空间" />}
    </div>
    <PageState {...query} onRetry={query.reload} />
    {branch && <>
      <section className="lib-branch-card">
        <header><h1>{branch.name}</h1><em>今日开放</em></header>
        <div className="lib-branch-meta">
          <p><LocationOutline /><span>{branch.address}<small className="lib-branch-demo">演示信息</small></span></p>
          <p><ClockCircleOutline /><span><b>开放时间</b>{branch.openingHours}</span></p>
          <p><PhonebookOutline /><span><b>联系电话</b>{branch.phone}</span></p>
        </div>
      </section>
      <section className="lib-floor-services">
        <header className="lib-branch-section-head"><h2>楼层服务</h2><span>书卷江海 · 服务读者</span></header>
        {floors.map(([floor, title, text]) => <button type="button" key={floor}>
          <b>{floor}</b><span><strong>{title}</strong><small>{text}</small></span><RightOutline />
        </button>)}
      </section>
      <section className="lib-facilities">
        <header className="lib-branch-section-head"><h2>设施服务</h2><span>用心打造 · 温暖阅读</span></header>
        <div>{branch.facilities.map((item) => {
          const Icon = facilityIcons[item] || AppstoreOutline;
          return <span key={item}><i className="lib-facility-icon"><Icon /></i><b>{item}</b><small>{facilityDescriptions[item] || '便民服务'}</small></span>;
        })}</div>
      </section>
      {recentEvent && <section className="lib-branch-recent">
        <header className="lib-branch-section-head"><h2>近期活动</h2><button type="button" onClick={() => navigate('/library/events')}>更多 <RightOutline /></button></header>
        <button type="button" className="lib-branch-recent-card" onClick={() => navigate(`/library/events/${recentEvent.id}`)}>
          <AssetImage remote={recentEvent.coverUrl} fallback="homeEvent" alt={recentEvent.title} />
          <span><strong>{recentEvent.title}</strong><em>{recentEvent.category}</em><small>{recentDate.year}年{recentDate.month}月{recentDate.day}日 · {recentDate.time}</small></span>
          <RightOutline />
        </button>
      </section>}
    </>}
  </main>;
}
