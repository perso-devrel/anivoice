import { Component, type ReactNode } from 'react';
import i18n from '../i18n';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const t = i18n.t.bind(i18n);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream text-ink gap-5 px-4 text-center">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-cinnabar">
          Error · 故障
        </span>
        <h1 className="font-display text-4xl md:text-5xl">{t('errorBoundary.title')}</h1>
        <p className="text-ink-soft max-w-md">{t('errorBoundary.description')}</p>
        <button
          onClick={this.handleReload}
          className="mt-2 px-6 py-3 bg-ink text-cream font-mono text-[12px] uppercase tracking-[0.22em] hover:bg-cinnabar transition-colors"
        >
          {t('errorBoundary.reload')}
        </button>
      </div>
    );
  }
}
