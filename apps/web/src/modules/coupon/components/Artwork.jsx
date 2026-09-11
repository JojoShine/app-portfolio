import PropTypes from 'prop-types';
const images = import.meta.glob('../assets/*.png', { eager: true, query: '?url', import: 'default' });
export default function Artwork({ name, className = '', alt = '', ...props }) {
  return <img className={`cv-art ${className}`} src={images[`../assets/${name}.png`]} alt={alt} draggable="false" {...props} />;
}
Artwork.propTypes = { name: PropTypes.string.isRequired, className: PropTypes.string, alt: PropTypes.string };
