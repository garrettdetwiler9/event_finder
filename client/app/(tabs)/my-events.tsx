import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export default function MyEventsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Events</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: Colors.primary,
    fontSize: 24,
    fontWeight: '600',
  },
});
