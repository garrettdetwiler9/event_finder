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
import type { EventCategory } from '@shared/types';
import { createEvent } from '@/lib/api';
import { useLocation } from '@/hooks/useLocation';
import { Colors } from '@/constants/Colors';
import { format } from 'date-fns';

interface CreateEventModalProps {
  onClose: () => void;
}

const CATEGORIES: EventCategory[] = ['sports', 'social', 'hiking', 'games', 'other'];

function defaultStart() {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d;
}

function defaultEnd() {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 2);
  return d;
}

export function CreateEventModal({ onClose }: CreateEventModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory | ''>('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('');
  const [startTime, setStartTime] = useState<Date>(defaultStart);
  const [endTime, setEndTime] = useState<Date>(defaultEnd);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { coords } = useLocation();

  const handleStartChange = (_: DateTimePickerEvent, date?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (date) {
      setStartTime(date);
      if (date >= endTime) {
        setEndTime(new Date(date.getTime() + 60 * 60 * 1000));
      }
    }
  };

  const handleEndChange = (_: DateTimePickerEvent, date?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (date) setEndTime(date);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Missing field', 'Please enter an event title.');
      return;
    }
    if (!category) {
      Alert.alert('Missing field', 'Please select a category.');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Missing field', 'Please enter an address.');
      return;
    }
    const max = parseInt(maxAttendees, 10);
    if (!max || max < 2) {
      Alert.alert('Invalid', 'Max attendees must be at least 2.');
      return;
    }
    if (endTime <= startTime) {
      Alert.alert('Invalid', 'End time must be after start time.');
      return;
    }

    setSubmitting(true);
    try {
      await createEvent({
        title: title.trim(),
        category: category as EventCategory,
        address: address.trim(),
        description: description.trim(),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        maxAttendees: max,
        // Fall back to Davis, CA coordinates if location permission not granted
        location: coords
          ? { type: 'Point', coordinates: [coords.longitude, coords.latitude] }
          : { type: 'Point', coordinates: [-121.7617, 38.5382] },
        isPublic: true,
      });
      Alert.alert('Event Created!', 'Your event is now live.', [{ text: 'OK', onPress: onClose }]);
    } catch (err: unknown) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
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
