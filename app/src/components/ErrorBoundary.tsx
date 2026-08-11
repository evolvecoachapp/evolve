import React from "react";
import { getLogger } from "../infrastructure/logging";
import { AppErrorFallback } from "./AppErrorFallback";

export interface ErrorBoundaryProps {
  readonly children: React.ReactNode;
}

interface ErrorBoundaryState {
  readonly hasError: boolean;
}

/**
 * Reusable React error boundary for unexpected render/runtime exceptions.
 * Logs through the existing logging abstraction (`infrastructure/logging`)
 * and shows a safe fallback with a retry action — never a stack trace or
 * raw error message.
 *
 * Placement: wraps only the authenticated app shell's routed content
 * (`app/(app)/_layout.tsx`), not auth/onboarding, so one broken authenticated
 * feature can recover without affecting sign-in/onboarding and without
 * duplicating boundaries across the tree.
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    getLogger().error("Unexpected application error was caught", {
      scope: "Application",
      reason: error.message || "Unknown error",
    });
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <AppErrorFallback
          icon="warning-outline"
          title="Something went wrong"
          subtitle="EVOLVE ran into an unexpected problem. You can try again."
          actionLabel="Try again"
          onAction={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}
