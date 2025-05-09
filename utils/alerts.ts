// Créer un nouveau fichier utilitaire pour gérer les alertes de manière compatible
import { Alert, Platform } from "react-native"

type AlertButton = {
  text: string
  onPress?: () => void
  style?: "default" | "cancel" | "destructive"
}

/**
 * Affiche une alerte compatible avec toutes les plateformes (web et mobile)
 */
export function showAlert(title: string, message: string, buttons: AlertButton[] = [{ text: "OK" }]) {
  if (Platform.OS === "web") {
    // Sur le web, utiliser l'alerte native du navigateur pour les messages simples
    if (buttons.length === 1 && buttons[0].text === "OK" && !buttons[0].onPress) {
      window.alert(`${title}\n\n${message}`)
      return
    }

    // Pour les confirmations (2 boutons typiquement)
    if (buttons.length === 2) {
      const cancelButton = buttons.find((b) => b.style === "cancel")
      const confirmButton = buttons.find((b) => b.style !== "cancel")

      if (cancelButton && confirmButton) {
        if (window.confirm(`${title}\n\n${message}`)) {
          confirmButton.onPress?.()
        } else {
          cancelButton.onPress?.()
        }
        return
      }
    }

    // Pour les cas plus complexes, on utilise une approche séquentielle
    const result = window.confirm(`${title}\n\n${message}`)
    const buttonToPress = result
      ? buttons.find((b) => b.style !== "cancel") || buttons[0]
      : buttons.find((b) => b.style === "cancel")

    buttonToPress?.onPress?.()
  } else {
    // Sur mobile, utiliser l'Alert natif de React Native
    Alert.alert(title, message, buttons)
  }
}
