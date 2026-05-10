import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Calendar, MapPin, Plus, Users, X } from 'lucide-react-native';
import { useAuthContext } from '@/context/AuthContext';
import {
  createEvent,
  deleteEvent,
  getEvents,
  type CreateEventData,
  type Event,
  type UserProfile,
} from '@/lib/api';
import { Colors } from '@/constants/Colors';

// Davis, CA — default location for created events
const DAVIS_LOCATION: CreateEventData['location'] = {
  type: 'Point',
  coordinates: [-121.7405, 38.5449],
};

const EVENT_CATEGORIES = ['sports', 'social', 'hiking', 'games', 'other'] as const;
type EventCategory = (typeof EVENT_CATEGORIES)[number];

interface FormState {
  title: string;
  description: string;
  category: EventCategory;
  address: string;
  maxAttendees: string;
}

export default function MyEventsScreen() {
  const { userProfile } = useAuthContext();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // create form state
  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    category: 'social',
    address: '',
    maxAttendees: '20',
  });
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    return d;
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 2, 0, 0, 0);
    return d;
  });
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch {
      // keep stale data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const myId = userProfile?._id;

  const hosting = events.filter((e: Event) => {
    const creatorId = typeof e.creator === 'string' ? e.creator : (e.creator as UserProfile)._id;
    return creatorId === myId;
  });

  const attending = events.filter((e: Event) => {
    const creatorId = typeof e.creator === 'string' ? e.creator : (e.creator as UserProfile)._id;
    return creatorId !== myId && (e.attendees as string[]).includes(myId ?? '');
  });

  const handleCreate = async () => {
    if (!form.title.trim() || !form.address.trim() || !form.description.trim()) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }
    if (endDate <= startDate) {
      Alert.alert('Invalid time', 'End time must be after start time.');
      return;
    }
    setSubmitting(true);
    try {
      const created = await createEvent({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        location: DAVIS_LOCATION,
        address: form.address.trim(),
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        maxAttendees: Math.max(1, parseInt(form.maxAttendees, 10) || 20),
        isPublic: true,
      });
      setEvents((prev: Event[]) => [created, ...prev]);
      setShowModal(false);
      setForm({ title: '', description: '', category: 'social', address: '', maxAttendees: '20' });
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not create event.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (event: Event) => {
    Alert.alert('Delete event', `Delete "${event.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(event._id);
          try {
            await deleteEvent(event._id);
            setEvents((prev: Event[]) => prev.filter((e: Event) => e._id !== event._id));
          } catch (err: unknown) {
            Alert.alert('Error', err instanceof Error ? err.message : 'Could not delete event.');
          } finally {
            setDeleting(null);
          }
        },
      },
    ]);
  };

  const renderCard = ({ item: event }: { item: Event }) => {
    const isHost = hosting.some((e: Event) => e._id === event._id);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{event.category}</Text>
          </View>
          {isHost && (
            <View style={styles.hostBadge}>
              <Text style={styles.hostBadgeText}>Host</Text>
            </View>
          )}
        </View>
        <Text style={styles.cardTitle}>{event.title}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Calendar size={13} color={Colors.textSecondary} />
            <Text style={styles.metaText}>
              {format(new Date(event.startTime), 'MMM d, h:mm a')}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <MapPin size={13} color={Colors.textSecondary} />
            <Text style={styles.metaText} numberOfLines={1}>{event.address}</Text>
          </View>
          <View style={styles.metaItem}>
            <Users size={13} color={Colors.textSecondary} />
            <Text style={styles.metaText}>
              {(event.attendees as string[]).length}/{event.maxAttendees}
            </Text>
          </View>
        </View>
        {isHost && (
          <Pressable
            style={styles.deleteButton}
            onPress={() => handleDelete(event)}
            disabled={deleting === event._id}
          >
            {deleting === event._id
              ? <ActivityIndicator size="small" color={Colors.error} />
              : <Text style={styles.deleteButtonText}>Delete event</Text>}
          </Pressable>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Events</Text>
      </View>

      <FlatList
        data={[...hosting, ...attending]}
        keyExtractor={(e: Event) => e._id}
        renderItem={renderCard}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListHeaderComponent={
          events.length > 0 ? (
            <View>
              {hosting.length > 0 && (
                <Text style={styles.sectionLabel}>Hosting ({hosting.length})</Text>
              )}
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No events yet — create one!</Text>
          </View>
        }
      />

      <Pressable style={styles.fab} onPress={() => setShowModal(true)}>
        <Plus size={28} color="#fff" />
      </Pressable>

      {/* Create Event Modal */}
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Event</Text>
              <Pressable onPress={() => setShowModal(false)} hitSlop={12}>
                <X size={22} color="#fff" />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody} contentContainerStyle={styles.modalContent}>
              <Text style={styles.fieldLabel}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Board Game Night"
                value={form.title}
                onChangeText={(t: string) => setForm((f: FormState) => ({ ...f, title: t }))}
              />

              <Text style={styles.fieldLabel}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What's the plan?"
                value={form.description}
                onChangeText={(t: string) => setForm((f: FormState) => ({ ...f, description: t }))}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.fieldLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                {EVENT_CATEGORIES.map(cat => (
                  <Pressable
                    key={cat}
                    style={[styles.chip, form.category === cat && styles.chipActive]}
                    onPress={() => setForm((f: FormState) => ({ ...f, category: cat }))}
                  >
                    <Text style={[styles.chipText, form.category === cat && styles.chipTextActive]}>
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Text style={styles.fieldLabel}>Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. UC Davis Memorial Union"
                value={form.address}
                onChangeText={(t: string) => setForm((f: FormState) => ({ ...f, address: t }))}
              />

              <Text style={styles.fieldLabel}>Start time</Text>
              <Pressable
                style={styles.dateButton}
                onPress={() => setShowStartPicker(true)}
              >
                <Calendar size={16} color={Colors.primary} />
                <Text style={styles.dateButtonText}>
                  {format(startDate, 'MMM d, yyyy h:mm a')}
                </Text>
              </Pressable>
              {showStartPicker && (
                <DateTimePicker
                  value={startDate}
                  mode="datetime"
                  onChange={(_: DateTimePickerEvent, date?: Date) => {
                    setShowStartPicker(false);
                    if (date) setStartDate(date);
                  }}
                />
              )}

              <Text style={styles.fieldLabel}>End time</Text>
              <Pressable
                style={styles.dateButton}
                onPress={() => setShowEndPicker(true)}
              >
                <Calendar size={16} color={Colors.primary} />
                <Text style={styles.dateButtonText}>
                  {format(endDate, 'MMM d, yyyy h:mm a')}
                </Text>
              </Pressable>
              {showEndPicker && (
                <DateTimePicker
                  value={endDate}
                  mode="datetime"
                  minimumDate={startDate}
                  onChange={(_: DateTimePickerEvent, date?: Date) => {
                    setShowEndPicker(false);
                    if (date) setEndDate(date);
                  }}
                />
              )}

              <Text style={styles.fieldLabel}>Max attendees</Text>
              <TextInput
                style={styles.input}
                placeholder="20"
                value={form.maxAttendees}
                onChangeText={(t: string) => setForm((f: FormState) => ({ ...f, maxAttendees: t }))}
                keyboardType="number-pad"
              />

              <Pressable
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleCreate}
                disabled={submitting}
              >
                {submitting
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.submitButtonText}>Create Event</Text>}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    elevation: 3,
    marginBottom: 12,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardHeader: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  cardTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 8 },
  categoryBadge: {
    backgroundColor: Colors.categoryBadgeBg,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryBadgeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  centered: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingVertical: 60 },
  chip: {
    borderColor: Colors.border,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipRow: { marginBottom: 16 },
  chipText: { color: Colors.textSecondary, fontSize: 13 },
  chipTextActive: { color: Colors.white },
  container: { flex: 1 },
  dateButton: {
    alignItems: 'center',
    borderColor: Colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    padding: 12,
  },
  dateButtonText: { color: Colors.textPrimary, fontSize: 14 },
  deleteButton: { alignItems: 'center', marginTop: 10 },
  deleteButtonText: { color: Colors.error, fontSize: 13, fontWeight: '600' },
  emptyText: { color: Colors.textSecondary, fontSize: 16 },
  fab: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 32,
    bottom: 24,
    elevation: 6,
    height: 60,
    justifyContent: 'center',
    position: 'absolute',
    right: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    width: 60,
  },
  fieldLabel: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 56,
  },
  headerTitle: { color: Colors.white, fontSize: 24, fontWeight: '700' },
  hostBadge: {
    backgroundColor: Colors.hostBadgeBg,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  hostBadgeText: { color: Colors.hostBadgeText, fontSize: 12, fontWeight: '600' },
  input: {
    borderColor: Colors.border,
    borderRadius: 10,
    borderWidth: 1,
    color: Colors.textPrimary,
    fontSize: 14,
    marginBottom: 16,
    padding: 12,
  },
  list: { padding: 16, paddingBottom: 100 },
  metaItem: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  metaRow: { gap: 6 },
  metaText: { color: Colors.textSecondary, flexShrink: 1, fontSize: 12 },
  modalBody: { flex: 1 },
  modalContent: { padding: 20, paddingBottom: 40 },
  modalHeader: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  modalOverlay: {
    backgroundColor: Colors.overlayDarker,
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalTitle: { color: Colors.white, fontSize: 20, fontWeight: '700' },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    marginTop: 8,
    paddingVertical: 14,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
});
