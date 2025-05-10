"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from "react-native"
import { MapPin, Package } from "lucide-react-native"
import { useUserContext } from "@/context/UserContext"
import { getCollectorMissions, acceptMission, rejectMission } from "@/services/api"
import { showAlert } from "@/utils/alerts"
import type { CollectorMission } from "@/types"
import MissionFilters, { type MissionFilters as MissionFiltersType } from "@/components/MissionFilters"

export default function CollectorMissions() {
  const { user, isAuthenticated } = useUserContext()
  const [missions, setMissions] = useState<CollectorMission[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filters, setFilters] = useState<MissionFiltersType>({})

  useEffect(() => {
    loadMissions()
  }, [filters]) // Recharger les missions quand les filtres changent

  const loadMissions = async () => {
    try {
      setLoading(true)
      const data = await getCollectorMissions(filters)
      setMissions(data)
    } catch (error) {
      console.error("Error fetching missions:", error)
      showAlert("Erreur", "Impossible de charger les missions. Veuillez réessayer.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleAccept = (missionId: number) => {
    showAlert("Accepter la mission", "Voulez-vous accepter cette mission de collecte ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Accepter",
        onPress: async () => {
          try {
            await acceptMission(missionId)
            // Mettre à jour la liste des missions
            const updatedMissions = missions.filter((m) => m.id !== missionId)
            setMissions(updatedMissions)
            showAlert("Mission acceptée", "La mission a été ajoutée à votre planning.")
          } catch (error) {
            console.error("Error accepting mission:", error)
            showAlert("Erreur", "Impossible d'accepter la mission. Veuillez réessayer.")
          }
        },
      },
    ])
  }

  const handleReject = (missionId: number) => {
    showAlert("Refuser la mission", "Êtes-vous sûr de vouloir refuser cette mission ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Refuser",
        onPress: async () => {
          try {
            await rejectMission(missionId)
            // Mettre à jour la liste des missions
            const updatedMissions = missions.filter((m) => m.id !== missionId)
            setMissions(updatedMissions)
          } catch (error) {
            console.error("Error rejecting mission:", error)
            showAlert("Erreur", "Impossible de refuser la mission. Veuillez réessayer.")
          }
        },
        style: "destructive",
      },
    ])
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadMissions()
  }

  const handleApplyFilters = (newFilters: MissionFiltersType) => {
    setFilters(newFilters)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const renderMissionItem = ({ item }: { item: CollectorMission }) => (
    <View style={styles.missionCard}>
      {item.photo && <Image source={{ uri: item.photo as any }} style={styles.missionImage} resizeMode="cover" />}

      <View style={styles.missionHeader}>
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryText}>{item.category.charAt(0).toUpperCase() + item.category.slice(1)}</Text>
        </View>
        <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
      </View>

      <View style={styles.missionDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Particulier:</Text>
          <Text style={styles.detailValue}>{item.user_username}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Téléphone:</Text>
          <Text style={styles.detailValue}>{item.user_phone}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Poids:</Text>
          <Text style={styles.detailValue}>{item.weight} kg</Text>
        </View>

        <View style={styles.detailRow}>
          <MapPin size={16} color="#6B7280" style={styles.locationIcon} />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>

        {/* Ajouter l'affichage des coordonnées GPS si disponibles */}
        {item.user_location_gps && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>GPS:</Text>
            <Text style={styles.detailValue}>{item.user_location_gps}</Text>
          </View>
        )}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={() => handleReject(item.id)}>
          <Text style={styles.rejectButtonText}>Refuser</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.acceptButton]} onPress={() => handleAccept(item.id)}>
          <Text style={styles.acceptButtonText}>Accepter</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Missions disponibles</Text>
        <Package size={24} color="#10B981" />
      </View>

      <View style={styles.filtersContainer}>
        <MissionFilters onApplyFilters={handleApplyFilters} activeFilters={filters} />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      ) : missions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {Object.keys(filters).length > 0
              ? "Aucune mission ne correspond à vos filtres."
              : "Aucune mission disponible actuellement."}
          </Text>
          {Object.keys(filters).length > 0 && (
            <TouchableOpacity style={styles.clearFiltersButton} onPress={() => setFilters({})}>
              <Text style={styles.clearFiltersText}>Effacer les filtres</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={missions}
          renderItem={renderMissionItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  filtersContainer: {
    padding: 16,
    paddingBottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
  },
  missionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  missionImage: {
    width: "100%",
    height: 160,
  },
  missionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  categoryContainer: {
    backgroundColor: "#10B98120",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  categoryText: {
    color: "#10B981",
    fontWeight: "500",
    fontSize: 14,
  },
  dateText: {
    color: "#6B7280",
    fontSize: 12,
  },
  missionDetails: {
    padding: 16,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailLabel: {
    width: 80,
    fontSize: 14,
    color: "#6B7280",
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  locationIcon: {
    marginRight: 4,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },
  actionButtons: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  actionButton: {
    flex: 1,
    padding: 14,
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: "#10B98110",
  },
  rejectButton: {
    backgroundColor: "#EF444410",
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
  },
  acceptButtonText: {
    color: "#10B981",
    fontWeight: "600",
    fontSize: 16,
  },
  rejectButtonText: {
    color: "#EF4444",
    fontWeight: "600",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
  clearFiltersButton: {
    marginTop: 16,
    padding: 10,
  },
  clearFiltersText: {
    color: "#10B981",
    fontWeight: "600",
    fontSize: 14,
  },
})
