import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar, Toast } from 'antd-mobile';
import {
  AppOutline, AppstoreOutline, BankcardOutline, CheckShieldOutline, CollectMoneyOutline,
  ContentOutline, CouponOutline, EnvironmentOutline, FileOutline, FillinOutline, MoreOutline,
  PayCircleOutline, RightOutline, SendOutline, ShopbagOutline, TeamOutline, UnorderedListOutline,
} from 'antd-mobile-icons';
import { registeredApplicationPaths } from '../../../app/registry/applications';
import PageState from '../../../shared/components/PageState';
import workshopIllustration from '../assets/app-market-workshop-pixel.png';
import { appService, categoryService } from '../services';

const ALL_CATEGORIES = 'all';
const ICON_COMPONENTS = {
  BookOpen: FileOutline, Briefcase: ShopbagOutline, Building2: BankcardOutline,
  DollarSign: CollectMoneyOutline, Content: ContentOutline, Coupon: CouponOutline,
  Fillin: FillinOutline, GraduationCap: FillinOutline, Home: ShopbagOutline,
  MapPin: EnvironmentOutline, Shield: CheckShieldOutline, Shopbag: ShopbagOutline,
  Send: SendOutline, Team: TeamOutline, Users: TeamOutline, Zap: PayCircleOutline,
};

