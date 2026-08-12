import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  error: Error | null;
}

// Top-level safety net: without this, any uncaught render error (e.g. a
// corrupted localStorage value thrown during SafeguardProvider's first
// render) unmounts the whole React tree with zero feedback — a blank white
// page and no way to recover except manually clearing site data.
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Safeguard crashed:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white border border-[#EDECE8] rounded-[24px] p-8 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-lg font-bold text-slate-900">Something went wrong</h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                Safeguard ran into an unexpected error and couldn't continue. Reloading usually fixes it.
              </p>
            </div>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Safeguard</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
