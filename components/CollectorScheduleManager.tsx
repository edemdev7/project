"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native"
import { Picker } from "@react-native-picker/picker"
import { Clock, MapPin, Calendar, Plus, Edit, Trash, X, Check } from "lucide-react-native"
import {
  getCollectorSchedules,
  addCollectorSchedule,
  deleteCollectorSchedule,
  updateCollectorSchedule,
} from "@/services/api"
import { showAlert } from "@/utils/alerts"
import type { CollectorSchedule } from "@/types"

export default function CollectorScheduleManager() {
  const [schedules, setSchedules] = useState<CollectorSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentSchedule, setCurrentSchedule] = useState<CollectorSchedule>({
    zone: "",
    day_of_week: 1, // Lundi par défaut
    start_time: "08:00",
    end_time: "17:00",
  })

  useEffect(() => {
    loadSchedules()
  }, [])

  const loadSchedules = async () => {
    try {
      setLoading(true)
      const data = await getCollectorSchedules()
      setSchedules(data)
    } catch (error) {
      console.error("Error fetching schedules:", error)
      showAlert("Erreur", "Impossible de charger vos horaires. Veuillez réessayer.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleAddSchedule = () => {
    setCurrentSchedule({
      zone: "",
      day_of_week: 1,
      start_time: "08:00",
      end_time: "17:00",
    })
    setEditMode(false)
    setModalVisible(true)
  }

  const handleEditSchedule = (schedule: CollectorSchedule) => {
    setCurrentSchedule(schedule)
    setEditMode(true)
    setModalVisible(true)
  }

  const handleDeleteSchedule = async (id: number) => {
    showAlert("Supprimer l'horaire", "Êtes-vous sûr de vouloir supprimer cet horaire ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true)
            await deleteCollectorSchedule(id)
            // Mettre à jour la liste des horaires
            setSchedules(schedules.filter((s) => s.id !== id))
            showAlert("Succès", "L'horaire a été supprimé avec succès.")
          } catch (error) {
            console.error("Error deleting schedule:", error)
            showAlert("Erreur", "Impossible de supprimer l'horaire. Veuillez réessayer.")
          } finally {
            setLoading(false)
          }
        },
      },
    ])
  }

  const validateSchedule = () => {
    if (!currentSchedule.zone.trim()) {
      showAlert("Erreur", "Veuillez entrer une zone d'intervention.")
      return false
    }

    // Vérifier que l'heure de fin est après l'heure de début
    const startTime = currentSchedule.start_time.split(":")
    const endTime = currentSchedule.end_time.split(":")
    const startHour = Number.parseInt(startTime[0])
    const startMinute = Number.parseInt(startTime[1])
    const endHour = Number.parseInt(endTime[0])
    const endMinute = Number.parseInt(endTime[1])

    if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
      showAlert("Erreur", "L'heure de fin doit être après l'heure de début.")
      return false
    }

    return true
  }

  const handleSaveSchedule = async () => {
    if (!validateSchedule()) return

    try {
      setLoading(true)
      if (editMode && currentSchedule.id) {
        // Mettre à jour un horaire existant
        const updatedSchedule = await updateCollectorSchedule(currentSchedule)
        // Mettre à jour la liste des horaires
        setSchedules(schedules.map((s) => (s.id === updatedSchedule.id ? updatedSchedule : s)))
        showAlert("Succès", "L'horaire a été mis à jour avec succès.")
      } else {
        // Ajouter un nouvel horaire
        const newSchedule = await addCollectorSchedule(currentSchedule)
        // Ajouter le nouvel horaire à la liste
        setSchedules([...schedules, newSchedule])
        showAlert("Succès", "L'horaire a été ajouté avec succès.")
      }
      setModalVisible(false)
    } catch (error) {
      console.error("Error saving schedule:", error)
      showAlert("Erreur", "Impossible d'enregistrer l'horaire. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  const getDayName = (dayNumber: number) => {
    const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
    return days[dayNumber]
  }

  const renderScheduleItem = ({ item }: { item: CollectorSchedule }) => (
    <View style={styles.scheduleCard}>
      <View style={styles.scheduleHeader}>
        <View style={styles.dayContainer}>
          <Calendar size={16} color="#10B981" />
          <Text style={styles.dayText}>{getDayName(item.day_of_week)}</Text>
        </View>
        <View style={styles.timeContainer}>
          <Clock size={16} color="#6B7280" />
          <Text style={styles.timeText}>
            {item.start_time} - {item.end_time}
          </Text>
        </View>
      </View>

      <View style={styles.zoneContainer}>
        <MapPin size={16} color="#6B7280" />
        <Text style={styles.zoneText}>{item.zone}</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEditSchedule(item)}>
          <Edit size={16} color="#10B981" />
          <Text style={styles.editButtonText}>Modifier</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteSchedule(item.id!)}>
          <Trash size={16} color="#EF4444" />
          <Text style={styles.deleteButtonText}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderScheduleModal = () => (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editMode ? "Modifier l'horaire" : "Ajouter un horaire"}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Jour de la semaine</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={currentSchedule.day_of_week}
                  style={styles.picker}
                  onValueChange={(itemValue) =>
                    setCurrentSchedule({ ...currentSchedule, day_of_week: itemValue as number })
                  }
                >
                  <Picker.Item label="Lundi" value={1} />
                  <Picker.Item label="Mardi" value={2} />
                  <Picker.Item label="Mercredi" value={3} />
                  <Picker.Item label="Jeudi" value={4} />
                  <Picker.Item label="Vendredi" value={5} />
                  <Picker.Item label="Samedi" value={6} />
                  <Picker.Item label="Dimanche" value={0} />
                </Picker>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Zone d'intervention</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Cotonou, Quartier X"
                value={currentSchedule.zone}
                onChangeText={(text) => setCurrentSchedule({ ...currentSchedule, zone: text })}
              />
            </View>

            <View style={styles.timeRow}>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Heure de début</Text>
                <TextInput
                  style={styles.input}
                  placeholder="HH:MM"
                  value={currentSchedule.start_time}
                  onChangeText={(text) => setCurrentSchedule({ ...currentSchedule, start_time: text })}
                  keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "default"}
                />
              </View>

              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Heure de fin</Text>
                <TextInput
                  style={styles.input}
                  placeholder="HH:MM"
                  value={currentSchedule.end_time}
                  onChangeText={(text) => setCurrentSchedule({ ...currentSchedule, end_time: text })}
                  keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "default"}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveSchedule} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Check size={16} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Enregistrer</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes horaires de collecte</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddSchedule}>
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      ) : schedules.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Vous n'avez pas encore défini d'horaires de collecte.</Text>
          <Text style={styles.emptySubtext}>
            Ajoutez vos horaires pour informer les particuliers de votre disponibilité.
          </Text>
        </View>
      ) : (
        <FlatList
          data={schedules}
          renderItem={renderScheduleItem}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={loadSchedules}
        />
      )}

      {renderScheduleModal()}
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
  addButton: {
    backgroundColor: "#10B981",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  listContent: {
    padding: 16,
  },
  scheduleCard: {
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
  scheduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  dayContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dayText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#6B7280",
  },
  zoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  zoneText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#111827",
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
  },
  editButtonText: {
    marginLeft: 6,
    color: "#10B981",
    fontWeight: "500",
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  deleteButtonText: {
    marginLeft: 6,
    color: "#EF4444",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  modalBody: {
    padding: 16,
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#374151",
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#6B7280",
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#10B981",
    borderRadius: 8,
    marginLeft: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 6,
  },
})
