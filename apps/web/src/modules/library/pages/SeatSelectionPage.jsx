import { useMemo, useState } from 'react';
import { Popup, Radio, Toast } from 'antd-mobile';
import { CalendarOutline, ClockCircleOutline, RightOutline } from 'antd-mobile-icons';
import { useLibraryBranches } from '../hooks/useCatalogData';
import useSeatAvailability from '../hooks/useSeatData';
import { createSeatReservation } from '../services/library.service';
import { PageHeader, PageState } from '../components/LibraryLayout';
import { SeatDatePicker, SeatTimePicker } from '../components/SeatDateTimePicker';
import seatLandscape from '../assets/seat-header.png';
import seatBook from '../assets/seat-book-panel.png';
import seatBrandLockup from '../assets/seat-brand-lockup.png';

function DeviceIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="13" rx="1" /><path d="M12 16v5m-5 0h10" /></svg>;
}
function AccessibleIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="10" cy="3" r="1.5" /><path d="m10 7 1 7h6l3 6 2-1M11 10h6M7 10a6 6 0 1 0 9 8" /></svg>;
}
function BranchIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true"><path d="M4 21V4l9-2 7 4v15M2 21h20M13 2v19M7 7h2m-2 4h2m-2 4h2m7-7h1m-1 4h1m-1 4h1" /></svg>;
}
function FloorIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true"><path d="m2 8 10-6 10 6-10 6L2 8Zm1 6 9 5 9-5M3 19l9 4 9-4" /></svg>;
}
function Plant() {
  return <svg viewBox="0 0 32 32" fill="#c6c8ad" stroke="#777c62" strokeWidth=".7" aria-hidden="true"><path d="m15 28 2-18m-1 9L7 9m9 12 9-12M16 17C8 18 4 15 3 11c6-1 10 1 13 6ZM17 13C12 9 12 4 15 2c4 3 5 7 2 11ZM18 16c0-6 4-10 9-10 0 5-3 9-9 10ZM16 22c-6 2-11 0-12-4 5-2 9 0 12 4ZM18 23c3-5 7-7 12-5-2 4-6 6-12 5Z" /></svg>;
}

