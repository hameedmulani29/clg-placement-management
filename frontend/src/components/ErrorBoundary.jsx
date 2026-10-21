import React from 'react';
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI exception in ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoDashboard = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '3rem 2rem',
            maxWidth: '680px',
            margin: '2rem auto',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--danger-light)',
              color: 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <AlertTriangle size={28} />
          </div>

          <h2
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-weight-extrabold)',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
            }}
          >
            Something went wrong loading this view
          </h2>

          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              marginBottom: '1.5rem',
              lineHeight: 1.5,
            }}
          >
            An unexpected error occurred while rendering this section. You can refresh or return to your dashboard.
          </p>

          {this.state.error?.message && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-family-mono)',
                color: 'var(--danger-text)',
                textAlign: 'left',
                overflowX: 'auto',
                marginBottom: '1.75rem',
              }}
            >
              {this.state.error.message}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={this.handleReset}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <RefreshCw size={14} /> Refresh Page
            </button>
            <button
              type="button"
              onClick={this.handleGoDashboard}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <LayoutDashboard size={14} /> Return to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
