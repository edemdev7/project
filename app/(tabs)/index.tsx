import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';
import { useUserContext } from '@/context/UserContext';
import { StatusCard } from '@/components/StatusCard';
import { WelcomeMessage } from '@/components/WelcomeMessage';
import { User } from '@/types';

export default function HomeScreen() {
  const { user, isAuthenticated } = useUserContext();
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated]);

  if (!user) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <WelcomeMessage username={user.username} points={user.points} />
      
      <View style={styles.statusSection}>
        <Text style={styles.sectionTitle}>État de votre compte</Text>
        <StatusCard
          title="Vérification téléphone"
          status={!!user.phone_verified} 
          action={!user.phone_verified ? 'verify' : undefined} 
          route="/verification/otp"
        />
        
        {user.type === 'particulier' && (
          <StatusCard
            title="Documents d'identité"
            status={!!user.documents_uploaded}
            action={!user.documents_uploaded ? 'upload' : undefined} 
            route="/verification/documents"
            errorMessage={user.rejected_reason}
            isPending={user.verification_status === 'en attente'}
          />
        )}
        
        {(user.type === 'collecteur' || user.type === 'recycleur') && (
          <StatusCard
            title="Profil professionnel"
            status={!!user.documents_uploaded}
            action={!user.documents_uploaded ? 'upload' : undefined} 
            route="/verification/professional"
            isPending={user.verification_status === 'en attente'}
            errorMessage={user.rejected_reason}
          />
        )}
        
        <StatusCard
          title="Validation du compte"
          status={user.verification_status === 'validé'}
          isPending={user.verification_status === 'en attente'}
          errorMessage={user.rejected_reason}
        />
      </View>
      
      {isUserVerified(user) && (
        <View style={styles.actionSection}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/waste')}
          >
            <Text style={styles.actionButtonText}>Déclarer un déchet</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Comment ça marche ?</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>1. Vérifiez votre compte</Text>
          <Text style={styles.infoText}>
            Complétez votre profil et vérifiez votre numéro de téléphone pour commencer.
          </Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>2. Déclarez vos déchets</Text>
          <Text style={styles.infoText}>
            Prenez une photo, indiquez le type et le poids, puis soumettez votre déclaration.
          </Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>3. Gagnez des points</Text>
          <Text style={styles.infoText}>
            Chaque déchet déclaré vous rapporte des points que vous pourrez échanger contre des récompenses.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function isUserVerified(user: User) {
  if (!user.phone_verified) return false; 
  
  if (user.type === 'particulier' && !user.documents_uploaded ) return false;
  
  if (['collecteur', 'recycleur'].includes(user.type) && user.verification_status !== 'validé') return false;
  
  return true;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  statusSection: {
    padding: 16,
    marginBottom: 16,
  },
  actionSection: {
    padding: 16,
    marginBottom: 16,
  },
  infoSection: {
    padding: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111827',
  },
  actionButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#10B981',
  },
  infoText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
});