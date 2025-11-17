import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  // FIX: Replaced the constructor with a class property for state initialization. This is a more modern and concise syntax that resolves errors where `this.state` and `this.props` were not being correctly identified on the component instance.
  state: State = { hasError: false };

  static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 m-4 bg-red-900/50 border border-red-500 rounded-lg text-center">
            <h2 className="text-lg font-bold text-red-300">A component has crashed.</h2>
            <p className="text-red-400">Something went wrong while rendering this part of the UI. The rest of the app is still functional.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
