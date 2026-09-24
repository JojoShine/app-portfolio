import { useState } from 'react';
import { Toast } from 'antd-mobile';
import { AudioFill, ClockCircleOutline, ContentOutline, RightOutline } from 'antd-mobile-icons';
import { useLibraryMessages } from '../hooks/useReaderData';
import { readAllMessages, readMessage } from '../services/library.service';
import { PersonalPageHeader, PageState } from '../components/LibraryLayout';
import LibraryDialog from '../components/LibraryDialog';
import { formatLibraryMessageTime } from '../utils/format';
import seatIcon from '../assets/service-seat-icon.png';
import messageFooter from '../assets/message-footer.png';

const messageArtwork = { '--message-footer-art': `url("${messageFooter}")` };

const icons = { reservation: ContentOutline, loan: ClockCircleOutline, event: AudioFill };
const categories = [{ label: '全部', types: null }, { label: '借阅', types: ['loan'] }, { label: '预约', types: ['reservation', 'seat'] }, { label: '活动', types: ['event'] }];
const priority = { reservation: 0, loan: 1, seat: 2, event: 3 };

export default function MessagesPage() {
  const query = useLibraryMessages();
  const [category, setCategory] = useState('全部');
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [opening, setOpening] = useState(null);
  const messages = query.data ? [...query.data].sort((a, b) => (priority[a.type] ?? 4) - (priority[b.type] ?? 4)) : [];
  const types = categories.find((item) => item.label === category).types;
  const filtered = messages.filter((item) => !types || types.includes(item.type));
  const unread = messages.some((item) => !item.readAt);
  const readAll = async () => {
    if (busy || !unread) return;
    setBusy(true);
    try { await readAllMessages(); query.reload(); Toast.show('已将全部消息标记为已读'); }
    catch (error) { Toast.show(error.message); }
    finally { setBusy(false); }
  };
  const open = async (item) => {
    if (opening || busy) return;
    setSelected(item);
    if (!item.readAt) {
      setOpening(item.id);
      try { await readMessage(item.id); query.reload(); }
      catch (error) { Toast.show(error.message); }
      finally { setOpening(null); }
    }
  };
  return <main className="lib-page lib-personal-subpage lib-messages" style={messageArtwork}>
    <PersonalPageHeader title="消息中心" action={<button disabled={busy || !unread} onClick={readAll}>{busy ? '处理中…' : '全部已读'}</button>} />
    <nav className="lib-message-tabs" aria-label="消息分类">{categories.map((item) => <button key={item.label} aria-pressed={category === item.label} className={category === item.label ? 'is-active' : ''} onClick={() => setCategory(item.label)}>{item.label}</button>)}</nav>
    <PageState {...query} onRetry={query.reload} />
    <section className="lib-message-list" aria-label={category + '消息'}>{filtered.map((item) => {
      const Icon = icons[item.type] || ContentOutline;
      return <button key={item.id} className={!item.readAt ? 'is-unread' : ''} disabled={busy || Boolean(opening)} onClick={() => open(item)}>
        {!item.readAt && <i className="lib-message-bookmark" aria-label="未读" />}
        <span className="lib-message-icon" aria-hidden="true">{item.type === 'seat' ? <img src={seatIcon} alt="" /> : <Icon />}</span>
        <span className="lib-message-copy"><span className="lib-message-row-heading"><h2>{item.title}</h2><time dateTime={item.createdAt}>{formatLibraryMessageTime(item.createdAt)}</time></span><p>{item.content}</p></span>
        <RightOutline className="lib-message-chevron" />
      </button>;
    })}</section>
    {!query.loading && !query.error && query.data && filtered.length === 0 && <p className="lib-message-empty" role="status">暂无{category === '全部' ? '' : category}消息</p>}
    <footer className="lib-message-footer"><div><p>阅读，让一座城<br />更温暖</p><i /><span>书香海安</span><small>READING<br />MAKES A BETTER HAIAN</small></div></footer>
    <LibraryDialog open={Boolean(selected)} title={selected?.title} onClose={() => setSelected(null)}><p className="lib-message-detail-date">{selected && formatLibraryMessageTime(selected.createdAt)}</p><p>{selected?.content}</p></LibraryDialog>
  </main>;
}