const CatalogPage = () => {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState({ applications: [], categories: [] });
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES);
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCatalog = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [applications, categories] = await Promise.all([appService.list(), categoryService.list()]);
      setCatalog({ applications, categories });
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCatalog(); }, [loadCatalog]);

  const isAvailable = useCallback((application) => application.status === 'active'
    && registeredApplicationPaths.has(application.path), []);
  const availableCount = useMemo(() => catalog.applications.filter(isAvailable).length, [catalog.applications, isAvailable]);
  const spotlight = useMemo(() => catalog.applications.find(isAvailable) || catalog.applications[0], [catalog.applications, isAvailable]);
  const applications = useMemo(() => catalog.applications.filter((application) => {
    const inCategory = activeCategory === ALL_CATEGORIES || application.categoryId === activeCategory;
    const keyword = query.trim().toLowerCase();
    return inCategory && (!keyword || `${application.name} ${application.description || ''}`.toLowerCase().includes(keyword));
  }), [activeCategory, catalog.applications, query]);

  const openApplication = (application) => {
    if (isAvailable(application)) navigate(application.path);
    else Toast.show({ content: '应用正在建设中' });
  };

  const shareApplication = async (event, application) => {
    event.stopPropagation();
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
    const url = `${window.location.origin}${basePath}${application.path}`;
    try {
      if (navigator.share) await navigator.share({ title: application.name, text: application.description || `体验 ${application.name}`, url });
      else {
        await navigator.clipboard.writeText(url);
        Toast.show({ content: '应用链接已复制' });
      }
    } catch (shareError) {
      if (shareError.name !== 'AbortError') Toast.show({ content: '暂时无法分享，请稍后重试' });
    }
  };

  const renderIcon = (application) => {
    const IconComponent = ICON_COMPONENTS[application.icon] || AppOutline;
    return <IconComponent aria-hidden="true" />;
  };

  return (
    <div className="pixel-market">
      <header className="pixel-market__bar">
        <span className="pixel-market__brand">APP PORTFOLIO</span>
        <span className="pixel-market__counter">{catalog.applications.length || 0} APPS</span>
      </header>

      <main>
        <section className="pixel-hero" aria-labelledby="pixel-hero-title">
          <div className="pixel-hero__copy">
            <span>PERSONAL APP ARCHIVE</span>
            <h1 id="pixel-hero-title">把做过的事<br />做成能用的应用</h1>
            <p>这里收录工作中真正落地的产品。打开体验，也可以直接分享。</p>
            <button type="button" onClick={() => document.getElementById('app-library')?.scrollIntoView({ behavior: 'smooth' })}>浏览应用 <RightOutline /></button>
          </div>
          <img src={workshopIllustration} alt="像素风数字应用工作间" />
          <div className="pixel-hero__stats" aria-label="应用概况">
            <span><strong>{catalog.applications.length || 0}</strong>作品</span>
            <span><strong>{availableCount}</strong>可体验</span>
          </div>
        </section>

        <section className="pixel-discovery" aria-label="查找应用">
          <div className="pixel-discovery__heading">
            <div><small>FIND SOMETHING</small><h2>发现应用</h2></div>
            <div className="pixel-view-switch" role="group" aria-label="应用展示方式">
              <button type="button" aria-label="列表展示" aria-pressed={viewMode === 'list'} className={viewMode === 'list' ? 'is-active' : ''} onClick={() => setViewMode('list')}><UnorderedListOutline /></button>
              <button type="button" aria-label="卡片展示" aria-pressed={viewMode === 'grid'} className={viewMode === 'grid' ? 'is-active' : ''} onClick={() => setViewMode('grid')}><AppstoreOutline /></button>
            </div>
          </div>
          <SearchBar value={query} onChange={setQuery} placeholder="输入应用名称或功能" clearable />
          <nav className="pixel-categories" aria-label="应用分类">
            <button type="button" className={activeCategory === ALL_CATEGORIES ? 'is-active' : ''} onClick={() => setActiveCategory(ALL_CATEGORIES)}>全部</button>
            {catalog.categories.map((category) => <button type="button" key={category.id} className={activeCategory === category.id ? 'is-active' : ''} onClick={() => setActiveCategory(category.id)}>{category.name}</button>)}
          </nav>
        </section>

        {!query && activeCategory === ALL_CATEGORIES && spotlight && (
          <section className="pixel-spotlight" aria-labelledby="spotlight-title">
            <div className="pixel-section-title"><small>READY TO PLAY</small><h2 id="spotlight-title">现在可以体验</h2></div>
            <article onClick={() => openApplication(spotlight)}>
              <span className="pixel-spotlight__icon">{renderIcon(spotlight)}</span>
              <span className="pixel-spotlight__copy"><small>已上线</small><strong>{spotlight.name}</strong><p>{spotlight.description || '暂无介绍'}</p></span>
              <span className="pixel-spotlight__actions">
                <button type="button" aria-label={`分享${spotlight.name}`} onClick={(event) => shareApplication(event, spotlight)}><SendOutline /></button>
                <button type="button" aria-label={`打开${spotlight.name}`} onClick={() => openApplication(spotlight)}><RightOutline /></button>
              </span>
            </article>
          </section>
        )}

        <section id="app-library" className="pixel-library" aria-labelledby="library-title">
          <div className="pixel-section-title"><small>THE COLLECTION</small><h2 id="library-title">应用收藏夹</h2></div>
          <PageState loading={loading} error={error} onRetry={loadCatalog}>
            {applications.length ? (
              <div className={`pixel-apps pixel-apps--${viewMode}`}>
                {applications.map((application) => (
                  <article key={application.id} className={isAvailable(application) ? 'is-ready' : 'is-building'} onClick={() => openApplication(application)}>
                    <button type="button" className="pixel-app__main" aria-label={`打开${application.name}`}>
                      <span className="pixel-app__icon">{renderIcon(application)}</span>
                      <span className="pixel-app__content">
                        <span className="pixel-app__title"><strong>{application.name}</strong><small>{isAvailable(application) ? '可体验' : '建设中'}</small></span>
                        <span className="pixel-app__description">{application.description || '暂无介绍'}</span>
                      </span>
                    </button>
                    <button type="button" className="pixel-app__share" aria-label={`分享${application.name}`} onClick={(event) => shareApplication(event, application)}><SendOutline /></button>
                  </article>
                ))}
              </div>
            ) : <div className="pixel-empty"><MoreOutline fontSize={32} /><p>没有找到相关应用</p></div>}
          </PageState>
        </section>
      </main>

      <footer className="pixel-footer"><span>MADE FROM REAL WORK</span><p>Powered by <a href="https://tbtparent.me" target="_blank" rel="noopener noreferrer"><strong>TBTparent</strong></a></p></footer>
    </div>
  );
};

export default CatalogPage;
