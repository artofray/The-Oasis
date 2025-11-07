import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  // FIX: Use class property for state initialization. This is a more modern and concise approach that avoids potential 'this' context issues inside a constructor in some TypeScript configurations.
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

    // FIX: Correctly access props from the component instance. The explicit `public` keywords were removed from class members to align with conventional React class component style, which may resolve type inference issues in some toolchains.
    return this.props.children;
  }
}
