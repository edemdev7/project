"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput, Platform } from "react-native"
import { Filter, X, Check, Calendar } from "lucide-react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import type { DateTimePickerEvent } from "@react-native-community/datetimepicker"

export interface MissionFilters {
  status?: string
  date?: string
  zone?: string
}

interface MissionFiltersProps {
  onApplyFilters: (filters: MissionFilters) => void
  activeFilters: MissionFilters
}

export default function MissionFilters({ onApplyFilters, activeFilters }: MissionFiltersProps) {
  const [modalVisible, setModalVisible] = useState(false)
  const [tempFilters, setTempFilters] = useState<MissionFilters>(activeFilters)
  const [showDatePicker, setShowDatePicker] = useState(false)

  // Compter le nombre de filtres actifs
  const getActiveFilterCount = () => {
    return Object.values(activeFilters).filter(Boolean).length
  }

  const handleStatusSelect = (status: string) => {
    if (tempFilters.status === status) {
      // Si le même statut est sélectionné, le désélectionner
      setTempFilters({ ...tempFilters, status: undefined })
    } else {
      setTempFilters({ ...tempFilters, status: status })
    }
  }

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false)
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0] // Format YYYY-MM-DD
      setTempFilters({ ...tempFilters, date: formattedDate })
    }
  }

  const handleClearFilters = () => {
    setTempFilters({})
    onApplyFilters({})
    setModalVisible(false)
  }

  const handleApplyFilters = () => {
    onApplyFilters(tempFilters)
    setModalVisible(false)
  }

  const formatDisplayDate = (dateString?: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.filterButton} onPress={() => setModalVisible(true)}>
        <Filter size={20} color="#10B981" />
        <Text style={styles.filterButtonText}>Filtrer</Text>
        {getActiveFilterCount() > 0 && (
          <View style={styles.filterCountBadge}>
            <Text style={styles.filterCountText}>{getActiveFilterCount()}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtrer les missions</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filtersContainer}>
              {/* Filtre par statut */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Statut</Text>
                <View style={styles.statusOptions}>
                  <TouchableOpacity
                    style={[styles.statusOption, tempFilters.status === "en attente" && styles.statusOptionSelected]}
                    onPress={() => handleStatusSelect("en attente")}
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        tempFilters.status === "en attente" && styles.statusOptionTextSelected,
                      ]}
                    >
                      En attente
                    </Text>
                    {tempFilters.status === "en attente" && <Check size={16} color="#FFFFFF" />}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.statusOption, tempFilters.status === "accepté" && styles.statusOptionSelected]}
                    onPress={() => handleStatusSelect("accepté")}
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        tempFilters.status === "accepté" && styles.statusOptionTextSelected,
                      ]}
                    >
                      Accepté
                    </Text>
                    {tempFilters.status === "accepté" && <Check size={16} color="#FFFFFF" />}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.statusOption, tempFilters.status === "collecté" && styles.statusOptionSelected]}
                    onPress={() => handleStatusSelect("collecté")}
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        tempFilters.status === "collecté" && styles.statusOptionTextSelected,
                      ]}
                    >
                      Collecté
                    </Text>
                    {tempFilters.status === "collecté" && <Check size={16} color="#FFFFFF" />}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Filtre par date */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Date</Text>
                <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
                  <Calendar size={20} color="#6B7280" />
                  <Text style={styles.datePickerButtonText}>
                    {tempFilters.date ? formatDisplayDate(tempFilters.date) : "Sélectionner une date"}
                  </Text>
                </TouchableOpacity>

                {tempFilters.date && (
                  <TouchableOpacity
                    style={styles.clearDateButton}
                    onPress={() => setTempFilters({ ...tempFilters, date: undefined })}
                  >
                    <Text style={styles.clearDateButtonText}>Effacer la date</Text>
                  </TouchableOpacity>
                )}

                {showDatePicker && (
                  <DateTimePicker
                    value={tempFilters.date ? new Date(tempFilters.date) : new Date()}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                  />
                )}
              </View>

              {/* Filtre par zone */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Zone</Text>
                <TextInput
                  style={styles.zoneInput}
                  placeholder="Entrez une zone (ex: Cotonou)"
                  value={tempFilters.zone}
                  onChangeText={(text) => setTempFilters({ ...tempFilters, zone: text })}
                />
              </View>
            </ScrollView>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.clearButton} onPress={handleClearFilters}>
                <Text style={styles.clearButtonText}>Effacer tout</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
                <Text style={styles.applyButtonText}>Appliquer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Afficher les filtres actifs */}
      {getActiveFilterCount() > 0 && (
        <View style={styles.activeFiltersContainer}>
          {activeFilters.status && (
            <View style={styles.activeFilterTag}>
              <Text style={styles.activeFilterText}>
                Statut:{" "}
                {activeFilters.status === "en_attente"
                  ? "En attente"
                  : activeFilters.status === "accepte"
                    ? "Accepté"
                    : "Collecté"}
              </Text>
              <TouchableOpacity
                onPress={() => onApplyFilters({ ...activeFilters, status: undefined })}
                style={styles.removeFilterButton}
              >
                <X size={14} color="#6B7280" />
              </TouchableOpacity>
            </View>
          )}

          {activeFilters.date && (
            <View style={styles.activeFilterTag}>
              <Text style={styles.activeFilterText}>Date: {formatDisplayDate(activeFilters.date)}</Text>
              <TouchableOpacity
                onPress={() => onApplyFilters({ ...activeFilters, date: undefined })}
                style={styles.removeFilterButton}
              >
                <X size={14} color="#6B7280" />
              </TouchableOpacity>
            </View>
          )}

          {activeFilters.zone && (
            <View style={styles.activeFilterTag}>
              <Text style={styles.activeFilterText}>Zone: {activeFilters.zone}</Text>
              <TouchableOpacity
                onPress={() => onApplyFilters({ ...activeFilters, zone: undefined })}
                style={styles.removeFilterButton}
              >
                <X size={14} color="#6B7280" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButtonText: {
    color: "#10B981",
    fontWeight: "600",
    marginLeft: 8,
  },
  filterCountBadge: {
    backgroundColor: "#10B981",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  filterCountText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  closeButton: {
    padding: 4,
  },
  filtersContainer: {
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  statusOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  statusOptionSelected: {
    backgroundColor: "#10B981",
  },
  statusOptionText: {
    color: "#4B5563",
  },
  statusOptionTextSelected: {
    color: "#FFFFFF",
    marginRight: 4,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
  },
  datePickerButtonText: {
    marginLeft: 8,
    color: "#4B5563",
  },
  clearDateButton: {
    alignSelf: "flex-start",
    marginTop: 8,
    padding: 4,
  },
  clearDateButtonText: {
    color: "#EF4444",
    fontSize: 14,
  },
  zoneInput: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  clearButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  clearButtonText: {
    color: "#6B7280",
    fontWeight: "600",
  },
  applyButton: {
    flex: 1,
    padding: 12,
    backgroundColor: "#10B981",
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 8,
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  activeFiltersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  activeFilterTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilterText: {
    fontSize: 12,
    color: "#4B5563",
  },
  removeFilterButton: {
    marginLeft: 4,
  },
})
