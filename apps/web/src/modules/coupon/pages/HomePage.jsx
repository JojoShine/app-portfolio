import { useCountdown } from '../hooks/useCountdown';
import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { RightOutline, LoopOutline, LeftOutline } from 'antd-mobile-icons';
import { listActivities } from '../services/activity.service';
import { useCouponData } from '../hooks/useCouponData';
import { categories } from '../constants/options';
import { appConfig } from '../../../app/config/env';
import DataState from '../components/DataState';
import Artwork from '../components/Artwork';
import ActivityCard from '../components/ActivityCard';
import Sheet from '../components/Sheet';
export default function HomePage() {
  const inkFilterId = useId();
  const state = useCouponData(listActivities);
  const [category, setCategory] = useState('餐饮');
  const [region, setRegion] = useState('建湖县专区');
  const [panel, setPanel] = useState('');
  const nextBatch = state.data?.find((item) => item.category === category)?.nextBatchAt;
  const timer = useCountdown(nextBatch);
  const nextBatchDate = new Date(typeof nextBatch === 'string' && /^\d+$/.test(nextBatch) ? Number(nextBatch) : nextBatch);
  const hasBatch = Number.isFinite(nextBatchDate.getTime());
  const batchLabel = hasBatch ? nextBatchDate.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) : '时间待公布';
  const countdown = `${String(Math.floor(timer.seconds / 3600)).padStart(2, '0')}:${String(Math.floor(timer.seconds / 60) % 60).padStart(2, '0')}:${String(timer.seconds % 60).padStart(2, '0')}`;
  const rows = state.data?.filter((item) => item.category === category);
  return <div className="cv-home" style={{ '--cv-category-ink-filter': `url(#${inkFilterId})` }}><svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}><defs><filter id={inkFilterId} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -4.252 -14.304 -1.444 0 19.2" /><feComposite in2="SourceGraphic" operator="in" /></filter><filter id="cv-category-active-color" colorInterpolationFilters="sRGB"><feComponentTransfer><feFuncR type="linear" slope="0.216" intercept="0.784" /><feFuncG type="linear" slope="0.675" intercept="0.325" /><feFuncB type="linear" slope="0.827" intercept="0.173" /></feComponentTransfer></filter></defs></svg><div className="cv-home-banner"><Link className="cv-home-return" to="/"><LeftOutline />返回主页</Link><div className="cv-home-top"><div className="cv-home-brand"><Artwork name="home-calligraphy" style={{ filter: `url(#${inkFilterId})` }} alt="大美湿地，盐城有礼" /></div><button onClick={() => setPanel('region')}>切换区域 <LoopOutline /></button>{appConfig.useMockApi && <button onClick={() => setPanel('demo')}>DEMO</button>}</div>
    <section className="cv-home-hero"><h1><Artwork name="home-title" style={{ filter: `url(#${inkFilterId})` }} alt="盐城惠民消费季" /></h1><div className="cv-home-region"><strong>{region}</strong><span>演示项目</span></div><div className="cv-next-batch">下一场 {batchLabel}</div><div className="cv-home-countdown">{!hasBatch ? '--:--:--' : timer.seconds > 0 ? countdown : '已开抢'}</div></section></div>
    <section className="cv-home-main"><div className="cv-category-tabs" aria-label="活动分类">{categories.map((item, index) => <button key={item} aria-pressed={category === item} onClick={() => setCategory(item)}><Artwork name={`icon-${['dining', 'shopping', 'travel', 'appliance'][index]}`} />{item}</button>)}</div><DataState {...state} />{rows?.map((activity) => <ActivityCard key={activity.id} activity={activity} />)}{rows?.length === 0 && <p className="cv-empty">该分类暂无活动</p>}<nav className="cv-shortcuts"><Link to="/coupon/wallet"><Artwork name="home-wallet-icon" /><div><strong>我的券包</strong><span>查看已领券与使用记录</span></div><RightOutline /></Link><Link to="/coupon/merchants"><Artwork name="home-store-icon" /><div><strong>适用商家</strong><span>发现身边好店</span></div><RightOutline /></Link><Link to="/coupon/rules"><Artwork name="home-rules-icon" /><div><strong>活动规则</strong><span>了解活动详情</span></div><RightOutline /></Link></nav></section><Artwork name="home-footer" className="cv-home-footer" style={{ filter: `url(#${inkFilterId})` }} />
    {panel && <Sheet title={panel === 'demo' ? '演示角色切换' : '切换活动区域'} onClose={() => setPanel('')}>{panel === 'demo' ? <><Link className="cv-sheet-option" to="/coupon/merchant">商家核销端 <RightOutline /></Link><Link className="cv-sheet-option" to="/coupon/select/store-1">模拟扫描商家码 <RightOutline /></Link><button className="cv-sheet-option" onClick={() => setPanel('')}>继续浏览用户端</button></> : ['建湖县专区', '盐城市主会场'].map((item) => <button key={item} className="cv-sheet-option" onClick={() => { setRegion(item); setPanel(''); }}>{item}</button>)}</Sheet>}</div>;
}
