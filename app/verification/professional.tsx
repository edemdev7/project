import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Platform,
  Image
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useUserContext } from '@/context/UserContext';
import { submitProfessionalVerification } from '@/services/api';
import { ProfessionalData } from '@/types';
import { Check, X, Info } from 'lucide-react-native';

export default function ProfessionalFormScreen() {
  const { user, isAuthenticated, refreshUserProfile } = useUserContext();
  const [loading, setLoading] = useState(false);
  const [preuveImpotUri, setPreuveImpotUri] = useState<string | null>(null);
  const [professionalData, setProfessionalData] = useState<ProfessionalData>({
    entreprise: '',
    ifu: '',
    rccm: '',
    email_entreprise: '',
    adresse_entreprise: '',
    type_dechets: '',
    nbre_equipe: 1,
    zones_intervention: [],
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    if (user?.type !== 'collecteur' && user?.type !== 'recycleur') {
      Alert.alert(
        'Non applicable',
        'Cette vérification est uniquement pour les comptes de type "collecteur" ou "recycleur".',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    }
  }, [isAuthenticated, user]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPreuveImpotUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner une image. Veuillez réessayer.');
    }
  };

  const handleZoneInput = (text: string) => {
    // Split comma-separated values and trim whitespace
    const zones = text.split(',').map(zone => zone.trim()).filter(zone => zone.length > 0);
    setProfessionalData(prev => ({
      ...prev,
      zones_intervention: zones
    }));
  };

  const getZonesString = () => {
    return professionalData.zones_intervention?.join(', ') || '';
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!professionalData.entreprise || !professionalData.ifu || !professionalData.rccm ||
        !professionalData.email_entreprise || !professionalData.adresse_entreprise ||
        !professionalData.type_dechets || !preuveImpotUri) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (user?.type === 'collecteur' && (!professionalData.zones_intervention || professionalData.zones_intervention.length === 0)) {
      Alert.alert('Erreur', 'Veuillez indiquer vos zones d\'intervention');
      return;
    }

    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('type', user?.type || '');
      
      // Add all text fields
      Object.entries(professionalData).forEach(([key, value]) => {
        if (key === 'zones_intervention' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (key !== 'preuve_impot') {
          formData.append(key, value.toString());
        }
      });
      
      // Gestion du fichier selon la plateforme
    if (Platform.OS === 'web') {
      console.log("Préparation du fichier pour le web...");
      try {
        // Sur le web, il faut récupérer le Blob à partir de l'URI
        const response = await fetch(preuveImpotUri);
        const blob = await response.blob();
        formData.append('preuve_impot', blob, 'preuve_impot.jpg');
      } catch (fileErr) {
        console.error('Erreur lors de la préparation du fichier:', fileErr);
        Alert.alert('Erreur', 'Impossible de préparer le fichier pour l\'envoi');
        setLoading(false);
        return;
      }
    } else {
      // Pour les plateformes natives (iOS/Android)
      formData.append('preuve_impot', {
        name: 'preuve_impot.jpg',
        type: 'image/jpeg',
        uri: Platform.OS === 'ios' ? preuveImpotUri.replace('file://', '') : preuveImpotUri,
      } as any);
    }

    // Afficher le contenu du FormData pour débogage
    console.log("FormData préparé, envoi en cours...");
    
    await submitProfessionalVerification(formData);
    await refreshUserProfile();
    
    Alert.alert(
      'Succès', 
      'Votre profil professionnel a été soumis avec succès et est en cours de vérification.',
      [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
    );

    } catch (error) {
      console.error('Error submitting professional verification:', error);
      Alert.alert('Erreur', 'Impossible de soumettre votre profil professionnel. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // If already verified/pending, show status message
if (user?.pro_verification_submitted) {
    return (
      <View style={styles.container}>
        <View style={styles.statusContainer}>
          {user.pro_verification_status === 'validé' ? (
            <Check size={60} color="#10B981" />
          ) : (
            <Info size={60} color="#F59E0B" />
          )}
          
          <Text style={[
            styles.statusTitle,
            user.pro_verification_status === 'validé' ? styles.validatedText : styles.pendingText
          ]}>
            {user.pro_verification_status === 'validé' ? 'Profil validé' : 'En attente de validation'}
          </Text>
          
          <Text style={styles.statusMessage}>
            {user.pro_verification_status === 'validé' 
              ? 'Votre profil professionnel a été vérifié et validé par notre équipe.'
              : 'Votre profil professionnel est en cours de vérification par notre équipe. Veuillez patienter.'}
          </Text>
          
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.buttonText}>Retour à l'accueil</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // If rejected, show rejected message and form
  const isRejected = user?.verification_status === 'rejected';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Vérification professionnelle</Text>

        {isRejected && user?.rejected_reason && (
          <View style={styles.rejectionContainer}>
            <X size={24} color="#EF4444" />
            <Text style={styles.rejectionTitle}>Profil rejeté</Text>
            <Text style={styles.rejectionReason}>{user.rejected_reason}</Text>
            <Text style={styles.rejectionText}>Veuillez corriger les informations et soumettre à nouveau.</Text>
          </View>
        )}

        <Text style={styles.description}>
          Pour compléter votre inscription en tant que {user?.type === 'collecteur' ? 'collecteur' : 'recycleur'},
          veuillez fournir les informations suivantes sur votre entreprise.
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Type de compte <Text style={styles.required}>*</Text></Text>
          <View style={styles.disabledInput}>
            <Text style={styles.disabledText}>{user?.type === 'collecteur' ? 'Collecteur' : 'Recycleur'}</Text>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nom de l'entreprise <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Green Collect Sarl"
            value={professionalData.entreprise}
            onChangeText={(text) => setProfessionalData(prev => ({ ...prev, entreprise: text }))}
          />
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>IFU <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Numéro IFU"
              value={professionalData.ifu}
              onChangeText={(text) => setProfessionalData(prev => ({ ...prev, ifu: text }))}
            />
          </View>
          
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>RCCM <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Numéro RCCM"
              value={professionalData.rccm}
              onChangeText={(text) => setProfessionalData(prev => ({ ...prev, rccm: text }))}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email de l'entreprise <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: contact@entreprise.com"
            value={professionalData.email_entreprise}
            onChangeText={(text) => setProfessionalData(prev => ({ ...prev, email_entreprise: text }))}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Adresse de l'entreprise <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Adresse complète"
            value={professionalData.adresse_entreprise}
            onChangeText={(text) => setProfessionalData(prev => ({ ...prev, adresse_entreprise: text }))}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Types de déchets traités <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: plastique, organique (séparés par des virgules)"
            value={professionalData.type_dechets}
            onChangeText={(text) => setProfessionalData(prev => ({ ...prev, type_dechets: text }))}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nombre d'équipes <Text style={styles.required}>*</Text></Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={professionalData.nbre_equipe}
              style={styles.picker}
              onValueChange={(itemValue) => 
                setProfessionalData(prev => ({ ...prev, nbre_equipe: itemValue as number }))
              }
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <Picker.Item key={num} label={num.toString()} value={num} />
              ))}
            </Picker>
          </View>
        </View>

        {user?.type === 'collecteur' && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Zones d'intervention <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Cotonou, Abomey-Calavi (séparés par des virgules)"
              value={getZonesString()}
              onChangeText={handleZoneInput}
            />
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Preuve d'impôt <Text style={styles.required}>*</Text></Text>
          <Text style={styles.hint}>Quittance de paiement d'impôt ou document fiscal récent</Text>
          
          {preuveImpotUri ? (
            <View>
              <Image source={{ uri: preuveImpotUri }} style={styles.documentImage} />
              <TouchableOpacity style={styles.changeDocButton} onPress={pickImage}>
                <Text style={styles.changeDocText}>Changer le document</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Text style={styles.uploadButtonText}>Sélectionner un document</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Soumettre le profil</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111827',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  rejectionContainer: {
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  rejectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 8,
    marginBottom: 8,
  },
  rejectionReason: {
    fontSize: 16,
    fontWeight: '500',
    color: '#B91C1C',
    marginBottom: 8,
    textAlign: 'center',
  },
  rejectionText: {
    fontSize: 14,
    color: '#7F1D1D',
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#374151',
    fontWeight: '500',
  },
  required: {
    color: '#EF4444',
  },
  hint: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
  },
  disabledText: {
    fontSize: 16,
    color: '#6B7280',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  uploadButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
  documentImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  changeDocButton: {
    alignItems: 'center',
    padding: 8,
  },
  changeDocText: {
    color: '#10B981',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 12,
  },
  validatedText: {
    color: '#10B981',
  },
  pendingText: {
    color: '#F59E0B',
  },
  statusMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '80%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});