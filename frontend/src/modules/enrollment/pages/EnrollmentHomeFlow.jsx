import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  Checkbox,
  Dialog,
  Input,
  SearchBar,
  Tag,
  Toast,
} from 'antd-mobile';
import {
  AppOutline,
  CalendarOutline,
  CheckCircleFill,
  ContentOutline,
  LocationOutline,
  RightOutline,
  TeamOutline,
} from 'antd-mobile-icons';
import {
  CATEGORIES,
  CURRENT_YEAR,
  SERVICE_ENTRIES,
  STAGES,
  getCategory,
  getStage,
} from '../domain/constants';
import useEnrollmentStore from '../store/enrollmentStore';
import enrollmentService from '../services';
import useSessionStore from '../../../shared/auth/sessionStore';
import {
  CompactNotice,
  ContactStrip,
  FixedActionBar,
  GovHero,
  SectionTitle,
  StatusTag,
  serviceIcons,
} from '../components';
import stageKindergarten from '../assets/reference/stage-kindergarten.png';
import stagePrimary from '../assets/reference/stage-primary.png';
import stageMiddle from '../assets/reference/stage-middle.png';
import categoryCity from '../assets/reference/category-city.png';
import categoryRural from '../assets/reference/category-rural.png';
import categoryPrivate from '../assets/reference/category-private.png';
import schoolRound from '../assets/reference/school-round.png';

const stageToneClass = {
  kindergarten: 'stage-entry--blue',
  primary: 'stage-entry--green',
  middle: 'stage-entry--orange',
};

const stageArtwork = { kindergarten: stageKindergarten, primary: stagePrimary, middle: stageMiddle };
const categoryArtwork = { urban: categoryCity, non_urban: categoryRural, private: categoryPrivate };

export const EnrollmentHomePage = () => {
  const navigate = useNavigate();
  const [portalYear, setPortalYear] = useState(CURRENT_YEAR);
  const application = useEnrollmentStore((state) => state.application);
  const [latestApplication, setLatestApplication] = useState(null);
  const [applicationLoadError, setApplicationLoadError] = useState('');
  const selectStage = useEnrollmentStore((state) => state.selectStage);

  useEffect(() => {
    enrollmentService.getPortal().then((portal) => setPortalYear(portal?.season?.year || CURRENT_YEAR));
    enrollmentService.listApplications()
      .then((items) => setLatestApplication(items[0] || null))
      .catch((error) => setApplicationLoadError(error.message || '报名记录加载失败'));
  }, []);
  const currentApplication = latestApplication || application;

  const start = (stageId) => {
    selectStage(stageId);
    navigate(`/enrollment/apply/${stageId}`);
  };

  return (
    <div className="enrollment-page enrollment-home">
      <GovHero eyebrow="教育服务" title={`${portalYear}年招生报名`} subtitle="入学报名 一站办理" visual="home" />

      <main className="enrollment-home__content">
        <SectionTitle>选择报名入口</SectionTitle>
        <div className="stage-entry-grid">
          {STAGES.map((stage, index) => (
            <button
              key={stage.id}
              className={`stage-entry ${stageToneClass[stage.id]}${index === 0 ? ' stage-entry--featured' : ''}`}
              type="button"
              onClick={() => start(stage.id)}
            >
              <img className="stage-entry__icon" src={stageArtwork[stage.id]} alt="" />
              <span className="stage-entry__copy">
                <strong>{stage.name}</strong>
                <small>{stage.description}</small>
              </span>
            </button>
          ))}
        </div>

        <SectionTitle action={currentApplication ? (
          <button className="home-section-action" type="button" onClick={() => navigate('/enrollment/applications')}>
            {currentApplication.hasUpdate && <span>有更新</span>}
            全部报名 <RightOutline />
          </button>
        ) : null}>
          我的报名
        </SectionTitle>
        {currentApplication ? (
          <>
            <Card className="application-summary" onClick={() => navigate(`/enrollment/applications/${currentApplication.id}`)}>
              <div className="application-summary__top">
                <strong>{currentApplication.maskedStudentName} <span>·</span> {currentApplication.schoolName}</strong>
                <StatusTag status={currentApplication.status} />
              </div>
              {currentApplication.status === '退回修改' ? (
                <div className="application-summary__action">
                  <span>请按老师意见补充报名信息</span>
                  <Button size="mini" color="primary" fill="outline">去修改</Button>
                </div>
              ) : (
                <p>{currentApplication.status === '初审通过' ? (currentApplication.offlineArrangement ? '线下审核安排已公布' : '线下审核安排待公布') : `${currentApplication.stageName} · ${currentApplication.categoryName}`}</p>
              )}
            </Card>
          </>
        ) : applicationLoadError ? (
          <CompactNotice type="warning">{applicationLoadError}</CompactNotice>
        ) : (
          <Card className="application-summary application-summary--empty">
            <p>暂无报名记录，请从上方选择报名入口开始办理。</p>
          </Card>
        )}

        <SectionTitle>招生服务</SectionTitle>
        <div className="service-entry-grid">
          {SERVICE_ENTRIES.map((entry) => {
            const Icon = serviceIcons[entry.id];
            return (
              <button key={entry.id} type="button" onClick={() => navigate(`/enrollment/${entry.id}`)}>
                <Icon />
                <strong>{entry.title}</strong>
                <span>{entry.description}</span>
              </button>
            );
          })}
        </div>
        <ContactStrip />
      </main>
    </div>
  );
};

