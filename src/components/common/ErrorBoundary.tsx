import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[300px] w-full flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle size={24} />
          </div>
          <h2 className="font-['Space_Grotesk'] text-lg font-bold text-[#003366]">
            Une erreur inattendue est survenue
          </h2>
          <p className="mt-1 max-w-md text-xs text-slate-500">
            {this.state.error?.message ||
              "L'application a rencontré un problème technique. Veuillez recharger la page."}
          </p>
          <button
            onClick={this.handleReset}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#003366] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#002244]"
          >
            <RotateCcw size={14} />
            <span>Actualiser l'application</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
