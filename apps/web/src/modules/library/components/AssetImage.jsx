import { useState } from 'react';
import PropTypes from 'prop-types';
import { appConfig } from '../../../app/config/env';
import hero from '../assets/library-hero-v4.png';
import readingEventsHero from '../assets/reading-events-hero.png';
import homeCommunity from '../assets/home-community-v2.png';

// 固定页面装饰随前端发布；业务图片由接口提供，失败时不冒用其他业务图片。
const assets = { hero, readingEventsHero, homeCommunity };
const placeholder = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="320"><rect width="100%" height="100%" fill="#eee9df"/><text x="50%" y="50%" text-anchor="middle" fill="#8b8376" font-size="16">暂无图片</text></svg>');

export default function AssetImage({ remote, fallback, alt = '', ...props }) {
  const fallbackSource = assets[fallback] || placeholder;
  const remoteSource = remote ? `${appConfig.apiBaseUrl}${remote}` : fallbackSource;
  const [failedSource, setFailedSource] = useState(null);
  return <img {...props} src={remoteSource === failedSource ? placeholder : remoteSource} alt={alt} onError={() => setFailedSource(remoteSource)} />;
}

AssetImage.propTypes = {
  remote: PropTypes.string,
  fallback: PropTypes.string,
  alt: PropTypes.string,
};
