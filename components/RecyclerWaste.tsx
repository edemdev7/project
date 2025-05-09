"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Modal, ActivityIndicator } from "react-native"
import { Calendar, Clock, MapPin, X } from "lucide-react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useUserContext } from "@/context/UserContext"
import { showAlert } from "@/utils/alerts"
import type { DateTimePickerEvent } from "@react-native-community/datetimepicker"
import WasteFilters, { type WasteFilters as WasteFiltersType } from "@/components/WasteFilters"

// Données fictives des déchets collectés
const MOCK_COLLECTED_WASTE = [
  {
    id: 1,
    wasteType: "plastique",
    weight: 150.5,
    location: "Centre de tri Cotonou",
    imageUrl: "https://picsum.photos/id/102/500/300",
    created_at: "2025-04-20T09:30:00Z",
    collector: {
      name: "Éco-Collecte SARL",
      phone: "0123456789",
    },
  },
  {
    id: 2,
    wasteType: "papier",
    weight: 85.2,
    location: "Centre de tri Cotonou",
    imageUrl: "https://picsum.photos/id/180/500/300",
    created_at: "2025-04-19T11:45:00Z",
    collector: {
      name: "Green Collect Bénin",
      phone: "0234567891",
    },
  },
  {
    id: 3,
    wasteType: "electronique",
    weight: 75.8,
    location: "Centre de tri Podji",
    imageUrl: "https://picsum.photos/id/201/500/300",
    created_at: "2025-04-18T14:20:00Z",
    collector: {
      name: "E-Waste Solutions",
      phone: "0345678912",
    },
  },
]

