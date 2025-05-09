"use client"

import { useEffect } from "react"
import { View, StyleSheet } from "react-native"
import { router } from "expo-router"
import { useUserContext } from "@/context/UserContext"
import EditProfileForm from "@/components/EditProfileForm"
import CollectorAvailabilityToggle from "@/components/CollectorAvailabilityToggle"

export default function EditProfileScreen() {
  const { user, isAuthenticated } = useUserContext()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/login")
    }
  }, [isAuthenticated])

  if (!user) {
    return null
  }

  return (
    <View style={styles.container}>
      {user.type === "collecteur" && <CollectorAvailabilityToggle />}
      <EditProfileForm />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 16,
  },
})
