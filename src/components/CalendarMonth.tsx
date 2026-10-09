import { Pressable, StyleSheet, Text, View } from 'react-native';
import { bookings } from '../data/bookings';
import { bookingsForDate, formatCalendarDate, localToday, monthGrid } from '../logic/calendar';
import { theme } from '../theme';

const { colors, typography, spacing, borderRadius } = theme;
export default function CalendarMonth({ month, onSelectDate }: { month: string; onSelectDate: (date: string) => void }) {
  const today = localToday();
  return (
    <View style={styles.month}>
      <Text accessibilityRole="header" style={styles.title}>{formatCalendarDate(month, { month: 'long', year: 'numeric' })}</Text>
      <View style={styles.grid}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <View key={day} style={styles.column}><Text style={styles.weekday}>{day}</Text></View>)}
        {monthGrid(month).map((date, index) => {
          const count = date ? bookingsForDate(bookings, date).length : 0;
          return date ? (
            <Pressable key={date} accessibilityRole="button"
              accessibilityLabel={`${formatCalendarDate(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}, ${count} bookings${date === today ? ', today' : ''}`}
              onPress={() => onSelectDate(date)} style={({ pressed }) => [styles.cell, pressed && styles.pressed]}>
              <View style={[styles.day, count > 0 && styles.booked, date === today && styles.today]}>
                <Text style={[styles.number, count > 0 && styles.bookedNumber]}>{Number(date.slice(-2))}</Text>
                <View style={[styles.dot, count > 0 && styles.bookedDot]} />
              </View>
            </Pressable>
          ) : <View key={`blank-${index}`} style={styles.cell} />;
        })}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  month: { paddingVertical: spacing.md, gap: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.darkGold },
  title: { ...typography.subheading, color: colors.warmCream },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  column: { width: '14.285714%', alignItems: 'center', paddingBottom: spacing.sm },
  weekday: { ...typography.caption, color: colors.mutedGray, fontSize: 12 },
  cell: { width: '14.285714%', minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingVertical: 2 },
  day: { width: '94%', minHeight: 44, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent' },
  booked: { backgroundColor: colors.warmCream },
  today: { borderColor: colors.mutedGold, borderWidth: 2 },
  number: { ...typography.body, color: colors.warmCream },
  bookedNumber: { color: colors.charcoal, fontWeight: '500' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'transparent' },
  bookedDot: { backgroundColor: colors.darkGold },
  pressed: { opacity: 0.65 },
});
