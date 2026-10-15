import { Pressable, StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import ScheduledDogCard from '../components/ScheduledDogCard';
import { useBookingSession } from '../context/BookingSession';
import { dogs } from '../data/dogs';
import type { Dog } from '../data/dogs';
import { formatCalendarDate } from '../logic/calendar';
import { dailySchedule, groupScheduleByDog } from '../logic/schedule';
import { theme } from '../theme';

export default function DailyScheduleScreen({ date, onBack, onSelectDog, onSelectBooking, onAddBooking }: { date: string; onBack: () => void; onSelectDog: (dog: Dog) => void; onSelectBooking: (bookingId: string) => void; onAddBooking: () => void }) {
  const { scheduleBookings: bookings, serviceLabel } = useBookingSession();
  const scheduled = dailySchedule(dogs, bookings, date);
  const groups = groupScheduleByDog(scheduled);
  return <Screen>
    <Pressable accessibilityRole="button" accessibilityLabel="Back to calendar" onPress={onBack} style={styles.back}><Text style={styles.link}>‹ Calendar</Text></Pressable>
    <View style={styles.group}>
      <Text accessibilityRole="header" style={styles.title}>Daily schedule</Text>
      <Text style={styles.date}>{formatCalendarDate(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</Text>
      <Text style={styles.secondary}>{groups.length} dogs · {scheduled.length} bookings · Arrival and departure days included</Text>
      <Pressable accessibilityRole="button" onPress={onAddBooking} style={styles.add}><Text style={styles.link}>＋ Add Booking</Text></Pressable>
    </View>
    {groups.map(group => <ScheduledDogCard key={group.dog.id} {...group} serviceLabel={serviceLabel} onSelectDog={onSelectDog} onSelectBooking={onSelectBooking} />)}
    {!scheduled.length && <View style={styles.empty}><Text style={styles.date}>No bookings scheduled</Text><Text style={styles.secondary}>Choose another date in the calendar.</Text></View>}
    <Text style={styles.secondary}>Prototype · All bookings and dog records are fictional.</Text>
  </Screen>;
}
const styles = StyleSheet.create({
  back: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  link: { ...theme.typography.button, color: theme.colors.mutedGold },
  title: { ...theme.typography.heading, color: theme.colors.warmCream },
  date: { ...theme.typography.body, color: theme.colors.warmCream },
  secondary: { ...theme.typography.caption, color: theme.colors.mutedGray },
  group: { gap: theme.spacing.sm },
  empty: { padding: theme.spacing.md, gap: theme.spacing.sm, backgroundColor: theme.colors.softCharcoal, borderRadius: theme.borderRadius.md },
  add: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
});
