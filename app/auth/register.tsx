import { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Link, router } from 'expo-router';
import { register } from '@/services/api';
import { RegisterData, UserType } from '@/types';

export default function RegisterScreen() {
  const [userData, setUserData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    type: 'particulier',
    location: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    // Validations
    if (!userData.username || !userData.email || !userData.password || !confirmPassword) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!isValidEmail(userData.email)) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    if (userData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (userData.password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await register(userData);
      Alert.alert(
        'Compte créé',
        'Votre compte a été créé avec succès. Veuillez vous connecter.',
        [{ text: 'OK', onPress: () => router.replace('/auth/login') }]
      );
    } catch (err: any) {
      if (err.response && err.response.data) {
        // Format API error messages
        const errorData = err.response.data;
        let errorMessage = 'Une erreur est survenue lors de l\'inscription';
        
        if (typeof errorData === 'object') {
          const messages = Object.entries(errorData)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
          errorMessage = messages || errorMessage;
        }
        
        setError(errorMessage);
      } else {
        setError('Une erreur est survenue lors de l\'inscription');
      }
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Créer un compte</Text>
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom d'utilisateur <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Votre nom d'utilisateur"
              value={userData.username}
              onChangeText={(text) => setUserData({ ...userData, username: text })}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Votre adresse email"
              value={userData.email}
              onChangeText={(text) => setUserData({ ...userData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Votre mot de passe"
              value={userData.password}
              onChangeText={(text) => setUserData({ ...userData, password: text })}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmer le mot de passe <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Confirmez votre mot de passe"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Type de compte <Text style={styles.required}>*</Text></Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={userData.type}
                style={styles.picker}
                onValueChange={(itemValue) => 
                  setUserData({ ...userData, type: itemValue as UserType })
                }
              >
                <Picker.Item label="Particulier" value="particulier" />
                <Picker.Item label="Entreprise" value="entreprise" />
                <Picker.Item label="Collecteur" value="collecteur" />
                <Picker.Item label="Recycleur" value="recycleur" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Localisation</Text>
            <TextInput
              style={styles.input}
              placeholder="Votre localisation"
              value={userData.location}
              onChangeText={(text) => setUserData({ ...userData, location: text })}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>S'inscrire</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Vous avez déjà un compte ? </Text>
            <Link href="/auth/login" asChild>
              <TouchableOpacity>
                <Text style={styles.loginLink}>Se connecter</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
    marginVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    color: '#111827',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 16,
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
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  button: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    color: '#6B7280',
    fontSize: 14,
  },
  loginLink: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
});