import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  // FIX: Reverted to using a constructor for state initialization. The class property
  // syntax was causing type inference issues where `this.props` was not recognized.
  // Using a constructor with `super(props)` is the standard and most reliable way
  // to set up a React class component.
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

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
