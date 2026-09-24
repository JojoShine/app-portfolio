import { useMemo, useState } from 'react';
import { HeartOutline, RightOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import { useLibraryBooks } from '../hooks/useCatalogData';
import AssetImage from '../components/AssetImage';
import { PersonalPageHeader, PageState } from '../components/LibraryLayout';

const readSavedIds = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch { return []; }
};

export default function FavoritesPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('wanted');
  const wantedIds = useMemo(() => readSavedIds('library-want-to-read'), []);
  const favoriteIds = useMemo(() => readSavedIds('library-favorite-books'), []);
  const query = useLibraryBooks({ pageSize: 100 }, []);
  const ids = tab === 'wanted' ? wantedIds : favoriteIds;
  const books = (query.data?.items || []).filter((book) => ids.includes(book.id));

  return <main className="lib-page lib-personal-subpage lib-personal-list lib-favorites">
    <PersonalPageHeader title="收藏与想读" />
    <nav className="lib-personal-tabs" aria-label="书单分类">
      <button className={tab === 'wanted' ? 'is-active' : ''} onClick={() => setTab('wanted')}>想读 <small>{wantedIds.length}</small></button>
      <button className={tab === 'favorite' ? 'is-active' : ''} onClick={() => setTab('favorite')}>收藏 <small>{favoriteIds.length}</small></button>
    </nav>
    <PageState {...query} onRetry={query.reload} />
    {!query.loading && !query.error && books.length === 0 && <section className="lib-personal-empty"><HeartOutline /><h2>{tab === 'wanted' ? '还没有想读的书' : '还没有收藏图书'}</h2><p>在图书详情页轻触心形或“加入想读”，喜欢的书会留在这里。</p><button onClick={() => navigate('/library/catalog')}>去逛馆藏</button></section>}
    {books.length > 0 && <section className="lib-personal-books">{books.map((book) => <button key={book.id} onClick={() => navigate(`/library/books/${book.id}`)}><AssetImage remote={book.coverUrl} fallback={book.title.includes('长安') ? 'changan' : 'humanWorld'} alt={`${book.title}封面`} /><span><small>{book.category}</small><h2>{book.title}</h2><p>{book.author} 著</p><b>可借 {book.availableCopies} 册</b></span><RightOutline /></button>)}</section>}
    <footer className="lib-personal-signoff">藏一卷书香 · 赴一场相遇</footer>
  </main>;
}
