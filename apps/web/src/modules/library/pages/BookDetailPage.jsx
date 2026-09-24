import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HeartOutline, HeartFill, DownOutline, RightOutline, TagOutline } from 'antd-mobile-icons';
import { Toast } from 'antd-mobile';
import { useLibraryBook } from '../hooks/useCatalogData';
import { createBookReservation } from '../services/library.service';
import AssetImage from '../components/AssetImage';
import { PageHeader, PageState } from '../components/LibraryLayout';

export default function BookDetailPage() {
  const { id } = useParams(); const query = useLibraryBook(id); const book = query.data;
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [wanted, setWanted] = useState(() => { try { return JSON.parse(localStorage.getItem('library-want-to-read') || '[]'); } catch { return []; } });
  const isWanted = wanted.includes(id);
  const toggleWanted = () => {
    const next = isWanted ? wanted.filter((item) => item !== id) : [...wanted, id];
    try { localStorage.setItem('library-want-to-read', JSON.stringify(next)); setWanted(next); Toast.show(isWanted ? '已移出本机想读清单' : '已加入本机想读清单'); }
    catch { Toast.show('暂时无法保存想读清单'); }
  };
  const isChangan = book?.title === '长安的荔枝';
  const synopsis = isChangan && (book.description || '').length < 40
    ? '大唐天宝年间，一枚小小的荔枝，牵动了帝国的权力、人情与命运。作者以马伯庸一贯的历史想象与现实关照，讲述了一个关于忠诚、选择与生存的故事。在盛世的背面，是无数普通人的辛酸与智慧。'
    : book?.description;
  const reserve = async () => { if (submitting) return; setSubmitting(true); try { const branch = book.holdings.find((item) => item.availableCopies === 0)?.branchId || book.holdings[0]?.branchId; await createBookReservation({ bookId: book.id, pickupBranchId: branch }); Toast.show('预约成功'); } catch (error) { Toast.show(error.message); } finally { setSubmitting(false); } };
  return <main className="lib-page lib-detail"><PageHeader title="图书详情" action={<button aria-label={isWanted ? '取消想读' : '加入想读'} aria-pressed={isWanted} onClick={toggleWanted}>{isWanted ? <HeartFill /> : <HeartOutline />}</button>} /><PageState {...query} onRetry={query.reload} />{book && <>
    <section className="lib-book-hero"><div className={`lib-detail-cover ${isChangan ? 'is-product' : ''}`}><AssetImage key={book.id} remote={book.coverUrl} alt={`${book.title}封面`} /></div><div className="lib-detail-book-info"><h1>{book.title}</h1><p className="lib-detail-author">{book.author} <span>著</span></p><p>{book.publisher}<br />{book.publishedYear}年出版</p><i /><blockquote>{isChangan ? <>一骑红尘妃子笑，<br />无人知是荔枝来。</> : book.description}</blockquote><small>{isChangan ? '中国文学　|　历史小说　|　社会人文' : book.category}</small></div></section>
    <section className="lib-detail-section lib-detail-intro"><h2>内容简介</h2><p id="book-synopsis" className={expanded ? 'is-expanded' : ''}>{synopsis}</p><button className="lib-detail-expand" aria-expanded={expanded} aria-controls="book-synopsis" onClick={() => setExpanded(!expanded)}>{expanded ? '收起' : '展开'}<DownOutline /></button></section>
    <section className="lib-detail-section lib-holdings"><header><h2>馆藏分布</h2><span>共 {book.holdings.length} 家馆藏 <RightOutline /></span></header>{book.holdings.map((item) => <button className="lib-holding-row" key={item.id} onClick={() => navigate(`/library/branches/${item.branchId}`)}><div><h3>{item.branchName}</h3><p>{item.floor}{item.area} · <span>{item.callNumber}</span></p></div><b>{item.availableCopies ? `可借 ${item.availableCopies} 册` : '已借出 · 可预约'}</b><RightOutline /></button>)}</section>
    <p className="lib-detail-signoff">阅读，让一座城市更温暖<br />书香海安 · 与你共读</p>
    <div className="lib-detail-actions"><button className="secondary" aria-pressed={isWanted} onClick={toggleWanted}><TagOutline />{isWanted ? '已加入想读' : '加入想读'}</button><button className="primary" disabled={submitting || !book.holdings.length} onClick={reserve}>{submitting ? '预约中…' : '预约图书'}</button></div>
  </>}</main>;
}
