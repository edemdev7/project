"use client"

import { useEffect } from "react"
import { View, StyleSheet } from "react-native"
import { router } from "expo-router"
import { useUserContext } from "@/context/UserContext"
import CollectorScheduleManager from "@/components/CollectorScheduleManager"

export default function ScheduleScreen() {
  const { user, isAuthenticated } = useUserContext()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/login")
      return
    }

    // Vérifier que l'utilisateur est un collecteur
    if (user?.type !== "collecteur") {
      router.replace("/(tabs)")
      return
    }
  }, [isAuthenticated, user])

  if (!user || user.type !== "collecteur") {
    return null
  }

  return (
    <View style={styles.container}>
      <CollectorScheduleManager />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
})
