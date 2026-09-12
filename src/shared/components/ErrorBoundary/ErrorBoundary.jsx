// src/shared/components/ErrorBoundary/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen p-5 text-center font-vazir bg-gray-50" dir="rtl">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            خطایی رخ داده است
          </h2>
          <p className="text-gray-600 max-w-lg mb-6">
            متأسفانه برنامه با خطا مواجه شد. لطفاً صفحه را مجدداً بارگذاری
            کنید.
          </p>
          <button
            onClick={this.handleReset}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            🔄 بارگذاری مجدد
          </button>
          {this.state.error && import.meta.env.DEV && (
            <details className="mt-6 text-left max-w-2xl w-full" dir="ltr">
              <summary className="cursor-pointer text-sm text-gray-500">
                جزئیات خطا (فقط در حالت توسعه)
              </summary>
              <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                {this.state.error.toString()}
                {'\n\n'}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;