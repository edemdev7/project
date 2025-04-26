import React from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { MapPin } from 'lucide-react-native';

// Import conditionnel pour éviter que react-native-maps ne soit importé sur le web
let MapView: any = null;
let Marker: any = null;

// N'importe le module que sur les plateformes natives (iOS/Android)
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
}

// Interface pour les props
interface PlatformMapProps {
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  onPress?: (event: any) => void;
  style?: any;
}

export function PlatformMap({ region, onPress, style }: PlatformMapProps) {
  // Version web simplifiée
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webMap, style]}>
        <View style={styles.webMapContent}>
          <MapPin size={32} color="#10B981" />
          <Text style={styles.webMapText}>
            Carte non disponible sur le web
          </Text>
          <Text style={styles.webMapSubtext}>
            Position: {region.latitude.toFixed(4)}, {region.longitude.toFixed(4)}
          </Text>
          <Text style={styles.webMapHint}>
            Utilisez les champs ci-dessous pour définir votre position
          </Text>
        </View>
      </View>
    );
  }

  // Version native avec MapView réelle
  return (
    <MapView
      style={style}
      region={region}
      onPress={onPress}
    >
      <Marker
        coordinate={{
          latitude: region.latitude,
          longitude: region.longitude,
        }}
      />
    </MapView>
  );
}

const styles = StyleSheet.create({
  webMap: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webMapContent: {
    alignItems: 'center',
    padding: 20,
  },
  webMapText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
  },
  webMapSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  webMapHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 16,
    textAlign: 'center',
  },
});