import { useState } from 'react';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { dogs } from '../data/dogs';
import type { Dog } from '../data/dogs';
import { bookings } from '../data/bookings';
import { localToday, formatCalendarDate } from '../logic/calendar';
import { dailySchedule, scheduledDogs as selectScheduledDogs, scheduleMovements } from '../logic/schedule';
import { filterByService, previewDogs } from '../logic/dogs';
import { theme } from '../theme';

const { colors, typography, spacing, borderRadius } = theme;
const services = ['Boarding', 'Daycare', 'Training'] as const;
type Service = Dog['service'];

export default function DashboardScreen({ navigation }: { navigation: ReactNode }) {
  const [filter, setFilter] = useState<Service | 'All'>('All');
  const today = localToday();
  const date = formatCalendarDate(today, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  const entries = dailySchedule(dogs, bookings, today);
  const todayDogs = selectScheduledDogs(entries);
  const scheduledDogs = filterByService(todayDogs, filter);
  const movements = scheduleMovements(entries, today);
  const preview = previewDogs(todayDogs, 3);

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic" indicatorStyle="white">
        {navigation}
        <View style={styles.brand}>
          <View style={styles.brandMark} />
          <Text style={styles.wordmark}>K9 ADVOCATES</Text>
          <Text style={styles.date}>{date}</Text>
        </View>
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>Today’s overview</Text>
          <View style={styles.summaryGrid}>
            {services.map((service) => (
              <View key={service} style={styles.summaryCard}>
                <Text style={styles.count}>{filterByService(todayDogs, service).length}</Text>
                <Text style={styles.summaryLabel}>{service}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>Arrivals & departures</Text>
          <View style={styles.panel}>
            {movements.slice(0, 3).map((movement, index) => (
              <View key={movement.id} style={[styles.movementRow, index > 0 && styles.divider]}>
                <View style={styles.rowContent}>
                  <Text style={styles.dogName}>{movement.dog.name}</Text>
                  <Text style={styles.secondary}>{movement.type} · {movement.service}</Text>
                </View>
                <Text style={styles.time}>{movement.time}</Text>
              </View>
            ))}
            {!movements.length && <Text style={[styles.secondary, { paddingVertical: spacing.sm }]}>No arrivals or departures today</Text>}
          </View>
          {movements.length > 3 && <Text style={styles.secondary}>{movements.length - 3} more movements · Times in full schedule below</Text>}
        </View>
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>Scheduled dogs · {new Set(todayDogs.map(dog => dog.id)).size}</Text>
          <View style={styles.panel}>
            {preview.dogs.map((dog, index) => (
              <View key={`${dog.id}-${dog.service}`} style={[styles.previewRow, index > 0 && styles.divider]}>
                <Text style={styles.dogName}>{dog.name}</Text>
                <Text style={styles.secondary}>{dog.service}</Text>
              </View>
            ))}
          </View>
          {preview.remaining > 0 && (
            <Text style={styles.secondary}>{preview.remaining} more {preview.remaining === 1 ? 'dog' : 'dogs'} · Full schedule below</Text>
          )}
        </View>
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>Full dog schedule</Text>
          <Text style={styles.secondary}>{new Set(todayDogs.map(dog => dog.id)).size} dogs scheduled across your services</Text>
          <View style={styles.filters}>
            {(['All', ...services] as const).map((service) => (
              <Pressable key={service} accessibilityRole="button"
                accessibilityLabel={`Show ${service === 'All' ? 'all dogs' : `${service.toLowerCase()} dogs`}`}
                accessibilityState={{ selected: filter === service }} onPress={() => setFilter(service)}
                style={({ pressed }) => [styles.filter, filter === service && styles.selectedFilter, pressed && styles.pressed]}>
                <Text style={[styles.filterLabel, filter === service && styles.selectedFilterLabel]}>{service}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.panel}>
            {!scheduledDogs.length && <Text style={[styles.secondary, { paddingVertical: spacing.sm }]}>No dogs scheduled{filter === 'All' ? ' today' : ` for ${filter.toLowerCase()}`}</Text>}
            {scheduledDogs.map((dog, index) => (
              <View key={`${dog.id}-${dog.service}`} style={[styles.dogRow, index > 0 && styles.divider]}>
                <View style={styles.dogHeading}>
                  <Text style={styles.dogName}>{dog.name}</Text>
                  <Text style={styles.serviceLabel}>{dog.service}</Text>
                </View>
                <Text style={styles.secondary}>{dog.breed}</Text>
                <Text style={styles.dogDetail}>{dog.scheduleDetail}</Text>
              </View>
            ))}
          </View>
        </View>
        <Text style={styles.footer}>Dashboard preview · Fictional sample data</Text>
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
  panel: { backgroundColor: colors.softCharcoal, borderRadius: borderRadius.lg, paddingHorizontal: spacing.md },
  movementRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, minHeight: 60 },
  rowContent: { flexGrow: 1, flexBasis: 160, gap: spacing.xs },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.darkGold },
  dogName: { ...typography.body, fontWeight: '500', color: colors.lightCream },
  time: { ...typography.caption, color: colors.warmCream, fontVariant: ['tabular-nums'] },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  filter: { minHeight: 44, minWidth: 44, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, alignItems: 'center', justifyContent: 'center', borderRadius: borderRadius.pill, backgroundColor: colors.softCharcoal },
  selectedFilter: { backgroundColor: colors.mutedGold },
  filterLabel: { ...typography.button, fontSize: 14, color: colors.warmCream },
  selectedFilterLabel: { color: colors.charcoal },
  pressed: { opacity: 0.75 },
  previewRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, paddingVertical: spacing.sm, minHeight: 44 },
  dogRow: { paddingVertical: spacing.md, gap: spacing.xs },
  dogHeading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  serviceLabel: { ...typography.caption, color: colors.mutedGold },
  dogDetail: { ...typography.caption, color: colors.warmCream, marginTop: spacing.xs },
  footer: { ...typography.caption, color: colors.mutedGray, textAlign: 'center' },
});
