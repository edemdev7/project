import { View, Text, StyleSheet } from "react-native"
import { Award } from "lucide-react-native"

interface WelcomeMessageProps {
  username: string
  points: number
  userType: string
}

export function WelcomeMessage({ username, points, userType }: WelcomeMessageProps) {
  // Get greeting based on time of day
  const getGreeting = () => {
    const hours = new Date().getHours()
    if (hours < 12) return "Bonjour"
    if (hours < 18) return "Bon après-midi"
    return "Bonsoir"
  }

  const showPoints = userType === "particulier"

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.greeting}>{getGreeting()},</Text>
        <Text style={styles.name}>{username}</Text>
      </View>

      {showPoints && (
        <View style={styles.pointsContainer}>
          <Award size={20} color="#FFFFFF" />
          <Text style={styles.pointsText}>{points} pts</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#10B981",
    padding: 16,
    paddingTop: 40,
    paddingBottom: 20,
  },
  textContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: "#E5E7EB",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pointsText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 6,
  },
})
