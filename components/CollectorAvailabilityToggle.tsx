"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, Switch, ActivityIndicator } from "react-native"
import { updateCollectorAvailability } from "@/services/api"
import { useUserContext } from "@/context/UserContext"
import { showAlert } from "@/utils/alerts"

export default function CollectorAvailabilityToggle() {
  const { user, refreshUserProfile } = useUserContext()
  const [loading, setLoading] = useState(false)
  const [isAvailable, setIsAvailable] = useState(user?.availability === "available")

  // Initialiser l'état avec la valeur du profil utilisateur
  useEffect(() => {
    setIsAvailable(user?.availability === "available")
  }, [user])

  const toggleAvailability = async (value: boolean) => {
    try {
      setLoading(true)
      await updateCollectorAvailability({ is_available: value })
      setIsAvailable(value)
      await refreshUserProfile()
      showAlert(
        "Statut mis à jour",
        `Vous êtes maintenant ${value ? "disponible" : "indisponible"} pour les missions de collecte.`,
      )
    } catch (error) {
      console.error("Error updating availability:", error)
      showAlert("Erreur", "Impossible de mettre à jour votre disponibilité. Veuillez réessayer.")
      // Revert switch state on error
      setIsAvailable(!value)
    } finally {
      setLoading(false)
    }
  }

  if (user?.type !== "collecteur") {
    return null
  }

  return (
    <View style={styles.container}>
      <View style={styles.switchContainer}>
        <Text style={styles.label}>Disponible pour les missions</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#10B981" />
        ) : (
          <Switch
            trackColor={{ false: "#E5E7EB", true: "#10B981" }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#E5E7EB"
            onValueChange={toggleAvailability}
            value={isAvailable}
          />
        )}
      </View>
      <Text style={styles.statusText}>
        Statut actuel:{" "}
        <Text style={isAvailable ? styles.availableText : styles.unavailableText}>
          {isAvailable ? "Disponible" : "Indisponible"}
        </Text>
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  statusText: {
    fontSize: 14,
    color: "#6B7280",
  },
  availableText: {
    color: "#10B981",
    fontWeight: "500",
  },
  unavailableText: {
    color: "#EF4444",
    fontWeight: "500",
  },
})
