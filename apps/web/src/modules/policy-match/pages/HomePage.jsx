import '../styles/pages/home.css';
import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {CheckCircleFill, UserContactOutline, TeamFill, RightOutline, ClockCircleFill} from 'antd-mobile-icons';
import {Header, Section, Icon, State, PolicyCard, ApplicationCard, Footer} from '../components/UI';
import hero from '../assets/home-hero.png';
import profileCard from '../assets/profile-card.png';
import {usePolicy} from '../components/PolicyContext';
import useDashboard from '../hooks/useDashboard';
import {date, isActive} from '../utils/format';

export default function HomePage() {
    const {subjectType, setSubjectType} = usePolicy();
    const resource = useDashboard();
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const data = resource.data;
    const results = data?.matches[0]?.results || [];
    const active = data?.applications.filter(isActive) || [];
    const recommended = results.length ? results.filter(p => ['eligible', 'potential'].includes(p.eligibility)).sort((a, b) => b.score - a.score) : data?.policies.filter(p => new Date(p.endsAt) > new Date()) || [];
    return <><Header title="政策智能匹配" back="/" backLabel="返回首页"/>
        <div className="pm-content pm-page-home">
            <section className="pm-home-hero" style={{backgroundImage: `url(${hero})`}}><h1>好政策，<br/>主动找到你</h1>
                <p>人才 · 就业 · 创业 · 惠企</p><Link to="/policy-match/policies">通用政策服务 <RightOutline/></Link>
            </section>
            <form className="pm-search" onSubmit={e => {
                e.preventDefault();
                navigate('/policy-match/policies?q=' + encodeURIComponent(query));
            }}><Icon name="search"/><input value={query} onChange={e => setQuery(e.target.value)}
                                           placeholder="搜索政策、补贴或关键词" aria-label="搜索政策"/>
                <button aria-label="搜索"><Icon name="arrow" size={18}/></button>
            </form>
            <section className="pm-start pm-card">
                <div className="pm-segments" role="group" aria-label="匹配主体">{['personal', 'company'].map(t =>
                    <button key={t} aria-pressed={subjectType === t} className={subjectType === t ? 'active' : ''}
                            onClick={() => setSubjectType(t)}>{t === 'personal' ? <UserContactOutline/> :
                        <TeamFill/>}{t === 'personal' ? '个人匹配' : '企业匹配'}</button>)}</div>
                <div className="pm-start-copy"><h2>发现属于你的政策机会</h2><p>{data?.profile.completeness>=100?'画像已完善，可直接匹配；资料变更可随时修改':'完善画像，查看匹配条件与申报路径'}</p><img
                    className="pm-start-art" src={profileCard} alt=""/></div>
                <Link className="pm-primary" to="/policy-match/analyze">立即智能匹配 <Icon name="arrow"/></Link>
            </section>
            <State {...resource} retry={resource.reload}>{data && <>
                <div className="pm-stats pm-card">
                    <div>
                        <b>{results.filter(r => r.eligibility === 'eligible').length}</b><span>项条件符合</span><small>重复享受另核实</small>
                    </div>
                    <div>
                        <b>{results.filter(r => r.eligibility !== 'expired').length}</b><span>项已匹配</span><small>发现机会</small>
                    </div>
                    <div><b>{active.length}</b><span>项待处理</span><small>继续办理</small></div>
                </div>
                <section className="pm-card pm-profile-summary">
                    <div>
                        <strong><UserContactOutline/> {subjectType === 'personal' ? '个人' : '企业'}画像</strong><small>已完成 <b>{data.profile.filled}</b> / {data.profile.count} 项</small>
                    </div>
                    <div className="pm-profile-progress">
                        <div><p>完整度 <b>{data.profile.completeness}%</b></p>
                            <progress aria-label="画像完整度" max="100" value={data.profile.completeness}/>
                        </div>
                        <Link to="/policy-match/profile">{data.profile.completeness>=100?'编辑画像':'继续完善'} <Icon name="arrow" size={15}/></Link></div>
                </section>
                <Section title="我的办理" to="/policy-match/records"
                         link="全部记录">{active.length ? active.slice(0, 2).map(a => <ApplicationCard key={a.id}
                                                                                                       application={a}
                                                                                                       compact/>) :
                    <Link className="pm-card pm-inline" to="/policy-match/policies"><Icon
                        name="document"/><span>尚无进行中的申报，先看看适合你的政策</span><Icon
                        name="arrow"/></Link>}</Section>
                {data.matches[0] && <Link className="pm-recent"
                                          to={'/policy-match/results/' + data.matches[0].id}><ClockCircleFill/><strong>最近匹配</strong><span>{results.length}项结果 · {date(data.matches[0].createdAt)}</span><RightOutline/></Link>}
                <Section title={<>{results.length ? '为你推荐' : '热门政策'}{results.length > 0 &&
                    <span className="pm-home-recommend-tag"><CheckCircleFill/>按画像推荐</span>}</>}
                         to={data.matches[0] ? '/policy-match/results/' + data.matches[0].id : '/policy-match/policies'}
                         link="更多优质政策">{recommended.slice(0, 3).map(p => <PolicyCard key={p.id} policy={p} home
                                                                                           snapshot={data.matches[0]?.id}/>)}{results.length > 0 && !recommended.length &&
                    <p className="pm-muted">暂无符合当前画像的政策，可补充信息后重新匹配。</p>}</Section>
                <div className="pm-home-schedule"><Section title="申报日程" to="/policy-match/policies" link="查看更多">
                    <div
                        className="pm-timeline">{data.policies.filter(p => new Date(p.endsAt) > new Date()).sort((a, b) => new Date(a.endsAt) - new Date(b.endsAt)).slice(0, 2).map(p =>
                        <Link to={'/policy-match/policies/' + p.id} key={p.id}><i aria-hidden="true"/>
                            <time dateTime={p.endsAt}>{date(p.endsAt)}</time>
                            <div><strong>{p.title}截止</strong><p>建议提前准备，避免错过申报</p></div>
                        </Link>)}</div>
                </Section></div>
            </>}</State>
            <Section title="更多服务">
                <div
                    className="pm-card pm-links">{[['clock', '历史匹配', '/policy-match/history'], ['star', '我的收藏', '/policy-match/favorites'], ['book', '申报指南', '/policy-match/guide'], ['user', '我的资料', '/policy-match/account']].map(([icon, title, to]) =>
                    <Link key={to} to={to}><Icon name={icon}/><span>{title}</span><Icon name="arrow"
                                                                                        size={17}/></Link>)}</div>
            </Section><Footer/>
        </div>
    </>;
}
