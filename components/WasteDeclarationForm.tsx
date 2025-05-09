"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Image,
} from "react-native"
import { Picker } from "@react-native-picker/picker"
import { router } from "expo-router"
import { CameraView, type CameraType, useCameraPermissions } from "expo-camera"
import { useUserContext } from "@/context/UserContext"
import { submitWasteDeclaration } from "@/services/api"
import type { User, WasteData } from "@/types"

export default function WasteDeclarationForm() {
  const { user, isAuthenticated } = useUserContext()
  const [loading, setLoading] = useState(false)
  const [wasteData, setWasteData] = useState<WasteData>({
    category: "plastique",
    weight: 0,
    location: "",
    photo: undefined,
  })
  const [permission, requestPermission] = useCameraPermissions()
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [facing, setFacing] = useState<CameraType>("back")
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [cameraRef, setCameraRef] = useState<any>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/login")
      return
    }

    if (!isUserVerified(user)) {
      Alert.alert(
        "Compte non vérifié",
        "Vous devez compléter toutes les étapes de vérification pour accéder à cette fonctionnalité.",
        [{ text: "OK", onPress: () => router.replace("/(tabs)") }],
      )
    }
  }, [isAuthenticated, user])

  const takePicture = async () => {
    if (cameraRef) {
      try {
        const photo = await cameraRef.takePictureAsync()
        setPhotoUri(photo.uri)
        setIsCameraActive(false)

        // Create FormData for photo
        const formData = new FormData()
        formData.append("photo", {
          name: "waste_photo.jpg",
          type: "image/jpeg",
          uri: Platform.OS === "ios" ? photo.uri.replace("file://", "") : photo.uri,
        } as any)

        setWasteData((prev) => ({
          ...prev,
          photo: formData,
        }))
      } catch (error) {
        console.error("Error taking picture:", error)
        Alert.alert("Erreur", "Impossible de prendre une photo. Veuillez réessayer.")
      }
    }
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"))
  }

  const handleSubmit = async () => {
    if (!wasteData.weight || wasteData.weight <= 0) {
      Alert.alert("Erreur", "Veuillez indiquer un poids valide.")
      return
    }

    if (!wasteData.location) {
      Alert.alert("Erreur", "Veuillez indiquer une localisation.")
      return
    }

    if (!photoUri) {
      Alert.alert("Erreur", "Veuillez prendre une photo des déchets.")
      return
    }

    try {
      setLoading(true)
      const response = await submitWasteDeclaration(wasteData)
      Alert.alert("Succès", "Votre déclaration de déchets a été soumise avec succès !", [
        { text: "OK", onPress: () => router.replace("/(tabs)/history") },
      ])
    } catch (error) {
      console.error("Error submitting waste declaration:", error)
      Alert.alert("Erreur", "Impossible de soumettre votre déclaration. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  if (!isUserVerified(user)) {
    return null
  }

  if (isCameraActive) {
    if (!permission?.granted) {
      return (
        <View style={styles.container}>
          <Text style={styles.message}>Nous avons besoin de votre permission pour utiliser la caméra</Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Autoriser l'accès</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <View style={styles.container}>
        <CameraView style={styles.camera} facing={facing} ref={(ref) => setCameraRef(ref)}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cameraButton} onPress={toggleCameraFacing}>
              <Text style={styles.cameraButtonText}>Retourner</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.captureBtnOuter} onPress={takePicture}>
              <View style={styles.captureBtnInner} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cameraButton} onPress={() => setIsCameraActive(false)}>
              <Text style={styles.cameraButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Déclarer un déchet</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Catégorie</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={wasteData.category}
              style={styles.picker}
              onValueChange={(itemValue) => setWasteData((prev) => ({ ...prev, category: itemValue }))}
            >
              <Picker.Item label="Plastique" value="plastique" />
              <Picker.Item label="Papier" value="papier" />
              <Picker.Item label="Organique" value="organique" />
              <Picker.Item label="Électronique" value="electronique" />
              <Picker.Item label="Autre" value="autre" />
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Poids (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 2.5"
            keyboardType="decimal-pad"
            value={wasteData.weight > 0 ? wasteData.weight.toString() : ""}
            onChangeText={(text) => setWasteData((prev) => ({ ...prev, weight: Number.parseFloat(text) || 0 }))}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Localisation</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Cotonou, Quartier X"
            value={wasteData.location}
            onChangeText={(text) => setWasteData((prev) => ({ ...prev, location: text }))}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Photo du déchet</Text>
          {photoUri ? (
            <View style={styles.photoPreviewContainer}>
              <Image source={{ uri: photoUri }} style={styles.photoPreview} resizeMode="cover" />
              <TouchableOpacity style={styles.changePhotoButton} onPress={() => setIsCameraActive(true)}>
                <Text style={styles.changePhotoButtonText}>Changer la photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.photoButton} onPress={() => setIsCameraActive(true)}>
              <Text style={styles.photoButtonText}>Prendre une photo</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, (loading || !photoUri) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading || !photoUri}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Soumettre la déclaration</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

function isUserVerified(user: User | null) {
  if (!user) return false

  if (!user.phone_verified) return false

  if (user.type === "particulier" && !user.documents_uploaded) return false

  if (["collecteur", "recycleur"].includes(user.type) && user.verification_status !== "validé") return false

  return true
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  formContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 24,
    color: "#111827",
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#374151",
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  photoButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#10B981",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  photoButtonText: {
    color: "#10B981",
    fontSize: 16,
    fontWeight: "600",
  },
  photoPreviewContainer: {
    alignItems: "center",
  },
  photoPreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  changePhotoButton: {
    padding: 8,
  },
  changePhotoButtonText: {
    color: "#10B981",
    fontSize: 14,
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#10B981",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  cameraButton: {
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 5,
  },
  cameraButtonText: {
    color: "#FFFFFF",
  },
  captureBtnOuter: {
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 35,
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  captureBtnInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
  },
  message: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#10B981",
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "600",
  },
})
