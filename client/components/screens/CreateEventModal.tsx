import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { X, Tag, MapPin, Users, Clock, AlignLeft } from 'lucide-react-native';
import type { EventCategory, CreateEventData } from '@shared/types';
import { createEvent } from '@/lib/api';
import { useLocation } from '@/hooks/useLocation';
import { Colors } from '@/constants/Colors';
import { format } from 'date-fns';

interface CreateEventModalProps {
  onClose: () => void;
}

const CATEGORIES: EventCategory[] = ['sports', 'social', 'hiking', 'games', 'other'];

export function CreateEventModal({ onClose }: CreateEventModalProps) {
  const { coords } = useLocation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory | null>(null);
  const [address, setAddress] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('');
  const [startTime, setStartTime] = useState(new Date(Date.now() + 60 * 60 * 1000));
  const [endTime, setEndTime] = useState(new Date(Date.now() + 3 * 60 * 60 * 1000));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleStartChange = (_: DateTimePickerEvent, date?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (date) setStartTime(date);
  };

  const handleEndChange = (_: DateTimePickerEvent, date?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (date) setEndTime(date);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return Alert.alert('Missing field', 'Please enter an event title.');
    if (!category) return Alert.alert('Missing field', 'Please select a category.');
    if (!address.trim()) return Alert.alert('Missing field', 'Please enter an address.');
    if (!description.trim()) return Alert.alert('Missing field', 'Please enter a description.');
    const max = parseInt(maxAttendees, 10);
    if (!max || max < 2) return Alert.alert('Invalid', 'Max attendees must be at least 2.');
    if (endTime <= startTime) return Alert.alert('Invalid', 'End time must be after start time.');

    const data: CreateEventData = {
      title: title.trim(),
      description: description.trim(),
      category,
      address: address.trim(),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      maxAttendees: max,
      isPublic: true,
      location: {
        type: 'Point',
        coordinates: coords ? [coords.longitude, coords.latitude] : [0, 0],
      },
    };

    setSubmitting(true);
    try {
      await createEvent(data);
      Alert.alert('Success!', 'Your event has been created.', [{ text: 'OK', onPress: onClose }]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create event. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#9333ea', '#ec4899', '#f97316']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Create Event</Text>
        <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
          <X size={22} color={Colors.white} />
        </Pressable>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Field label="Event Title" icon={<Tag size={16} color={Colors.primary} />}>
          <TextInput
            style={styles.input}
            placeholder="e.g. Morning Run at the Park"
            placeholderTextColor={Colors.textPlaceholder}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </Field>

        {/* Category */}
        <View style={styles.fieldGroup}>
          <View style={styles.fieldLabel}>
            <Tag size={16} color={Colors.secondary} />
            <Text style={styles.fieldLabelText}>Category</Text>
          </View>
          <View style={styles.categoryRow}>
            {CATEGORIES.map(cat => (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    category === cat && styles.categoryChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Address */}
        <Field label="Address" icon={<MapPin size={16} color="#f97316" />}>
          <TextInput
            style={styles.input}
            placeholder="e.g. ARC, UC Davis"
            placeholderTextColor={Colors.textPlaceholder}
            value={address}
            onChangeText={setAddress}
          />
        </Field>

        {/* Start time */}
        <View style={styles.fieldGroup}>
          <View style={styles.fieldLabel}>
            <Clock size={16} color={Colors.primary} />
            <Text style={styles.fieldLabelText}>Start Time</Text>
          </View>
          <Pressable style={styles.dateBtn} onPress={() => setShowStartPicker(true)}>
            <Text style={styles.dateBtnText}>{format(startTime, 'MMM d, yyyy · h:mm a')}</Text>
          </Pressable>
          {showStartPicker && (
            <DateTimePicker
              value={startTime}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={handleStartChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        {/* End time */}
        <View style={styles.fieldGroup}>
          <View style={styles.fieldLabel}>
            <Clock size={16} color={Colors.secondary} />
            <Text style={styles.fieldLabelText}>End Time</Text>
          </View>
          <Pressable style={styles.dateBtn} onPress={() => setShowEndPicker(true)}>
            <Text style={styles.dateBtnText}>{format(endTime, 'MMM d, yyyy · h:mm a')}</Text>
          </Pressable>
          {showEndPicker && (
            <DateTimePicker
              value={endTime}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={handleEndChange}
              minimumDate={startTime}
            />
          )}
        </View>

        {/* Max Attendees */}
        <Field label="Max Attendees" icon={<Users size={16} color={Colors.secondary} />}>
          <TextInput
            style={styles.input}
            placeholder="e.g. 20"
            placeholderTextColor={Colors.textPlaceholder}
            value={maxAttendees}
            onChangeText={setMaxAttendees}
            keyboardType="number-pad"
          />
        </Field>

        {/* Description */}
        <Field label="Description" icon={<AlignLeft size={16} color="#f97316" />}>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell people what to expect…"
            placeholderTextColor={Colors.textPlaceholder}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={1000}
          />
        </Field>

        <Pressable
          style={({ pressed }) => [styles.submitBtn, pressed && styles.submitBtnPressed]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <LinearGradient
            colors={['#9333ea', '#ec4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.submitText}>Create Event</Text>
            )}
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.fieldGroup}>
      <View style={styles.fieldLabel}>
        {icon}
        <Text style={styles.fieldLabelText}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  categoryChip: {
    borderColor: Colors.border,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  categoryChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryChipText: { color: Colors.textSecondary, fontSize: 14, textTransform: 'capitalize' },
  categoryChipTextActive: { color: Colors.white, fontWeight: '600' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  closeBtn: {
    alignItems: 'center',
    backgroundColor: Colors.whiteAlpha20,
    borderRadius: 20,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  container: { backgroundColor: Colors.white, flex: 1 },
  dateBtn: {
    backgroundColor: Colors.backgroundMuted,
    borderColor: Colors.border,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateBtnText: { color: Colors.textPrimary, fontSize: 15 },
  fieldGroup: { marginBottom: 20 },
  fieldLabel: { alignItems: 'center', flexDirection: 'row', gap: 8, marginBottom: 8 },
  fieldLabelText: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerTitle: { color: Colors.white, fontSize: 20, fontWeight: '700' },
  input: {
    backgroundColor: Colors.backgroundMuted,
    borderColor: Colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: Colors.textPrimary,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  submitBtn: { marginTop: 8 },
  submitBtnPressed: { opacity: 0.85 },
  submitGradient: {
    alignItems: 'center',
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
  },
  submitText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  textArea: { height: 120, paddingTop: 12, textAlignVertical: 'top' },
});
