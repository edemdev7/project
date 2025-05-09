"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, TouchableOpacity } from "react-native"
import { MapPin, CheckCircle, XCircle } from "lucide-react-native"
import { useUserContext } from "@/context/UserContext"
import { getCollectorMissions } from "@/services/api"
import { showAlert } from "@/utils/alerts"
import type { CollectorMission } from "@/types"
import MissionFilters, { type MissionFilters as MissionFiltersType } from "@/components/MissionFilters"

export default function MissionHistoryScreen() {
  const { user, isAuthenticated } = useUserContext()
  const [missions, setMissions] = useState<CollectorMission[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filters, setFilters] = useState<MissionFiltersType>({
    status: "collecte", // Par défaut, afficher les missions collectées
  })

  useEffect(() => {
    loadMissions()
  }, [filters])

  const loadMissions = async () => {
    try {
      setLoading(true)
      // Charger les missions avec le filtre de statut "collecté" par défaut
      const data = await getCollectorMissions(filters)
      setMissions(data)
    } catch (error) {
      console.error("Error fetching mission history:", error)
      showAlert("Erreur", "Impossible de charger l'historique des missions. Veuillez réessayer.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
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
      <View style={[styles.statusBanner, item.status === "collecte" ? styles.completedBanner : styles.cancelledBanner]}>
        <Text style={styles.statusText}>
          {item.status === "collecte" ? "Collecté" : item.status === "accepte" ? "Accepté" : "En attente"}
        </Text>
        {item.status === "collecte" ? <CheckCircle size={16} color="#FFFFFF" /> : <XCircle size={16} color="#FFFFFF" />}
      </View>

      {item.photo && <Image source={{ uri: item.photo as any }} style={styles.missionImage} resizeMode="cover" />}

      <View style={styles.missionHeader}>
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryText}>{item.category.charAt(0).toUpperCase() + item.category.slice(1)}</Text>
        </View>
        <Text style={styles.dateText}>Créé le {formatDate(item.created_at)}</Text>
      </View>

      <View style={styles.missionDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Particulier:</Text>
          <Text style={styles.detailValue}>{item.user_details.name}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Téléphone:</Text>
          <Text style={styles.detailValue}>{item.user_details.phone}</Text>
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
        {item.user_details.location_gps && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>GPS:</Text>
            <Text style={styles.detailValue}>{item.user_details.location_gps}</Text>
          </View>
        )}

        {item.status === "collecte" && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Collecté le:</Text>
            <Text style={styles.detailValue}>{formatDate(item.completed_at || item.created_at)}</Text>
          </View>
        )}
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historique des missions</Text>
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
              : "Aucune mission dans votre historique."}
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
    position: "relative",
  },
  statusBanner: {
    position: "absolute",
    top: 10,
    right: 0,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
  },
  completedBanner: {
    backgroundColor: "#10B981",
  },
  cancelledBanner: {
    backgroundColor: "#EF4444",
  },
  statusText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 12,
    marginRight: 4,
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
  cancelReason: {
    color: "#EF4444",
  },
  locationIcon: {
    marginRight: 4,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
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
