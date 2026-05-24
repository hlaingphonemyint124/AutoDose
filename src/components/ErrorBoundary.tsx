import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-orbitron font-bold text-primary">
                AUTO<span className="text-foreground">DOSE</span>
              </h1>
              <p className="text-muted-foreground">Something went wrong. Please refresh the page.</p>
              {import.meta.env.DEV && this.state.error && (
                <pre className="mt-4 max-w-xl text-left text-xs text-red-400/90 whitespace-pre-wrap break-words px-4">
                  {this.state.error.message}
                </pre>
              )}
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Reload Page
              </button>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
