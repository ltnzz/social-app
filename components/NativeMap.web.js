import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export default function NativeMap() {
  return (
    <View style={styles.webMapFallback}>
      <Ionicons name="map" size={46} color="#18604c" />
      <Text style={styles.permissionTitle}>Map native tampil di Android/iOS.</Text>
      <Text style={styles.permissionText}>Jalankan lewat Expo Go untuk melihat marker.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  permissionText: {
    color: '#53645d',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  permissionTitle: {
    color: '#15241f',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  webMapFallback: {
    alignItems: 'center',
    flex: 1,
    gap: 10,
    justifyContent: 'center',
    padding: 24,
  },
});
