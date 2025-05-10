"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from "react-native"
import { router } from "expo-router"
import { useUserContext } from "@/context/UserContext"
import { getAllWasteapi } from "@/services/api"
import { showAlert } from "@/utils/alerts"
import type { WasteDeclaration } from "@/types"
import { WasteItem } from "@/components/WasteItem"
import WasteFilters, { type WasteFilters as WasteFiltersType } from "@/components/WasteFilters"

export default function ParticularHistory() {
  const { user, isAuthenticated } = useUserContext()
  const [declarations, setDeclarations] = useState<WasteDeclaration[]>([])
  const [filteredDeclarations, setFilteredDeclarations] = useState<WasteDeclaration[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filters, setFilters] = useState<WasteFiltersType>({})

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/login")
      return
    }

    fetchDeclarations()
  }, [isAuthenticated])

  useEffect(() => {
    // Appliquer les filtres à la liste des déclarations
    applyFilters()
  }, [filters, declarations])

  const fetchDeclarations = async () => {
    try {
      setLoading(true)
      const data = await getAllWasteapi()
      setDeclarations(data)
    } catch (error) {
      console.error("Error fetching waste declarations:", error)
      showAlert("Erreur", "Impossible de charger vos déclarations. Veuillez réessayer.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...declarations]

    // Filtre par catégorie
    if (filters.category) {
      filtered = filtered.filter((declaration) => declaration.category === filters.category)
    }

    // Filtre par date
    if (filters.date) {
      const filterDate = new Date(filters.date).toDateString()
      filtered = filtered.filter((declaration) => {
        const declarationDate = new Date(declaration.created_at).toDateString()
        return declarationDate === filterDate
      })
    }

    // Filtre par localisation
    if (filters.location) {
      const locationLower = filters.location.toLowerCase()
      filtered = filtered.filter((declaration) => declaration.location.toLowerCase().includes(locationLower))
    }

    // Filtre par poids minimum
    if (filters.minWeight !== undefined) {
      filtered = filtered.filter((declaration) => declaration.weight >= filters.minWeight!)
    }

    // Filtre par poids maximum
    if (filters.maxWeight !== undefined) {
      filtered = filtered.filter((declaration) => declaration.weight <= filters.maxWeight!)
    }

    setFilteredDeclarations(filtered)
  }

  const handleApplyFilters = (newFilters: WasteFiltersType) => {
    setFilters(newFilters)
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchDeclarations()
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historique des déclarations</Text>

      <View style={styles.filtersContainer}>
        <WasteFilters onApplyFilters={handleApplyFilters} activeFilters={filters} />
      </View>

      {filteredDeclarations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {Object.keys(filters).length > 0
              ? "Aucune déclaration ne correspond à vos filtres."
              : "Vous n'avez pas encore déclaré de déchets."}
          </Text>
          {Object.keys(filters).length > 0 && (
            <TouchableOpacity style={styles.clearFiltersButton} onPress={() => setFilters({})}>
              <Text style={styles.clearFiltersText}>Effacer les filtres</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredDeclarations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <WasteItem declaration={item} />}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    margin: 16,
    color: "#111827",
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 0,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
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
