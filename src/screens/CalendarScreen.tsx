import { useImperativeHandle, useRef, useState } from 'react';
import type { Ref } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import CalendarMonth from '../components/CalendarMonth';
import { demoCalendarStart } from '../data/bookings';
import { monthSequence } from '../logic/calendar';
import { theme } from '../theme';

export type CalendarScreenHandle = { scrollToTop: () => void };

export default function CalendarScreen({ onSelectDate, ref }: {
  onSelectDate: (date: string) => void;
  ref?: Ref<CalendarScreenHandle>;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  useImperativeHandle(ref, () => ({
    // The ScrollView's automatic iOS inset puts its top at a negative offset.
    scrollToTop: () => scrollRef.current?.scrollTo({ x: 0, y: -insets.top, animated: true }),
  }), [insets.top]);
  const [count, setCount] = useState(6);
  return <Screen scrollRef={scrollRef}>
    <View style={styles.header}>
      <Text accessibilityRole="header" style={styles.title}>Calendar</Text>
      <Text style={styles.secondary}>Bookings at a glance. Tap a date for its schedule.</Text>
      <Text style={styles.secondary}>● Booked dates · Gold outline marks today</Text>
    </View>
    {monthSequence(demoCalendarStart, count).map(month => <CalendarMonth key={month} month={month} onSelectDate={onSelectDate} />)}
    <Pressable accessibilityRole="button" onPress={() => setCount(value => value + 6)} style={styles.more}><Text style={styles.button}>Show next six months</Text></Pressable>
    <Text style={styles.secondary}>Read-only demo · Fictional bookings from October 2026.</Text>
  </Screen>;
}
const styles = StyleSheet.create({
  header: { gap: theme.spacing.sm },
  title: { ...theme.typography.heading, color: theme.colors.warmCream },
  secondary: { ...theme.typography.caption, color: theme.colors.mutedGray },
  more: { minHeight: 48, justifyContent: 'center', alignItems: 'center', borderRadius: theme.borderRadius.md, backgroundColor: theme.colors.softCharcoal },
  button: { ...theme.typography.button, color: theme.colors.mutedGold },
});
