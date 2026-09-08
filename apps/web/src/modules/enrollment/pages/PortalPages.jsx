import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  Dialog,
  Input,
  Picker,
  SearchBar,
  Tabs,
  Toast,
} from 'antd-mobile';
import {
  AppOutline,
  CalendarOutline,
  CheckCircleFill,
  CheckShieldOutline,
  ContentOutline,
  DownOutline,
  ExclamationCircleOutline,
  FileOutline,
  LocationOutline,
  RightOutline,
  UserCircleOutline,
} from 'antd-mobile-icons';
import {
  CATEGORIES,
  CURRENT_YEAR,
  STAGES,
} from '../domain/constants';
import useEnrollmentStore from '../store/enrollmentStore';
import enrollmentService from '../services';
import {
  CompactNotice,
  GovHero,
  SectionTitle,
  ServiceHero,
  StatusTag,
} from '../components';

const formatDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const formatDateRange = (startsAt, endsAt) => {
  const start = formatDateTime(startsAt);
  const end = formatDateTime(endsAt);
  return start && end ? `${start} 至 ${end}` : start || end || '待公布';
};

const formatScheduleDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: String(value || '待公布'), time: '' };
  return {
    date: date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replaceAll('/', '.'),
    time: date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
  };
};

const formatList = (value) => Array.isArray(value) ? value.join('、') : value;

const applicationStatusClass = {
  待提交: 'draft',
  审核中: 'reviewing',
  退回修改: 'returned',
  初审通过: 'approved',
  初审不通过: 'rejected',
  已录取: 'admitted',
};

const GUIDE_STEP_ICONS = [AppOutline, ContentOutline, CheckShieldOutline, FileOutline, CheckCircleFill, UserCircleOutline];

export const ApplicationListPage = () => {
  const navigate = useNavigate();
  const fallbackApplication = useEnrollmentStore((state) => state.application);
  const [source, setSource] = useState(fallbackApplication ? [fallbackApplication] : []);
  const [studentName, setStudentName] = useState('all');
  const [stageId, setStageId] = useState('all');
  const [loadError, setLoadError] = useState('');
  const applications = useMemo(() => source.filter((application) => (
    (studentName === 'all' || application.studentName === studentName)
    && (stageId === 'all' || application.stage === stageId)
  )), [source, stageId, studentName]);
  const studentOptions = [
    { label: '全部学生', value: 'all' },
    ...[...new Set(source.map((item) => item.studentName).filter(Boolean))].map((name) => ({ label: name, value: name })),
  ];

  useEffect(() => {
    setLoadError('');
    enrollmentService.listApplications()
      .then(setSource)
      .catch((error) => setLoadError(error.message || '报名记录加载失败'));
  }, [fallbackApplication]);
  return (
    <div className="enrollment-page">
      <main className="enrollment-content application-list-page">
        <section className="application-filter-panel">
          <strong><CalendarOutline /> {CURRENT_YEAR}年招生</strong>
          <div className="application-filter-controls">
            <Picker
              columns={[studentOptions]}
              value={[studentName]}
              onConfirm={(value) => setStudentName(value[0])}
              title="选择学生"
            >
              {(items, actions) => (
                <button type="button" className="application-filter-trigger" aria-label="筛选学生" onClick={actions.open}>
                  <span>{items[0]?.label || '全部学生'}</span><DownOutline />
                </button>
              )}
            </Picker>
            <Picker
              columns={[[{ label: '全部学段', value: 'all' }, ...STAGES.map((stage) => ({ label: stage.shortName, value: stage.id }))]]}
              value={[stageId]}
              onConfirm={(value) => setStageId(value[0])}
              title="选择学段"
            >
              {(items, actions) => (
                <button type="button" className="application-filter-trigger" aria-label="筛选学段" onClick={actions.open}>
                  <span>{items[0]?.label || '全部学段'}</span><DownOutline />
                </button>
              )}
            </Picker>
          </div>
          <p>默认展示当前招生年度报名</p>
        </section>
        {loadError && <CompactNotice type="warning">{loadError}</CompactNotice>}
        {!loadError && applications.length === 0 && <CompactNotice type="info">暂无报名记录</CompactNotice>}
        <div className="application-list">
          {applications.map((application) => (
            <Card key={application.id} className={`application-list-card application-list-card--${applicationStatusClass[application.status] || 'draft'}`} onClick={() => navigate(`/enrollment/applications/${application.id}`)}>
              <div className="application-list-card__head">
                <span><UserCircleOutline /></span>
                <div><strong>{application.studentName}</strong><small>{application.schoolName}</small></div>
                <div className="application-list-card__status">
                  <StatusTag status={application.status} />
                  {application.hasUpdate && <em>有更新</em>}
                </div>
              </div>
              <div className="application-list-card__meta">
                <p><span>报名类型</span><strong>{application.stageName} <i>·</i> {application.categoryName}</strong></p>
                <p><span>报名编号</span><strong title={application.applicationNumber || application.id}>{application.applicationNumber || application.id}</strong></p>
                <p><span>更新时间</span><strong>{formatDateTime(application.updatedAt)}</strong></p>
              </div>
              <button type="button">查看详情</button>
            </Card>
          ))}
        </div>
        <CompactNotice type="info">历史报名记录长期保留，提交后的记录只读展示。</CompactNotice>
      </main>
    </div>
  );
};

