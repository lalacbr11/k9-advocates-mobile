import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Dog } from '../data/dogs';
import type { dailySchedule } from '../logic/schedule';
import DogAvatar from './DogAvatar';
import { bookingCardAction } from '../logic/bookingDetails';
import { theme } from '../theme';

export default function ScheduledDogCard({ dog, bookings, serviceLabel, onSelectDog, onSelectBooking }: {
  dog: Dog;
  bookings: ReturnType<typeof dailySchedule<Dog>>;
  serviceLabel: (id: string) => string;
  onSelectDog?: (dog: Dog) => void;
  onSelectBooking?: (bookingId: string) => void;
}) {
  const [choosing, setChoosing] = useState(false);
  const multiple = bookings.length > 1;
  const select = (id: string) => { setChoosing(false); onSelectBooking?.(id); };
  const open = () => {
    const action = bookingCardAction(bookings.map(entry => entry.booking.id));
    if (action.kind === 'choose') setChoosing(true);
    else if (action.kind === 'open') select(action.id);
  };
  const summary = (entry: typeof bookings[number]) => `${serviceLabel(entry.booking.id)} · ${entry.details.join(' · ')}${entry.details.includes('Continuing boarding stay') ? ` · ${entry.booking.startDate} ${entry.booking.arrivalTime} to ${entry.booking.endDate} ${entry.booking.departureTime}` : ''}`;

  return <View style={styles.card} testID={`scheduled-dog-${dog.id}`}>
    {/* The background, booking rows and Profile are siblings: no nested press targets. */}
    {onSelectBooking && bookings.length > 0 && <Pressable
      testID={`scheduled-dog-open-${dog.id}`} accessibilityRole="button"
      accessibilityLabel={multiple ? `Choose a booking for ${dog.name}, ${bookings.length} bookings` : `View ${dog.name}'s booking, ${summary(bookings[0])}`}
      onPress={open} style={({ pressed }) => [StyleSheet.absoluteFill, styles.cardTarget, pressed && styles.pressed]} />}
    <View pointerEvents="box-none" style={styles.content}>
      <View pointerEvents="box-none" style={styles.heading}>
        <View pointerEvents="none"><DogAvatar name={dog.name} photo={dog.photo} size={40} /></View>
        <View pointerEvents="none" style={styles.identity}>
          <Text style={styles.name}>{dog.name}</Text>
          <Text style={styles.secondary}>{dog.client.name}</Text>
        </View>
        {onSelectDog && <Pressable accessibilityRole="button" accessibilityLabel={`View ${dog.name}'s profile`}
          onPress={() => onSelectDog(dog)} style={styles.profile}><Text style={styles.link}>Profile ›</Text></Pressable>}
      </View>
      {multiple && onSelectBooking && <Text pointerEvents="none" style={styles.secondary}>Choose a booking below · {bookings.length} bookings</Text>}
      {bookings.map(entry => {
        const body = <>
          <Text style={styles.service}>{serviceLabel(entry.booking.id)}{onSelectBooking ? ' ›' : ''}</Text>
          <Text style={styles.times}>{entry.details.join(' · ')}</Text>
          {entry.details.includes('Continuing boarding stay') && <Text style={styles.secondary}>
            {entry.booking.startDate} · {entry.booking.arrivalTime} → {entry.booking.endDate} · {entry.booking.departureTime}
          </Text>}
        </>;
        return multiple && onSelectBooking ? <Pressable key={entry.booking.id} testID={`scheduled-booking-${entry.booking.id}`}
          accessibilityRole="button" accessibilityLabel={`View ${dog.name}'s booking, ${summary(entry)}, ID ${entry.booking.id}`}
          onPress={() => select(entry.booking.id)} style={({ pressed }) => [styles.booking, pressed && styles.pressed]}>{body}</Pressable>
          : <View key={entry.booking.id} pointerEvents={onSelectBooking ? 'none' : 'auto'} testID={`scheduled-booking-${entry.booking.id}`} style={styles.booking}>{body}</View>;
      })}
    </View>
    <Modal visible={choosing} transparent animationType="slide" onRequestClose={() => setChoosing(false)}>
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close booking selection" onPress={() => setChoosing(false)} style={styles.scrim} />
        <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.sheet}>
          <View style={styles.heading}>
            <Text accessibilityRole="header" style={[styles.name, styles.identity]}>Bookings for {dog.name}</Text>
            <Pressable accessibilityRole="button" onPress={() => setChoosing(false)} style={styles.profile}><Text style={styles.link}>Cancel</Text></Pressable>
          </View>
          <ScrollView>
            {bookings.map(entry => <Pressable key={entry.booking.id} accessibilityRole="button" onPress={() => select(entry.booking.id)}
              style={({ pressed }) => [styles.booking, pressed && styles.pressed]}>
              <Text style={styles.service}>{serviceLabel(entry.booking.id)} ›</Text>
              <Text style={styles.times}>{entry.booking.startDate} · {entry.booking.arrivalTime} → {entry.booking.endDate} · {entry.booking.departureTime}</Text>
              <Text style={styles.secondary}>Booking ID · {entry.booking.id}</Text>
            </Pressable>)}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  </View>;
}
const styles = StyleSheet.create({
  card: { backgroundColor: theme.colors.softCharcoal, borderRadius: theme.borderRadius.lg },
  cardTarget: { borderRadius: theme.borderRadius.lg },
  content: { padding: 14, gap: 8 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  identity: { flex: 1 },
  name: { ...theme.typography.button, color: theme.colors.warmCream },
  secondary: { ...theme.typography.caption, color: theme.colors.mutedGray },
  profile: { minHeight: 44, minWidth: 44, justifyContent: 'center' },
  link: { ...theme.typography.caption, color: theme.colors.mutedGold },
  booking: { minHeight: 44, gap: 3, paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.darkGold },
  service: { ...theme.typography.caption, color: theme.colors.mutedGold },
  times: { ...theme.typography.caption, color: theme.colors.warmCream },
  pressed: { backgroundColor: 'rgba(196,154,85,0.12)' },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  scrim: { flex: 1 },
  sheet: { maxHeight: '75%', backgroundColor: theme.colors.softCharcoal, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: theme.spacing.md, gap: theme.spacing.sm },
});
