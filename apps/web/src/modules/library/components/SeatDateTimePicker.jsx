import { useState } from 'react';
import PropTypes from 'prop-types';
import { Calendar, PickerView } from 'antd-mobile';

const toDate = (value) => new Date(`${value}T00:00:00`);
const formatDate = (value) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
const timeColumns = [24, 60].map((length) => Array.from({ length }, (_, index) => String(index).padStart(2, '0')));

export function SeatDatePicker({ value, min, onConfirm }) {
  const [selected, setSelected] = useState(() => toDate(value));
  return <div className="lib-seat-date-picker">
    <Calendar selectionMode="single" value={selected} onChange={setSelected} min={toDate(min)} minPage={{ year: Number(min.slice(0, 4)), month: Number(min.slice(5, 7)) }} weekStartsOn="Monday" allowClear={false} />
    <button className="lib-seat-picker-confirm" onClick={() => onConfirm(formatDate(selected))}>确定日期</button>
  </div>;
}
SeatDatePicker.propTypes = { value: PropTypes.string.isRequired, min: PropTypes.string.isRequired, onConfirm: PropTypes.func.isRequired };

export function SeatTimePicker({ value, openingHours, onConfirm }) {
  const [times, setTimes] = useState(value);
  const [active, setActive] = useState(0);
  const valid = times[0] < times[1];
  return <div className="lib-seat-time-picker">
    <p className="lib-seat-picker-hint">开放时间：{openingHours || '请以分馆公告为准'}</p>
    <div className="lib-seat-time-tabs" role="tablist" aria-label="编辑预约时段">{['开始时间', '结束时间'].map((label, index) => <button key={label} role="tab" aria-selected={active === index} onClick={() => setActive(index)}><span>{label}</span><strong>{times[index]}</strong></button>)}</div>
    <div className="lib-seat-time-units" aria-hidden="true"><span>时</span><span>分</span></div>
    <PickerView key={active} columns={timeColumns} value={times[active].split(':')} mouseWheel onChange={(parts) => setTimes((previous) => previous.map((time, index) => index === active ? parts.join(':') : time))} />
    <p className={`lib-seat-time-help ${valid ? '' : 'is-invalid'}`} role="status">{valid ? '滑动选择时间，点击上方切换开始与结束' : '结束时间必须晚于开始时间'}</p>
    <button className="lib-seat-picker-confirm" disabled={!valid} onClick={() => onConfirm(times)}>确定时段</button>
  </div>;
}
SeatTimePicker.propTypes = { value: PropTypes.arrayOf(PropTypes.string).isRequired, openingHours: PropTypes.string, onConfirm: PropTypes.func.isRequired };
