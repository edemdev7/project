"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator } from "react-native"
import { MapPin, Calendar, Clock } from "lucide-react-native"
import { useUserContext } from "@/context/UserContext"

// Définir des interfaces pour typer les données
interface Collector {
  name: string
  phone: string
}

interface Appointment {
  id: number
  wasteType: string
  weight: number
  location: string
  imageUrl: string
  appointment_date: string
  status: string
  collector: Collector
}

// Données fictives de l'historique des rendez-vous
const MOCK_APPOINTMENTS = [
  {
    id: 1,
    wasteType: "plastique",
    weight: 200.5,
    location: "Usine de recyclage Cotonou",
    imageUrl: "https://picsum.photos/id/120/500/300",
    appointment_date: "2025-04-25T11:00:00Z",
    status: "à venir",
    collector: {
      name: "Éco-Collecte SARL",
      phone: "0123456789",
    },
  },
  {
    id: 2,
    wasteType: "papier",
    weight: 105.2,
    location: "Usine de recyclage Cotonou",
    imageUrl: "https://picsum.photos/id/131/500/300",
    appointment_date: "2025-04-18T09:15:00Z",
    status: "terminé",
    collector: {
      name: "Green Collect Bénin",
      phone: "0234567891",
    },
  },
  {
    id: 3,
    wasteType: "electronique",
    weight: 80.5,
    location: "Usine de recyclage Podji",
    imageUrl: "https://picsum.photos/id/142/500/300",
    appointment_date: "2025-04-15T14:30:00Z",
    status: "terminé",
    collector: {
      name: "E-Waste Solutions",
      phone: "0345678912",
    },
  },
]

export default function DechetsHistoryScreen() {
  const { user, isAuthenticated } = useUserContext()
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = async () => {
    try {
      setLoading(true)
      // Dans une vraie app, ici on ferait un appel API
      // Pour cette démo, on utilise un délai simulé
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setAppointments(MOCK_APPOINTMENTS)
    } catch (error) {
      console.error("Error fetching appointments:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadAppointments()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const renderAppointmentItem = ({ item }: { item: Appointment }) => (
    <View style={styles.appointmentCard}>
      <View style={[styles.statusBanner, item.status === "terminé" ? styles.completedBanner : styles.pendingBanner]}>
        <Text style={styles.statusText}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Text>
      </View>

      <Image source={{ uri: item.imageUrl }} style={styles.appointmentImage} resizeMode="cover" />

      <View style={styles.appointmentHeader}>
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryText}>{item.wasteType.charAt(0).toUpperCase() + item.wasteType.slice(1)}</Text>
        </View>
        <View style={styles.weightContainer}>
          <Text style={styles.weightText}>{item.weight} kg</Text>
        </View>
      </View>

      <View style={styles.appointmentDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Collecteur:</Text>
          <Text style={styles.detailValue}>{item.collector.name}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Téléphone:</Text>
          <Text style={styles.detailValue}>{item.collector.phone}</Text>
        </View>

        <View style={styles.detailRow}>
          <MapPin size={16} color="#6B7280" style={styles.iconStyle} />
          <Text style={styles.detailValue}>{item.location}</Text>
        </View>

        <View style={styles.detailRow}>
          <Calendar size={16} color="#6B7280" style={styles.iconStyle} />
          <Text style={styles.detailValue}>{formatDate(item.appointment_date)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Clock size={16} color="#6B7280" style={styles.iconStyle} />
          <Text style={styles.detailValue}>{formatTime(item.appointment_date)}</Text>
        </View>
      </View>
    </View>
  )

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historique des rendez-vous</Text>
      </View>

      {appointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucun rendez-vous dans votre historique.</Text>
        </View>
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderAppointmentItem}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
  },
  appointmentCard: {
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
    zIndex: 10,
  },
  completedBanner: {
    backgroundColor: "#10B981",
  },
  pendingBanner: {
    backgroundColor: "#F59E0B",
  },
  statusText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 12,
  },
  appointmentImage: {
    width: "100%",
    height: 160,
  },
  appointmentHeader: {
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
  weightContainer: {
    backgroundColor: "#6B728020",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  weightText: {
    color: "#6B7280",
    fontWeight: "500",
    fontSize: 14,
  },
  appointmentDetails: {
    padding: 16,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "center",
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
    marginLeft: 6,
  },
  iconStyle: {
    marginRight: 2,
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
})
