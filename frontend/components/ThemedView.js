// components/ThemedView.js
import { View, StyleSheet } from 'react-native';

export function ThemedView({ children, style }) {
  return <View style={[styles.container, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#121212', // Dark theme background
    borderRadius: 12,           // Rounded corners for a modern look
  },
});