export default function RecyclerWaste() {
  const { user, isAuthenticated } = useUserContext()
  const [wasteList, setWasteList] = useState(MOCK_COLLECTED_WASTE)
  const [filteredWasteList, setFilteredWasteList] = useState(MOCK_COLLECTED_WASTE)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [filters, setFilters] = useState<WasteFiltersType>({})

  // Modal état et données pour la réservation
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedWaste, setSelectedWaste] = useState<CollectedWaste | null>(null)
  const [pickupDate, setPickupDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)

  useEffect(() => {
    loadWaste()
  }, [])

  useEffect(() => {
    // Appliquer les filtres à la liste des déchets
    applyFilters()
  }, [filters, wasteList])

  const loadWaste = async () => {
    try {
      setLoading(true)
      // Dans une vraie app, ici on ferait un appel API
      // Pour cette démo, on utilise un délai simulé
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setWasteList(MOCK_COLLECTED_WASTE)
    } catch (error) {
      console.error("Error fetching collected waste:", error)
      showAlert("Erreur", "Impossible de charger les déchets. Veuillez réessayer.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...wasteList]

    // Filtre par catégorie
    if (filters.category) {
      filtered = filtered.filter((waste) => waste.wasteType === filters.category)
    }

    // Filtre par date
    if (filters.date) {
      const filterDate = new Date(filters.date).toDateString()
      filtered = filtered.filter((waste) => {
        const wasteDate = new Date(waste.created_at).toDateString()
        return wasteDate === filterDate
      })
    }

    // Filtre par localisation
    if (filters.location) {
      const locationLower = filters.location.toLowerCase()
      filtered = filtered.filter((waste) => waste.location.toLowerCase().includes(locationLower))
    }

    // Filtre par poids minimum
    if (filters.minWeight !== undefined) {
      filtered = filtered.filter((waste) => waste.weight >= filters.minWeight!)
    }

    // Filtre par poids maximum
    if (filters.maxWeight !== undefined) {
      filtered = filtered.filter((waste) => waste.weight <= filters.maxWeight!)
    }

    setFilteredWasteList(filtered)
  }

  const handleApplyFilters = (newFilters: WasteFiltersType) => {
    setFilters(newFilters)
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadWaste()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Define interfaces based on MOCK_COLLECTED_WASTE structure
  interface Collector {
    name: string
    phone: string
  }

  interface CollectedWaste {
    id: number
    wasteType: string
    weight: number
    location: string
    imageUrl: string
    created_at: string // Keep as string as it's used with new Date()
    collector: Collector
  }

  // Add type to the function parameter
  const handleReserve = (waste: CollectedWaste) => {
    // Ensure selectedWaste state is typed appropriately, e.g.:
    // const [selectedWaste, setSelectedWaste] = useState<CollectedWaste | null>(null);
    setSelectedWaste(waste)
    setModalVisible(true)
  }

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false)
    if (selectedDate) {
      const currentTime = pickupDate
      selectedDate.setHours(currentTime.getHours())
      selectedDate.setMinutes(currentTime.getMinutes())
      setPickupDate(selectedDate)
    }
  }

  const handleTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowTimePicker(false)
    if (selectedTime) {
      const currentDate = pickupDate
      currentDate.setHours(selectedTime.getHours())
      currentDate.setMinutes(selectedTime.getMinutes())
      setPickupDate(new Date(currentDate))
    }
  }

  const confirmReservation = () => {
    // Simuler la réservation avec un message de succès
    showAlert(
      "Réservation confirmée",
      `Rendez-vous le ${pickupDate.toLocaleDateString("fr-FR")} à ${pickupDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`,
      [{ text: "OK", onPress: () => setModalVisible(false) }],
    )
  }

  const renderWasteItem = ({ item }: { item: CollectedWaste }) => (
    <View style={styles.wasteCard}>
      <Image source={{ uri: item.imageUrl }} style={styles.wasteImage} resizeMode="cover" />

      <View style={styles.wasteHeader}>
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryText}>{item.wasteType.charAt(0).toUpperCase() + item.wasteType.slice(1)}</Text>
        </View>
        <Text style={styles.dateText}>Collecté le {formatDate(item.created_at)}</Text>
      </View>

      <View style={styles.wasteDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Poids:</Text>
          <Text style={styles.detailValue}>{item.weight} kg</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Collecteur:</Text>
          <Text style={styles.detailValue}>{item.collector.name}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Téléphone:</Text>
          <Text style={styles.detailValue}>{item.collector.phone}</Text>
        </View>

        <View style={styles.detailRow}>
          <MapPin size={16} color="#6B7280" style={styles.locationIcon} />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.reserveButton} onPress={() => handleReserve(item)}>
        <Text style={styles.reserveButtonText}>Réserver un rendez-vous</Text>
      </TouchableOpacity>
    </View>
  )

  // Modal de réservation
  const renderReservationModal = () => (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Réserver un rendez-vous</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {selectedWaste && (
            <View style={styles.wasteInfo}>
              <Text style={styles.wasteInfoTitle}>
                {selectedWaste.wasteType.charAt(0).toUpperCase() + selectedWaste.wasteType.slice(1)} -{" "}
                {selectedWaste.weight} kg
              </Text>
              <Text style={styles.wasteInfoLocation}>{selectedWaste.location}</Text>
              <Text style={styles.wasteInfoCollector}>Collecteur: {selectedWaste.collector.name}</Text>
            </View>
          )}

          <View style={styles.datePickerSection}>
            <Text style={styles.datePickerLabel}>Choisir une date et heure</Text>

            <View style={styles.dateTimeSelectors}>
              <TouchableOpacity style={styles.dateSelector} onPress={() => setShowDatePicker(true)}>
                <Calendar size={20} color="#10B981" />
                <Text style={styles.dateSelectorText}>{pickupDate.toLocaleDateString("fr-FR")}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.timeSelector} onPress={() => setShowTimePicker(true)}>
                <Clock size={20} color="#10B981" />
                <Text style={styles.timeSelectorText}>
                  {pickupDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={pickupDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}

            {showTimePicker && (
              <DateTimePicker value={pickupDate} mode="time" display="default" onChange={handleTimeChange} />
            )}
          </View>

          <TouchableOpacity style={styles.confirmButton} onPress={confirmReservation}>
            <Text style={styles.confirmButtonText}>Confirmer la réservation</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Déchets disponibles</Text>
      </View>

      <View style={styles.filtersContainer}>
        <WasteFilters onApplyFilters={handleApplyFilters} activeFilters={filters} />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      ) : filteredWasteList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {Object.keys(filters).length > 0
              ? "Aucun déchet ne correspond à vos filtres."
              : "Aucun déchet disponible actuellement."}
          </Text>
          {Object.keys(filters).length > 0 && (
            <TouchableOpacity style={styles.clearFiltersButton} onPress={() => setFilters({})}>
              <Text style={styles.clearFiltersText}>Effacer les filtres</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredWasteList}
          renderItem={renderWasteItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}

      {renderReservationModal()}
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
  wasteCard: {
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
  wasteImage: {
    width: "100%",
    height: 160,
  },
  wasteHeader: {
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
  wasteDetails: {
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
  reserveButton: {
    backgroundColor: "#10B981",
    padding: 14,
    alignItems: "center",
  },
  reserveButtonText: {
    color: "#FFFFFF",
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  closeButton: {
    padding: 4,
  },
  wasteInfo: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
  },
  wasteInfoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  wasteInfoLocation: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  wasteInfoCollector: {
    fontSize: 14,
    color: "#6B7280",
  },
  datePickerSection: {
    marginBottom: 24,
  },
  datePickerLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 12,
  },
  dateTimeSelectors: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateSelector: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  timeSelector: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  dateSelectorText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#111827",
  },
  timeSelectorText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#111827",
  },
  confirmButton: {
    backgroundColor: "#10B981",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
})
