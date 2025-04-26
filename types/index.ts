export type UserType = 'particulier' | 'entreprise' | 'collecteur' | 'recycleur' | 'admin';

export type VerificationStatus = 'en attente' | 'validated' | 'rejected';

export interface User {
  id: number;
  username: string;
  email: string;
  type: UserType;
  location?: string;
  points: number;
  is_active: boolean;
  phone_verified: string;
  documents_uploaded: string;
  verification_status: string;
  rejected_reason?: string;
  pro_verification_submitted:string,
  pro_verification_status:string,
  latitude?: number;
  longitude?: number;
  availability?: 'available' | 'unavailable';
}

export interface AuthTokens {
  auth_token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  type: UserType;
  location?: string;
}

export interface OtpRequest {
  phone: string;
}

export interface OtpVerify {
  otp: string;
}

export interface DocumentUpload {
  cip_document: FormData;
  residence_proof: FormData;
}

export interface ProfessionalData {
  entreprise: string;
  ifu: string;
  rccm: string;
  email_entreprise: string;
  adresse_entreprise: string;
  type_dechets: string;
  nbre_equipe: number;
  zones_intervention?: string[];
  preuve_impot?: FormData;
}

export interface WasteData {
  category: 'plastique' | 'papier' | 'organique' | 'electronique' | 'autre';
  weight: number;
  location: string;
  photo?: FormData;
}

export interface WasteDeclaration extends WasteData {
  id: number;
  status: string;
  created_at: string;
  user: number;
  collector?: number;
}