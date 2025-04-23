import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  ScrollView,
  Image,
  Platform
} from 'react-native';
import { router } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useUserContext } from '@/context/UserContext';
import { uploadDocuments } from '@/services/api';
import { Camera, Upload, Check } from 'lucide-react-native';

export default function DocumentUploadScreen() {
  const { user, isAuthenticated, refreshUserProfile } = useUserContext();
  const [cipDocument, setCipDocument] = useState<string | null>(null);
  const [residenceProof, setResidenceProof] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraActive, setCameraActive] = useState<'cip' | 'residence' | null>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [cameraRef, setCameraRef] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    if (user?.type !== 'particulier') {
      Alert.alert(
        'Non applicable',
        'Cette vérification est uniquement pour les comptes de type "particulier".',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    }
  }, [isAuthenticated, user]);

  const takePicture = async () => {
    if (cameraRef) {
      try {
        const photo = await cameraRef.takePictureAsync();
        if (cameraActive === 'cip') {
          setCipDocument(photo.uri);
        } else if (cameraActive === 'residence') {
          setResidenceProof(photo.uri);
        }
        setCameraActive(null);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Erreur', 'Impossible de prendre une photo. Veuillez réessayer.');
      }
    }
  };

  const pickImage = async (type: 'cip' | 'residence') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        if (type === 'cip') {
          setCipDocument(result.assets[0].uri);
        } else {
          setResidenceProof(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner une image. Veuillez réessayer.');
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleUpload = async () => {
    if (!cipDocument || !residenceProof) {
      Alert.alert('Erreur', 'Veuillez fournir les deux documents requis.');
      return;
    }

    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('cip_document', {
        name: 'cip_document.jpg',
        type: 'image/jpeg',
        uri: Platform.OS === 'ios' ? cipDocument.replace('file://', '') : cipDocument,
      } as any);
      
      formData.append('residence_proof', {
        name: 'residence_proof.jpg',
        type: 'image/jpeg',
        uri: Platform.OS === 'ios' ? residenceProof.replace('file://', '') : residenceProof,
      } as any);

      await uploadDocuments(formData);
      await refreshUserProfile();
      
      Alert.alert(
        'Succès', 
        'Vos documents ont été soumis avec succès et sont en cours de vérification.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (error) {
      console.error('Error uploading documents:', error);
      Alert.alert('Erreur', 'Impossible de soumettre vos documents. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // If already uploaded, show success message
  if (user?.documents_uploaded) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Check size={60} color="#10B981" />
          <Text style={styles.successTitle}>Documents soumis</Text>
          <Text style={styles.successMessage}>
            Vos documents ont déjà été soumis et sont en cours de vérification par notre équipe.
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

  if (cameraActive) {
    if (!permission?.granted) {
      return (
        <View style={styles.container}>
          <Text style={styles.message}>Nous avons besoin de votre permission pour utiliser la caméra</Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Autoriser l'accès</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <CameraView 
          style={styles.camera} 
          facing={facing}
          ref={ref => setCameraRef(ref)}
        >
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cameraButton} onPress={toggleCameraFacing}>
              <Text style={styles.cameraButtonText}>Retourner</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.captureBtnOuter} onPress={takePicture}>
              <View style={styles.captureBtnInner} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cameraButton} onPress={() => setCameraActive(null)}>
              <Text style={styles.cameraButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Soumission des documents d'identité</Text>
        <Text style={styles.description}>
          Pour compléter votre inscription, veuillez soumettre une copie de votre CIP/Passeport et une preuve de résidence.
        </Text>

        <View style={styles.documentSection}>
          <Text style={styles.sectionTitle}>CIP ou Passeport</Text>
          
          {cipDocument ? (
            <View style={styles.documentPreview}>
              <Image source={{ uri: cipDocument }} style={styles.documentImage} />
              <View style={styles.documentActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => setCameraActive('cip')}
                >
                  <Camera size={18} color="#10B981" />
                  <Text style={styles.actionButtonText}>Reprendre</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => pickImage('cip')}
                >
                  <Upload size={18} color="#10B981" />
                  <Text style={styles.actionButtonText}>Changer</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.uploadOptions}>
              <TouchableOpacity 
                style={styles.uploadOption}
                onPress={() => setCameraActive('cip')}
              >
                <Camera size={24} color="#10B981" />
                <Text style={styles.uploadOptionText}>Prendre une photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.uploadOption}
                onPress={() => pickImage('cip')}
              >
                <Upload size={24} color="#10B981" />
                <Text style={styles.uploadOptionText}>Choisir une image</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.documentSection}>
          <Text style={styles.sectionTitle}>Preuve de résidence</Text>
          <Text style={styles.sectionDescription}>
            Facture récente d'électricité, d'eau ou attestation de résidence
          </Text>
          
          {residenceProof ? (
            <View style={styles.documentPreview}>
              <Image source={{ uri: residenceProof }} style={styles.documentImage} />
              <View style={styles.documentActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => setCameraActive('residence')}
                >
                  <Camera size={18} color="#10B981" />
                  <Text style={styles.actionButtonText}>Reprendre</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => pickImage('residence')}
                >
                  <Upload size={18} color="#10B981" />
                  <Text style={styles.actionButtonText}>Changer</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.uploadOptions}>
              <TouchableOpacity 
                style={styles.uploadOption}
                onPress={() => setCameraActive('residence')}
              >
                <Camera size={24} color="#10B981" />
                <Text style={styles.uploadOptionText}>Prendre une photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.uploadOption}
                onPress={() => pickImage('residence')}
              >
                <Upload size={24} color="#10B981" />
                <Text style={styles.uploadOptionText}>Choisir une image</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton, 
            (!cipDocument || !residenceProof || loading) && styles.submitButtonDisabled
          ]}
          onPress={handleUpload}
          disabled={!cipDocument || !residenceProof || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Soumettre les documents</Text>
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
  documentSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#111827',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  uploadOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  uploadOption: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  uploadOptionText: {
    color: '#374151',
    fontSize: 14,
    marginTop: 8,
  },
  documentPreview: {
    marginTop: 8,
  },
  documentImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  documentActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginHorizontal: 8,
  },
  actionButtonText: {
    color: '#10B981',
    fontSize: 14,
    marginLeft: 4,
  },
  submitButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cameraButton: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 5,
  },
  cameraButtonText: {
    color: '#FFFFFF',
  },
  captureBtnOuter: {
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 35,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  captureBtnInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  message: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
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
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#10B981',
    marginTop: 16,
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
});