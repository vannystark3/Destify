import { ScrollView, ImageBackground, StyleSheet } from 'react-native';

export default function ParallaxScrollView({ children, headerImage, headerBackgroundColor }) {
  return (
    <ScrollView style={styles.container}>
      <ImageBackground source={headerImage.props.source} style={styles.header}>
        <ScrollView contentContainerStyle={{ backgroundColor: headerBackgroundColor.dark }}>
          {children}
        </ScrollView>
      </ImageBackground>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 250,
    justifyContent: 'flex-end',
  },
});