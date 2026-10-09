
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>K9 ADVOCATES</Text>
      <Text style={styles.subtitle}>Mobile Management</Text>
      <Text style={styles.message}>
        Welcome to K9 Advocates Mobile
      </Text>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 17,
    color: '#D1D5DB',
    marginTop: 8,
  },
  message: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 40,
  },
});
