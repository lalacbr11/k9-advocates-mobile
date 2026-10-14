import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Dog } from '../data/dogs';
import type { dailySchedule } from '../logic/schedule';
import DogAvatar from './DogAvatar';
import { theme } from '../theme';

export default function ScheduledDogCard({ dog, bookings, serviceLabel, onSelectDog }: {
  dog: Dog;
  bookings: ReturnType<typeof dailySchedule<Dog>>;
  serviceLabel: (id: string) => string;
  onSelectDog?: (dog: Dog) => void;
}) {
  return <View style={styles.card} testID={`scheduled-dog-${dog.id}`}>
    <View style={styles.heading}>
      {onSelectDog && <DogAvatar name={dog.name} photo={dog.photo} size={40} />}
      <View style={styles.identity}>
        <Text style={styles.name}>{dog.name}</Text>
        {onSelectDog && <Text style={styles.secondary}>{dog.client.name}</Text>}
      </View>
      {onSelectDog && <Pressable accessibilityRole="button" accessibilityLabel={`View ${dog.name}'s profile`}
        onPress={() => onSelectDog(dog)} style={styles.profile}><Text style={styles.link}>Profile ›</Text></Pressable>}
    </View>
    {bookings.map(({ booking, details }) => <View key={booking.id} testID={`scheduled-booking-${booking.id}`} style={styles.booking}>
      <Text style={styles.service}>{serviceLabel(booking.id)}</Text>
      <Text style={styles.times}>{details.join(' · ')}</Text>
      {details.includes('Continuing boarding stay') && <Text style={styles.secondary}>
        {booking.startDate} · {booking.arrivalTime} → {booking.endDate} · {booking.departureTime}
      </Text>}
    </View>)}
  </View>;
}
const styles = StyleSheet.create({
  card: { backgroundColor: theme.colors.softCharcoal, borderRadius: 16, padding: 14, gap: 8 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  identity: { flex: 1 },
  name: { ...theme.typography.button, color: theme.colors.warmCream },
  secondary: { ...theme.typography.caption, color: theme.colors.mutedGray },
  profile: { minHeight: 44, minWidth: 44, justifyContent: 'center' },
  link: { ...theme.typography.caption, color: theme.colors.mutedGold },
  booking: { gap: 3, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.darkGold },
  service: { ...theme.typography.caption, color: theme.colors.mutedGold },
  times: { ...theme.typography.caption, color: theme.colors.warmCream },
});