export const ApplicationDetailPage = () => {
  const navigate = useNavigate();
  const { applicationId } = useParams();
  const fallbackApplication = useEnrollmentStore((state) => state.application);
  const [application, setApplication] = useState(fallbackApplication?.id === applicationId ? fallbackApplication : null);
  const [loadError, setLoadError] = useState('');
  const markRead = useEnrollmentStore((state) => state.markApplicationRead);
  const hydrateDraftFromServer = useEnrollmentStore((state) => state.hydrateDraftFromServer);

  useEffect(() => {
    enrollmentService.getApplication(applicationId).then((record) => {
      setApplication(record);
      hydrateDraftFromServer(record, record.verifications || []);
    }).catch((error) => setLoadError(error.message || '报名详情加载失败'));
  }, [applicationId, hydrateDraftFromServer]);

  useEffect(() => () => markRead(), [markRead]);

  if (!application) {
    return (
      <div className="enrollment-page application-detail-page">
        <main className="enrollment-content"><CompactNotice type={loadError ? 'warning' : 'info'}>{loadError || '正在加载报名详情…'}</CompactNotice></main>
      </div>
    );
  }

  const statusMessage = {
    待提交: '报名尚未提交，请继续完善信息',
    审核中: '学校老师正在审核报名信息',
    退回修改: '请根据老师意见补充后重新提交',
    初审通过: '已进入线下审核范围',
    初审不通过: '可查看原因并重新报名其他学校',
    已录取: '录取结果已统一发布',
  }[application.status];
  const detailStatusTone = {
    待提交: 'draft',
    审核中: 'reviewing',
    退回修改: 'warning',
    初审不通过: 'danger',
  }[application.status] || 'success';
  const detailStatusStamp = {
    待提交: '草稿',
    审核中: '审核',
    退回修改: '退回',
    初审通过: '通过',
    初审不通过: '未通过',
    已录取: '录取',
  }[application.status];

  const handleDelete = () => {
    Dialog.confirm({
      content: '确定要删除这条报名记录吗？删除后无法恢复。',
      confirmText: '删除',
      cancelText: '取消',
      onConfirm: () => {
        enrollmentService.deleteApplication(applicationId).then(() => {
          Toast.show({ content: '已删除' });
          navigate('/enrollment/applications');
        }).catch((error) => {
          Toast.show({ content: error.message || '删除失败' });
        });
      },
    });
  };

  return (
    <div className="enrollment-page application-detail-page">
      <main className="enrollment-content">
        <section className={`detail-status detail-status--${detailStatusTone}`}>
          <div className="detail-status__stamp" aria-hidden="true">
            <b>{detailStatusStamp}</b>
            <i>招生报名</i>
          </div>
          <div><h1>{application.status}</h1><p>{statusMessage}</p>{application.status === '初审通过' && <strong>{application.offlineArrangement ? '线下审核安排已公布' : '线下审核安排待公布'}</strong>}</div>
          {application.hasUpdate && <span>有更新</span>}
        </section>

        <Card className="student-application-card">
          <div className="student-application-card__inner">
            <span className="student-application-card__avatar"><UserCircleOutline /></span>
            <div className="student-application-card__copy">
              <h2>{application.studentName}</h2>
              <p>{application.schoolName}</p>
              <p>{application.stageName} <span>·</span> {application.categoryName}</p>
              <small title={application.applicationNumber || application.id}>报名号：{application.applicationNumber || application.id}</small>
            </div>
          </div>
        </Card>

        <SectionTitle>报名信息</SectionTitle>
        <div className="detail-link-list">
          {['学生信息', '监护人信息', '户籍信息', '房产及居住信息', '材料信息'].map((label) => (
            <button type="button" key={label} onClick={() => navigate('/enrollment/review?readonly=1')}><ContentOutline />{label}<span>查看 <RightOutline /></span></button>
          ))}
        </div>

        <SectionTitle>审核信息</SectionTitle>
        <Card className="review-summary-card">
          <CheckCircleFill />
          <strong>{application.status}</strong>
          <span>更新时间：{formatDateTime(application.updatedAt) || '暂无'}</span>
        </Card>

        {application.reviewMessage && <CompactNotice type={application.status === '初审不通过' ? 'warning' : 'info'}>审核意见：{application.reviewMessage}</CompactNotice>}
        {application.returnedFields?.length > 0 && <CompactNotice type="warning">需修改：{application.returnedFields.join('、')}</CompactNotice>}
        {application.offlineArrangement ? (
          <div className="offline-arrangement">
            <p><CalendarOutline /><strong>审核时间</strong>{formatDateRange(application.offlineArrangement.startsAt, application.offlineArrangement.endsAt)}</p>
            <p><LocationOutline /><strong>审核地点</strong>{application.offlineArrangement.location}</p>
            {application.offlineArrangement.materials && <p><FileOutline /><strong>携带材料</strong>{formatList(application.offlineArrangement.materials)}</p>}
            {application.offlineArrangement.notes && <p><ExclamationCircleOutline /><strong>注意事项</strong>{application.offlineArrangement.notes}</p>}
          </div>
        ) : application.status === '初审通过' ? <CompactNotice type="info">线下审核安排待统一公布。</CompactNotice> : null}

        {application.status === '审核中' && <CompactNotice type="info">报名已成功提交，请耐心等待学校审核。</CompactNotice>}
        <div className="application-detail-actions">
          {['待提交', '退回修改'].includes(application.status) && <Button block color="primary" size="large" onClick={() => navigate('/enrollment/overview')}>继续完善报名</Button>}
          {application.status === '待提交' && <Button block className="delete-application-btn" size="large" fill="outline" onClick={handleDelete}>删除报名记录</Button>}
          <Button block className="back-to-list-btn" size="large" fill="outline" onClick={() => navigate('/enrollment/applications')}>返回我的报名</Button>
        </div>
      </main>
    </div>
  );
};

