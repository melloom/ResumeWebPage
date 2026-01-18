import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './assets/styles/global.css';
import { unregisterAllServiceWorkers } from './pwaRegistration';

// TEMPORARILY DISABLE SERVICE WORKER TO TEST
unregisterAllServiceWorkers().then(() => {
  console.log('Service worker disabled for testing');
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);