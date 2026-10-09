import { Pressable, StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import DogCard from '../components/DogCard';
import { bookings } from '../data/bookings';
import { dogs } from '../data/dogs';
import type { Dog } from '../data/dogs';
import { formatCalendarDate } from '../logic/calendar';
import { dailySchedule } from '../logic/schedule';
import { theme } from '../theme';

export default function DailyScheduleScreen({ date, onBack, onSelectDog }: { date: string; onBack: () => void; onSelectDog: (dog: Dog) => void }) {
  const scheduled = dailySchedule(dogs, bookings, date);
  return <Screen>
    <Pressable accessibilityRole="button" accessibilityLabel="Back to calendar" onPress={onBack} style={styles.back}><Text style={styles.link}>‹ Calendar</Text></Pressable>
    <View style={styles.group}>
      <Text accessibilityRole="header" style={styles.title}>Daily schedule</Text>
      <Text style={styles.date}>{formatCalendarDate(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</Text>
      <Text style={styles.secondary}>{scheduled.length} {scheduled.length === 1 ? 'booking' : 'bookings'} · Arrival and departure days included</Text>
    </View>
    {scheduled.map(({ booking, dog, details }) => {
      return <View key={booking.id} style={styles.group}>
        <Text style={styles.service}>{booking.service}</Text>
        <DogCard dog={{ ...dog, service: booking.service }} onPress={() => onSelectDog(dog)} />
        {details.map(detail => <Text key={detail} style={styles.secondary}>{detail}</Text>)}
      </View>;
    })}
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
  service: { ...theme.typography.button, color: theme.colors.mutedGold },
  group: { gap: theme.spacing.sm },
  empty: { padding: theme.spacing.md, gap: theme.spacing.sm, backgroundColor: theme.colors.softCharcoal, borderRadius: theme.borderRadius.md },
});
