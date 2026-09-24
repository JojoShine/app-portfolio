import { useEffect, useMemo, useState } from 'react';
import { Popup, Radio } from 'antd-mobile';
import { CloseCircleFill, DownOutline, RightOutline, SearchOutline } from 'antd-mobile-icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLibraryBooks, useLibraryBranches } from '../hooks/useCatalogData';
import { updateCatalogParams } from '../utils/catalogFilters';
import AssetImage from '../components/AssetImage';
import { BottomNav, PageState } from '../components/LibraryLayout';

const availabilityOptions = [
  { value: '', label: '全部状态' },
  { value: 'available', label: '可借' },
  { value: 'unavailable', label: '暂不可借' },
];
const sortOptions = [
  { value: 'relevance', label: '按相关性排序' },
  { value: 'popular', label: '按热度排序' },
  { value: 'newest', label: '按出版时间排序' },
];

export default function CatalogPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [term, setTerm] = useState(params.get('q') || '');
  const [activeFilter, setActiveFilter] = useState('');
  const category = params.get('category') || '';
  const branchId = params.get('branchId') || '';
  const availability = params.get('availability') || '';
  const sort = params.get('sort') || 'relevance';
  const branchesQuery = useLibraryBranches();
  const query = useLibraryBooks({
    q: params.get('q') || undefined,
    category: category || undefined,
    branchId: branchId || undefined,
    availability: availability || undefined,
    sort,
  }, [params.toString()]);

  const branchOptions = useMemo(() => [
    { value: '', label: '全部分馆' },
    ...(branchesQuery.data || []).map((branch) => ({ value: branch.id, label: branch.name })),
  ], [branchesQuery.data]);
  const filters = {
    branch: { title: '选择分馆', value: branchId, param: 'branchId', options: branchOptions },
    availability: { title: '馆藏状态', value: availability, param: 'availability', options: availabilityOptions },
    sort: { title: '排序方式', value: sort, param: 'sort', options: sortOptions },
  };
  const openedFilter = filters[activeFilter];
  const branchLabel = branchId
    ? branchOptions.find((option) => option.value === branchId)?.label || '分馆'
    : '分馆';
  const availabilityLabel = availability === 'unavailable' ? '不可借' : '可借';
  const sortLabel = sortOptions.find((option) => option.value === sort)?.label || sortOptions[0].label;

  const updateParams = (updates) => setParams((current) => updateCatalogParams(current, updates));
  const submit = (event) => { event.preventDefault(); updateParams({ q: term.trim() }); };
  const clearSearch = () => { setTerm(''); updateParams({ q: '' }); };
  const chooseCategory = (value) => updateParams({ category: value });
  const chooseFilter = (value) => {
    updateParams({ [openedFilter.param]: value });
    setActiveFilter('');
  };

  useEffect(() => setTerm(params.get('q') || ''), [params]);

  return <main className="lib-page lib-catalog">
    <header className="lib-catalog-head">
      <span>书香海安</span><small>让阅读成为一种生活方式</small>
      <aside>江海书卷<br />阅见美好</aside><h1>馆藏</h1><p>在书中，遇见更大的江海</p>
    </header>
    <form className="lib-search-form" onSubmit={submit}>
      <SearchOutline />
      <input value={term} onChange={(event) => setTerm(event.target.value)} placeholder="搜索书名、作者或 ISBN" aria-label="搜索书名、作者或 ISBN" />
      {term ? <button className="lib-search-clear" type="button" aria-label="清空搜索" onClick={clearSearch}><CloseCircleFill /></button> : <span className="lib-search-clear-spacer" />}
      <button className="lib-search-submit" type="submit">搜索</button>
    </form>
    <div className="lib-filters">
      <div className="lib-category-row">
        <button type="button" className={!category ? 'is-active' : ''} onClick={() => chooseCategory('')}>全部</button>
        <button type="button" className={category === '文学' ? 'is-active' : ''} onClick={() => chooseCategory('文学')}>文学</button>
        <button type="button" className={category === '少儿阅读' ? 'is-active' : ''} onClick={() => chooseCategory('少儿阅读')}>少儿</button>
        <button type="button" className={category === '地方文献' ? 'is-active' : ''} onClick={() => chooseCategory('地方文献')}>地方文献</button>
      </div>
      <button className="lib-filter-button" type="button" data-filtered={Boolean(branchId)} aria-haspopup="dialog" aria-expanded={activeFilter === 'branch'} onClick={() => setActiveFilter('branch')}><span>{branchLabel}</span><DownOutline /></button>
      <button className="lib-filter-button" type="button" data-filtered={Boolean(availability)} aria-haspopup="dialog" aria-expanded={activeFilter === 'availability'} onClick={() => setActiveFilter('availability')}><span>{availabilityLabel}</span><DownOutline /></button>
    </div>
    <PageState {...query} onRetry={query.reload} />
    {query.data && <section className="lib-book-list">
      <div className="lib-result-count"><p>共找到 <b>{query.data.total}</b> 条相关馆藏</p><button type="button" aria-haspopup="dialog" aria-expanded={activeFilter === 'sort'} onClick={() => setActiveFilter('sort')}><span>{sortLabel}</span><DownOutline /></button></div>
      {query.data.items.map((book) => <button key={book.id} className="lib-book-row" onClick={() => navigate(`/library/books/${book.id}`)}>
        <div className="lib-book-cover"><AssetImage remote={book.coverUrl} fallback="humanWorld" alt={`${book.title}封面`} /></div>
        <span><h2>{book.title}</h2><p>{book.author} 著</p><span className="lib-book-tags"><i>文学</i><i>{book.category}</i></span><p className="lib-book-summary">{book.description}</p><b>海安市图书馆&nbsp; · &nbsp;可借 <em>{book.availableCopies}</em> 册</b></span>
        <RightOutline className="lib-book-row-arrow" />
      </button>)}
    </section>}
    <Popup visible={Boolean(openedFilter)} position="bottom" closeOnMaskClick destroyOnClose onClose={() => setActiveFilter('')} bodyClassName="lib-catalog-filter-sheet" getContainer={() => document.querySelector('.library-app')}>
      {openedFilter && <section role="dialog" aria-modal="true" aria-label={openedFilter.title}>
        <header><h2>{openedFilter.title}</h2><button type="button" onClick={() => setActiveFilter('')}>取消</button></header>
        <Radio.Group value={openedFilter.value} onChange={chooseFilter}>
          {openedFilter.options.map((option) => <Radio key={option.value || 'all'} value={option.value} block>{option.label}</Radio>)}
        </Radio.Group>
      </section>}
    </Popup>
    <BottomNav />
  </main>;
}
