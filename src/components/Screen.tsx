import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { theme } from '../theme';

export default function Screen({ children }: { children: ReactNode }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic" indicatorStyle="white"
      keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
      automaticallyAdjustKeyboardInsets>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.charcoal },
  content: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.sm, paddingBottom: theme.spacing.xxl, gap: theme.spacing.md },
});
