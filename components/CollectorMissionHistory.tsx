import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { MapPin, CheckCircle, XCircle } from 'lucide-react-native';
import { useUserContext } from '@/context/UserContext';

// Define the Mission type based on the mock data structure
interface Mission {
  id: number;
  user: { name: string; phone: string };
  wasteType: string;
  weight: number;
  location: string;
  imageUrl: string;
  created_at: string;
  completed_at?: string; // Optional as it might not exist for cancelled missions
  status: 'completed' | 'cancelled';
  cancel_reason?: string; // Optional as it only exists for cancelled missions
}

// Données fictives de l'historique des missions
const MOCK_MISSIONS_HISTORY: Mission[] = [
  {
    id: 1,
    user: { name: 'Martin Hounsou', phone: '0787654321' },
    wasteType: 'plastique',
    weight: 6.3,
    location: 'Cotonou, Quartier A',
    imageUrl: 'https://picsum.photos/id/60/500/300',
    created_at: '2025-04-18T10:30:00Z',
    completed_at: '2025-04-18T14:45:00Z',
    status: 'completed',
  },
  {
    id: 2,
    user: { name: 'Sophie Tchibozo', phone: '0611223344' },
    wasteType: 'organique',
    weight: 4.8,
    location: 'Cotonou, Quartier B',
    imageUrl: 'https://picsum.photos/id/48/500/300',
    created_at: '2025-04-17T09:20:00Z',
    completed_at: '2025-04-17T13:15:00Z',
    status: 'completed',
  },
  {
    id: 3,
    user: { name: 'Léa Koffi', phone: '0655667788' },
    wasteType: 'electronique',
    weight: 2.5,
    location: 'Podji, Avenue C',
    imageUrl: 'https://picsum.photos/id/96/500/300',
    created_at: '2025-04-16T15:10:00Z',
    status: 'cancelled',
    cancel_reason: 'Client indisponible',
  },
  {
    id: 4,
    user: { name: 'Marc Assogba', phone: '0722334455' },
    wasteType: 'papier',
    weight: 3.2,
    location: 'Cotonou, Quartier D',
    imageUrl: 'https://picsum.photos/id/116/500/300',
    created_at: '2025-04-15T11:40:00Z',
    completed_at: '2025-04-15T16:25:00Z',
    status: 'completed',
  },
];

export default function MissionHistoryScreen() {
  const { user, isAuthenticated } = useUserContext();
  const [missions, setMissions] = useState(MOCK_MISSIONS_HISTORY);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {

    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      setLoading(true);
      // Dans une vraie app, ici on ferait un appel API
      // Pour cette démo, on utilise un délai simulé
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMissions(MOCK_MISSIONS_HISTORY);
    } catch (error) {
      console.error('Error fetching mission history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMissions();
  };

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

  const renderMissionItem = ({ item }: { item: Mission }) => (
    <View style={styles.missionCard}>
      <View style={[
        styles.statusBanner,
        item.status === 'completed' ? styles.completedBanner : styles.cancelledBanner
      ]}>
        <Text style={styles.statusText}>
          {item.status === 'completed' ? 'Collecté' : 'Annulé'}
        </Text>
        {item.status === 'completed' ? (
          <CheckCircle size={16} color="#FFFFFF" />
        ) : (
          <XCircle size={16} color="#FFFFFF" />
        )}
      </View>
      
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.missionImage} 
        resizeMode="cover"
      />
      
      <View style={styles.missionHeader}>
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryText}>
            {item.wasteType.charAt(0).toUpperCase() + item.wasteType.slice(1)}
          </Text>
        </View>
        <Text style={styles.dateText}>Créé le {formatDate(item.created_at)}</Text>
      </View>
      
      <View style={styles.missionDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Particulier:</Text>
          <Text style={styles.detailValue}>{item.user.name}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Téléphone:</Text>
          <Text style={styles.detailValue}>{item.user.phone}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Poids:</Text>
          <Text style={styles.detailValue}>{item.weight} kg</Text>
        </View>
        
        <View style={styles.detailRow}>
          <MapPin size={16} color="#6B7280" style={styles.locationIcon} />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
        
        {item.status === 'completed' && item.completed_at && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Collecté le:</Text>
            <Text style={styles.detailValue}>{formatDate(item.completed_at)}</Text>
          </View>
        )}
        
        {item.status === 'cancelled' && item.cancel_reason && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Raison:</Text>
            <Text style={[styles.detailValue, styles.cancelReason]}>{item.cancel_reason}</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historique des missions</Text>
      </View>
      
      {missions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucune mission dans votre historique.</Text>
        </View>
      ) : (
        <FlatList
          data={missions}
          renderItem={renderMissionItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  missionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
    position: 'relative',
  },
  statusBanner: {
    position: 'absolute',
    top: 10,
    right: 0,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  completedBanner: {
    backgroundColor: '#10B981',
  },
  cancelledBanner: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
    marginRight: 4,
  },
  missionImage: {
    width: '100%',
    height: 160,
  },
  missionHeader: {
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
  dateText: {
    color: '#6B7280',
    fontSize: 12,
  },
  missionDetails: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: 80,
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  cancelReason: {
    color: '#EF4444',
  },
  locationIcon: {
    marginRight: 4,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});