export const CategoryPage = () => {
  const navigate = useNavigate();
  const { stageId } = useParams();
  const flow = useEnrollmentStore((state) => state.flow);
  const selectStage = useEnrollmentStore((state) => state.selectStage);
  const selectCategory = useEnrollmentStore((state) => state.selectCategory);
  const [selected, setSelected] = useState(flow.categoryId || CATEGORIES[0].id);

  useEffect(() => {
    if (stageId && stageId !== flow.stageId) selectStage(stageId);
  }, [flow.stageId, selectStage, stageId]);

  const currentStage = getStage(stageId || flow.stageId);

  const proceed = () => {
    selectCategory(selected);
    navigate('/enrollment/schools');
  };

  return (
    <div className="enrollment-page enrollment-page--with-actions category-page">
      <div className="stage-switcher-wrap">
        <strong>{CURRENT_YEAR}年招生</strong>
        <div className="stage-switcher" role="tablist" aria-label="报名学段">
          {STAGES.map((stage) => (
            <button
              type="button"
              role="tab"
              aria-selected={stage.id === currentStage.id}
              className={stage.id === currentStage.id ? 'is-active' : ''}
              key={stage.id}
              onClick={() => {
                selectStage(stage.id);
                navigate(`/enrollment/apply/${stage.id}`, { replace: true });
              }}
            >
              {stage.name}
            </button>
          ))}
        </div>
      </div>
      <main className="enrollment-content">
        <SectionTitle>请选择报名类别</SectionTitle>
        <p className="section-description">请根据拟报名学校所属类别选择</p>
        <div className="category-options">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`category-option category-option--${category.tone}${selected === category.id ? ' is-selected' : ''}`}
              onClick={() => setSelected(category.id)}
            >
              <img className="category-option__icon" src={categoryArtwork[category.id]} alt="" />
              <span><strong>{category.name}</strong><small>{category.description}</small></span>
              {selected === category.id ? <CheckCircleFill /> : <RightOutline />}
            </button>
          ))}
        </div>
      </main>
      <FixedActionBar>
        <Button block color="primary" size="large" onClick={proceed}>下一步 选择学校</Button>
      </FixedActionBar>
    </div>
  );
};

export const SchoolListPage = () => {
  const navigate = useNavigate();
  const flow = useEnrollmentStore((state) => state.flow);
  const selectSchool = useEnrollmentStore((state) => state.selectSchool);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(flow.schoolId || '');
  const [schoolSource, setSchoolSource] = useState([]);
  const stage = getStage(flow.stageId);
  const category = getCategory(flow.categoryId);

  useEffect(() => {
    enrollmentService.getSchools({ stage: flow.stageId, category: flow.categoryId })
      .then((items) => {
        setSchoolSource(items);
        setSelected((current) => current || items[0]?.id || '');
      })
      .catch((error) => Toast.show({ content: error.message || '学校列表加载失败' }));
  }, [flow.categoryId, flow.stageId]);

  const schools = useMemo(() => schoolSource.filter((school) => (
    school.categoryId === flow.categoryId
      && (!query.trim() || school.name.includes(query.trim()))
  )), [flow.categoryId, query, schoolSource]);

  const viewPolicy = (schoolId) => {
    const school = schoolSource.find((item) => item.id === schoolId);
    if (!school) return;
    selectSchool(school);
    navigate(`/enrollment/policy/${schoolId}`);
  };

  const proceed = () => {
    if (!selected) {
      Toast.show({ content: '请先选择学校' });
      return;
    }
    const school = schoolSource.find((item) => item.id === selected);
    if (!school) {
      Toast.show({ content: '请选择有效学校' });
      return;
    }
    selectSchool(school);
    navigate(`/enrollment/policy/${selected}`);
  };

  return (
    <div className="enrollment-page enrollment-page--with-actions">
      <div className="school-filter-bar">
        <p><CalendarOutline /> {CURRENT_YEAR}年 <span>·</span> {stage.name} <span>·</span> {category.name}</p>
        <SearchBar value={query} onChange={setQuery} placeholder="搜索学校名称" />
      </div>
      <main className="enrollment-content school-list-content">
        <p className="section-description">请选择目标学校，并仔细阅读招生政策</p>
        {schools.map((school) => (
          <Card
            key={school.id}
            className={`school-card${selected === school.id ? ' is-selected' : ''}`}
            onClick={() => setSelected(school.id)}
          >
            <div className="school-card__head">
              <img className="school-card__icon" src={schoolRound} alt="" />
              <div className="school-card__summary">
                <strong title={school.name}>{school.name}</strong>
                <Tag color="primary" fill="outline">{school.categoryId === 'private' ? '民办' : `${category.name}公办`}</Tag>
              </div>
              {selected === school.id ? <CheckCircleFill className="school-card__check" /> : <span className="school-card__radio" />}
            </div>
            <div className="school-card__facts">
              <p><LocationOutline /> {school.address}</p>
              <p><TeamOutline /> {school.scope}</p>
              <p><CalendarOutline /> {school.dates}</p>
            </div>
            <button
              type="button"
              className="school-card__policy"
              onClick={(event) => {
                event.stopPropagation();
                viewPolicy(school.id);
              }}
            >
              查看政策 <RightOutline />
            </button>
          </Card>
        ))}
        {!schools.length && <p className="section-description">暂无可选择的学校</p>}
      </main>
      <FixedActionBar>
        <Button block color="primary" size="large" onClick={proceed}>确认学校</Button>
      </FixedActionBar>
    </div>
  );
};

