import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  effectName: string;
}

interface State {
  hasError: boolean;
}

/**
 * Specialized Error Boundary for visual effects components (WebGL, PIXI, Three.js).
 * Silently fails and disables the effect rather than crashing the game.
 */
class VisualEffectsErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn(
      `[VisualEffects] ${this.props.effectName} failed to load:`,
      error.message
    );
    console.debug('Stack:', errorInfo.componentStack);
  }

  render() {
    // If error, render nothing - game continues without visual effects
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

export default VisualEffectsErrorBoundary;
