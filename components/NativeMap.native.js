import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { StyleSheet, Text, View } from 'react-native';

const googleMapsApiKey = Constants.expoConfig?.android?.config?.googleMaps?.apiKey;

export default function NativeMap({ region, users, style }) {
  if (!googleMapsApiKey || googleMapsApiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
    return (
      <View style={[style, styles.fallback]}>
        <Ionicons name="map" size={42} color="#18604c" />
        <Text style={styles.title}>Google Maps API key belum diset</Text>
        <Text style={styles.text}>
          Development build Android butuh android.config.googleMaps.apiKey di app.json.
        </Text>
        <Text style={styles.text}>
          Koordinat user: {region.latitude.toFixed(5)}, {region.longitude.toFixed(5)}
        </Text>
      </View>
    );
  }

  return (
    <MapView style={style} region={region} showsUserLocation>
      <Marker
        coordinate={{ latitude: region.latitude, longitude: region.longitude }}
        title="Kamu"
        description="Lokasi perangkat"
        pinColor="#18604c"
      />
      {users.map((user) => (
        <Marker
          key={user.id}
          coordinate={user.coordinate}
          title={user.name}
          description={user.mood}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    backgroundColor: '#eff4f1',
    justifyContent: 'center',
    padding: 24,
  },
  text: {
    color: '#53645d',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  title: {
    color: '#15241f',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 12,
    textAlign: 'center',
  },
});
