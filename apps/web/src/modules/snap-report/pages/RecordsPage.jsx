import PropTypes from 'prop-types';
import { ImageViewer, Tabs } from 'antd-mobile';
import { useNavigate, useParams } from 'react-router-dom';
import SnapIcon from '../components/SnapIcon';
import useRecords from '../hooks/useRecords';
import useLogin from '../hooks/useLogin';
import usePhotoUrl from '../hooks/usePhotoUrl';
import { displayTime } from '../utils/report';

function PrivatePhoto({ id, preview = false }) {
  const { url, error } = usePhotoUrl(id);
  return url ? (preview ? <button className="snap-record-photo" onClick={() => ImageViewer.show({ image: url })}><img src={url} alt="上报现场照片，点击放大" /></button> : <img className="snap-record-thumbnail" src={url} alt="上报现场" />)
    : <span className="snap-record-placeholder">{error ? '照片未加载' : '加载中'}</span>;
}
PrivatePhoto.propTypes = { id: PropTypes.string.isRequired, preview: PropTypes.bool };

export default function RecordsPage() {
  const login = useLogin();
  const { reportId } = useParams();
  const navigate = useNavigate();
  const records = useRecords(reportId, Boolean(login.ready && login.user));
  const detail = records.detail;
  return <main className="snap-app snap-records-page">
    <header className="snap-records-heading"><button className="snap-icon-button" aria-label={reportId ? '返回记录列表' : '返回上报'} onClick={() => navigate(reportId ? '/snap-report/records' : '/snap-report')}><SnapIcon name="back" /></button><h1>{reportId ? '上报详情' : '我的上报'}</h1></header>
    {!login.ready ? <p className="snap-skeleton">正在恢复外层身份…</p> : !login.user ? <div className="snap-error" role="alert">{login.error}<button className="snap-text-button" onClick={login.retry}>重试</button></div> : <section className="snap-card">
    {detail ? <>
      <Tabs key={detail.id} className="snap-record-tabs" defaultActiveKey="information">
        <Tabs.Tab title="提交信息" key="information">
          <div className="snap-photo-grid">{detail.fileIds.map((id) => <PrivatePhoto key={id} id={id} preview />)}</div>
          <dl className="snap-detail">{[['物品或对象', detail.object], ['问题类别', detail.category], ['问题程度', detail.severity], ['判断依据', detail.reason], ['问题描述', detail.description], ['发生位置', detail.address], ['补充位置', detail.detail], ['上报编号', detail.id], ['提交时间', displayTime(detail.createdAt)]].filter(([, value]) => value).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        </Tabs.Tab>
        <Tabs.Tab title="处理进度" key="progress">
          <ol className="snap-timeline" aria-label="上报处理时间轴">
            <li className="is-complete"><span className="snap-timeline-dot" aria-hidden="true"><SnapIcon name="check" size={14} /></span><div><h3>上报已提交</h3><time dateTime={detail.createdAt}>{displayTime(detail.createdAt)}</time><p>上报信息已成功提交。</p></div></li>
            <li className="is-pending"><span className="snap-timeline-dot" aria-hidden="true" /><div><h3>等待处理</h3><p>暂无后续处理记录。</p></div></li>
          </ol>
        </Tabs.Tab>
      </Tabs></>
      : !reportId && <><p className="snap-muted">仅展示你本人提交的问题。</p>{records.items.map((item) => <button className="snap-record-row" key={item.id} disabled={records.busy} onClick={() => navigate(`/snap-report/records/${item.id}`)}><PrivatePhoto id={item.fileIds[0]} /><span className="snap-record-copy"><strong>{item.object} · {item.category}</strong><span>{item.address}</span><small>{displayTime(item.createdAt)} · {item.status}</small></span><SnapIcon name="arrow" size={18} /></button>)}
        {!records.items.length && !records.busy && !records.error && <div className="snap-empty"><SnapIcon name="camera" size={42} /><h3>还没有上报记录</h3><p>拍下身边的问题，从第一条上报开始。</p><button className="snap-primary" onClick={() => navigate('/snap-report')}>返回上报</button></div>}
        {records.items.length < records.total && <button className="snap-text-button" disabled={records.busy} onClick={records.more}>加载更多</button>}</>}
    {records.busy && <p role="status" className="snap-skeleton">正在加载记录…</p>}
    {records.error && <div className="snap-error" role="alert">{records.error}<button className="snap-text-button" onClick={records.retry}>重试</button></div>}
    </section>}
  </main>;
}
