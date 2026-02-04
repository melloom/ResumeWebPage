import React from 'react';
import { FaShare, FaFilePdf, FaLink } from 'react-icons/fa';
import { shareContent } from '../../utils/shareUtils';
import styles from './ShareButton.module.css';

const ShareButton = ({ 
  className,
  title = "Share this page",
  text = "Check out this website!", 
  url, 
  type = "page",
  showLabel = true,
  size = "medium",
  forceShowIcon = false // Add this prop to force icon display
}) => {
  // Determine the icon to use
  let icon;
  let label;
  
  switch (type) {
    case 'resume':
      icon = <FaFilePdf className={styles.iconSvg} />;
      label = "Share Resume";
      break;
    case 'link':
      icon = <FaLink className={styles.iconSvg} />;
      label = "Share Link";
      break;
    case 'page':
    default:
      icon = <FaShare className={styles.iconSvg} />;
      label = "Share";
      break;
  }

  // Handle sharing
  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    await shareContent({
      title: title || document.title,
      text,
      url: url || window.location.href
    });
  };

  return (
    <button
      className={`${styles.shareButton} ${styles[size]} ${className || ''} ${forceShowIcon ? styles.forceIcon : ''}`}
      onClick={handleShare}
      aria-label={label}
      title={label}
    >
      <span className={styles.shareIcon} aria-hidden="true">{icon}</span>
      {showLabel && <span className={styles.shareLabel}>{label}</span>}
    </button>
  );
};

export default ShareButton;
