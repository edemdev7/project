"use client"

import { useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from "react-native"
import { router } from "expo-router"
import { useUserContext } from "@/context/UserContext"
// Ajouter l'import pour l'icône Edit
import { User, MapPin, Award, LogOut, ChevronRight, Edit, Calendar } from "lucide-react-native"

export default function ProfileScreen() {
  const { user, logout, isAuthenticated, refreshUserProfile } = useUserContext()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/login")
    } else {
      // try {
      //   refreshUserProfile();
      // } catch (err) {
      //   console.error('Error refreshing profile:', err);
      // }
      console.log("User profile refreshe disabled")
    }
  }, [isAuthenticated])

  const handleLogout = () => {
    console.log("Logout button pressed")

    // Version conditionnelle selon la plateforme
    if (Platform.OS === "web") {
      // Sur le web, utiliser une confirmation standard du navigateur
      if (confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
        logoutAndRedirect()
      }
    } else {
      // Sur mobile, utiliser Alert.alert
      Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
        { text: "Annuler", style: "cancel" },
        {
          text: "Déconnexion",
          onPress: logoutAndRedirect,
          style: "destructive",
        },
      ])
    }
  }
  // Fonction séparée pour la logique de déconnexion
  const logoutAndRedirect = async () => {
    console.log("Confirming logout")
    try {
      // Force déconnexion sur le web
      if (Platform.OS === "web") {
        localStorage.removeItem("auth_token")
      }

      await logout()
      console.log("Logout successful, redirecting")

      // Redirection selon la plateforme
      if (Platform.OS === "web") {
        // Redirection dure pour le web
        window.location.href = "/auth/login"
      } else {
        // Router pour mobile
        router.replace("/auth/login")
      }
    } catch (error) {
      console.error("Error during logout:", error)

      // Forcer la déconnexion même en cas d'erreur
      if (Platform.OS === "web") {
        localStorage.removeItem("auth_token")
        window.location.href = "/auth/login"
      } else {
        router.replace("/auth/login")
      }
    }
  }

  if (!user) {
    return null
  }

  const userTypeLabel = {
    particulier: "Particulier",
    entreprise: "Entreprise",
    collecteur: "Collecteur",
    recycleur: "Recycleur",
    admin: "Administrateur",
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{user.username.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.username}>{user.username}</Text>
        <View style={styles.userTypeContainer}>
          <Text style={styles.userType}>{userTypeLabel[user.type] || user.type}</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <User size={20} color="#10B981" />
          <Text style={styles.infoLabel}>Email :</Text>
          <Text style={styles.infoValue}>{user.email}</Text>
        </View>

        {user.location && (
          <View style={styles.infoRow}>
            <MapPin size={20} color="#10B981" />
            <Text style={styles.infoLabel}>Localisation :</Text>
            <Text style={styles.infoValue}>{user.location}</Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Award size={20} color="#10B981" />
          <Text style={styles.infoLabel}>Points :</Text>
          <Text style={styles.infoValue}>{user.points}</Text>
        </View>
      </View>

      {/* Ajouter un bouton d'édition dans la section du profil */}
      {/* Après la section des informations de l'utilisateur, ajouter: */}

      <TouchableOpacity style={styles.editProfileButton} onPress={() => router.push("/profile/edit")}>
        <Edit size={18} color="#FFFFFF" />
        <Text style={styles.editProfileButtonText}>Modifier le profil</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vérification</Text>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/verification/otp")}>
          <Text style={styles.menuItemText}>Vérification téléphone</Text>
          <View style={styles.menuItemRight}>
            <Text style={[styles.statusText, !!user.phone_verified ? styles.statusVerified : styles.statusPending]}>
              {!!user.phone_verified ? "Vérifié" : "Non vérifié"}
            </Text>
            <ChevronRight size={20} color="#9CA3AF" />
          </View>
        </TouchableOpacity>

        {user.type === "particulier" && (
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/verification/documents")}>
            <Text style={styles.menuItemText}>Documents d'identité</Text>
            <View style={styles.menuItemRight}>
              <Text
                style={[styles.statusText, !!user.documents_uploaded ? styles.statusVerified : styles.statusPending]}
              >
                {!!user.documents_uploaded ? "Envoyés" : "Non envoyés"}
              </Text>
              <ChevronRight size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        )}

        {(user.type === "collecteur" || user.type === "recycleur") && (
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/verification/professional")}>
            <Text style={styles.menuItemText}>Profil professionnel</Text>
            <View style={styles.menuItemRight}>
              <Text
                style={[
                  styles.statusText,
                  user.verification_status === "validé"
                    ? styles.statusVerified
                    : user.verification_status === "rejected"
                      ? styles.statusRejected
                      : styles.statusPending,
                ]}
              >
                {user.verification_status === "validé"
                  ? "Validé"
                  : user.verification_status === "rejected"
                    ? "Rejeté"
                    : "En attente"}
              </Text>
              <ChevronRight size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Ajouter une section pour les collecteurs */}
      {user.type === "collecteur" && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Collecte</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/(tabs)/schedule")}>
            <Text style={styles.menuItemText}>Horaires de collecte</Text>
            <View style={styles.menuItemRight}>
              <Calendar size={20} color="#10B981" />
              <ChevronRight size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compte</Text>
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Text style={styles.menuItemTextDanger}>Déconnexion</Text>
          <LogOut size={20} color="#EF4444" />
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
  header: {
    backgroundColor: "#10B981",
    padding: 24,
    alignItems: "center",
    paddingTop: 40,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#10B981",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  userTypeContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  userType: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  infoSection: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 15,
    color: "#6B7280",
    marginLeft: 8,
    width: 100,
  },
  infoValue: {
    fontSize: 15,
    color: "#111827",
    flex: 1,
  },
  section: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuItemText: {
    fontSize: 15,
    color: "#111827",
  },
  menuItemTextDanger: {
    fontSize: 15,
    color: "#EF4444",
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 14,
    marginRight: 8,
  },
  statusVerified: {
    color: "#10B981",
  },
  statusPending: {
    color: "#F59E0B",
  },
  statusRejected: {
    color: "#EF4444",
  },
  // Ajouter les styles correspondants à la fin du StyleSheet:

  editProfileButton: {
    backgroundColor: "#10B981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginHorizontal: 16,
  },
  editProfileButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 8,
  },
})
