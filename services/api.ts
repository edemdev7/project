import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import type {
  AuthTokens,
  LoginCredentials,
  RegisterData,
  User,
  OtpRequest,
  OtpVerify,
  WasteData,
  WasteDeclaration,
  UserProfileUpdate,
  CollectorAvailability,
  CollectorMission,
  CollectorSchedule,
  WasteFilters,
} from "@/types"
import { Platform } from "react-native"

// Create axios instance
const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor for auth token
api.interceptors.request.use(
  async (config) => {
    let token = null
    if (Platform.OS === "web") {
      token = localStorage.getItem("auth_token")
    } else {
      token = await AsyncStorage.getItem("auth_token")
    }

    if (token) {
      config.headers["Authorization"] = `Token ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message)
    return Promise.reject(error)
  },
)

// Auth API calls
export const register = async (userData: RegisterData): Promise<void> => {
  await api.post("/auth/users/", userData)
}

export const login = async (credentials: LoginCredentials): Promise<AuthTokens> => {
  try {
    const response = await api.post<AuthTokens>("/auth/token/login", credentials)
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(Object.values(error.response.data).flat().join(", "))
    }
    throw error
  }
}

export const fetchCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>("/auth/users/me/")
  return response.data
}

// Nouveau: Mise à jour du profil utilisateur
export const updateUserProfile = async (data: UserProfileUpdate): Promise<User> => {
  const response = await api.patch<User>("/auth/users/me/", data)
  return response.data
}

// Nouveau: Mise à jour de la localisation GPS
// Mise à jour de la fonction updateUserLocation pour supporter le format de chaîne GPS
export const updateUserLocation = async (locationData: {
  location_gps: string | { latitude: number; longitude: number }
}): Promise<User> => {
  // Si location_gps est un objet, le convertir en chaîne "latitude,longitude"
  const formattedData = { ...locationData }
  if (typeof locationData.location_gps === "object") {
    formattedData.location_gps = `${locationData.location_gps.latitude},${locationData.location_gps.longitude}`
  }

  const response = await api.patch<User>("/auth/profile/update/", formattedData)
  return response.data
}

// OTP verification
export const requestOtp = async (data: OtpRequest): Promise<void> => {
  await api.post("/core/request-otp/", data)
}

export const verifyOtp = async (data: OtpVerify): Promise<void> => {
  await api.post("/core/verify-phone/", data)
}

// Document upload
export const uploadDocuments = async (formData: FormData): Promise<void> => {
  await api.post("/auth/upload-verification-documents/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}

// Professional verification
export const submitProfessionalVerification = async (formData: FormData): Promise<void> => {
  await api.post("/auth/professional-verification/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}

// Waste api
export const submitWasteDeclaration = async (data: WasteData): Promise<WasteDeclaration> => {
  const formData = new FormData()

  // Add text fields
  formData.append("category", data.category)
  formData.append("weight", data.weight.toString())
  formData.append("location", data.location)

  // Add photo if exists
  if (data.photo) {
    if (data.photo instanceof Blob) {
      formData.append("photo", data.photo)
    } else {
      console.error("Invalid photo format. Expected Blob or File.")
    }
  }

  const response = await api.post<WasteDeclaration>("/api/waste/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return response.data
}

export const getAllWasteapi = async (): Promise<WasteDeclaration[]> => {
  const response = await api.get<WasteDeclaration[]>("/api/waste/")
  return response.data
}

export const getWasteDeclaration = async (id: number): Promise<WasteDeclaration> => {
  const response = await api.get<WasteDeclaration>(`/api/waste/${id}/`)
  return response.data
}

// Ajouter cette fonction pour filtrer les déchets disponibles pour les recycleurs
export const getAvailableWaste = async (filters?: WasteFilters): Promise<WasteDeclaration[]> => {
  const params = new URLSearchParams()

  if (filters?.category) params.append("category", filters.category)
  if (filters?.date) params.append("date", filters.date)
  if (filters?.location) params.append("location", filters.location)
  if (filters?.minWeight !== undefined) params.append("min_weight", filters.minWeight.toString())
  if (filters?.maxWeight !== undefined) params.append("max_weight", filters.maxWeight.toString())

  const url = `/api/waste/available/?${params.toString()}`
  const response = await api.get<WasteDeclaration[]>(url)
  return response.data
}

// Nouveaux endpoints pour les collecteurs
export const updateCollectorAvailability = async (data: CollectorAvailability): Promise<void> => {
  await api.post("/auth/collector/availability/", data)
}

export const getCollectorMissions = async (filters?: { status?: string; date?: string; zone?: string }): Promise<
  CollectorMission[]
> => {
  const params = new URLSearchParams()
  if (filters?.status) params.append("status", filters.status)
  if (filters?.date) params.append("date", filters.date)
  if (filters?.zone) params.append("zone", filters.zone)

  const url = `/api/waste/my_missions/?${params.toString()}`
  const response = await api.get<CollectorMission[]>(url)
  return response.data
}

export const acceptMission = async (id: number): Promise<void> => {
  await api.post(`/api/waste/${id}/accept_mission/`)
}
export const rejectMission = async (id: number): Promise<void> => {
  await api.post(`/api/waste/${id}/reject_mission/`)
}

export const markMissionCollected = async (id: number): Promise<void> => {
  await api.post(`/api/waste/${id}/mark_collected/`)
}

export const markAllMissionsCollected = async (): Promise<void> => {
  await api.post("/api/waste/mark_all_collected/")
}

// Endpoints pour les horaires des collecteurs
export const getCollectorSchedules = async (): Promise<CollectorSchedule[]> => {
  const response = await api.get<CollectorSchedule[]>("/api/collector-schedules/")
  return response.data
}

export const addCollectorSchedule = async (schedule: CollectorSchedule): Promise<CollectorSchedule> => {
  const response = await api.post<CollectorSchedule>("/api/collector-schedules/", schedule)
  return response.data
}

export const updateCollectorSchedule = async (schedule: CollectorSchedule): Promise<CollectorSchedule> => {
  if (!schedule.id) {
    throw new Error("Schedule ID is required for update")
  }
  const response = await api.put<CollectorSchedule>(`/api/collector-schedules/${schedule.id}/`, schedule)
  return response.data
}

export const deleteCollectorSchedule = async (id: number): Promise<void> => {
  await api.delete(`/api/collector-schedules/${id}/`)
}