export const SchedulePage = () => {
  const [stageId, setStageId] = useState('primary');
  const [windows, setWindows] = useState([]);
  const [loadError, setLoadError] = useState('');
  const currentStage = STAGES.find((stage) => stage.id === stageId) || STAGES[0];

  useEffect(() => {
    setLoadError('');
    enrollmentService.getWindows({ stage: stageId })
      .then(setWindows)
      .catch((error) => {
        setWindows([]);
        setLoadError(error.message || '报名时间加载失败');
      });
  }, [stageId]);

  return (
    <div className="enrollment-page service-page schedule-page">
      <ServiceHero title="报名时间" subtitle="查看各学段报名开始与截止时间" />
      <main className="enrollment-content">
        <Tabs className="service-tabs schedule-stage-tabs" activeKey={stageId} onChange={setStageId}>
          {STAGES.map((stage) => <Tabs.Tab title={stage.shortName} key={stage.id} />)}
        </Tabs>
        {loadError && <CompactNotice type="warning">{loadError}</CompactNotice>}
        {!loadError && windows.length > 0 && <SectionTitle>{currentStage.shortName}报名安排</SectionTitle>}
        <div className="schedule-list service-card-list">
          {!loadError && CATEGORIES.map((category, index) => {
            const current = windows.find((item) => item.category === category.id);
            if (!current) return null;
            const start = formatScheduleDate(current.startsAt);
            const end = formatScheduleDate(current.endsAt);
            return (
              <article className={`schedule-card schedule-card--${category.tone}`} key={category.id}>
                <header>
                  <span>{index + 1}</span>
                  <div><strong>{category.name}</strong><small>{category.description}</small></div>
                </header>
                <div className="schedule-card__times">
                  <div>
                    <span>开始时间</span>
                    <time><strong>{start.date}</strong><small>{start.time}</small></time>
                  </div>
                  <i aria-hidden="true" />
                  <div>
                    <span>截止时间</span>
                    <time><strong>{end.date}</strong><small>{end.time}</small></time>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {!loadError && windows.length === 0 && <CompactNotice type="info">当前学段暂无报名时间安排。</CompactNotice>}
        <CompactNotice type="info">具体材料要求请查看当年招生政策。</CompactNotice>
      </main>
    </div>
  );
};

export const PoliciesPage = () => {
  const [policy, setPolicy] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    enrollmentService.getContents({ type: 'policy' })
      .then((contents) => setPolicy(contents?.[0] || null))
      .catch((error) => setLoadError(error.message || '招生政策加载失败'));
  }, []);

  return (
    <div className="enrollment-page service-page policy-document-page">
      <ServiceHero title="招生政策" subtitle="查看本年度招生报名政策说明" />
      <main className="enrollment-content">
        {loadError && <CompactNotice type="warning">{loadError}</CompactNotice>}
        {policy && (
          <article className="policy-document">
            <header className="policy-document__header">
              <span>招生政策</span>
              <h1>{policy.title}</h1>
              <p>{policy.summary}</p>
              <div><time>{CURRENT_YEAR}年发布</time><i />适用于本年度招生报名</div>
            </header>
            <div className="policy-document__body">
              {policy.content?.sections?.map((section) => (
                <section key={section.title}>
                  <h2>{section.title}</h2>
                  {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  {section.items?.length > 0 && <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul>}
                </section>
              ))}
            </div>
          </article>
        )}
        {!loadError && !policy && <CompactNotice type="info">暂无招生政策。</CompactNotice>}
      </main>
    </div>
  );
};

export const FaqPage = () => {
  const [query, setQuery] = useState('');
  const [source, setSource] = useState([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    enrollmentService.getFaqs()
      .then(setSource)
      .catch((error) => setLoadError(error.message || '常见问答加载失败'));
  }, []);

  const items = source.filter((item) => (
    !query.trim() || `${item.title}${item.content?.answer || ''}`.includes(query.trim())
  ));
  return (
    <div className="enrollment-page service-page content-page faq-page">
      <ServiceHero title="常见问答" subtitle="查看招生报名常见问题解答" />
      <div className="sticky-search faq-search"><SearchBar value={query} onChange={setQuery} placeholder="搜索报名问题" /></div>
      <main className="enrollment-content">
        {loadError && <CompactNotice type="warning">{loadError}</CompactNotice>}
        <div className="faq-list service-card-list">
          {items.map((item) => (
            <article className="faq-item" key={item.id}>
              <header><span>问</span><h2>{item.title}</h2></header>
              <div className="faq-answer"><span>答</span><p>{item.content?.answer || item.summary}</p></div>
            </article>
          ))}
        </div>
        {!loadError && items.length === 0 && <CompactNotice type="info">暂无匹配问答。</CompactNotice>}
      </main>
    </div>
  );
};

export const DistrictLookupPage = () => {
  const [mode, setMode] = useState('map');
  const [address, setAddress] = useState('');
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    enrollmentService.searchDistrict({ mode: 'map' })
      .then((data) => setRegions(data?.regions || []))
      .catch((error) => setSearchError(error.message || '学区数据加载失败'));
  }, []);

  const runSearch = async (query) => {
    setSearching(true);
    setSearchError('');
    try {
      setResult(await enrollmentService.searchDistrict(query));
      setSearched(true);
    } catch (error) {
      setResult(null);
      setSearched(true);
      setSearchError(error.message || '学区查询失败');
    } finally {
      setSearching(false);
    }
  };

  const searchAddress = () => {
    if (!address.trim()) {
      Toast.show({ content: '请输入查询地址' });
      return;
    }
    runSearch({ keyword: address.trim() });
  };

  const selectRegion = (region) => {
    setSelectedRegion(region);
    runSearch({ regionId: region.id, keyword: region.name });
  };

  const changeMode = (key) => {
    setMode(key);
    setSelectedRegion(null);
    setSearched(false);
    setResult(null);
    setSearchError('');
  };

  return (
    <div className="enrollment-page service-page content-page district-lookup-page">
      <ServiceHero title="查询学区范围" subtitle="通过区域地图或房屋地址查询" />
      <main className="enrollment-content">
        <Tabs className="service-tabs district-query-tabs" activeKey={mode} onChange={changeMode}>
          <Tabs.Tab title="区域地图" key="map">
            <div className="district-region-map" aria-label="学区划分地图">
              <div className="district-region-map__water" aria-hidden="true" />
              <div className="district-region-map__areas">
                {regions.map((region, index) => (
                  <button
                    type="button"
                    key={region.id}
                    className={`district-region district-region--${index + 1} ${selectedRegion?.id === region.id ? 'is-selected' : ''}`}
                    onClick={() => selectRegion(region)}
                  >
                    <span>{region.name}</span>
                  </button>
                ))}
              </div>
              <div className="district-region-map__legend"><i />学区划分区域<span>点击地图区域查看详情</span></div>
            </div>
            {selectedRegion && (
              <section className="district-region-summary">
                <strong>{selectedRegion.name}</strong>
                <p>{selectedRegion.description}</p>
              </section>
            )}
          </Tabs.Tab>
          <Tabs.Tab title="房屋地址" key="address">
            <div className="district-search-box">
              <LocationOutline />
              <Input value={address} onChange={setAddress} placeholder="请输入小区、道路或详细地址" />
            </div>
            <Button block color="primary" size="large" loading={searching} onClick={searchAddress}>查询学区</Button>
          </Tabs.Tab>
        </Tabs>
        {searchError && <CompactNotice type="warning">{searchError}</CompactNotice>}
        {searched && (
          <div className="district-result-list">
            <SectionTitle>{mode === 'map' ? '学区内学校' : '可能对应的学校'}</SectionTitle>
            {(result?.schools || []).map((school) => (
              <Card key={school.id}>
                <h3><AppOutline /> {school.name}</h3>
                <p><strong>招生范围</strong>{school.scopeSummary}</p>
                <p><strong>学校地址</strong>{school.address}</p>
              </Card>
            ))}
            {!searchError && (result?.schools || []).length === 0 && <CompactNotice type="info">暂未查到匹配学校。</CompactNotice>}
          </div>
        )}
        <CompactNotice type="warning">{result?.notice || '查询结果仅供参考，请以当年招生政策和学校审核为准。'}</CompactNotice>
      </main>
    </div>
  );
};

export const PropertyDegreeLookupPage = () => {
  const [mode, setMode] = useState('address');
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const changeMode = (key) => {
    setMode(key);
    setValue('');
    setResult(null);
    setSearchError('');
  };

  const search = async () => {
    if (!value.trim()) {
      Toast.show({ content: mode === 'address' ? '请输入房产地址' : '请输入不动产权证号' });
      return;
    }
    setSearching(true);
    setSearchError('');
    try {
      setResult(await enrollmentService.searchPropertyDegree({ type: mode, keyword: value.trim() }));
    } catch (error) {
      setResult(null);
      setSearchError(error.message || '房产学位查询失败');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="enrollment-page service-page content-page property-degree-page">
      <ServiceHero title="房产学位查询" subtitle="查询房产对应学位占用情况" />
      <main className="enrollment-content">
        <Tabs className="service-tabs property-degree-tabs" activeKey={mode} onChange={changeMode}>
          <Tabs.Tab title="房产地址" key="address" />
          <Tabs.Tab title="产权证号" key="certificate" />
        </Tabs>
        <Card className="service-query-card">
          <label>{mode === 'address' ? '房产地址' : '不动产权证号'}</label>
          <div>{mode === 'address' ? <LocationOutline /> : <ContentOutline />}<Input value={value} onChange={setValue} placeholder={mode === 'address' ? '请输入小区、道路或详细地址' : '请输入不动产权证号'} /></div>
          <Button block color="primary" size="large" loading={searching} onClick={search}>查询学位占用情况</Button>
        </Card>
        {searchError && <CompactNotice type="warning">{searchError}</CompactNotice>}
        {result && (
          <div className="property-degree-result service-card-list">
            <SectionTitle>查询结果</SectionTitle>
            <Card className={`property-degree-status property-degree-status--${result.degree?.status}`}>
              <div className="property-degree-result__status">
                {result.degree?.status === 'occupied' ? <ExclamationCircleOutline /> : <CheckCircleFill />}
                <div><strong>{result.degree?.label}</strong></div>
              </div>
              <p><span>查询方式</span>{result.queryType === 'address' ? '房产地址' : '产权证号'}</p>
              <p><span>查询内容</span>{result.queryValue}</p>
              {result.degree?.status === 'occupied' && <p><span>占用年度</span>{result.degree.year}</p>}
              {result.degree?.status === 'occupied' && <p><span>占用学段</span>{result.degree.stage}</p>}
            </Card>
          </div>
        )}
        <CompactNotice type="warning">{result?.notice || '查询结果仅供参考，最终以教育主管部门核验结果为准。'}</CompactNotice>
      </main>
    </div>
  );
};

export const GuidePage = () => {
  const [stageId, setStageId] = useState('primary');
  const [guides, setGuides] = useState([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    setLoadError('');
    enrollmentService.getGuides({ stage: stageId })
      .then(setGuides)
      .catch((error) => {
        setGuides([]);
        setLoadError(error.message || '操作指南加载失败');
      });
  }, [stageId]);

  const guide = guides[0];
  const steps = guide?.content?.steps || [];
  return (
    <div className="enrollment-page service-page content-page guide-page">
      <ServiceHero title="招生报名操作指南" subtitle="查看不同学段的报名操作流程" />
      <main className="enrollment-content">
        <Tabs className="service-tabs guide-stage-tabs" activeKey={stageId} onChange={setStageId}>
          {STAGES.map((stage) => <Tabs.Tab title={stage.shortName} key={stage.id} />)}
        </Tabs>
        {loadError && <CompactNotice type="warning">{loadError}</CompactNotice>}
        <div className="guide-steps service-card-list">
          {steps.map((step, index) => {
            const item = typeof step === 'string' ? { title: step, description: '', tip: '' } : step;
            const StepIcon = GUIDE_STEP_ICONS[index] || ContentOutline;
            return (
              <section className={`guide-step-card guide-step-card--${(index % 3) + 1}`} key={item.title}>
                <div className="guide-step-card__visual">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <StepIcon />
                  <i /><i />
                </div>
                <div className="guide-step-card__content">
                  <em>第{index + 1}步</em>
                  <h2>{item.title}</h2>
                  {item.description && <p>{item.description}</p>}
                  {item.tip && <small>{item.tip}</small>}
                </div>
              </section>
            );
          })}
        </div>
        {!loadError && steps.length === 0 && <CompactNotice type="info">当前学段暂无操作指南。</CompactNotice>}
        <CompactNotice type="info">部门数据只用于辅助填写，最终资格由学校老师审核。</CompactNotice>
      </main>
    </div>
  );
};

export const PublicQueryPage = () => {
  const navigate = useNavigate();
  const { type } = useParams();
  const finalQuery = type === 'final';
  const [name, setName] = useState('');
  const [documentSuffix, setDocumentSuffix] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaInfo, setCaptchaInfo] = useState({ token: '', image: '' });
  const [captchaLoading, setCaptchaLoading] = useState(true);
  const [captchaError, setCaptchaError] = useState('');
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState(false);
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    let active = true;
    enrollmentService.getCaptcha().then((data) => {
      if (!active) return;
      setCaptchaInfo(data);
      setCaptchaError('');
    }).catch((error) => {
      if (active) setCaptchaError(error.message || '验证码加载失败');
    }).finally(() => {
      if (active) setCaptchaLoading(false);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    setResult(false);
    setResultData(null);
    setCaptcha('');
  }, [type]);

  const search = async () => {
    if (!name.trim() || documentSuffix.trim().length !== 6 || !captcha.trim() || !captchaInfo.token) {
      Toast.show({ content: '未查询到匹配结果或信息有误' });
      return;
    }
    setSearching(true);
    setResult(false);
    try {
      const data = await enrollmentService.publicQuery(type, {
        studentName: name.trim(),
        studentIdLastSix: documentSuffix.trim(),
        captchaToken: captchaInfo.token,
        captchaCode: captcha.trim(),
      });
      setResultData(data);
      setResult(true);
    } catch {
      Toast.show({ content: '未查询到匹配结果或信息有误' });
      await refreshCaptcha();
    } finally {
      setSearching(false);
    }
  };

  const refreshCaptcha = async () => {
    setCaptchaLoading(true);
    setCaptchaError('');
    try {
      setCaptchaInfo(await enrollmentService.getCaptcha());
      setCaptcha('');
    } catch (error) {
      setCaptchaInfo({ token: '', image: '' });
      setCaptchaError(error.message || '验证码加载失败');
    } finally {
      setCaptchaLoading(false);
    }
  };

  const arrangement = resultData?.offlineArrangement;

  return (
    <div className="enrollment-page public-query-page">
      <GovHero title={finalQuery ? '录取结果查询' : '初审公示查询'} subtitle={`${CURRENT_YEAR}年招生报名`} visual="public" />
      <main className="enrollment-content">
        <Card className="public-query-card">
          <SectionTitle>请输入学生信息</SectionTitle>
          <label>学生姓名<Input value={name} onChange={setName} placeholder="请输入学生姓名" /></label>
          <label>证件号码后六位<Input value={documentSuffix} onChange={setDocumentSuffix} maxLength={6} placeholder="请输入证件号后六位" /></label>
          <label>图形验证码
            <div className="captcha-row">
              <Input value={captcha} onChange={(value) => setCaptcha(value.toUpperCase())} maxLength={4} />
              <button type="button" className={`captcha-code${captchaInfo.image ? ' captcha-code--image' : ''}`} onClick={refreshCaptcha} disabled={captchaLoading}>
                {captchaInfo.image ? <img src={captchaInfo.image} alt="图形验证码" /> : (captchaLoading ? '加载中' : '重新加载')}
              </button>
              <button type="button" onClick={refreshCaptcha} disabled={captchaLoading}>换一张</button>
            </div>
          </label>
          {captchaError && <CompactNotice type="warning">{captchaError}</CompactNotice>}
          <Button block color="primary" size="large" loading={searching} disabled={!captchaInfo.token} onClick={search}>查询</Button>
          <p><CheckShieldOutline /> 查询信息仅用于身份核验，请勿频繁尝试</p>
        </Card>

        {result && (
          <Card className="public-result-card">
            <SectionTitle>查询结果</SectionTitle>
            <div className="result-identity">
              <UserCircleOutline />
              <div><strong>{resultData?.studentName}</strong><span>{resultData?.studentIdNumber}</span></div>
            </div>
            {finalQuery ? (
              <div className="public-result-state"><CheckCircleFill /><h2>{resultData?.result}</h2><p>录取学校：{resultData?.schoolName}</p></div>
            ) : (
              <>
                <div className="public-result-state"><CheckCircleFill /><h2>{resultData?.result}</h2><p>初审通过不代表最终录取</p></div>
                <div className="offline-arrangement">
                  {arrangement?.status === 'pending' ? (
                    <p><CalendarOutline /><strong>线下审核</strong>{arrangement.message || '安排待公布'}</p>
                  ) : (
                    <>
                      <p><CalendarOutline /><strong>审核时间</strong>{formatDateRange(arrangement?.startsAt, arrangement?.endsAt)}</p>
                      <p><LocationOutline /><strong>审核地点</strong>{arrangement?.location || '待公布'}</p>
                      {arrangement?.materials && <p><FileOutline /><strong>携带材料</strong>{formatList(arrangement.materials)}</p>}
                      {arrangement?.notes && <p><ExclamationCircleOutline /><strong>注意事项</strong>{arrangement.notes}</p>}
                    </>
                  )}
                </div>
              </>
            )}
            {!finalQuery && <Button block color="primary" fill="outline" onClick={() => navigate('/enrollment/public/final')}>查看最终录取结果</Button>}
          </Card>
        )}
        <p className="public-query-footer">如信息有误，请联系报名学校</p>
      </main>
    </div>
  );
};
