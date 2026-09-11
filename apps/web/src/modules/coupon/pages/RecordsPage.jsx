import { useCallback, useId, useState } from 'react';
import { DatePicker } from 'antd-mobile';
import { SearchOutline, RightOutline, CalendarOutline } from 'antd-mobile-icons';
import { listVerifications } from '../services/verification.service';
import { useCouponData } from '../hooks/useCouponData';
import Artwork from '../components/Artwork';
import Sheet from '../components/Sheet';
import CouponValue from '../components/CouponValue';
import RecordRows from '../components/RecordRows';
import DataState from '../components/DataState';
import recordsReference from '../../../../../../docs/coupon/ui/16-verification-records.png';
export default function RecordsPage() {
  const bannerFilter = useId();
  const storeId = sessionStorage.getItem('coupon-store') || 'store-1';
  const state = useCouponData(useCallback(() => listVerifications(storeId), [storeId]));
  const [period, setPeriod] = useState('今日');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [dateField, setDateField] = useState(null);
  const rows = state.data?.filter((item) => {
    const date = new Date(item.createdAt); const today = new Date(); today.setHours(0, 0, 0, 0);
    if (period === '今日' && date < today) return false;
    if (period === '本周') { today.setDate(today.getDate() - (today.getDay() + 6) % 7); if (date < today) return false; }
    if (period === '自定义' && ((from && date < new Date(`${from}T00:00:00`)) || (to && date > new Date(`${to}T23:59:59`)))) return false;
    return `${item.user}${item.id}${item.code || ''}${item.coupon.name}`.includes(search);
  });
  return <div className="cv-records"><svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}><defs><filter id={bannerFilter} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -4.252 -14.304 -1.444 0 18.9" /><feComposite in2="SourceGraphic" operator="in" /></filter></defs></svg><div className="cv-records-hero"><span className="cv-records-banner-art" aria-hidden="true" style={{ backgroundImage: `url(${recordsReference})`, filter: `url(#${bannerFilter})` }} /><h1>核销记录</h1><p>惠 民 消 费 共 建 美 好 盐 城</p></div><div className="cv-page-padding"><div className="cv-record-periods">{['今日', '本周', '自定义'].map((item) => <button key={item} aria-pressed={period === item} onClick={() => setPeriod(item)}>{item}</button>)}</div>{period === '自定义' && <div className="cv-date-range">{[['from', '开始日期', from], ['to', '结束日期', to]].map(([field, label, value]) => <button key={field} type="button" aria-label={`${label}：${value || '请选择'}`} onClick={() => setDateField(field)}><span>{label}</span><strong>{value || '请选择日期'}</strong><CalendarOutline /></button>)}</div>}{dateField && <DatePicker visible precision="day" title={dateField === 'from' ? '选择开始日期' : '选择结束日期'} confirmText="确定" cancelText="取消" className="cv-record-date-picker" min={dateField === 'to' && from ? new Date(`${from}T00:00:00`) : new Date(2020, 0, 1)} max={dateField === 'from' && to ? new Date(`${to}T00:00:00`) : new Date()} value={(from || to) ? new Date(`${(dateField === 'from' ? from : to) || (dateField === 'from' ? to : from)}T00:00:00`) : new Date()} onClose={() => setDateField(null)} onConfirm={(date) => { const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; if (dateField === 'from') setFrom(value); else setTo(value); }} renderLabel={(type, value) => `${value}${{ year: '年', month: '月', day: '日' }[type] || ''}`} />}<label className="cv-record-search"><SearchOutline /><input placeholder="搜索券码或用户" value={search} onChange={(event) => setSearch(event.target.value)} /></label><header className="cv-record-date"><h2>{period === '今日' ? '今天' : period}</h2><time>{`${new Date().toLocaleDateString('zh-CN').replaceAll('/', '.')}（${new Date().toLocaleDateString('zh-CN', { weekday: 'short' })}）`}</time></header><DataState {...state} />{rows && <RecordRows records={rows} onSelect={setSelected} />}{rows?.length === 0 && <p className="cv-empty">未找到核销记录</p>}</div><div className="cv-footer cv-records-footer" aria-hidden="true" style={{ filter: `url(#${bannerFilter})` }}><Artwork name="records-footer" /><Artwork name="record-detail-scene" /></div>{selected && <Sheet title="核销详情" onClose={() => setSelected(null)} className="cv-record-detail"><div className="cv-record-detail-ticket"><Artwork name="record-coupon-icon" /><div><h2>{selected.coupon.name}</h2><CouponValue coupon={selected.coupon} /></div><span className="cv-record-detail-art" aria-hidden="true" style={{ backgroundImage: `url(${recordsReference})`, filter: `url(#${bannerFilter})` }} /><RightOutline className="cv-record-detail-arrow" aria-hidden="true" /></div><dl>{[['用户', selected.user], ['所属门店', selected.store.branch || selected.store.name], ['核销时间', new Date(selected.createdAt).toLocaleString('zh-CN')], ['券码序列号', selected.id], ['核销方式', selected.method], ['操作人员', '演示核销员']].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><div className="cv-record-detail-footer" aria-hidden="true" style={{ filter: `url(#${bannerFilter})` }}><Artwork name="records-footer" /><Artwork name="record-detail-scene" /></div></Sheet>}</div>;
}
