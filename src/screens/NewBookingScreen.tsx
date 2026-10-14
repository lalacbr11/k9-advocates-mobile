import { useEffect, useRef, useState } from 'react';
import {
  Alert, BackHandler, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { dogs } from '../data/dogs';
import { services } from '../domain/services';
import type { ServiceCode } from '../domain/services';
import { useBookingSession } from '../context/BookingSession';
import {
  displayTime, evaluateBookingForm, formIsDirty, initialBookingForm, pickerCarrier,
  pickerWallValue, reviewToken, searchBookingDogs, validationMessage,
} from '../logic/bookingForm';
import type { BookingForm } from '../logic/bookingForm';
import { scheduleBoundaries } from '../logic/bookingTime';
import { formatCalendarDate } from '../logic/calendar';
import { theme } from '../theme';

type Picker = { field: 'startDate' | 'endDate' | 'startTime' | 'endTime'; mode: 'date' | 'time'; label: string; value: Date };
const dogIds = dogs.map(dog => dog.id);

export default function NewBookingScreen({ calendarDate, onClose, onSaved }: {
  calendarDate?: string; onClose: () => void; onSaved: () => void;
}) {
  const session = useBookingSession();
  const [initial] = useState(() => initialBookingForm(calendarDate));
  const [form, setForm] = useState(initial);
  const [id] = useState(() => session.reserveId());
  const [dogSheet, setDogSheet] = useState(false);
  const [query, setQuery] = useState('');
  const [picker, setPicker] = useState<Picker | null>(null);
  const pickerSelection = useRef<Date | null>(null);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [acknowledgement, setAcknowledgement] = useState<string>();
  const [submitted, setSubmitted] = useState(false);
  const saving = useRef(false);
  const scroll = useRef<ScrollView>(null);
  const notesFocused = useRef(false);
  const notesPosition = useRef(0);
  const scrollToNotes = () => scroll.current?.scrollTo({ y: Math.max(0, notesPosition.current - 8), animated: true });
  useEffect(() => {
    const subscription = Keyboard.addListener('keyboardDidShow', () => {
      if (notesFocused.current) scrollToNotes();
    });
    return () => subscription.remove();
  }, []);
  const evaluation = evaluateBookingForm(form, id, dogIds, session.bookings);
  const token = evaluation.ok ? reviewToken(form, evaluation) : undefined;
  const conflicts = evaluation.ok ? session.bookings.filter(booking => evaluation.warnings.some(warning => warning.bookingId === booking.id)) : [];
  const incomplete = evaluation.ok && evaluation.invalidRecords.length > 0;
  const errors = submitted && !evaluation.ok ? [...new Set(evaluation.errors.map(validationMessage))] : [];
  const selectedDog = dogs.find(dog => dog.id === form.dogId);
  const kind = form.serviceCode ? services[form.serviceCode].scheduleKind : undefined;
  const startLabel = kind === 'overnight' ? 'Check-in' : kind === 'daycare' ? 'Drop-off' : 'Session Start';
  const endLabel = kind === 'overnight' ? 'Check-out' : kind === 'daycare' ? 'Pick-up' : 'Session End';

  const update = (changes: Partial<BookingForm>) => {
    setForm(previous => ({ ...previous, ...changes }));
    setAcknowledgement(undefined);
  };
  const close = () => {
    Keyboard.dismiss();
    if (!formIsDirty(form, initial)) return onClose();
    Alert.alert('Discard this booking?', 'Your unsaved selections and notes will be lost.', [
      { text: 'Keep editing', style: 'cancel' }, { text: 'Discard', style: 'destructive', onPress: onClose },
    ]);
  };
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => { close(); return true; });
    return () => subscription.remove();
  });

  const openPicker = (field: Picker['field'], mode: Picker['mode'], label: string) => {
    Keyboard.dismiss();
    const value = pickerCarrier(form[field], mode);
    pickerSelection.current = value;
    setPicker({ field, mode, label, value });
  };
  const save = () => {
    if (saving.current) return;
    setSubmitted(true);
    Keyboard.dismiss();
    const result = session.save(form, id, acknowledgement);
    if (result.kind === 'saved') {
      saving.current = true;
      onSaved();
    } else {
      if (result.kind === 'review') setAcknowledgement(undefined);
      scroll.current?.scrollToEnd({ animated: true });
    }
  };
  const dateButton = (field: 'startDate' | 'endDate', label: string) => <Pressable
    accessibilityRole="button" accessibilityLabel={`${label} date, ${form[field]}`}
    onPress={() => openPicker(field, 'date', `${label} date`)} style={styles.field}>
    <Text style={styles.fieldCaption}>Date</Text>
    <Text style={styles.fieldValue}>{formatCalendarDate(form[field], { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
  </Pressable>;
  const timeButton = (field: 'startTime' | 'endTime', label: string) => <Pressable
    accessibilityRole="button" accessibilityLabel={`${label} time, ${displayTime(form[field])}`}
    onPress={() => openPicker(field, 'time', `${label} time`)} style={styles.field}>
    <Text style={styles.fieldCaption}>Time</Text><Text style={styles.fieldValue}>{displayTime(form[field])}</Text>
  </Pressable>;

  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.root}>
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={close} style={styles.close}><Text style={styles.closeText}>‹ Back</Text></Pressable>
        <Text accessibilityRole="header" style={styles.title}>New Booking</Text>
      </View>
      <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive"
        onLayout={() => { if (notesFocused.current) scrollToNotes(); }}
        contentContainerStyle={styles.content}>
        <Text style={styles.demo}>Fictional demo · Bookings and notes last only for this app session.</Text>
        <View style={[styles.section, styles.dogSection]}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>Dog</Text>
          <Pressable testID="booking-dog-select" accessibilityRole="button" onPress={() => { Keyboard.dismiss(); setQuery(''); setDogSheet(true); }} style={styles.selectDog}>
            <View style={styles.flex}><Text style={styles.fieldValue}>{selectedDog?.name ?? 'Select a Dog'}</Text>
              {selectedDog && <Text style={styles.caption}>{selectedDog.client.name}</Text>}</View>
            <Text style={styles.chevron}>⌄</Text>
          </Pressable>
        </View>
        <View style={[styles.section, styles.serviceSection]}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>Service</Text>
          {(['Boarding & Care', 'Training'] as const).map(category => <View key={category} style={styles.group}>
            <Text style={styles.groupLabel}>{category}</Text>
            <View style={styles.cards}>{(Object.keys(services) as ServiceCode[]).filter(code => services[code].category === category).map(code => <Pressable
              key={code} testID={`booking-service-${code}`} accessibilityLabel={services[code].label} accessibilityRole="radio" accessibilityState={{ checked: form.serviceCode === code }}
              onPress={() => update({ serviceCode: code })} style={[styles.card, form.serviceCode === code && styles.selectedCard]}>
              <Text style={styles.cardLabel}>{services[code].label}</Text>
              <Text style={styles.check}>{form.serviceCode === code ? '✓' : '○'}</Text>
            </Pressable>)}</View>
          </View>)}
        </View>
        <View style={[styles.section, styles.scheduleSection]}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>Schedule</Text>
          {!kind ? <Text style={styles.caption}>Select a service to set its schedule.</Text> : <>
            <View style={styles.group}><Text style={styles.groupLabel}>{startLabel}</Text>
              <View style={styles.fieldRow}>{dateButton('startDate', startLabel)}{timeButton('startTime', startLabel)}</View></View>
            <View style={styles.group}><Text style={styles.groupLabel}>{endLabel}</Text>
              <View style={styles.fieldRow}>{kind === 'overnight' ? dateButton('endDate', endLabel) : <View style={styles.field}>
                <Text style={styles.fieldCaption}>Date · same day</Text><Text style={styles.fieldValue}>{formatCalendarDate(form.startDate, { month: 'short', day: 'numeric', year: 'numeric' })}</Text></View>}{timeButton('endTime', endLabel)}</View></View>
          </>}
        </View>
        <View style={[styles.section, styles.notesSection]} onLayout={event => { notesPosition.current = event.nativeEvent.layout.y; }}>
          <Pressable testID="booking-notes-toggle" accessibilityRole="button" accessibilityState={{ expanded: notesExpanded }} onPress={() => { Keyboard.dismiss(); setNotesExpanded(value => !value); }} style={styles.row}>
            <Text style={styles.sectionTitle}>Notes <Text style={styles.optional}>(optional)</Text></Text>
            <Text style={styles.caption}>{form.notes.trim() ? 'Notes added' : ''} {notesExpanded ? '−' : '+'}</Text>
          </Pressable>
          {notesExpanded && <TextInput testID="booking-notes-input" accessibilityLabel="Booking notes" multiline value={form.notes} onChangeText={notes => update({ notes })}
            placeholder="Add a note for this demo booking…" placeholderTextColor={theme.colors.mutedGray} keyboardAppearance="dark" style={styles.notes}
            onFocus={() => { notesFocused.current = true; scrollToNotes(); }}
            onBlur={() => { notesFocused.current = false; }} />}
        </View>
        {(conflicts.length > 0 || incomplete) && <View style={[styles.section, styles.warning]} accessibilityLiveRegion="polite">
          <Text style={styles.sectionTitle}>{incomplete ? 'Conflict checks incomplete' : 'Potential overlap'}</Text>
          <Text style={styles.caption}>Checked against fictional bookings in this app session only.</Text>
          {conflicts.length > 0 && <Text style={styles.body}>{conflicts.length} existing {conflicts.length === 1 ? 'booking overlaps' : 'bookings overlap'} this schedule.</Text>}
          {incomplete && <><Text style={styles.body}>Some existing bookings could not be checked. Other scheduling conflicts may exist.</Text>
            {evaluation.ok && evaluation.invalidRecords.map(record => <Text key={record.index} style={styles.caption}>Booking {record.bookingId ?? `record ${record.index + 1}`} needs review.</Text>)}</>}
          {conflicts.length > 0 && <Pressable accessibilityRole="button" accessibilityState={{ expanded: detailsExpanded }} onPress={() => setDetailsExpanded(value => !value)} style={styles.detailButton}>
            <Text style={styles.link}>View Existing Booking{conflicts.length > 1 ? 's' : ''} {detailsExpanded ? '−' : '+'}</Text>
          </Pressable>}
          {detailsExpanded && conflicts.map(booking => {
            const [start, end] = scheduleBoundaries(booking.schedule);
            return <View key={booking.id} style={styles.conflictDetail}>
              <Text style={styles.groupLabel}>{dogs.find(dog => dog.id === booking.dogId)?.name ?? 'Unknown dog'} · {services[booking.serviceCode].label}</Text>
              <Text style={styles.caption}>{start.date} · {displayTime(start.time)} → {end.date} · {displayTime(end.time)}</Text>
              <Text style={styles.caption}>Confirmed · Read-only fictional booking</Text>
            </View>;
          })}
          <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: !!token && acknowledgement === token }}
            onPress={() => setAcknowledgement(acknowledgement === token ? undefined : token)} style={styles.acknowledge}>
            <Text style={styles.check}>{acknowledgement === token ? '☑' : '☐'}</Text>
            <Text style={[styles.body, styles.flex]}>I have reviewed the warnings and want to save this demo booking.</Text>
          </Pressable>
          {submitted && token !== acknowledgement && <Text style={styles.error}>Please acknowledge these warnings before saving.</Text>}
        </View>}
        {evaluation.ok && !token && <Text style={styles.caption}>No overlaps found in the checked fictional session bookings.</Text>}
        {!!errors.length && <View style={[styles.section, styles.errorSection]} accessibilityLiveRegion="polite">
          <Text style={styles.groupLabel}>Please check your booking</Text>{errors.map(error => <Text key={error} style={styles.error}>{error}</Text>)}
        </View>}
      </ScrollView>
      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <Pressable accessibilityRole="button" onPress={save} style={({ pressed }) => [styles.save, pressed && styles.pressed]}><Text style={styles.saveText}>Save Booking</Text></Pressable>
        <Text style={styles.footerCaption}>Demo session only · Not permanently saved</Text>
      </SafeAreaView>
    </KeyboardAvoidingView>
    <Modal visible={dogSheet} transparent animationType="slide" onRequestClose={() => setDogSheet(false)}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close dog selection" style={styles.scrim} onPress={() => setDogSheet(false)} />
        <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.sheet}>
          <View style={styles.handle} /><View style={styles.row}><Text style={styles.sectionTitle}>Select a Dog</Text>
            <Pressable accessibilityRole="button" onPress={() => setDogSheet(false)} style={styles.close}><Text style={styles.link}>Done</Text></Pressable></View>
          <TextInput accessibilityLabel="Search dogs or owners" placeholder="Search dogs or owners" placeholderTextColor={theme.colors.mutedGray} keyboardAppearance="dark"
            value={query} onChangeText={setQuery} autoCorrect={false} style={styles.search} />
          <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
            {searchBookingDogs(dogs, query).map(dog => <Pressable key={dog.id} accessibilityRole="button"
              accessibilityLabel={`${dog.name}, owner ${dog.client.name}`} onPress={() => { update({ dogId: dog.id }); Keyboard.dismiss(); setDogSheet(false); }} style={styles.dogOption}>
              <View style={styles.flex}><Text style={styles.fieldValue}>{dog.name}</Text><Text style={styles.caption}>{dog.client.name}</Text></View>
              {form.dogId === dog.id && <Text style={styles.check}>✓</Text>}
            </Pressable>)}
            {!searchBookingDogs(dogs, query).length && <Text style={styles.body}>No dogs match that search.</Text>}
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
    <Modal visible={!!picker} transparent animationType="slide" onRequestClose={() => setPicker(null)}>
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" accessibilityLabel="Cancel date or time selection" style={styles.scrim} onPress={() => setPicker(null)} />
        <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.row}><Pressable accessibilityRole="button" onPress={() => setPicker(null)} style={styles.close}><Text style={styles.link}>Cancel</Text></Pressable>
            <Text style={styles.groupLabel}>{picker?.label}</Text>
            <Pressable accessibilityRole="button" onPress={() => { if (picker && pickerSelection.current) update({ [picker.field]: pickerWallValue(pickerSelection.current, picker.mode) }); setPicker(null); }} style={styles.close}><Text style={styles.link}>Done</Text></Pressable></View>
          {picker && <DateTimePicker value={picker.value} mode={picker.mode} display="spinner" locale="en-US" timeZoneName="UTC"
            minuteInterval={1} themeVariant="dark" textColor={theme.colors.warmCream}
            minimumDate={picker.mode === 'date' ? new Date('2000-01-01T00:00:00Z') : undefined}
            maximumDate={picker.mode === 'date' ? new Date('2100-12-31T23:59:59Z') : undefined}
            // Keep the initial carrier stable while a native wheel is moving.
            // Refeeding intermediate values can interrupt its scroll on iOS.
            onValueChange={(_event, value) => { pickerSelection.current = value; }} />}
        </SafeAreaView>
      </View>
    </Modal>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.charcoal },
  header: { paddingHorizontal: 20, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.darkGold },
  title: { ...theme.typography.heading, color: theme.colors.warmCream, paddingBottom: 8 },
  close: { minHeight: 44, justifyContent: 'center' }, closeText: { ...theme.typography.button, color: theme.colors.mutedGold },
  content: { padding: 16, gap: 12, paddingBottom: 28 }, demo: { ...theme.typography.caption, color: theme.colors.mutedGray },
  section: { padding: 12, borderRadius: 16, gap: 10 }, dogSection: { backgroundColor: theme.colors.softCharcoal },
  serviceSection: { backgroundColor: theme.colors.softCharcoal }, scheduleSection: { backgroundColor: theme.colors.softCharcoal }, notesSection: { backgroundColor: theme.colors.softCharcoal },
  sectionTitle: { ...theme.typography.subheading, fontSize: 22, lineHeight: 28, color: theme.colors.warmCream },
  selectDog: { backgroundColor: theme.colors.charcoal, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', minHeight: 58 },
  flex: { flex: 1 }, chevron: { fontSize: 24, color: theme.colors.mutedGold },
  caption: { ...theme.typography.caption, color: theme.colors.mutedGray }, body: { ...theme.typography.body, fontSize: 15, lineHeight: 22, color: theme.colors.warmCream },
  group: { gap: 8 }, groupLabel: { ...theme.typography.button, fontSize: 15, color: theme.colors.mutedGold },
  cards: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, card: { width: '48%', flexGrow: 1, minHeight: 56, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#454940', backgroundColor: theme.colors.charcoal, flexDirection: 'row', alignItems: 'center', gap: 6 },
  selectedCard: { backgroundColor: '#303D2D', borderColor: '#8BA276' }, cardLabel: { ...theme.typography.button, fontSize: 15, lineHeight: 21, flex: 1, color: theme.colors.warmCream },
  check: { fontSize: 22, color: '#BCD3A9' }, fieldRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  field: { flex: 1, minWidth: 110, minHeight: 68, padding: 12, borderRadius: 12, backgroundColor: theme.colors.charcoal, gap: 4 },
  fieldCaption: { ...theme.typography.caption, fontSize: 12, color: theme.colors.mutedGray }, fieldValue: { ...theme.typography.button, fontSize: 16, lineHeight: 23, color: theme.colors.warmCream },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, minHeight: 44 },
  optional: { fontSize: 14 }, notes: { backgroundColor: theme.colors.charcoal, borderRadius: 12, padding: 12, minHeight: 120, textAlignVertical: 'top', ...theme.typography.body, color: theme.colors.warmCream },
  warning: { backgroundColor: '#302A1E', borderWidth: 1, borderColor: theme.colors.darkGold },
  detailButton: { minHeight: 44, justifyContent: 'center' }, link: { ...theme.typography.button, fontSize: 15, color: theme.colors.mutedGold },
  conflictDetail: { paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.darkGold, gap: 6 },
  acknowledge: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 },
  errorSection: { backgroundColor: '#332421' }, error: { ...theme.typography.caption, color: '#F3B5A6' },
  footer: { paddingHorizontal: 16, paddingTop: 12, backgroundColor: theme.colors.charcoal, borderTopWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.darkGold, gap: 6 },
  save: { backgroundColor: theme.colors.mutedGold, padding: 14, borderRadius: 14, alignItems: 'center', minHeight: 52 }, saveText: { ...theme.typography.button, color: theme.colors.charcoal },
  footerCaption: { ...theme.typography.caption, fontSize: 12, color: theme.colors.mutedGray, textAlign: 'center', paddingBottom: 6 }, pressed: { opacity: 0.75 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' }, scrim: { flex: 1 },
  sheet: { maxHeight: '75%', backgroundColor: theme.colors.softCharcoal, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, gap: 12 },
  handle: { width: 36, height: 5, borderRadius: 3, backgroundColor: '#AEB3A6', alignSelf: 'center' },
  search: { backgroundColor: theme.colors.charcoal, borderRadius: 12, padding: 12, minHeight: 48, ...theme.typography.body, color: theme.colors.warmCream },
  dogOption: { minHeight: 72, flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.darkGold },
});
