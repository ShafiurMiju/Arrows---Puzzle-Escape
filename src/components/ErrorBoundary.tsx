import { Component, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { palette, spacing } from '../constants';
import { analytics } from '../services/analytics';
import { AppText } from './ui/AppText';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Root error boundary: catches render/runtime errors anywhere in the tree,
 * reports them through the analytics port (Crashlytics-ready), and shows a
 * recoverable fallback instead of a white screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: { componentStack?: string }): void {
    analytics.recordError(error, { componentStack: info.componentStack });
  }

  private readonly handleReset = (): void => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <AppText variant="heading" center>
            Something went wrong
          </AppText>
          <AppText variant="body" color="textSecondary" center style={styles.message}>
            An unexpected error occurred. Tap below to return to the game.
          </AppText>
          <Button label="Try Again" onPress={this.handleReset} />
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    backgroundColor: palette.background,
  },
  message: {
    lineHeight: 22,
  },
});
