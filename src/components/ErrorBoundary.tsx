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
      <div className="min-h-screen flex flex-col items-center justify-center bg-void text-bone gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold">{t('errorBoundary.title')}</h1>
        <p className="text-bone/50 max-w-md">{t('errorBoundary.description')}</p>
        <button
          onClick={this.handleReload}
          className="mt-2 px-6 py-2 bg-lucy text-void border-2 border-lucy hover:bg-void hover:text-lucy transition-colors"
        >
          {t('errorBoundary.reload')}
        </button>
      </div>
    );
  }
}
