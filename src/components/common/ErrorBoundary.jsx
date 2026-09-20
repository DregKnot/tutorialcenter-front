import React from "react";
import { Icon } from "@iconify/react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoDashboard = () => {
    window.location.href = "/student/dashboard";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-[#061e31]">
          <div className="max-w-md w-full bg-white dark:bg-[#09314F] border border-gray-100 dark:border-white/10 rounded-3xl p-8 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 flex items-center justify-center mx-auto mb-5 text-amber-600 dark:text-amber-400">
              <Icon icon="lucide:alert-triangle" className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-black text-[#09314F] dark:text-white mb-2">
              Something went wrong
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-300 font-medium mb-6">
              We encountered an unexpected display issue. Your account and data are safe.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="py-3 px-5 bg-[#09314F] hover:bg-[#0c436b] text-white rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                <Icon icon="lucide:refresh-cw" className="w-4 h-4" />
                Refresh Page
              </button>

              <button
                onClick={this.handleGoDashboard}
                className="py-3 px-5 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-700 dark:text-white rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all active:scale-95"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
