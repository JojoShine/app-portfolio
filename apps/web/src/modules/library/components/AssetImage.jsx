import { useState } from 'react';
import PropTypes from 'prop-types';
import { appConfig } from '../../../app/config/env';
import hero from '../assets/library-hero-v4.png';
import readingCircle from '../assets/reading-circle.png';
import readingEventsHero from '../assets/reading-events-hero.png';
import branchInterior from '../assets/branch-interior.png';
import humanWorld from '../assets/book-human-world.png';
import changan from '../assets/book-changan.png';
import ditan from '../assets/book-ditan.png';
import ditanEvent from '../assets/book-ditan-event.png';
import homeFeatured from '../assets/home-featured-book.png';
import homeCommunity from '../assets/home-community-v2.png';
import homeEvent from '../assets/home-event.png';
import eventFamily from '../assets/event-family-reading.png';
import eventLocal from '../assets/event-local-culture.png';
import eventBookScene from '../assets/event-book-scene.png';
import eventBookPhoto from '../assets/event-book-photo.png';
import eventFamilyList from '../assets/event-family-list.png';
import eventLocalList from '../assets/event-local-list.png';

const assets = { hero, readingCircle, readingEventsHero, branchInterior, humanWorld, changan, ditan, ditanEvent, homeFeatured, homeCommunity, homeEvent, eventFamily, eventLocal, eventBookScene, eventBookPhoto, eventFamilyList, eventLocalList };
const fileFallbacks = {
  'book-human-world.png': humanWorld, 'book-changan.png': changan, 'book-ditan.png': ditan,
  'reading-circle.png': readingCircle, 'branch-interior.png': branchInterior, 'library-hero.png': hero,
};

export default function AssetImage({ remote, fallback = 'hero', alt = '', ...props }) {
  const fallbackSource = fileFallbacks[String(remote || '').split('/').pop()] || assets[fallback];
  const remoteSource = remote ? `${appConfig.apiBaseUrl}${remote}` : fallbackSource;
  const [source, setSource] = useState(remoteSource);
  return <img {...props} src={source} alt={alt} onError={() => setSource(fallbackSource)} />;
}

AssetImage.propTypes = {
  remote: PropTypes.string,
  fallback: PropTypes.oneOf(Object.keys(assets)),
  alt: PropTypes.string,
};
