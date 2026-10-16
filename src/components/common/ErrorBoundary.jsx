import React, { Component } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-neutral-50 border border-neutral-300 text-center my-4 space-y-3">
          <AlertTriangle className="w-8 h-8 text-neutral-800 mx-auto" />
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
            Terjadi kendala pada komponen ini
          </h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            {this.state.error?.message || "Terdapat kesalahan tampilan. Silakan refresh halaman atau coba reset komponen."}
          </p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 inline-flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Muat Ulang Komponen</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
