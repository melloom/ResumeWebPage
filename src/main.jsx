import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './assets/styles/global.css';
import { registerServiceWorker, unregisterAllServiceWorkers } from './pwaRegistration';

// Check if we need to reset service worker (for emergency fixes)
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('resetSW') === 'true') {
  unregisterAllServiceWorkers().then(() => {
    // Remove the query parameter and reload
    window.history.replaceState({}, document.title, window.location.pathname);
    window.location.reload();
  });
} else {
  // Register service worker for PWA support
  registerServiceWorker();
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);