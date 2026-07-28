"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { AlertCircle } from "lucide-react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
    // Optional: send to Sentry
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div className="p-6">
            <EmptyState
              variant="error"
              icon={<AlertCircle className="size-6" />}
              title="Something went wrong"
              description={this.state.error.message}
              action={{ label: "Try again", onClick: this.reset }}
            />
          </div>
        )
      );
    }
    return this.props.children;
  }
}
