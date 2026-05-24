import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer, useIsFocused, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { File, Paths } from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import * as Notifications from 'expo-notifications';
import * as Sharing from 'expo-sharing';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
  initialWindowMetrics,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import NativeMap from './components/NativeMap';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    priority: Notifications.AndroidNotificationPriority.MAX,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const Tab = createBottomTabNavigator();
const prefix = Linking.createURL('/');
const notificationChannelId = 'socialapp-local-v2';

const nearbyUsers = [
  {
    id: 'dina',
    name: 'Dina',
    mood: 'Ngopi dulu',
    coordinate: { latitude: -6.3159, longitude: 106.8682 },
  },
  {
    id: 'rio',
    name: 'Rio',
    mood: 'Lagi cari spot foto',
    coordinate: { latitude: -6.3136, longitude: 106.8721 },
  },
  {
    id: 'maya',
    name: 'Maya',
    mood: 'Ready buat meet up',
    coordinate: { latitude: -6.3184, longitude: 106.8659 },
  },
];

function IconButton({ icon, label, onPress, variant = 'primary', disabled = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        styles[`${variant}Button`],
        disabled && styles.disabledButton,
        pressed && !disabled && styles.pressedButton,
      ]}
    >
      <Ionicons name={icon} size={18} color={variant === 'ghost' ? '#234338' : '#ffffff'} />
      <Text style={[styles.actionText, variant === 'ghost' && styles.ghostText]}>{label}</Text>
    </Pressable>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>{title}</Text>
      {subtitle ? <Text style={styles.panelSubtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

function HomeScreen() {
  const navigation = useNavigation();
  const url = Linking.useURL();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerBand}>
          <View>
            <Text style={styles.eyebrow}>SocialApp</Text>
            <Text style={styles.title}>Story, Nearby, Share</Text>
          </View>
          <Ionicons name="sparkles" size={34} color="#f5b335" />
        </View>

        <Panel title="Menu Praktikum" subtitle="Semua fitur utama tersedia dari tab bawah.">
          <View style={styles.quickGrid}>
            <Pressable style={styles.quickItem} onPress={() => navigation.navigate('Camera')}>
              <Ionicons name="camera" size={24} color="#18604c" />
              <Text style={styles.quickTitle}>Story Camera</Text>
              <Text style={styles.quickCopy}>Flip, torch, countdown 3-2-1.</Text>
            </Pressable>
            <Pressable style={styles.quickItem} onPress={() => navigation.navigate('Map')}>
              <Ionicons name="map" size={24} color="#18604c" />
              <Text style={styles.quickTitle}>Nearby Users</Text>
              <Text style={styles.quickCopy}>Lokasi user dan marker dummy.</Text>
            </Pressable>
            <Pressable style={styles.quickItem} onPress={() => navigation.navigate('Profile')}>
              <Ionicons name="images" size={24} color="#18604c" />
              <Text style={styles.quickTitle}>Post Filter</Text>
              <Text style={styles.quickCopy}>Pick, crop, compress, save, share.</Text>
            </Pressable>
          </View>
        </Panel>

        <Panel title="Deep Link" subtitle="Scheme app sudah disiapkan di app.json.">
          <Text style={styles.infoText}>URL aktif: {url || 'Belum ada URL masuk'}</Text>
          <IconButton
            icon="link"
            label="Buka socialapp://profile"
            onPress={() => Linking.openURL('socialapp://profile?source=home')}
          />
        </Panel>
      </ScrollView>
    </SafeAreaView>
  );
}

