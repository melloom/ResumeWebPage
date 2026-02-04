import React, { useEffect } from 'react';
import './CalendlyWidgetOverrides.css'; // Create this file for global CSS overrides

const CalendlyWidget = () => {
  useEffect(() => {
    // Add Calendly CSS
    const link = document.createElement('link');
    link.href = 'https://assets.calendly.com/assets/external/widget.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Add custom class to body to target Calendly widgets
    document.body.classList.add('has-calendly-widgets');

    // Load Calendly script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    // Initialize widgets once script is loaded with a guaranteed separation
    script.onload = () => {
      if (window.Calendly) {
        // First, remove any existing widgets
        const existingWidgets = document.querySelectorAll('.calendly-badge-widget');
        existingWidgets.forEach(widget => {
          if (widget.parentNode) {
            widget.parentNode.removeChild(widget);
          }
        });
        
        // Initialize Phone Call widget with right positioning and ID for targeting
        window.Calendly.initBadgeWidget({
          url: 'https://calendly.com/melvin-a-p-cruz/phone-call',
          text: 'Schedule A Call',
          color: '#6366f1',
          textColor: '#ffffff',
          position: 'right',
          branding: false
        });
        
        // Wait before initializing the second widget to avoid conflicts
        setTimeout(() => {
          // Initialize Zoom Meeting widget on the left
          window.Calendly.initBadgeWidget({
            url: 'https://calendly.com/melvin-a-p-cruz/30min',
            text: 'Schedule Zoom Meeting',
            color: '#a855f7',
            textColor: '#ffffff',
            position: 'left',
            branding: false
          });
          
          // Apply custom positioning after widgets are created
          setTimeout(() => {
            const widgets = document.querySelectorAll('.calendly-badge-widget');
            if (widgets.length >= 2) {
              // Right widget (call)
              widgets[0].style.right = '20px';
              widgets[0].style.bottom = '90px';
              widgets[0].setAttribute('data-widget-type', 'call');
              
              // Left widget (zoom)
              widgets[1].style.left = '20px';
              widgets[1].style.bottom = '20px';
              widgets[1].setAttribute('data-widget-type', 'zoom');
            }
          }, 200);
        }, 200);
      }
    };

    // Clean up function
    return () => {
      document.body.classList.remove('has-calendly-widgets');
      
      if (link.parentNode) {
        document.head.removeChild(link);
      }
      
      if (script.parentNode) {
        document.body.removeChild(script);
      }
      
      // Clean up Calendly widgets if they exist
      const badges = document.querySelectorAll('.calendly-badge-widget');
      badges.forEach(badge => {
        if (badge.parentNode) {
          badge.parentNode.removeChild(badge);
        }
      });
    };
  }, []);

  // Component doesn't render anything visible
  return null;
};

export default CalendlyWidget;
