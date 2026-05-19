/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // ============================================
      // 颜色系统
      // ============================================
      colors: {
        // 品牌色
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // 状态色
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        // 场景化标签色
        scenario: '#f97316',
      },

      // ============================================
      // 字号系统
      // ============================================
      fontSize: {
        // 标题
        'title-lg': ['28px', { lineHeight: '36px', fontWeight: '700' }],
        'title-md': ['24px', { lineHeight: '32px', fontWeight: '700' }],
        'title-sm': ['20px', { lineHeight: '28px', fontWeight: '700' }],
        // 正文
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '22px', fontWeight: '400' }],
        'body-sm': ['12px', { lineHeight: '20px', fontWeight: '400' }],
        // 标签/徽章
        'label-lg': ['14px', { lineHeight: '20px', fontWeight: '600' }],
        'label-md': ['12px', { lineHeight: '18px', fontWeight: '600' }],
        'label-sm': ['11px', { lineHeight: '16px', fontWeight: '600' }],
        // 辅助文本
        'caption': ['12px', { lineHeight: '18px', fontWeight: '400' }],
        'caption-sm': ['11px', { lineHeight: '16px', fontWeight: '400' }],
      },

      // ============================================
      // 圆角系统
      // ============================================
      borderRadius: {
        // 基础圆角
        'radius-none': '0px',
        'radius-xs': '2px',
        'radius-sm': '4px',
        'radius-md': '8px',
        'radius-lg': '12px',
        'radius-xl': '16px',
        'radius-full': '9999px',
        // 组件圆角别名
        'card': '8px',
        'button': '6px',
        'badge': '4px',
        'input': '6px',
      },

      // ============================================
      // 阴影系统
      // ============================================
      boxShadow: {
        // 基础阴影
        'shadow-xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        'shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        // 组件阴影别名
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'button': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'badge': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'hover': '0 4px 12px 0 rgba(0, 0, 0, 0.15)',
      },

      // ============================================
      // 间距系统
      // ============================================
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        'xxl': '32px',
      },

      // ============================================
      // 组件样式预设
      // ============================================
      // 可以通过 @apply 在组件中使用
    },
  },
  plugins: [
    // 自定义组件类
    function({ addComponents, theme }) {
      addComponents({
        // 徽章/标签组件
        '.badge': {
          '@apply inline-flex items-center px-1.5 py-0.5 rounded-badge text-caption-sm font-semibold shadow-badge': {},
        },
        '.badge-scenario': {
          '@apply badge bg-scenario text-white': {},
        },
        '.badge-success': {
          '@apply badge bg-success text-white': {},
        },
        '.badge-warning': {
          '@apply badge bg-warning text-white': {},
        },
        '.badge-error': {
          '@apply badge bg-error text-white': {},
        },

        // 卡片组件
        '.card': {
          '@apply rounded-card shadow-card p-4': {},
        },
        '.card-hover': {
          '@apply card hover:shadow-hover transition-shadow': {},
        },

        // 按钮基础样式
        '.btn': {
          '@apply inline-flex items-center justify-center px-4 py-2 rounded-button font-semibold text-body-md transition-all': {},
        },
        '.btn-primary': {
          '@apply btn bg-primary-500 text-white hover:bg-primary-600 shadow-button': {},
        },
        '.btn-secondary': {
          '@apply btn bg-gray-200 text-gray-800 hover:bg-gray-300': {},
        },

        // 输入框基础样式
        '.input': {
          '@apply w-full px-3 py-2 rounded-input border border-gray-300 text-body-md focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500': {},
        },
      });
    },
  ],
}