function CameraScreen() {
  const isFocused = useIsFocused();
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [torch, setTorch] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [photoUri, setPhotoUri] = useState(null);
  const [cameraStatus, setCameraStatus] = useState('Siap ambil story.');
  const [busy, setBusy] = useState(false);

  const takeStory = async () => {
    if (!cameraRef.current || busy) return;
    setBusy(true);
    setPhotoUri(null);
    setCameraStatus('Countdown dimulai...');

    let current = 3;
    setCountdown(current);
    const timer = setInterval(() => {
      current -= 1;
      setCountdown(current > 0 ? current : null);
      if (current === 0) {
        clearInterval(timer);
      }
    }, 1000);

    setTimeout(async () => {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.75 });
        setPhotoUri(photo.uri);
        setCameraStatus('Story berhasil dibuat. Preview tampil di layar.');
      } catch (error) {
        setCameraStatus(`Gagal mengambil foto: ${error.message}`);
        Alert.alert('Camera error', error.message);
      } finally {
        setBusy(false);
      }
    }, 3200);
  };

  if (!permission) {
    return <View style={styles.centered} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
        <View style={styles.permissionBox}>
          <Ionicons name="camera" size={42} color="#18604c" />
          <Text style={styles.permissionTitle}>Izin kamera diperlukan</Text>
          <Text style={styles.permissionText}>Aktifkan izin kamera untuk membuat story.</Text>
          <IconButton icon="checkmark-circle" label="Izinkan Kamera" onPress={requestPermission} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
      <View style={styles.cameraShell}>
        {photoUri ? (
          <View style={styles.cameraPreview}>
            <Image source={{ uri: photoUri }} style={styles.cameraPreviewImage} />
          </View>
        ) : (
          <CameraView
            active={isFocused}
            animateShutter
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            enableTorch={torch}
          >
            {countdown ? (
              <View style={styles.countdownOverlay}>
                <Text style={styles.countdown}>{countdown}</Text>
              </View>
            ) : null}
          </CameraView>
        )}
        <View style={styles.cameraControls}>
          <Text style={styles.cameraStatus}>{cameraStatus}</Text>
          {photoUri ? (
            <IconButton
              icon="camera"
              label="Ambil Ulang"
              onPress={() => {
                setPhotoUri(null);
                setCameraStatus('Siap ambil story.');
              }}
            />
          ) : (
            <>
              <IconButton
                icon="camera-reverse"
                label="Flip"
                variant="ghost"
                onPress={() => setFacing((value) => (value === 'back' ? 'front' : 'back'))}
              />
              <IconButton
                icon={torch ? 'flash' : 'flash-off'}
                label={torch ? 'Flash On' : 'Flash Off'}
                variant="ghost"
                onPress={() => setTorch((value) => !value)}
              />
              <IconButton icon="radio-button-on" label="Story" onPress={takeStory} disabled={busy} />
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

function MapScreen() {
  const [region, setRegion] = useState({
    latitude: -6.3161,
    longitude: 106.8687,
    latitudeDelta: 0.018,
    longitudeDelta: 0.018,
  });
  const [status, setStatus] = useState('Mengambil lokasi...');

  useEffect(() => {
    let mounted = true;
    let locationSubscription;

    const loadLocation = async () => {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setStatus('Izin lokasi ditolak, memakai koordinat simulasi.');
        return;
      }

      const current = await Location.getCurrentPositionAsync({});
      if (!mounted) return;
      setRegion((value) => ({
        ...value,
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      }));
      setStatus('Lokasi user aktif.');

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 10,
          timeInterval: 5000,
        },
        (position) => {
          setRegion((value) => ({
            ...value,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          setStatus('Lokasi user aktif dan diperbarui.');
        },
      );
      if (!mounted) {
        locationSubscription.remove();
      }
    };

    loadLocation().catch((error) => setStatus(error.message));
    return () => {
      mounted = false;
      locationSubscription?.remove();
    };
  }, []);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
      <View style={styles.mapHeader}>
        <Text style={styles.title}>Nearby Users</Text>
        <Text style={styles.panelSubtitle}>{status}</Text>
      </View>

      <NativeMap region={region} users={nearbyUsers} style={styles.map} />

      <View style={styles.userList}>
        {nearbyUsers.map((user) => (
          <View key={user.id} style={styles.userItem}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color="#18604c" />
            </View>
            <View>
              <Text style={styles.quickTitle}>{user.name}</Text>
              <Text style={styles.quickCopy}>{user.mood}</Text>
            </View>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

function ProfileScreen() {
  const [imageUri, setImageUri] = useState(null);
  const [jsonStatus, setJsonStatus] = useState('Belum ada data JSON tersimpan');
  const [saveStatus, setSaveStatus] = useState('Pilih foto dulu, lalu tekan Simpan.');
  const [pushToken, setPushToken] = useState('Belum login');
  const [notificationStatus, setNotificationStatus] = useState('Belum ada notifikasi dijadwalkan');

  useEffect(() => {
    registerPushToken();

    const receivedSubscription = Notifications.addNotificationReceivedListener(() => {
      setNotificationStatus('Notifikasi diterima di aplikasi.');
    });
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(() => {
      setNotificationStatus('Notifikasi dibuka dari tray.');
    });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  const registerPushToken = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(notificationChannelId, {
        name: 'SocialApp Local',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#18604c',
      });
    }

    const existingPermission = await Notifications.getPermissionsAsync();
    if (existingPermission.status === 'granted') {
      setPushToken('Izin notifikasi aktif');
      return;
    }

    const permission = await Notifications.requestPermissionsAsync();
    if (!permission.granted) {
      setPushToken('Izin notifikasi ditolak');
      return;
    }

    try {
      const token = await Notifications.getDevicePushTokenAsync();
      setPushToken(`${token.type}: ${token.data}`);
    } catch (error) {
      setPushToken(`Simulasi token aktif (${error.message})`);
    }
  };

  const pickAndFilter = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Izin galeri diperlukan', 'Aktifkan akses galeri untuk memilih foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      mediaTypes: ['images'],
      quality: 1,
    });

    if (result.canceled) return;

    const picked = result.assets[0];
    const maxSide = Math.max(picked.width || 0, picked.height || 0);
    const resizeActions =
      maxSide > 800
        ? [
            {
              resize:
                (picked.width || 0) >= (picked.height || 0)
                  ? { width: 800 }
                  : { height: 800 },
            },
          ]
        : [];
    const edited = await ImageManipulator.manipulateAsync(
      picked.uri,
      resizeActions,
      {
        compress: 0.68,
        format: ImageManipulator.SaveFormat.JPEG,
      },
    );
    setImageUri(edited.uri);
    setSaveStatus('Foto siap disimpan ke album SocialApp.');
  };

  const saveImage = async () => {
    if (!imageUri) {
      setSaveStatus('Belum ada foto untuk disimpan.');
      return;
    }

    try {
      setSaveStatus('Menyimpan foto...');

      const available = await MediaLibrary.isAvailableAsync();
      if (!available) {
        setSaveStatus('Media Library tidak tersedia di perangkat ini.');
        return;
      }

      const permission = await MediaLibrary.requestPermissionsAsync(false, ['photo']);
      if (!permission.granted) {
        setSaveStatus('Izin media ditolak. Aktifkan izin Photos/Gallery dari Settings.');
        Alert.alert('Izin media diperlukan', 'Aktifkan akses foto/galeri untuk menyimpan foto.');
        return;
      }

      try {
        const album = await MediaLibrary.getAlbumAsync('SocialApp');
        if (album) {
          const asset = await MediaLibrary.createAssetAsync(imageUri, album);
          setSaveStatus(`Tersimpan ke album SocialApp: ${asset.filename}`);
        } else if (Platform.OS === 'android') {
          await MediaLibrary.createAlbumAsync('SocialApp', undefined, false, imageUri);
          setSaveStatus('Tersimpan ke album SocialApp.');
        } else {
          const asset = await MediaLibrary.createAssetAsync(imageUri);
          await MediaLibrary.createAlbumAsync('SocialApp', asset, false);
          setSaveStatus(`Tersimpan ke album SocialApp: ${asset.filename}`);
        }
      } catch (albumError) {
        await MediaLibrary.saveToLibraryAsync(imageUri);
        setSaveStatus(`Tersimpan ke galeri default. Album gagal dibuat: ${albumError.message}`);
      }
      Alert.alert('Tersimpan', 'Foto berhasil disimpan ke album SocialApp di galeri.');
    } catch (error) {
      setSaveStatus(`Gagal menyimpan: ${error.message}`);
      Alert.alert('Gagal menyimpan', error.message);
    }
  };

  const shareImage = async () => {
    if (!imageUri) return;
    const available = await Sharing.isAvailableAsync();
    if (!available) {
      Alert.alert('Share tidak tersedia', 'Fitur sharing tidak tersedia di platform ini.');
      return;
    }
    await Sharing.shareAsync(imageUri);
  };

  const writeAndReadJson = async () => {
    const payload = {
      imageReady: Boolean(imageUri),
      profile: 'Social Profile',
      savedAt: new Date().toISOString(),
    };
    const file = new File(Paths.document, 'socialapp-profile.json');
    if (!file.exists) {
      file.create();
    }

    file.write(JSON.stringify(payload, null, 2));
    const readBack = JSON.parse(file.textSync());
    setJsonStatus(`JSON terbaca: ${readBack.profile} (${readBack.savedAt})`);
  };

  const sendTestNotification = async () => {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Chat baru',
        body: 'Ada pesan masuk dari Nearby Users.',
        priority: Notifications.AndroidNotificationPriority.MAX,
        sound: true,
        data: { screen: 'Profile' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
        channelId: notificationChannelId,
      },
    });
    setNotificationStatus(`Notifikasi dijadwalkan 2 detik lagi (${notificationId}).`);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileTop}>
          <View style={styles.largeAvatar}>
            <Ionicons name="person-circle" size={42} color="#234338" />
          </View>
          <View>
            <Text style={styles.title}>Social Profile</Text>
            <Text style={styles.panelSubtitle}>Push token dibuat saat layar profil dibuka.</Text>
          </View>
        </View>

        <Panel title="Post Dengan Filter" subtitle="Pilih foto, crop, lalu compress sebelum upload.">
          <View style={styles.postCard}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.postImage} />
            ) : (
              <View style={styles.emptyPost}>
                <Ionicons name="image" size={42} color="#87968f" />
                <Text style={styles.permissionText}>Belum ada foto dipilih.</Text>
              </View>
            )}
          </View>
          <Text style={styles.infoText}>{saveStatus}</Text>
          <View style={styles.buttonRow}>
            <IconButton icon="images" label="Pilih Foto" onPress={pickAndFilter} />
            <IconButton icon="save" label="Simpan" onPress={saveImage} disabled={!imageUri} />
            <IconButton icon="share-social" label="Bagikan" onPress={shareImage} disabled={!imageUri} />
          </View>
        </Panel>

        <Panel title="Push Notification" subtitle="Simulasi chat masuk dengan local notification.">
          <Text style={styles.infoText} numberOfLines={3}>
            Token: {pushToken}
          </Text>
          <Text style={styles.infoText}>{notificationStatus}</Text>
          <IconButton icon="notifications" label="Kirim Test Notif" onPress={sendTestNotification} />
        </Panel>

        <Panel title="File System" subtitle="Tulis data profil ke JSON, lalu baca kembali dari storage app.">
          <Text style={styles.infoText}>{jsonStatus}</Text>
          <IconButton icon="document-text" label="Tes JSON" onPress={writeAndReadJson} />
        </Panel>
      </ScrollView>
    </SafeAreaView>
  );
}