export const SchoolPolicyPage = () => {
  const navigate = useNavigate();
  const { schoolId } = useParams();
  const flow = useEnrollmentStore((state) => state.flow);
  const storedSchool = useEnrollmentStore((state) => state.selectedSchool);
  const selectSchool = useEnrollmentStore((state) => state.selectSchool);
  const acceptPolicy = useEnrollmentStore((state) => state.acceptPolicy);
  const [school, setSchool] = useState(
    storedSchool?.id === (schoolId || flow.schoolId)
      ? storedSchool
      : { id: schoolId || flow.schoolId, name: '学校信息加载中', policyVersion: '', scope: '' }
  );
  const stage = getStage(flow.stageId);
  const category = getCategory(flow.categoryId);
  const [checked, setChecked] = useState(flow.policyAccepted && school.id === flow.schoolId);
  const [policyLoaded, setPolicyLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    enrollmentService.getSchoolPolicy(schoolId || flow.schoolId).then((policySchool) => {
      setSchool(policySchool);
      selectSchool(policySchool);
      setPolicyLoaded(true);
      setLoadError('');
    }).catch((error) => {
      setPolicyLoaded(false);
      setLoadError(error.message || '学校政策加载失败');
    });
  }, [flow.schoolId, schoolId, selectSchool]);

  const proceed = () => {
    if (!policyLoaded) {
      Toast.show({ content: '学校政策尚未加载完成' });
      return;
    }
    if (!checked) {
      Toast.show({ content: '请勾选已阅读招生政策' });
      return;
    }
    acceptPolicy(true);
    navigate('/enrollment/preprocess');
  };

  return (
    <div className="enrollment-page enrollment-page--with-actions policy-page">
      <GovHero title={school.name} subtitle={`${CURRENT_YEAR}年 · ${stage.name} · ${category.name}`} compact visual="policy" />
      <main className="enrollment-content">
        {loadError && <CompactNotice type="warning">{loadError}</CompactNotice>}
        <article className="policy-article">
          <header>
            <h1>{school.policyTitle || `${school.name}${CURRENT_YEAR}年招生报名须知`}</h1>
            <p>适用年度：{CURRENT_YEAR}年 <span /> 政策版本：{school.policyVersion}</p>
          </header>
          {(school.policyContent?.sections || []).map((section, index) => (
            <section key={`${section.title}-${index}`}>
              <h2>{section.title}</h2>
              {(section.paragraphs || []).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {(section.items || []).length > 0 && (
                <ol>{section.items.map((item) => <li key={item}>{item}</li>)}</ol>
              )}
            </section>
          ))}
          {policyLoaded && (school.policyContent?.sections || []).length === 0 && <CompactNotice type="info">该学校暂无补充政策内容。</CompactNotice>}
          {policyLoaded && <div className="policy-read-end"><CheckCircleFill /> 已阅读至底部</div>}
        </article>
      </main>
      <FixedActionBar>
        <div className="policy-confirm">
          <Checkbox checked={checked} onChange={setChecked}>我已阅读并理解上述招生政策</Checkbox>
          <Button block color="primary" size="large" disabled={!policyLoaded} onClick={proceed}>同意并继续</Button>
        </div>
      </FixedActionBar>
    </div>
  );
};

