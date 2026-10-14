import { useState } from 'react';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { dogs } from '../data/dogs';
import type { Dog } from '../data/dogs';
import { useBookingSession } from '../context/BookingSession';
import { formatCalendarDate } from '../logic/calendar';
import { dailySchedule, groupScheduleByDog, filterDogScheduleGroups } from '../logic/schedule';
import ScheduledDogCard from '../components/ScheduledDogCard';
import { theme } from '../theme';

const { colors, typography, spacing, borderRadius } = theme;
const services = ['Boarding', 'Daycare', 'Training'] as const;
type Service = Dog['service'];

export default function DashboardScreen({
  navigation,
  onAddBooking,
  onSelectDog,
}: {
  navigation: ReactNode;
  onAddBooking: () => void;
  onSelectDog: (dog: Dog) => void;
}) {
  const { scheduleBookings: bookings, today, serviceLabel } = useBookingSession();
  const [filter, setFilter] = useState<Service | 'All'>('All');
  const date = formatCalendarDate(today, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  const entries = dailySchedule(dogs, bookings, today);
  const todayDogs = groupScheduleByDog(entries);
  const visibleDogs = filterDogScheduleGroups(todayDogs, filter);

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic" indicatorStyle="white">
        {navigation}
        <View style={styles.brand}>
          <View style={styles.brandMark} />
          <Text style={styles.wordmark}>K9 ADVOCATES</Text>
          <Text style={styles.date}>{date}</Text>
          <Pressable accessibilityRole="button" onPress={onAddBooking} style={styles.addBooking}><Text style={styles.addBookingText}>＋ Add Booking</Text></Pressable>
        </View>
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>Today’s overview</Text>
          <View style={styles.summaryGrid}>
            {services.map((service) => (
              <View key={service} style={styles.summaryCard}>
                <Text style={styles.count}>{filterDogScheduleGroups(todayDogs, service).length}</Text>
                <Text style={styles.summaryLabel}>{service}</Text>
                <Text style={styles.secondary}>dogs</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>Today’s Dogs</Text>
          <Text style={styles.secondary}>{todayDogs.length} dogs · {entries.length} bookings</Text>
          <View style={styles.filters}>
            {(['All', ...services] as const).map(service => <Pressable key={service} accessibilityRole="button"
              accessibilityLabel={`Show ${service === 'All' ? 'all dogs' : `${service.toLowerCase()} dogs`}`}
              accessibilityState={{ selected: filter === service }} onPress={() => setFilter(service)}
              style={({ pressed }) => [styles.filter, filter === service && styles.selectedFilter, pressed && styles.pressed]}>
              <Text style={[styles.filterLabel, filter === service && styles.selectedFilterLabel]}>{service}</Text>
            </Pressable>)}
          </View>
          {visibleDogs.map(group => (
            <ScheduledDogCard
              key={group.dog.id}
              {...group}
              serviceLabel={serviceLabel}
              onSelectDog={onSelectDog}
            />
          ))}
          {!visibleDogs.length && <Text style={styles.secondary}>No dogs scheduled{filter === 'All' ? ' today' : ` for ${filter.toLowerCase()}`}</Text>}
        </View>
        <Text style={styles.footer}>Fictional demo · Added bookings last only for this session</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.charcoal },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xxl, gap: spacing.md },
  brand: { gap: spacing.xs, paddingVertical: spacing.sm },
  brandMark: { width: spacing.xl, height: 2, backgroundColor: colors.mutedGold },
  wordmark: { ...typography.subheading, fontSize: 20, lineHeight: 28, color: colors.warmCream, letterSpacing: 2 },
  date: { ...typography.caption, color: colors.mutedGold },
  secondary: { ...typography.caption, color: colors.mutedGray },
  section: { gap: spacing.sm },
  sectionTitle: { ...typography.subheading, fontSize: 20, lineHeight: 28, color: colors.warmCream },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  summaryCard: { flexGrow: 1, flexBasis: 100, backgroundColor: colors.softCharcoal, borderRadius: borderRadius.md, padding: spacing.sm, gap: spacing.xs, borderTopWidth: 2, borderTopColor: colors.darkGold },
  count: { ...typography.heading, color: colors.warmCream, fontSize: 28, lineHeight: 34 },
  summaryLabel: { ...typography.body, color: colors.warmCream, fontSize: 15 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  filter: { minHeight: 44, minWidth: 44, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, alignItems: 'center', justifyContent: 'center', borderRadius: borderRadius.pill, backgroundColor: colors.softCharcoal },
  selectedFilter: { backgroundColor: colors.mutedGold },
  filterLabel: { ...typography.button, fontSize: 14, color: colors.warmCream },
  selectedFilterLabel: { color: colors.charcoal },
  pressed: { opacity: 0.75 },
  footer: { ...typography.caption, color: colors.mutedGray, textAlign: 'center' },
  addBooking: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', paddingHorizontal: 16, backgroundColor: colors.warmCream, borderRadius: 10, marginTop: 8 },
  addBookingText: { ...typography.button, color: colors.charcoal },
});
