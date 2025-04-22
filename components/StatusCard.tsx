import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Check, Clock, X, ChevronRight } from 'lucide-react-native';

interface StatusCardProps {
  title: string;
  status: boolean;
  action?: 'verify' | 'upload' | 'complete';
  route?: string;
  isPending?: boolean;
  errorMessage?: string;
}

export function StatusCard({ 
  title, 
  status, 
  action, 
  route, 
  isPending = false,
  errorMessage
}: StatusCardProps) {
  
  const handleActionPress = () => {
    if (route) {
      router.push(route);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={[
          styles.iconContainer, 
          status ? styles.iconSuccess : 
          isPending ? styles.iconPending : 
          errorMessage ? styles.iconError : styles.iconDefault
        ]}>
          {status ? (
            <Check size={20} color="#FFFFFF" />
          ) : isPending ? (
            <Clock size={20} color="#FFFFFF" />
          ) : errorMessage ? (
            <X size={20} color="#FFFFFF" />
          ) : (
            <X size={20} color="#FFFFFF" />
          )}
        </View>
        
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={[
            styles.status, 
            status ? styles.statusVerified : 
            isPending ? styles.statusPending : 
            errorMessage ? styles.statusError : styles.statusDefault
          ]}>
            {status ? 'Vérifié' : 
             isPending ? 'En attente' : 
             errorMessage ? 'Rejeté' : 'Non vérifié'}
          </Text>
          
          {errorMessage && (
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          )}
        </View>
      </View>
      
      {action && route && (
        <TouchableOpacity style={styles.actionButton} onPress={handleActionPress}>
          <Text style={styles.actionButtonText}>
            {action === 'verify' ? 'Vérifier' : 
             action === 'upload' ? 'Soumettre' : 'Compléter'}
          </Text>
          <ChevronRight size={16} color="#10B981" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconSuccess: {
    backgroundColor: '#10B981',
  },
  iconPending: {
    backgroundColor: '#F59E0B',
  },
  iconError: {
    backgroundColor: '#EF4444',
  },
  iconDefault: {
    backgroundColor: '#9CA3AF',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
  },
  statusVerified: {
    color: '#10B981',
  },
  statusPending: {
    color: '#F59E0B',
  },
  statusError: {
    color: '#EF4444',
  },
  statusDefault: {
    color: '#9CA3AF',
  },
  errorMessage: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionButtonText: {
    color: '#10B981',
    fontWeight: '500',
    marginRight: 4,
  },
});