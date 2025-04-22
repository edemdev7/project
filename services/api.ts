import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  AuthTokens, 
  LoginCredentials, 
  RegisterData, 
  User, 
  OtpRequest, 
  OtpVerify,
  WasteData,
  WasteDeclaration
} from '@/types';
import { Platform } from 'react-native';

// Create axios instance
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
api.interceptors.request.use(
  async (config) => {
    let token = null;
    if (Platform.OS === 'web') {
      token = localStorage.getItem('auth_token');
    } else {
      token = await AsyncStorage.getItem('auth_token');
    }

    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Auth API calls
export const register = async (userData: RegisterData): Promise<void> => {
  await api.post('/auth/users/', userData);
};

export const login = async (credentials: LoginCredentials): Promise<AuthTokens> => {
  try {
    const response = await api.post<AuthTokens>('/auth/token/login', credentials);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(Object.values(error.response.data).flat().join(', '));
    }
    throw error;
  }
};

export const fetchCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>('/auth/users/me/');
  return response.data;
};

// OTP verification
export const requestOtp = async (data: OtpRequest): Promise<void> => {
  await api.post('/auth/request-otp/', data);
};

export const verifyOtp = async (data: OtpVerify): Promise<void> => {
  await api.post('/auth/verify-phone/', data);
};

// Document upload
export const uploadDocuments = async (formData: FormData): Promise<void> => {
  await api.post('/auth/upload-documents/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Professional verification
export const submitProfessionalVerification = async (formData: FormData): Promise<void> => {
  await api.post('/auth/professional-verification/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Waste declarations
export const submitWasteDeclaration = async (data: WasteData): Promise<WasteDeclaration> => {
  const formData = new FormData();
  
  // Add text fields
  formData.append('category', data.category);
  formData.append('weight', data.weight.toString());
  formData.append('location', data.location);
  
  // Add photo if exists
  if (data.photo) {
    if (data.photo instanceof Blob) {
      formData.append('photo', data.photo);
    } else {
      console.error('Invalid photo format. Expected Blob or File.');
    }
  }
  
  const response = await api.post<WasteDeclaration>('/api/waste/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const getAllWasteDeclarations = async (): Promise<WasteDeclaration[]> => {
  const response = await api.get<WasteDeclaration[]>('/api/waste/');
  return response.data;
};

export const getWasteDeclaration = async (id: number): Promise<WasteDeclaration> => {
  const response = await api.get<WasteDeclaration>(`/api/waste/${id}/`);
  return response.data;
};