import { Pressable, StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import DogAvatar from '../components/DogAvatar';
import type { Booking } from '../domain/booking';
import { services } from '../domain/services';
import { dogs } from '../data/dogs';
import { bookingScheduleRows } from '../logic/bookingDetails';
import { displayTime } from '../logic/bookingForm';
import { formatCalendarDate } from '../logic/calendar';
import { theme } from '../theme';

const { colors, typography, spacing, borderRadius } = theme;

export default function BookingDetailsScreen({ booking, onBack }: {
  booking: Booking; onBack: () => void;
}) {
  const dog = dogs.find(dog => dog.id === booking.dogId);
  const details = [
    ['Owner', dog?.client.name ?? 'Unavailable'],
    ['Service', services[booking.serviceCode].label],
    ['Status', booking.status === 'confirmed' ? 'Confirmed' : 'Cancelled'],
    ...bookingScheduleRows(booking.schedule).map(row => [
      row.label,
      `${formatCalendarDate(row.date, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} · ${displayTime(row.time)}`,
    ]),
  ];

  return (
    <Screen>
      <Pressable accessibilityRole="button" accessibilityLabel="Back to previous screen" onPress={onBack}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
        <Text style={styles.backLabel}>‹ Back</Text>
      </Pressable>
      <View style={styles.identity}>
        <DogAvatar name={dog?.name ?? 'Unknown dog'} photo={dog?.photo} size={112} />
        <View style={styles.identityText}>
          <Text accessibilityRole="header" style={styles.title}>{dog?.name ?? 'Unknown dog'}</Text>
          <Text style={styles.secondary}>{dog?.breed ?? 'Breed unavailable'}</Text>
        </View>
      </View>
      <Text accessibilityRole="header" style={styles.sectionTitle}>Booking details</Text>
      <View style={styles.panel}>
        {details.map(([label, value], index) => (
          <View key={label} style={[styles.row, index > 0 && styles.divider]}>
            <Text style={styles.secondary}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
          </View>
        ))}
      </View>
      <View style={styles.footer}>
        <Text selectable style={styles.identifier}>Booking ID · {booking.id}</Text>
        <Text style={styles.secondary}>Fictional demo · Session only · Read-only details</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md },
  identityText: { flexGrow: 1, flexBasis: 160, gap: spacing.xs },
  back: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start', paddingRight: spacing.md },
  backLabel: { ...typography.button, color: colors.mutedGold },
  title: { ...typography.heading, color: colors.warmCream },
  sectionTitle: { ...typography.subheading, color: colors.warmCream },
  secondary: { ...typography.caption, color: colors.mutedGray },
  value: { ...typography.body, color: colors.warmCream, flexShrink: 1 },
  panel: { backgroundColor: colors.softCharcoal, borderRadius: borderRadius.lg, paddingHorizontal: spacing.md },
  row: { paddingVertical: spacing.sm, minHeight: 48, gap: spacing.xs },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.darkGold },
  identifier: { ...typography.caption, fontSize: 12, color: colors.mutedGray },
  // Adds breathing room beyond Screen's shared scroll-content bottom padding.
  footer: { gap: spacing.sm, paddingBottom: spacing.xl },
  pressed: { opacity: 0.75 },
});
