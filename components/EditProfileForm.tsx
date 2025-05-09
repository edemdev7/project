"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native"
import { updateUserProfile, updateUserLocation } from "@/services/api"
import { useUserContext } from "@/context/UserContext"
import { showAlert } from "@/utils/alerts"
import { Save } from "lucide-react-native"
import { PlatformMap } from "@/components/PlatformMap"
import type { UserProfileUpdate } from "@/types"

export default function EditProfileForm() {
  const { user, refreshUserProfile } = useUserContext()
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState<UserProfileUpdate>({
    username: user?.username || "",
    phone: user?.phone || "",
    location: user?.location || "",
    location_gps: user?.location_gps || {
      latitude: 6.3702928,
      longitude: 2.3912362,
    },
  })

  const handleUpdateProfile = async () => {
    try {
      setLoading(true)

      // Mise à jour du profil de base
      await updateUserProfile(profileData)

      // Mise à jour de la localisation GPS si disponible
      if (profileData.location_gps) {
        // Convertir l'objet location_gps en chaîne pour l'API
        await updateUserLocation({
          location_gps: profileData.location_gps,
        })
      }

      await refreshUserProfile()
      showAlert("Succès", "Votre profil a été mis à jour avec succès")
    } catch (error) {
      console.error("Error updating profile:", error)
      showAlert("Erreur", "Impossible de mettre à jour votre profil. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent
    setProfileData((prev) => ({
      ...prev,
      location_gps: {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      },
    }))
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Modifier votre profil</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nom d'utilisateur</Text>
          <TextInput
            style={styles.input}
            value={profileData.username}
            onChangeText={(text) => setProfileData((prev) => ({ ...prev, username: text }))}
            placeholder="Votre nom d'utilisateur"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Téléphone</Text>
          <TextInput
            style={styles.input}
            value={profileData.phone}
            onChangeText={(text) => setProfileData((prev) => ({ ...prev, phone: text }))}
            placeholder="Votre numéro de téléphone"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Adresse</Text>
          <TextInput
            style={styles.input}
            value={profileData.location}
            onChangeText={(text) => setProfileData((prev) => ({ ...prev, location: text }))}
            placeholder="Votre adresse"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Position GPS</Text>
          <View style={styles.mapContainer}>
            <PlatformMap
              style={styles.map}
              region={{
                latitude: profileData.location_gps?.latitude || 6.3702928,
                longitude: profileData.location_gps?.longitude || 2.3912362,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              onPress={handleMapPress}
            />
          </View>
          <View style={styles.coordinatesContainer}>
            <View style={styles.coordinateItem}>
              <Text style={styles.coordinateLabel}>Latitude:</Text>
              <Text style={styles.coordinateValue}>{profileData.location_gps?.latitude.toFixed(6)}</Text>
            </View>
            <View style={styles.coordinateItem}>
              <Text style={styles.coordinateLabel}>Longitude:</Text>
              <Text style={styles.coordinateValue}>{profileData.location_gps?.longitude.toFixed(6)}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.buttonDisabled]}
          onPress={handleUpdateProfile}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Save size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Enregistrer les modifications</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  formContainer: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 24,
    color: "#111827",
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#374151",
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  coordinatesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  coordinateItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  coordinateLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginRight: 4,
  },
  coordinateValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#10B981",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
  },
})
