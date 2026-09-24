import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CalendarOutline, DownOutline, EnvironmentOutline, StarOutline, StarFill, UserOutline, CouponOutline, UnorderedListOutline, FileOutline, ContentOutline } from 'antd-mobile-icons';
import { Toast } from 'antd-mobile';
import { useLibraryEvent } from '../hooks/useEventData';
import { registerEvent } from '../services/library.service';
import AssetImage from '../components/AssetImage';
import LibraryDialog from '../components/LibraryDialog';
import { PageHeader, PageState } from '../components/LibraryLayout';
import { formatLibraryEventDate } from '../utils/format';

export default function EventDetailPage() {
  const { id } = useParams();
  const query = useLibraryEvent(id);
  const event = query.data;
  const [expanded, setExpanded] = useState({});
  const [starred, setStarred] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [registration, setRegistration] = useState(null);
  const date = event ? formatLibraryEventDate(event.startsAt) : null;
  const register = async () => {
    if (submitting || registration) return;
    setSubmitting(true);
    try { const result = await registerEvent(id); setRegistration(result.status); Toast.show(result.status === 'waitlisted' ? '已进入候补' : '报名成功'); query.reload(); }
    catch (error) { Toast.show(error.message); }
    finally { setSubmitting(false); }
  };
  const copyLink = async () => { try { await navigator.clipboard.writeText(window.location.href); setShareOpen(false); Toast.show('活动链接已复制'); } catch { Toast.show('无法复制，请复制地址栏中的链接'); } };
  const sections = event ? [['活动介绍', event.description, ContentOutline], ['活动流程', (event.agenda || []).join(' · '), UnorderedListOutline], ['参与须知', event.notice, FileOutline]] : [];
  return <main className="lib-page lib-event-detail">
    <PageHeader title="活动详情" action={<div className="lib-event-header-actions"><button aria-label={starred ? '取消本次收藏' : '收藏活动'} aria-pressed={starred} onClick={() => setStarred(!starred)}>{starred ? <StarFill /> : <StarOutline />}</button><button aria-label="分享活动" onClick={() => setShareOpen(true)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8.5 5.5 12 2l3.5 3.5M12 2.5v12M7.5 9H5a1.5 1.5 0 0 0-1.5 1.5v10A1.5 1.5 0 0 0 5 22h14a1.5 1.5 0 0 0 1.5-1.5v-10A1.5 1.5 0 0 0 19 9h-2.5" /></svg></button></div>} />
    <PageState {...query} onRetry={query.reload} />
    {event && <>
      <div className="lib-event-art"><AssetImage className="lib-event-cover is-photo" remote={event.coverUrl} alt={event.title + '活动现场'} /><section className="lib-event-title"><small>书香海安 · 阅读同行</small><h1>{event.title}</h1><i /><p>{event.summary}</p></section></div>
      <section className="lib-event-meta" aria-label="活动信息"><span><CalendarOutline /><span>{Number(date.month)}月{Number(date.day)}日 {date.weekday} {date.time}</span></span><span><EnvironmentOutline /><span>{event.branchName}{event.address ? ' · ' + event.address : ''}</span></span><span><UserOutline /><span>{event.ageGroup}</span></span><span><CouponOutline /><span>剩余 <b>{event.remaining}</b> 席</span></span></section>
      {sections.map(([title, content, Icon], index) => <section className={'lib-event-section ' + (expanded[index] ? 'is-expanded' : '')} key={title}><Icon /><div><header><h2>{title}</h2><button aria-expanded={Boolean(expanded[index])} aria-controls={'event-section-' + index} onClick={() => setExpanded((previous) => ({ ...previous, [index]: !previous[index] }))}>{expanded[index] ? '收起' : '展开'}<DownOutline /></button></header>{expanded[index] && index === 1 ? <ol id={'event-section-' + index}>{(event.agenda || []).map((step, stepIndex) => <li key={stepIndex}>{step}</li>)}</ol> : <p id={'event-section-' + index}>{content}</p>}</div></section>)}
      <div className="lib-event-colophon"><span>书香海安 · 阅读同行</span><span>{date.day}</span></div>
      <div className="lib-event-enroll"><button disabled={submitting || Boolean(registration)} onClick={register}>{submitting ? '报名中…' : registration === 'waitlisted' ? '已进入候补' : registration ? '已报名' : event.remaining === 0 ? '加入候补' : '立即报名'}</button></div>
    </>}
    <LibraryDialog open={shareOpen} title="分享活动" confirmText="复制活动链接" onConfirm={copyLink} onClose={() => setShareOpen(false)}><p>邀请朋友一起参加{event ? '「' + event.title + '」' : '阅读活动'}。</p></LibraryDialog>
  </main>;
}
