import type { ReactNode, Ref } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { theme } from '../theme';

export default function Screen({ children, scrollRef }: { children: ReactNode; scrollRef?: Ref<ScrollView> }) {
  return (
    <ScrollView ref={scrollRef} style={styles.screen} contentContainerStyle={styles.content}
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