function AppNavigator() {
  const insets = useSafeAreaInsets();
  const linking = {
    prefixes: [prefix, 'socialapp://'],
    config: {
      screens: {
        Home: '',
        Camera: 'camera',
        Map: 'map',
        Profile: 'profile',
      },
    },
  };

  return (
    <NavigationContainer linking={linking}>
      <StatusBar backgroundColor="#f4f7f5" style="dark" translucent={false} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#18604c',
          tabBarItemStyle: styles.tabBarItem,
          tabBarInactiveTintColor: '#87968f',
          tabBarShowLabel: false,
          tabBarStyle: [
            styles.tabBar,
            {
              height: 54 + insets.bottom,
              paddingBottom: Math.max(insets.bottom, 8),
            },
          ],
          tabBarIcon: ({ color, size }) => {
            const icons = {
              Home: 'home',
              Camera: 'camera',
              Map: 'map',
              Profile: 'person-circle',
            };
            return <Ionicons name={icons[route.name]} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Camera" component={CameraScreen} />
        <Tab.Screen name="Map" component={MapScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <AppNavigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#18604c',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 14,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#e4f2ed',
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    padding: 12,
  },
  cameraPreview: {
    backgroundColor: '#050807',
    flex: 1,
  },
  cameraPreviewImage: {
    height: '100%',
    resizeMode: 'contain',
    width: '100%',
  },
  cameraShell: {
    backgroundColor: '#0b1512',
    flex: 1,
  },
  cameraStatus: {
    color: '#53645d',
    flexBasis: '100%',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    gap: 16,
    padding: 16,
    paddingBottom: 28,
  },
  countdown: {
    color: '#ffffff',
    fontSize: 78,
    fontWeight: '900',
  },
  countdownOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    flex: 1,
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.45,
  },
  emptyPost: {
    alignItems: 'center',
    backgroundColor: '#eff4f1',
    height: 230,
    justifyContent: 'center',
  },
  eyebrow: {
    color: '#d8891f',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  ghostButton: {
    backgroundColor: '#e4f2ed',
  },
  ghostText: {
    color: '#234338',
  },
  headerBand: {
    alignItems: 'center',
    backgroundColor: '#234338',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 18,
  },
  infoText: {
    color: '#53645d',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  largeAvatar: {
    alignItems: 'center',
    backgroundColor: '#f5b335',
    borderRadius: 8,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  map: {
    flex: 1,
  },
  mapHeader: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  panel: {
    backgroundColor: '#ffffff',
    borderColor: '#dbe5df',
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  panelSubtitle: {
    color: '#53645d',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  panelTitle: {
    color: '#15241f',
    fontSize: 17,
    fontWeight: '800',
  },
  permissionBox: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 24,
  },
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
  postCard: {
    borderColor: '#dbe5df',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  postImage: {
    height: 280,
    width: '100%',
  },
  pressedButton: {
    opacity: 0.86,
  },
  previewCopy: {
    flex: 1,
  },
  previewRow: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderTopColor: '#dbe5df',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  profileTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#18604c',
  },
  quickCopy: {
    color: '#53645d',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  quickGrid: {
    gap: 10,
    marginTop: 14,
  },
  quickItem: {
    backgroundColor: '#f7faf8',
    borderColor: '#dbe5df',
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    padding: 12,
  },
  quickTitle: {
    color: '#15241f',
    fontSize: 15,
    fontWeight: '800',
  },
  screen: {
    backgroundColor: '#f4f7f5',
    flex: 1,
  },
  storyPreview: {
    borderRadius: 8,
    height: 82,
    width: 82,
  },
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopColor: '#dbe5df',
    borderTopWidth: 1,
    paddingTop: 6,
  },
  tabBarItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#15241f',
    fontSize: 25,
    fontWeight: '900',
  },
  userItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  userList: {
    backgroundColor: '#ffffff',
    borderTopColor: '#dbe5df',
    borderTopWidth: 1,
    gap: 10,
    padding: 14,
  },
});
