import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * PWA-safe Link component that ensures navigation stays within the app
 * Prevents iOS PWA from breaking into Safari browser
 */
const PWALink = ({ to, children, onClick, ...props }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    // Call custom onClick if provided
    if (onClick) {
      onClick(e);
    }
    
    // Prevent default link behavior
    e.preventDefault();
    
    // Use navigate instead to ensure SPA navigation
    navigate(to);
  };

  return (
    <Link to={to} {...props} onClick={handleClick}>
      {children}
    </Link>
  );
};

export default PWALink;
