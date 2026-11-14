import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[CampusKit] Unhandled error', error, info.componentStack);
  }

  private reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex min-h-dvh items-center justify-center bg-[rgb(var(--ck-bg))] px-4">
        <div className="ck-card w-full max-w-lg p-6 text-center animate-scale-in">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <h1 className="mt-4 font-display text-[1.35rem] font-semibold text-[rgb(var(--ck-text))]">
            Something went wrong
          </h1>
          <p className="mt-2 text-[0.85rem] leading-relaxed ck-muted">
            The workspace hit an unexpected error. Your saved data is safe on this device.
          </p>
          <pre className="mt-4 max-h-40 overflow-auto rounded-xl border border-[rgb(var(--ck-border)/0.1)] bg-[rgb(var(--ck-border)/0.03)] p-3 text-left text-[0.7rem] text-rose-300">
            {error.message}
          </pre>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={this.reset} className="ck-btn-gold h-10 px-4">
              <RotateCcw className="h-4 w-4" />
              Try again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="ck-btn-ghost h-10 px-4"
            >
              Reload the app
            </button>
          </div>
        </div>
      </div>
    );
  }
}
