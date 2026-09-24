import { useMemo } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Toast } from 'antd-mobile';
import {
  CheckShieldOutline,
  ContentOutline,
  CouponOutline,
  FileOutline,
  FillinOutline,
  LeftOutline,
  LinkOutline,
  RightOutline,
  ShopbagOutline,
} from 'antd-mobile-icons';
import { appConfig } from '../../../app/config/env';
import { applicationModules, resolveApplicationAddress } from '../../../app/registry/applications';
import './application-overview.css';

const LOGOS = {
  BookOpen: FileOutline,
  Content: ContentOutline,
  Coupon: CouponOutline,
  GraduationCap: FillinOutline,
  Shopbag: ShopbagOutline,
};

const ApplicationOverviewPage = () => {
  const navigate = useNavigate();
  const { applicationId } = useParams();
  const application = applicationModules.find(({ id }) => id === applicationId);
  const address = useMemo(() => {
    if (!application) return { displayUrl: '', copyUrl: '' };
    return resolveApplicationAddress(application.path, {
      publicSiteUrl: appConfig.publicSiteUrl,
      currentOrigin: window.location.origin,
      basePath: appConfig.routerBaseName,
    });
  }, [application]);

  if (!application) return <Navigate to="/" replace />;

  const { profile } = application;
  const Logo = LOGOS[profile.logo] || CheckShieldOutline;
  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address.copyUrl);
      Toast.show({ content: '访问地址已复制' });
    } catch {
      Toast.show({ content: '复制失败，请手动复制' });
    }
  };

  return (
    <div className="app-overview">
      <header className="app-overview__nav">
        <button type="button" onClick={() => navigate('/')} aria-label="返回应用市场">
          <LeftOutline />
          <span>应用市场</span>
        </button>
        <small>APP PROFILE</small>
      </header>

      <main>
        <section className="app-overview__hero" aria-labelledby="app-overview-title">
          <div className="app-overview__logo" aria-hidden="true"><Logo /></div>
          <div className="app-overview__identity">
            <span>READY TO EXPERIENCE</span>
            <h1 id="app-overview-title">{profile.name}</h1>
            <p>{profile.tagline}</p>
          </div>
          <span className="app-overview__number">{String(applicationModules.indexOf(application) + 1).padStart(2, '0')}</span>
        </section>

        <section className="app-overview__address" aria-labelledby="app-address-title">
          <div className="app-overview__section-heading">
            <LinkOutline aria-hidden="true" />
            <h2 id="app-address-title">访问地址</h2>
          </div>
          <div className="app-overview__address-row">
            <a href={address.copyUrl}>{address.displayUrl}</a>
            <button type="button" onClick={copyAddress} aria-label="复制访问地址"><LinkOutline /><span>复制</span></button>
          </div>
        </section>

        <section className="app-overview__story" aria-labelledby="app-business-title">
          <div className="app-overview__section-heading">
            <span>01</span>
            <h2 id="app-business-title">业务介绍</h2>
          </div>
          <p>{profile.businessIntroduction}</p>
        </section>

        <section className="app-overview__features" aria-labelledby="app-features-title">
          <div className="app-overview__section-heading">
            <span>02</span>
            <h2 id="app-features-title">包含功能</h2>
          </div>
          <ol>
            {profile.features.map((feature, index) => (
              <li key={feature}><b>{String(index + 1).padStart(2, '0')}</b><span>{feature}</span></li>
            ))}
          </ol>
        </section>

        <section className="app-overview__problem" aria-labelledby="app-problem-title">
          <div className="app-overview__section-heading">
            <span>03</span>
            <h2 id="app-problem-title">解决什么问题</h2>
          </div>
          <p>{profile.problemStatement}</p>
        </section>

        <section className="app-overview__entry" aria-label="进入应用">
          <p>以上是应用简介，接下来将进入可交互的演示环境。</p>
          <button type="button" onClick={() => navigate(application.path)}>
            <span>进入应用</span>
            <RightOutline />
          </button>
        </section>
      </main>
    </div>
  );
};

export default ApplicationOverviewPage;
