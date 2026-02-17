import React from 'react';
import ReactDOM from 'react-dom/client';
import { CodeGuardianAPI, WidgetConfig } from './widget-api';
import CodeGuardianWidget from './CodeGuardianWidget';
import { WIDGET_CSS } from './widget-styles';

const api = new CodeGuardianAPI();

const CodeGuardian = {
  init(config: WidgetConfig = {}): void {
    api.init(config);

    const shadowRoot = api.getShadowRoot();
    if (!shadowRoot) return;

    // Inject CSS
    const style = document.createElement('style');
    style.textContent = WIDGET_CSS;
    shadowRoot.appendChild(style);

    // Create React mount point
    const mountDiv = document.createElement('div');
    shadowRoot.appendChild(mountDiv);

    // Render React into Shadow DOM
    const root = ReactDOM.createRoot(mountDiv);
    root.render(
      React.createElement(CodeGuardianWidget, { api })
    );
  },

  async analyze(code: string, language?: string) {
    return api.analyze(code, language);
  },

  destroy(): void {
    api.destroy();
  },

  setTheme(theme: 'light' | 'dark'): void {
    api.setTheme(theme);
  },

  open(): void {
    api.open();
  },

  close(): void {
    api.close();
  },
};

// Expose globally
(window as any).CodeGuardian = CodeGuardian;

export default CodeGuardian;
