import React from 'react';

/**
 * 自定义TextArea组件 - 参照react-vant风格
 * 支持字数统计、maxLength等功能
 */
const TextArea = ({
  value,
  onChange,
  placeholder,
  rows = 5,
  maxLength,
  showCount = false,
  disabled = false,
  readOnly = false,
  style = {},
}) => {
  const handleChange = (e) => {
    const newValue = e.target.value;
    if (maxLength && newValue.length > maxLength) {
      return;
    }
    onChange && onChange(newValue);
  };

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <style>{`
        textarea:focus {
          outline: none;
          border-color: #0283EB !important;
          box-shadow: 0 0 0 2px rgba(2, 131, 235, 0.1);
        }
      `}</style>
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        readOnly={readOnly}
        style={{
          width: '100%',
          padding: '1vh',
          fontSize: '2.8vw',
          border: '1px solid #EBEDF0',
          borderRadius: '4px',
          fontFamily: 'inherit',
          resize: 'vertical',
          backgroundColor: '#ffffff',
          color: '#323233',
          boxSizing: 'border-box',
          transition: 'border-color 0.3s, box-shadow 0.3s',
          paddingBottom: showCount ? '3vh' : '1vh',
          ...style,
        }}
      />
      {showCount && (
        <div style={{
          position: 'absolute',
          bottom: '1vh',
          right: '1vh',
          fontSize: '2.8vw',
          color: '#999999',
          pointerEvents: 'none',
        }}>
          {value?.length || 0}{maxLength ? `/${maxLength}` : ''}
        </div>
      )}
    </div>
  );
};

export default TextArea;
