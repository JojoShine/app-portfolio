import React from 'react';

/**
 * 自定义Checkbox组件
 * 支持圆形、方形、自定义icon等功能
 */
const Checkbox = ({
  checked = false,
  onChange,
  disabled = false,
  children,
  shape = 'square', // 'square' 或 'circle'
  checkedIcon,
  uncheckedIcon,
  checkedColor = '#0283EB', // 选中时的颜色
  style = {},
}) => {
  const handleChange = () => {
    if (!disabled) {
      onChange && onChange(!checked);
    }
  };

  const borderRadius = shape === 'circle' ? '50%' : '4px';
  const size = '4vw';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1vw',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        paddingTop: '0.5vh',
        ...style,
      }}
      onClick={handleChange}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius,
          border: `2px solid ${checked ? checkedColor : '#CCCCCC'}`,
          backgroundColor: checked ? checkedColor : '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s',
          flexShrink: 0,
        }}
      >
        {checked ? (
          checkedIcon ? (
            <div style={{ fontSize: '2.5vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {checkedIcon}
            </div>
          ) : (
            <span style={{ color: '#ffffff', fontSize: '2.5vw', fontWeight: 'bold' }}>✓</span>
          )
        ) : (
          uncheckedIcon && (
            <div style={{ fontSize: '2.5vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {uncheckedIcon}
            </div>
          )
        )}
      </div>
      {children && (
        <span style={{ fontSize: '3vw', color: '#333333', userSelect: 'none' }}>
          {children}
        </span>
      )}
    </div>
  );
};

export default Checkbox;