const haianDate = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
export default function SeatSelectionPage() {
  const branches = useLibraryBranches();
  const [chosenBranch, setChosenBranch] = useState('');
  const branch = branches.data?.find((item) => item.id === chosenBranch) || branches.data?.[0];
  const branchId = branch?.id;
  const [date, setDate] = useState(haianDate);
  const [times, setTimes] = useState(['14:00', '17:00']);
  const [area, setArea] = useState('');
  const [picker, setPicker] = useState('');
  const [selection, setSelection] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [revision, setRevision] = useState(0);
  const startsAt = `${date}T${times[0]}:00+08:00`;
  const endsAt = `${date}T${times[1]}:00+08:00`;
  const reloadSeats = () => setRevision((value) => value + 1);
  const seats = useSeatAvailability({ branchId, startsAt, endsAt, revision });
  const { requestKey, loading } = seats;
  const areas = useMemo(() => [...new Set(seats.data.map((seat) => `${seat.floor}${seat.area}`))], [seats.data]);
  const currentArea = areas.includes(area) ? area : areas[0] || '';
  const rows = useMemo(() => seats.data.filter((seat) => `${seat.floor}${seat.area}` === currentArea).sort((a, b) => a.label.localeCompare(b.label, 'zh-CN', { numeric: true })), [seats.data, currentArea]);
  const seatRows = useMemo(() => [...new Set(rows.map((seat) => seat.label.split('-')[0]))].map((name) => ({ name, seats: rows.filter((seat) => seat.label.split('-')[0] === name) })), [rows]);
  const selected = selection?.key === requestKey ? rows.find((seat) => seat.id === selection.id && seat.available) : null;
  const timeLabel = times.join('–');
  const dateLabel = `${date === haianDate() ? '今天 ' : ''}${Number(date.slice(5, 7))}月${Number(date.slice(8))}日`;
  const choose = (change) => { change(); setSelection(null); setPicker(''); };
  const reserve = async () => {
    if (!selected || submitting || loading) return Toast.show('请先选择可用座位');
    if (new Date(startsAt) <= new Date()) return Toast.show('请选择尚未开始的预约时段');
    setSubmitting(true);
    try { await createSeatReservation({ seatId: selected.id, startsAt, endsAt }); Toast.show('座位预约成功'); setSelection(null); reloadSeats(); }
    catch (error) { Toast.show(error.message); reloadSeats(); }
    finally { setSubmitting(false); }
  };
  return <main className="lib-page lib-seat-page" style={{ '--seat-landscape': `url("${seatLandscape}")`, '--seat-book': `url("${seatBook}")` }}>
    <PageHeader title="座位预约" action={<span className="lib-vertical-brand"><img src={seatBrandLockup} alt="书香海安" /></span>} />
    <header className="lib-seat-masthead"><h1>在书香里<br />遇见更好的自己</h1><p>阅读，让海安更温暖</p><i /><span>江海书卷<br />阅见未来</span></header>
    <section className="lib-seat-controls"><button aria-label="选择分馆" disabled={submitting} onClick={() => setPicker('branch')}><BranchIcon /><span>{branch?.name || '选择分馆'}</span><RightOutline /></button><div><button aria-label="选择日期" disabled={submitting} onClick={() => setPicker('date')}><CalendarOutline /><span>{dateLabel}</span><RightOutline /></button><button aria-label="选择时段" disabled={submitting} onClick={() => setPicker('time')}><ClockCircleOutline /><span>{timeLabel}</span><RightOutline /></button><button aria-label="选择阅览区" disabled={submitting || loading} onClick={() => setPicker('area')}><FloorIcon /><span>{currentArea || '选择阅览区'}</span><RightOutline /></button></div></section>
    <div className="lib-seat-title"><h2>{currentArea || '阅览区'}</h2><span>静心阅读 · 遇见更大的世界</span></div>
    <PageState {...branches} onRetry={branches.reload} />
    <PageState loading={loading} error={seats.error} onRetry={reloadSeats} />
    {!loading && !branches.loading && !seats.error && !branches.error && rows.length === 0 && <p className="lib-seat-empty">该分馆暂无可预约座位，请选择其他分馆。</p>}
    {rows.length > 0 && <section className="lib-seat-map" aria-label="座位图">
      <div className="lib-seat-left-wall" aria-hidden="true" />
      <div className="lib-seat-window-row"><Plant /><div className="lib-window">窗边阅读区</div><Plant /></div>
      <div className="lib-seat-layout"><div className="lib-seat-rows">{seatRows.map((row, rowIndex) => <div className="lib-seat-row-wrap" key={row.name}><div className="lib-seat-row"><b>{row.name}</b><div className="lib-seat-desks">{Array.from({ length: Math.ceil(row.seats.length / 2) }, (_, index) => index * 2).map((start) => <div className="lib-seat-desk" key={start}>{row.seats.slice(start, start + 2).map((seat) => <div key={seat.id} className={`lib-seat-place ${!seat.available ? 'is-occupied' : ''}`}><button disabled={!seat.available || submitting} aria-label={`${seat.label}${!seat.available ? ' 已占用' : ''}`} aria-pressed={selected?.id === seat.id} className={`${selected?.id === seat.id ? 'is-selected' : ''} type-${seat.type}`} onClick={() => setSelection({ id: seat.id, key: requestKey })}>{seat.type === 'powered' && <DeviceIcon />}{seat.type === 'accessible' && <AccessibleIcon />}<span>{seat.label}</span></button></div>)}</div>)}</div></div>{rowIndex < seatRows.length - 1 && <div className="lib-aisle">过 道</div>}</div>)}</div><aside className="lib-shelf"><Plant /><span>书架区</span><Plant /></aside></div>
    </section>}
    <div className="lib-seat-legend"><span><i />可选</span><span><i className="occupied" />已占</span><span><i className="selected" />已选</span><span><i className="unavailable" />不可用</span><span><DeviceIcon />设备席</span><span><AccessibleIcon />无障碍席</span></div>
    <div className="lib-seat-action"><span className="lib-seat-book-spine">书香海安</span><small className="lib-seat-page-number">PAGE<br />1 / 1</small><p>{currentArea || '请选择阅览区'} · <b>{selected?.label || '请选择'}</b> · {timeLabel}</p><button disabled={!selected || loading || submitting} onClick={reserve}>{submitting ? '预约中…' : '确认预约'} <span aria-hidden="true">→</span></button><div className="lib-seat-book-notes"><span>阅读<br />让生活更美好</span><i /><span>江海书卷<br />书香海安</span></div></div>
    <Popup visible={Boolean(picker)} position="bottom" closeOnMaskClick onClose={() => setPicker('')} destroyOnClose bodyClassName="lib-seat-picker" getContainer={() => document.querySelector('.library-app')}>
      <section role="dialog" aria-modal="true" aria-label={{ branch: '选择分馆', date: '选择日期', time: '选择时段', area: '选择阅览区' }[picker]}>
        <header><h2>{{ branch: '选择分馆', date: '选择日期', time: '选择时段', area: '选择阅览区' }[picker]}</h2><button onClick={() => setPicker('')}>取消</button></header>
        {picker === 'branch' && <><PageState {...branches} onRetry={branches.reload} /><Radio.Group value={branchId} onChange={(value) => choose(() => { setChosenBranch(value); setArea(''); })}>{branches.data?.map((item) => <Radio key={item.id} value={item.id} block>{item.name}<small>{item.openingHours}</small></Radio>)}</Radio.Group></>}
        {picker === 'area' && <>{areas.length ? <Radio.Group value={currentArea} onChange={(value) => choose(() => setArea(value))}>{areas.map((item) => <Radio key={item} value={item} block>{item}</Radio>)}</Radio.Group> : <p>该分馆暂无可预约阅览区</p>}</>}
        {picker === 'date' && <SeatDatePicker value={date} min={haianDate()} onConfirm={(value) => choose(() => setDate(value))} />}
        {picker === 'time' && <SeatTimePicker value={times} openingHours={branch?.openingHours} onConfirm={(value) => choose(() => setTimes(value))} />}
      </section>
    </Popup>
  </main>;
}
