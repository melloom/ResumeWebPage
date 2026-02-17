import { EnhancedCodeAnalyzer, AnalysisResult } from '../lib/analyzer-enhanced';
import { GitHubFile } from '../lib/github';

export interface WidgetConfig {
  apiKey?: string;
  theme?: 'light' | 'dark' | 'inherit';
  position?: 'bottom-right' | 'bottom-left' | 'inline';
  container?: HTMLElement | string;
  onAnalysisComplete?: (result: AnalysisResult) => void;
}

export type { AnalysisResult };

export class CodeGuardianAPI {
  private config: WidgetConfig = {};
  private mountEl: HTMLElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private analyzer = new EnhancedCodeAnalyzer();
  private renderCallback: (() => void) | null = null;
  private isOpen = false;

  init(config: WidgetConfig): void {
    this.config = { theme: 'inherit', position: 'bottom-right', ...config };
    this.mount();
  }

  async analyze(code: string, language: string = 'typescript'): Promise<AnalysisResult> {
    const ext = language === 'python' ? '.py'
      : language === 'java' ? '.java'
      : language === 'go' ? '.go'
      : language === 'rust' ? '.rs'
      : language === 'cpp' ? '.cpp'
      : language.includes('script') ? '.ts'
      : '.ts';

    const file: GitHubFile = {
      name: `input${ext}`,
      path: `input${ext}`,
      type: 'file',
      content: code,
      sha: '',
      size: code.length,
    };

    const result = await this.analyzer.analyzeFiles([file]);
    this.config.onAnalysisComplete?.(result);
    return result;
  }

  destroy(): void {
    if (this.mountEl && this.mountEl.parentNode) {
      this.mountEl.parentNode.removeChild(this.mountEl);
    }
    this.mountEl = null;
    this.shadowRoot = null;
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.config.theme = theme;
    if (this.shadowRoot?.host) {
      if (theme === 'dark') {
        this.shadowRoot.host.classList.add('dark');
      } else {
        this.shadowRoot.host.classList.remove('dark');
      }
    }
  }

  open(): void {
    this.isOpen = true;
    this.renderCallback?.();
  }

  close(): void {
    this.isOpen = false;
    this.renderCallback?.();
  }

  getIsOpen(): boolean {
    return this.isOpen;
  }

  getConfig(): WidgetConfig {
    return this.config;
  }

  getShadowRoot(): ShadowRoot | null {
    return this.shadowRoot;
  }

  setRenderCallback(cb: () => void): void {
    this.renderCallback = cb;
  }

  private mount(): void {
    // Create host element
    this.mountEl = document.createElement('div');
    this.mountEl.id = 'code-guardian-widget';

    // Create shadow DOM
    this.shadowRoot = this.mountEl.attachShadow({ mode: 'open' });

    // Determine theme
    if (this.config.theme === 'dark') {
      this.mountEl.classList.add('dark');
    } else if (this.config.theme === 'inherit') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) this.mountEl.classList.add('dark');
    }

    // Append to DOM
    const target =
      typeof this.config.container === 'string'
        ? document.getElementById(this.config.container)
        : this.config.container;

    (target || document.body).appendChild(this.mountEl);
  }
}
