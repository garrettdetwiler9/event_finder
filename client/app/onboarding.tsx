import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createUserProfile } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/Colors';
import { format } from 'date-fns';

type AccountType = 'user' | 'business' | 'org';

const ACCOUNT_TYPES: { value: AccountType; label: string; desc: string }[] = [
  { value: 'user', label: 'Personal', desc: 'Student or individual' },
  { value: 'business', label: 'Business', desc: 'Local shop or venue' },
  { value: 'org', label: 'Organization', desc: 'Club or non-profit' },
];

export default function OnboardingScreen() {
  const { refreshProfile } = useAuth();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('user');
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !displayName.trim()) {
      setError('Username and display name are required.');
      return;
    }
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (accountType === 'user' && !birthdate) {
      setError('Birthdate is required for personal accounts.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await createUserProfile({
        username: username.trim().toLowerCase(),
        displayName: displayName.trim(),
        accountType,
        birthdate: birthdate ? birthdate.toISOString() : undefined,
      });
      await refreshProfile();
    } catch (err: any) {
      if (err.status === 409) {
        setError('That username is already taken. Please choose another.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Set up your profile</Text>
        <Text style={styles.subtitle}>Join the Davis events community</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. johndoe"
          placeholderTextColor={Colors.textPlaceholder}
          value={username}
          onChangeText={text => setUsername(text.toLowerCase())}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={30}
        />

        <Text style={styles.label}>Display Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. John Doe"
          placeholderTextColor={Colors.textPlaceholder}
          value={displayName}
          onChangeText={setDisplayName}
          maxLength={50}
        />

        <Text style={styles.label}>Account Type</Text>
        <View style={styles.segmented}>
          {ACCOUNT_TYPES.map(type => (
            <TouchableOpacity
              key={type.value}
              style={[styles.segment, accountType === type.value && styles.segmentActive]}
              onPress={() => setAccountType(type.value)}
            >
              <Text style={[styles.segmentText, accountType === type.value && styles.segmentTextActive]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {accountType === 'user' && (
          <>
            <Text style={styles.label}>Birthdate</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowPicker(true)}>
              <Text style={{ color: birthdate ? Colors.textPrimary : Colors.textPlaceholder, fontSize: 15 }}>
                {birthdate ? format(birthdate, 'MMMM d, yyyy') : 'Select your birthdate'}
              </Text>
            </TouchableOpacity>
            {showPicker && (
              <DateTimePicker
                value={birthdate ?? new Date(2000, 0, 1)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={new Date()}
                onChange={(_e, date) => {
                  setShowPicker(Platform.OS === 'ios');
                  if (date) setBirthdate(date);
                }}
              />
            )}
          </>
        )}

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: Colors.brand,
    borderRadius: 10,
    marginTop: 24,
    paddingVertical: 14,
  },
  buttonText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
  container: { backgroundColor: Colors.white, flex: 1 },
  error: { color: Colors.error, fontSize: 14, marginBottom: 12 },
  inner: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  input: {
    borderColor: Colors.border,
    borderRadius: 10,
    borderWidth: 1,
    color: Colors.textPrimary,
    fontSize: 15,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  segment: {
    alignItems: 'center',
    borderColor: Colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 10,
  },
  segmentActive: { backgroundColor: Colors.brand, borderColor: Colors.brand },
  segmentText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '500' },
  segmentTextActive: { color: Colors.white, fontWeight: '600' },
  segmented: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  subtitle: { color: Colors.textSecondary, fontSize: 15, marginBottom: 32 },
  title: { color: Colors.textPrimary, fontSize: 28, fontWeight: '700', marginBottom: 8 },
});
