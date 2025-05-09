import { View, Text, StyleSheet } from "react-native"
import { MapPin } from "lucide-react-native"
import { PlatformMapProps } from "@/types"

export function PlatformMap({ region, style }: PlatformMapProps) {
  return (
    <View style={[styles.webMap, style]}>
      <View style={styles.webMapContent}>
        <MapPin size={32} color="#10B981" />
        <Text style={styles.webMapText}>Carte non disponible sur le web</Text>
        <Text style={styles.webMapSubtext}>
          Position: {region.latitude.toFixed(4)}, {region.longitude.toFixed(4)}
        </Text>
        <Text style={styles.webMapHint}>Utilisez les champs ci-dessous pour définir votre position</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  webMap: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  webMapContent: {
    alignItems: "center",
    padding: 20,
  },
  webMapText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 12,
  },
  webMapSubtext: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
  },
  webMapHint: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 16,
    textAlign: "center",
  },
})