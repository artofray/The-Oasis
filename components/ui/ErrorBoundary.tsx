import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  // FIX: Initialize state using a class property. This modern syntax is more concise
  // and avoids potential issues with `this` in constructors, resolving the type
  // errors where `state` and `props` were not being recognized.
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
