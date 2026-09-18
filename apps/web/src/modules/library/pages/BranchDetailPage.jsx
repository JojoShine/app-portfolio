import { useParams } from 'react-router-dom';
import { AppOutline, LocationOutline, PhonebookOutline, RightOutline } from 'antd-mobile-icons';
import useLibraryQuery from '../hooks/useLibraryQuery';
import { getBranch } from '../services/library.service';
import AssetImage from '../components/AssetImage';
import { PageHeader, PageState } from '../components/LibraryLayout';

export default function BranchDetailPage() {
  const { id } = useParams(); const query = useLibraryQuery(() => getBranch(id), [id]); const branch = query.data;
  return <main className="lib-page lib-branch"><PageHeader title="分馆详情" /><PageState {...query} onRetry={query.reload} />{branch && <><AssetImage className="lib-branch-image" remote={branch.imageUrl} fallback="branchInterior" alt="图书馆室内阅读空间" /><section className="lib-branch-card"><header><h1>{branch.name}</h1><em>今日开放</em></header><p><LocationOutline />{branch.address}<small>演示信息</small></p><p><AppOutline />开放时间 {branch.openingHours}</p><p><PhonebookOutline />联系电话 {branch.phone}</p></section><section className="lib-floor-services"><h2>楼层服务</h2>{[['1F', '一楼 综合服务', '办证咨询 · 借还服务 · 信息查询'], ['2F', '二楼 文学与少儿', '文学图书 · 少儿读物 · 亲子阅读区'], ['3F', '三楼 阅读空间', '成人阅览 · 自习空间 · 文创展示']].map(([floor, title, text]) => <button key={floor}><b>{floor}</b><span><strong>{title}</strong><small>{text}</small></span><RightOutline /></button>)}</section><section className="lib-facilities"><h2>设施服务</h2><div>{branch.facilities.map((item) => <span key={item}><AppOutline /><b>{item}</b></span>)}</div></section></>}</main>;
}
