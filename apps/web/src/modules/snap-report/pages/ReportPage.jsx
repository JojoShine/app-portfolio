import { useEffect, useRef, useState } from 'react';
import { Popup } from 'antd-mobile';
import { Link, useNavigate } from 'react-router-dom';
import useLogin from '../hooks/useLogin';
import useReportForm from '../hooks/useReportForm';
import PhotoSection from '../components/PhotoSection';
import ReportFields from '../components/ReportFields';
import LocationSheet from '../components/LocationSheet';
import SnapIcon from '../components/SnapIcon';
import { displayTime } from '../utils/report';

export default function ReportPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const report = useReportForm(login.user);
  const [sheet, setSheet] = useState(null);
  const container = useRef(null);
  const [frame, setFrame] = useState({ left: 0, width: '100%' });
  useEffect(() => {
    const update = () => {
      const bounds = container.current.getBoundingClientRect();
      setFrame({ left: bounds.left, width: bounds.width });
    };
    const observer = new ResizeObserver(update);
    observer.observe(container.current);
    window.addEventListener('resize', update);
    update();
    return () => { observer.disconnect(); window.removeEventListener('resize', update); };
  }, []);
  const { form, error, receipt } = report;
  return <div className="snap-app" ref={container}>
    <header className="snap-header"><div className="snap-brand"><SnapIcon name="camera" size={30} /><h1>城市随手拍</h1></div><button onClick={() => login.user ? navigate('/snap-report/records') : login.retry()}>我的上报</button></header>
    <p className="snap-tagline">拍下身边问题，识别后确认上报。</p>
    {!login.ready ? <div className="snap-skeleton">正在恢复外层身份…</div> : !login.user ? <section className="snap-card snap-empty"><SnapIcon name="camera" size={48} /><h2>暂未恢复登录状态</h2><p role="alert">{login.error}</p><button className="snap-primary" onClick={login.retry}>重试</button><Link to="/">返回应用超市</Link></section> : receipt ? <section className="snap-card snap-receipt"><span className="snap-success-icon"><SnapIcon name="check" size={36} /></span><h2>已提交</h2><p>你的问题已记录，可在“我的上报”查看。</p><h3>{receipt.object} · {receipt.category}</h3><p>{receipt.description}</p><dl className="snap-detail"><div><dt>上报编号</dt><dd>{receipt.id}</dd></div><div><dt>提交时间</dt><dd>{displayTime(receipt.createdAt)}</dd></div></dl><button className="snap-primary" onClick={() => navigate(`/snap-report/records/${receipt.id}`)}>查看记录</button><button className="snap-text-button" onClick={report.reset}>再报一条</button></section> : <>
      <form onSubmit={(event) => { event.preventDefault(); report.submit(); }} noValidate>
        <fieldset className="snap-form-body" disabled={report.submitting}>
          <PhotoSection photos={report.photos} add={report.addPhotos} remove={report.removePhoto} retry={report.retryPhoto} disabled={report.submitting} error={error?.field === 'photos' ? error.message : undefined} frame={frame} />
          <ReportFields form={form} analysis={report.analysis} change={report.change} retry={report.retryAnalysis} error={['object', 'category', 'severity', 'description'].includes(error?.field) ? error.message : undefined} frame={frame} disabled={report.submitting} />
          <section className="snap-card" id="snap-address"><h2>发生位置</h2>
            <label className="snap-field">发生地址<input value={form.address} maxLength={300} onChange={(event) => report.change('address', event.target.value)} placeholder="直接填写，如海安市中坝路某路口" /></label>
            <button type="button" className="snap-address" onClick={() => setSheet('location')}><SnapIcon name="pin" /><span>{report.locating ? '定位中，也可直接手动填写' : '地图选点或定位（可选）'}</span><strong>选择</strong></button>
            <label className="snap-field">补充位置<input value={form.detail} maxLength={200} onChange={(event) => report.change('detail', event.target.value)} placeholder="例如路口东侧人行道旁" /></label>
            <label className="snap-confirm"><input type="checkbox" checked={form.locationConfirmed} onChange={(event) => report.change('locationConfirmed', event.target.checked)} />我已确认照片实际发生位置</label>
            <p className="snap-muted">定位失败或不准确时，手动填写并确认地址即可提交。</p>
            {error?.field === 'address' && <p className="snap-error" role="alert">{error.message}</p>}
          </section>
          {error?.field === 'submit' && <p className="snap-error snap-submit-error" role="alert">{error.message}</p>}
        </fieldset>
        <footer className="snap-submit-bar" style={frame}><button type="submit" className="snap-primary" disabled={report.busy}>{report.submitting ? '正在提交…' : report.analysis.status === 'loading' ? '正在识别…' : report.photos.some((photo) => photo.status === 'uploading') ? '正在上传照片…' : <>提交上报<SnapIcon name="arrow" /></>}</button></footer>
      </form>
    </>}
    <Popup visible={Boolean(sheet) && Boolean(login.user)} onMaskClick={() => setSheet(null)} bodyClassName="snap-sheet" bodyStyle={{ ...frame, right: 'auto', margin: 0 }} destroyOnClose>
      {sheet === 'location' && <LocationSheet initial={form} onClose={() => setSheet(null)} onConfirm={(value) => { report.setLocation(value); setSheet(null); }} />}
    </Popup>
  </div>;
}
