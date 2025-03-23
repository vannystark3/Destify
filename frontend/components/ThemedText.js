import { Text, View, StyleSheet } from 'react-native';

export function ThemedText({ type = 'default', children }) {
  return <Text style={[styles.text, styles[type]]}>{children}</Text>;
}

export function ThemedView({ children, style }) {
  return <View style={[styles.container, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  text: {
    color: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  defaultSemiBold: {
    fontWeight: '600',
  },
});