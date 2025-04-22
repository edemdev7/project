import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { router } from 'expo-router';
import { useUserContext } from '@/context/UserContext';
import { requestOtp, verifyOtp } from '@/services/api';

export default function OtpVerificationScreen() {
  const { user, isAuthenticated, refreshUserProfile } = useUserContext();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSendOtp = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone valide');
      return;
    }

    try {
      setLoading(true);
      await requestOtp({ phone: phoneNumber });
      setOtpSent(true);
      setCountdown(120); // 2 minutes countdown
      Alert.alert('Succès', 'Un code OTP a été envoyé à votre numéro de téléphone');
    } catch (error) {
      console.error('Error requesting OTP:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le code OTP. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le code OTP reçu');
      return;
    }

    try {
      setLoading(true);
      await verifyOtp({ otp: otpCode });
      await refreshUserProfile();
      Alert.alert(
        'Succès', 
        'Votre numéro de téléphone a été vérifié avec succès',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/') }]
      );
    } catch (error) {
      console.error('Error verifying OTP:', error);
      Alert.alert('Erreur', 'Code OTP incorrect ou expiré. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // If already verified, show success message
  if (user?.phone_verified === 'true') {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successTitle}>Téléphone vérifié</Text>
          <Text style={styles.successMessage}>
            Votre numéro de téléphone a déjà été vérifié avec succès.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace('/(tabs)/')}
          >
            <Text style={styles.buttonText}>Retour à l'accueil</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Vérification du numéro de téléphone</Text>
        <Text style={styles.description}>
          Pour continuer, nous devons vérifier votre numéro de téléphone. Veuillez entrer votre numéro ci-dessous.
        </Text>

        {!otpSent ? (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Numéro de téléphone</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 97000000"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSendOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Envoyer le code</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Code OTP</Text>
              <Text style={styles.codeHint}>
                Un code a été envoyé au {phoneNumber}.
                {countdown > 0 && ` Valide pendant ${formatCountdown()}`}
              </Text>
              <TextInput
                style={styles.otpInput}
                placeholder="Entrez le code reçu"
                value={otpCode}
                onChangeText={setOtpCode}
                keyboardType="number-pad"
                editable={!loading}
                maxLength={6}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Vérifier le code</Text>
              )}
            </TouchableOpacity>

            {countdown === 0 && (
              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleSendOtp}
                disabled={loading}
              >
                <Text style={styles.resendButtonText}>Renvoyer le code</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#374151',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  codeHint: {
    color: '#6B7280',
    marginBottom: 8,
    fontSize: 14,
  },
  otpInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 8,
  },
  button: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  resendButton: {
    padding: 16,
    alignItems: 'center',
  },
  resendButtonText: {
    color: '#10B981',
    fontWeight: '600',
    fontSize: 14,
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