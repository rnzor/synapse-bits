import React, { Component, ErrorInfo, ReactNode } from 'react';
import { IconZap, IconRefresh } from './Icons';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  // Explicitly declare props to satisfy strict TypeScript environments
  public props: Props;

  constructor(props: Props) {
    super(props);
    this.props = props;
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    // Attempt to recover by reloading. 
    // In a more complex app, we might clear specific local storage keys here if corruption is suspected.
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#02040a] flex items-center justify-center p-4 font-mono">
          <div className="max-w-md w-full bg-slate-900/50 border border-rose-500/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden text-center">
            
            {/* Background Noise */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-50"></div>

            <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border border-rose-500/20 animate-pulse">
                    <IconZap className="w-10 h-10 text-rose-500" />
                </div>

                <h1 className="text-2xl font-black text-white mb-2 tracking-tight uppercase">System Malfunction</h1>
                <p className="text-slate-400 text-sm mb-6">
                    A critical error has occurred in the neural link. The application state has been compromised.
                </p>

                <div className="w-full bg-black/50 rounded-lg p-3 mb-8 border border-white/5 text-left overflow-hidden">
                    <code className="text-xs text-rose-400 break-all">
                        Error: {this.state.error?.message || "Unknown Exception"}
                    </code>
                </div>

                <button 
                    onClick={this.handleReset}
                    className="flex items-center space-x-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-500/20"
                >
                    <IconRefresh className="w-5 h-5" />
                    <span>Reboot System</span>
                </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;