import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar, Toast } from 'antd-mobile';
import {
  AppOutline,
  AppstoreOutline,
  BankcardOutline,
  CheckShieldOutline,
  CollectMoneyOutline,
  ContentOutline,
  CouponOutline,
  EnvironmentOutline,
  FileOutline,
  FillinOutline,
  HeartOutline,
  MoreOutline,
  PayCircleOutline,
  RightOutline,
  SendOutline,
  ShopbagOutline,
  TeamOutline,
  UnorderedListOutline,
} from 'antd-mobile-icons';
import { registeredApplicationPaths } from '../../../app/registry/applications';
import PageState from '../../../shared/components/PageState';
import heroIllustration from '../assets/app-market-hero.png';
import { appService, categoryService } from '../services';

const ALL_CATEGORIES = 'all';

const ICON_COMPONENTS = {
  BookOpen: FileOutline,
  Briefcase: ShopbagOutline,
  Building2: BankcardOutline,
  DollarSign: CollectMoneyOutline,
  Content: ContentOutline,
  Coupon: CouponOutline,
  Fillin: FillinOutline,
  GraduationCap: FillinOutline,
  Heart: HeartOutline,
  Home: ShopbagOutline,
  MapPin: EnvironmentOutline,
  Shield: CheckShieldOutline,
  Shopbag: ShopbagOutline,
  Team: TeamOutline,
  Users: TeamOutline,
  Zap: PayCircleOutline,
};

const FEATURED_APPLICATIONS = ['招生报名', '消费券'];

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
      const [applications, categories] = await Promise.all([
        appService.list(),
        categoryService.list(),
      ]);
      setCatalog({ applications, categories });
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const applications = useMemo(() => catalog.applications.filter((application) => {
    const inCategory = activeCategory === ALL_CATEGORIES || application.categoryId === activeCategory;
    const keyword = query.trim().toLowerCase();
    const matchesQuery = !keyword || `${application.name} ${application.description || ''}`.toLowerCase().includes(keyword);
    return inCategory && matchesQuery;
  }), [activeCategory, catalog.applications, query]);

  const featuredApplications = useMemo(() => FEATURED_APPLICATIONS
    .map((name) => catalog.applications.find((application) => application.name === name))
    .filter(Boolean), [catalog.applications]);

  const isAvailable = (application) => application.status === 'active'
    && registeredApplicationPaths.has(application.path);

  const openApplication = (application) => {
    if (isAvailable(application)) {
      navigate(application.path);
      return;
    }
    Toast.show({ content: '应用正在建设中' });
  };

  const shareApplication = async (event, application) => {
    event.stopPropagation();
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
    const url = `${window.location.origin}${basePath}${application.path}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: application.name,
          text: application.description || `体验 ${application.name}`,
          url,
        });
      } else {
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
    <div className="catalog-page">
      <main>
        <section className="catalog-search" aria-label="搜索应用">
          <SearchBar value={query} onChange={setQuery} placeholder="搜索应用" clearable />
        </section>

        <section className="catalog-intro" aria-labelledby="catalog-intro-title">
          <div className="catalog-intro__content">
            <h1 id="catalog-intro-title">App Portfolio</h1>
            <p>沉淀工作经历，应用可体验、可分享</p>
            <div className="catalog-intro__labels" aria-label="应用特点">
              <span>移动端应用</span>
              <span>可体验</span>
              <span>可分享</span>
            </div>
          </div>
          <img src={heroIllustration} alt="移动应用与分享" />
        </section>

        <nav className="catalog-categories" aria-label="应用分类">
          <button
            type="button"
            className={activeCategory === ALL_CATEGORIES ? 'is-active' : ''}
            onClick={() => setActiveCategory(ALL_CATEGORIES)}
          >
            全部
          </button>
          {catalog.categories.map((category) => (
            <button
              type="button"
              key={category.id}
              className={activeCategory === category.id ? 'is-active' : ''}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </nav>

        {!query && activeCategory === ALL_CATEGORIES && featuredApplications.length > 0 && (
          <section className="catalog-section catalog-featured" aria-labelledby="featured-title">
            <h2 id="featured-title">精选应用</h2>
            <div className="catalog-featured__grid">
              {featuredApplications.map((application, index) => (
                <article
                  key={application.id}
                  className={`featured-card featured-card--${index + 1}`}
                >
                  <button
                    type="button"
                    className="featured-card__main"
                    onClick={() => openApplication(application)}
                  >
                    <span className="featured-card__icon">{renderIcon(application)}</span>
                    <span className="featured-card__copy">
                      <strong>{application.name}</strong>
                      <small>{application.description || '暂无介绍'}</small>
                    </span>
                  </button>
                  <div className="featured-card__actions">
                    <button
                      type="button"
                      aria-label={`分享${application.name}`}
                      className="featured-card__share"
                      onClick={(event) => shareApplication(event, application)}
                    >
                      <SendOutline />
                    </button>
                    <button
                      type="button"
                      aria-label={`打开${application.name}`}
                      className="featured-card__enter"
                      onClick={() => openApplication(application)}
                    >
                      <RightOutline />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="catalog-section catalog-applications" aria-labelledby="applications-title">
          <div className="catalog-section__heading">
            <h2 id="applications-title">全部应用</h2>
            <div className="catalog-view-switch" role="group" aria-label="应用展示方式">
              <button
                type="button"
                aria-label="列表展示"
                aria-pressed={viewMode === 'list'}
                className={viewMode === 'list' ? 'is-active' : ''}
                onClick={() => setViewMode('list')}
              >
                <UnorderedListOutline />
              </button>
              <button
                type="button"
                aria-label="卡片展示"
                aria-pressed={viewMode === 'grid'}
                className={viewMode === 'grid' ? 'is-active' : ''}
                onClick={() => setViewMode('grid')}
              >
                <AppstoreOutline />
              </button>
            </div>
          </div>

          <PageState loading={loading} error={error} onRetry={loadCatalog}>
            {applications.length ? (
              <div className={`application-collection application-collection--${viewMode}`}>
                {applications.map((application) => (
                  <article
                    key={application.id}
                    className={`application-item${isAvailable(application) ? '' : ' application-item--pending'}`}
                    onClick={() => openApplication(application)}
                  >
                    <button
                      type="button"
                      className="application-item__main"
                      aria-label={`打开${application.name}`}
                    >
                      <span className="application-item__icon">{renderIcon(application)}</span>
                      <span className="application-item__content">
                        <span className="application-item__title-row">
                          <strong>{application.name}</strong>
                          {application.Category?.name && <small>{application.Category.name}</small>}
                        </span>
                        <span className="application-item__description">
                          {application.description || '暂无介绍'}
                        </span>
                      </span>
                    </button>
                    <div className="application-item__actions">
                      <button
                        type="button"
                        aria-label={`分享${application.name}`}
                        onClick={(event) => shareApplication(event, application)}
                      >
                        <SendOutline />
                      </button>
                      <RightOutline className="application-item__arrow" />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="catalog-empty">
                <MoreOutline fontSize={34} />
                <p>没有找到相关应用</p>
              </div>
            )}
          </PageState>
        </section>
      </main>

      <footer className="catalog-footer">Powered by <strong>TBTparent</strong></footer>
    </div>
  );
};

export default CatalogPage;
