import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { WasteDeclaration } from '@/types';

interface WasteItemProps {
  declaration: WasteDeclaration;
}

export function WasteItem({ declaration }: WasteItemProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getCategoryLabel = (category: string) => {
    const categories = {
      plastique: 'Plastique',
      papier: 'Papier',
      organique: 'Organique',
      electronique: 'Électronique',
      autre: 'Autre'
    };
    return categories[category] || category;
  };
  
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'collecté':
        return '#10B981';
      case 'en attente':
        return '#F59E0B';
      case 'annulé':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryText}>{getCategoryLabel(declaration.category)}</Text>
        </View>
        
        <View style={[styles.statusContainer, { backgroundColor: getStatusColor(declaration.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(declaration.status) }]}>
            {declaration.status || 'En attente'}
          </Text>
        </View>
      </View>
      
      {declaration.photo && (
        <Image 
          source={{ uri: declaration.photo }} 
          style={styles.image} 
          resizeMode="cover"
        />
      )}
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Poids :</Text>
          <Text style={styles.detailValue}>{declaration.weight} kg</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Localisation :</Text>
          <Text style={styles.detailValue}>{declaration.location}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date :</Text>
          <Text style={styles.detailValue}>{formatDate(declaration.created_at)}</Text>
        </View>
        
        {declaration.collector && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Collecteur ID :</Text>
            <Text style={styles.detailValue}>{declaration.collector}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryContainer: {
    backgroundColor: '#10B98120',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  categoryText: {
    color: '#10B981',
    fontWeight: '500',
    fontSize: 14,
  },
  statusContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontWeight: '500',
    fontSize: 14,
  },
  image: {
    width: '100%',
    height: 180,
  },
  detailsContainer: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: 100,
    fontSize: 15,
    color: '#6B7280',
  },
  detailValue: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
});