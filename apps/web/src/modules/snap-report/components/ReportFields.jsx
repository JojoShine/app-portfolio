import { useState } from 'react';
import { Picker } from 'antd-mobile';
import PropTypes from 'prop-types';
import SnapIcon from './SnapIcon';
import { categories, severities } from '../utils/report';
export default function ReportFields({ form, analysis, change, retry, error, frame, disabled }) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  return <section className="snap-card">
    <header className="snap-section-heading"><h2>识别结果</h2>{analysis.status === 'done' && <span className="snap-badge"><SnapIcon name="check" size={15} />已识别 · 请确认</span>}</header>
    <p className="snap-muted">根据照片生成，内容可修改。</p>
    {analysis.status === 'idle' && <p className="snap-notice">上传照片后自动识别，也可以手动填写。</p>}
    {analysis.status === 'loading' && <div className="snap-skeleton" role="status">正在综合识别照片中的问题…</div>}
    {analysis.status === 'failed' && <div className="snap-notice" role="status">{analysis.message}<button type="button" onClick={retry}>重新识别</button><span>你可以直接填写下方信息。</span></div>}
    {analysis.multipleIssues && <p className="snap-notice">照片可能包含多个问题，请确认本次只上报一处。</p>}
    {analysis.status === 'done' && analysis.needsConfirmation && <p className="snap-notice">部分内容尚不确定，请逐项确认。</p>}
    <label className="snap-field" id="snap-object">物品或对象<input maxLength={80} value={form.object} onChange={(event) => change('object', event.target.value)} placeholder="例如井盖、路灯、道路" required /></label>
    <div className="snap-field" id="snap-category"><span id="snap-category-label">问题类别</span>
      <button type="button" className={`snap-select-trigger${form.category ? '' : ' is-placeholder'}`} aria-labelledby="snap-category-label snap-category-value" aria-haspopup="dialog" aria-expanded={categoryOpen} disabled={disabled} onClick={() => setCategoryOpen(true)}>
        <span id="snap-category-value">{form.category || '请选择问题类别'}</span><SnapIcon name="chevron" size={18} />
      </button>
      <Picker columns={[categories.map((name) => ({ label: name, value: name }))]} value={form.category ? [form.category] : []}
        title="选择问题类别" confirmText="确定" cancelText="取消" visible={categoryOpen && !disabled}
        popupClassName="snap-picker-popup" popupStyle={{ '--snap-popup-left': `${frame.left}px`, '--snap-popup-width': typeof frame.width === 'number' ? `${frame.width}px` : frame.width }}
        onClose={() => setCategoryOpen(false)} onConfirm={([value]) => { if (!disabled && value) change('category', value); }} />
    </div>
    <div className="snap-field" id="snap-severity"><span>{form.category === '设施损坏' ? '损坏程度' : '影响程度'}</span><div className="snap-segments" role="group" aria-label="问题程度">{severities.map((name) => <button type="button" aria-pressed={form.severity === name} key={name} className={form.severity === name ? 'is-selected' : ''} onClick={() => change('severity', name)}>{name}</button>)}</div></div>
    {form.reason && <p className="snap-muted">{form.reason}</p>}
    <label className="snap-field" id="snap-description">问题描述<textarea rows={4} maxLength={1000} value={form.description} onChange={(event) => change('description', event.target.value)} placeholder="请描述现场情况" required /></label>
    {analysis.locationClue && <p className="snap-notice">照片位置线索：{analysis.locationClue}，请在下方确认实际位置。</p>}
    {error && <p className="snap-error" role="alert">{error}</p>}
  </section>;
}
ReportFields.propTypes = { form: PropTypes.object.isRequired, analysis: PropTypes.object.isRequired, change: PropTypes.func.isRequired, retry: PropTypes.func.isRequired, error: PropTypes.string, frame: PropTypes.object.isRequired, disabled: PropTypes.bool };