export const PreprocessPage = () => {
  const navigate = useNavigate();
  const testStudent = useSessionStore((state) => state.user?.testProfile?.student);
  const flow = useEnrollmentStore((state) => state.flow);
  const selectedSchool = useEnrollmentStore((state) => state.selectedSchool);
  const completePreprocess = useEnrollmentStore((state) => state.completePreprocess);
  const syncServerApplication = useEnrollmentStore((state) => state.syncServerApplication);
  const hydrateDraftFromServer = useEnrollmentStore((state) => state.hydrateDraftFromServer);
  const [authorized, setAuthorized] = useState(flow.dataAuthorized);
  const [querying, setQuerying] = useState(false);
  const [queryName, setQueryName] = useState(testStudent?.name || '');
  const [queryDocument, setQueryDocument] = useState(testStudent?.documentNumber || '');
  const stage = getStage(flow.stageId);
  const category = getCategory(flow.categoryId);
  const school = selectedSchool;

  if (!school) {
    return (
      <div className="enrollment-page preprocess-page">
        <main className="enrollment-content"><CompactNotice type="warning">请先选择学校并阅读招生政策。</CompactNotice></main>
      </div>
    );
  }

  const runQuery = async () => {
    if (!authorized) {
      Toast.show({ content: '请先阅读并同意数据查询授权说明' });
      return;
    }
    if (!queryName.trim() || queryDocument.trim().length < 6) {
      Toast.show({ content: '请补充学生姓名和证件号码' });
      return;
    }
    setQuerying(true);
    try {
      const application = await enrollmentService.createDraft({
        schoolId: school.id,
        studentName: queryName.trim(),
        studentIdNumber: queryDocument.trim(),
      });
      syncServerApplication(application);
      const policyConfirmed = await enrollmentService.confirmPolicy(application.id, school.policyVersion);
      syncServerApplication(policyConfirmed);
      const verificationTypes = school.formRules?.verificationTypes;
      const verificationResult = await enrollmentService.runVerifications(application.id, verificationTypes);
      syncServerApplication(verificationResult.application);
      hydrateDraftFromServer(verificationResult.application, verificationResult.results);
      completePreprocess();
      const resultCount = (verificationResult.results || []).filter((result) => result.status === 'success').length;
      await Dialog.alert({
        bodyClassName: 'verification-dialog',
        maskClassName: 'verification-dialog-mask',
        title: (
          <div className="verification-dialog-title">
            <span><CheckCircleFill /></span>
            <strong>共享数据查询完成</strong>
            <small>已为你获取 {resultCount} 项信息并自动带入</small>
          </div>
        ),
        content: (
          <div className="verification-dialog-results">
            {(verificationResult.results || []).map((result) => (
              <div className={result.status === 'success' ? 'is-success' : 'is-pending'} key={result.type}>
                <i><CheckCircleFill /></i>
                <span>
                  <strong>{result.label || result.type}</strong>
                  <small>{result.summary || '查询完成'}</small>
                </span>
                <em>{result.status === 'success' ? '已获取' : '待补充'}</em>
              </div>
            ))}
            <p>查询结果已自动带入报名信息，仍可在填写时核对和修改。</p>
          </div>
        ),
        confirmText: '进入报名信息',
      });
      navigate('/enrollment/overview', { replace: true });
    } catch (error) {
      Toast.show({ content: error.message || '共享数据查询失败，请稍后重试' });
    } finally {
      setQuerying(false);
    }
  };

  return (
    <div className="enrollment-page preprocess-page">
      <main className="enrollment-content">
        <div className="flow-context"><AppOutline /> {school.name} <span>·</span> {CURRENT_YEAR}年{stage.name} <span>·</span> <LocationOutline /> {category.name}</div>
        <GovHero title="先查询共享数据，填写更省心" subtitle="补充少量查询信息，结果将在进入报名表时自动带入" compact visual="preprocess" />

        <SectionTitle>填写查询信息</SectionTitle>
        <div className="manual-query-fields">
          <label>学生姓名<Input value={queryName} onChange={setQueryName} placeholder="请输入学生姓名" /></label>
          <label>学生证件号码<Input value={queryDocument} onChange={setQueryDocument} placeholder="请输入完整证件号码" /></label>
        </div>

        <SectionTitle>本次查询内容</SectionTitle>
        <div className="query-scope-list">
          {(school.formRules?.verificationItems || []).map((item) => (
            <div key={item.type}><ContentOutline /><span>{item.label}{item.optional ? '（按需）' : ''}</span><RightOutline /></div>
          ))}
        </div>

        <Checkbox checked={authorized} onChange={setAuthorized} className="authorization-check">
          我已阅读并同意《数据查询授权说明》
        </Checkbox>
        <p className="authorization-tip">查询结果仅用于辅助填写，是否符合招生条件由学校老师审核</p>
        <Button block color="primary" size="large" loading={querying} onClick={runQuery}>授权并查询共享数据</Button>

      </main>
    </div>
  );
};
