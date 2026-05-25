import React from 'react';

/**
 * 自定义Input组件 - 参照react-vant风格
 * 基于原生HTML input元素，简洁设计
 */
const Input = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  readOnly = false,
  maxLength,
  style = {},
  className = '',
}) => {
  const handleChange = (e) => {
    const newValue = e.target.value;
    if (maxLength && newValue.length > maxLength) {
      return;
    }
    onChange && onChange(newValue);
  };

  return (
    <input
      type={type}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      maxLength={maxLength}
      className={className}
      style={{
        width: '100%',
        padding: '0.8vh 1vw',
        fontSize: '3vw',
        border: '1px solid #EBEDF0',
        borderRadius: '4px',
        fontFamily: 'inherit',
        backgroundColor: '#ffffff',
        color: '#333333',
        boxSizing: 'border-box',
        outline: 'none',
        ...style,
      }}
    />
  );
};

export default Input;