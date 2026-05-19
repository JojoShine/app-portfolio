import * as LucideIcons from 'lucide-react';

/**
 * 动态获取lucide-react icon组件
 * @param {string} iconName - icon名称（如：'Wallet', 'Heart'等）
 * @returns {React.Component} icon组件，如果不存在则返回Search icon
 */
export const getIconComponent = (iconName) => {
  if (!iconName) {
    return LucideIcons.Search;
  }

  // 从lucide-react中获取对应的icon
  const IconComponent = LucideIcons[iconName];

  // 如果icon存在则返回，否则返回默认的Search icon
  return IconComponent || LucideIcons.Search;
};

export default getIconComponent;
