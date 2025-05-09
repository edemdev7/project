import { Stack } from "expo-router"
import { useFrameworkReady } from "@/hooks/useFrameworkReady"

export default function ScheduleLayout() {
  useFrameworkReady()

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#10B981",
        },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Horaires de collecte",
        }}
      />
    </Stack>
  )
}
