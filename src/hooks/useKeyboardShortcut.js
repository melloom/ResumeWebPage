import { useEffect } from 'react';

const useKeyboardShortcut = (keyCombo, callback, condition = true) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only execute if condition is true
      if (!condition) return;

      const keys = keyCombo.toLowerCase().split('+');
      const pressedKeys = [];

      // Check for modifier keys
      if (event.ctrlKey) pressedKeys.push('ctrl');
      if (event.altKey) pressedKeys.push('alt');
      if (event.shiftKey) pressedKeys.push('shift');
      if (event.metaKey) pressedKeys.push('meta');

      // Add the main key
      pressedKeys.push(event.key.toLowerCase());

      // Check if all required keys are pressed
      const isMatch = keys.every(key => pressedKeys.includes(key)) && 
                     pressedKeys.length === keys.length;

      if (isMatch) {
        event.preventDefault();
        callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [keyCombo, callback, condition]);
};

export default useKeyboardShortcut; 