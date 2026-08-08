import React, { Component, ErrorInfo, ReactNode } from "react";
import { UniversalAccessIcon } from "./UniversalAccessIcon";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service here
    console.error("Rafeeq Accessibility Widget crashed:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default silent fallback - a small unclickable icon to show it failed gracefully
      return (
        <div 
          className="fixed bottom-6 right-6 z-[999999] opacity-50 grayscale cursor-not-allowed flex items-center justify-center p-3 rounded-full bg-gray-200 border border-red-200 shadow-sm"
          title="Accessibility Widget encountered an error and was disabled to protect your experience."
        >
          <UniversalAccessIcon className="w-8 h-8 text-gray-400" />
        </div>
      );
    }

    return this.props.children;
  }
}
