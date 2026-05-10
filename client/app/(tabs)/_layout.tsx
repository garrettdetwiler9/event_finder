import { Tabs } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import Root from '../../components/screens/Root';

export default function TabLayout() {
  return (
    <LinearGradient
      colors={['#faf5ff', '#fdf2f8', '#fff7ed']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <Tabs tabBar={() => <Root />} screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="discover" />
        <Tabs.Screen name="my-events" />
        <Tabs.Screen name="map" />
        <Tabs.Screen name="achievements" />
        <Tabs.Screen name="profile" />
      </Tabs>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
});
