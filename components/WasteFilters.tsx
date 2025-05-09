"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput, Platform } from "react-native"
import { Filter, X, Check, Calendar } from "lucide-react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import type { DateTimePickerEvent } from "@react-native-community/datetimepicker"

export interface WasteFilters {
  category?: string
  date?: string
  location?: string
  minWeight?: number
  maxWeight?: number
}

interface WasteFiltersProps {
  onApplyFilters: (filters: WasteFilters) => void
  activeFilters: WasteFilters
}

export default function WasteFilters({ onApplyFilters, activeFilters }: WasteFiltersProps) {
  const [modalVisible, setModalVisible] = useState(false)
  const [tempFilters, setTempFilters] = useState<WasteFilters>(activeFilters)
  const [showDatePicker, setShowDatePicker] = useState(false)

  // Compter le nombre de filtres actifs
  const getActiveFilterCount = () => {
    return Object.values(activeFilters).filter(Boolean).length
  }

  const handleCategorySelect = (category: string) => {
    if (tempFilters.category === category) {
      // Si la même catégorie est sélectionnée, la désélectionner
      setTempFilters({ ...tempFilters, category: undefined })
    } else {
      setTempFilters({ ...tempFilters, category: category })
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
              <Text style={styles.modalTitle}>Filtrer les déchets</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filtersContainer}>
              {/* Filtre par catégorie */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Catégorie</Text>
                <View style={styles.categoryOptions}>
                  <TouchableOpacity
                    style={[
                      styles.categoryOption,
                      tempFilters.category === "plastique" && styles.categoryOptionSelected,
                    ]}
                    onPress={() => handleCategorySelect("plastique")}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        tempFilters.category === "plastique" && styles.categoryOptionTextSelected,
                      ]}
                    >
                      Plastique
                    </Text>
                    {tempFilters.category === "plastique" && <Check size={16} color="#FFFFFF" />}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.categoryOption, tempFilters.category === "papier" && styles.categoryOptionSelected]}
                    onPress={() => handleCategorySelect("papier")}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        tempFilters.category === "papier" && styles.categoryOptionTextSelected,
                      ]}
                    >
                      Papier
                    </Text>
                    {tempFilters.category === "papier" && <Check size={16} color="#FFFFFF" />}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.categoryOption,
                      tempFilters.category === "organique" && styles.categoryOptionSelected,
                    ]}
                    onPress={() => handleCategorySelect("organique")}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        tempFilters.category === "organique" && styles.categoryOptionTextSelected,
                      ]}
                    >
                      Organique
                    </Text>
                    {tempFilters.category === "organique" && <Check size={16} color="#FFFFFF" />}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.categoryOption,
                      tempFilters.category === "electronique" && styles.categoryOptionSelected,
                    ]}
                    onPress={() => handleCategorySelect("electronique")}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        tempFilters.category === "electronique" && styles.categoryOptionTextSelected,
                      ]}
                    >
                      Électronique
                    </Text>
                    {tempFilters.category === "electronique" && <Check size={16} color="#FFFFFF" />}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.categoryOption, tempFilters.category === "autre" && styles.categoryOptionSelected]}
                    onPress={() => handleCategorySelect("autre")}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        tempFilters.category === "autre" && styles.categoryOptionTextSelected,
                      ]}
                    >
                      Autre
                    </Text>
                    {tempFilters.category === "autre" && <Check size={16} color="#FFFFFF" />}
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

              {/* Filtre par localisation */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Localisation</Text>
                <TextInput
                  style={styles.locationInput}
                  placeholder="Entrez une localisation"
                  value={tempFilters.location}
                  onChangeText={(text) => setTempFilters({ ...tempFilters, location: text })}
                />
              </View>

              {/* Filtre par poids */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Poids (kg)</Text>
                <View style={styles.weightContainer}>
                  <View style={styles.weightInputContainer}>
                    <Text style={styles.weightLabel}>Min:</Text>
                    <TextInput
                      style={styles.weightInput}
                      placeholder="0"
                      keyboardType="numeric"
                      value={tempFilters.minWeight?.toString() || ""}
                      onChangeText={(text) => {
                        const value = text ? Number.parseFloat(text) : undefined
                        setTempFilters({ ...tempFilters, minWeight: value })
                      }}
                    />
                  </View>
                  <View style={styles.weightInputContainer}>
                    <Text style={styles.weightLabel}>Max:</Text>
                    <TextInput
                      style={styles.weightInput}
                      placeholder="∞"
                      keyboardType="numeric"
                      value={tempFilters.maxWeight?.toString() || ""}
                      onChangeText={(text) => {
                        const value = text ? Number.parseFloat(text) : undefined
                        setTempFilters({ ...tempFilters, maxWeight: value })
                      }}
                    />
                  </View>
                </View>
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
          {activeFilters.category && (
            <View style={styles.activeFilterTag}>
              <Text style={styles.activeFilterText}>
                Catégorie: {activeFilters.category.charAt(0).toUpperCase() + activeFilters.category.slice(1)}
              </Text>
              <TouchableOpacity
                onPress={() => onApplyFilters({ ...activeFilters, category: undefined })}
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

          {activeFilters.location && (
            <View style={styles.activeFilterTag}>
              <Text style={styles.activeFilterText}>Lieu: {activeFilters.location}</Text>
              <TouchableOpacity
                onPress={() => onApplyFilters({ ...activeFilters, location: undefined })}
                style={styles.removeFilterButton}
              >
                <X size={14} color="#6B7280" />
              </TouchableOpacity>
            </View>
          )}

          {(activeFilters.minWeight !== undefined || activeFilters.maxWeight !== undefined) && (
            <View style={styles.activeFilterTag}>
              <Text style={styles.activeFilterText}>
                Poids: {activeFilters.minWeight !== undefined ? activeFilters.minWeight : "0"} -
                {activeFilters.maxWeight !== undefined ? activeFilters.maxWeight : "∞"} kg
              </Text>
              <TouchableOpacity
                onPress={() => onApplyFilters({ ...activeFilters, minWeight: undefined, maxWeight: undefined })}
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
  categoryOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryOptionSelected: {
    backgroundColor: "#10B981",
  },
  categoryOptionText: {
    color: "#4B5563",
  },
  categoryOptionTextSelected: {
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
  locationInput: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  weightContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weightInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  weightLabel: {
    width: 40,
    fontSize: 14,
    color: "#6B7280",
  },
  weightInput: {
    flex: 1,
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
