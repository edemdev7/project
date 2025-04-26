import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { MapPin, Package } from 'lucide-react-native';
import { useUserContext } from '@/context/UserContext';

// Données fictives des missions
const MOCK_MISSIONS = [
  {
    id: 1,
    user: { name: 'Jean Dupont', phone: '0987654321' },
    wasteType: 'plastique',
    weight: 5.2,
    location: 'Cotonou, Quartier X',
    imageUrl: 'https://picsum.photos/id/28/500/300',
    created_at: '2025-04-22T14:30:00Z',
  },
  {
    id: 2,
    user: { name: 'Marie Koné', phone: '0612345678' },
    wasteType: 'papier',
    weight: 3.7,
    location: 'Cotonou, Quartier Y',
    imageUrl: 'https://picsum.photos/id/20/500/300',
    created_at: '2025-04-21T11:45:00Z',
  },
  {
    id: 3,
    user: { name: 'Pascal Adéwolé', phone: '0723456789' },
    wasteType: 'electronique',
    weight: 8.1,
    location: 'Podji, Avenue Z',
    imageUrl: 'https://picsum.photos/id/24/500/300',
    created_at: '2025-04-20T09:15:00Z',
  },
];

// Define the Mission type
interface Mission {
  id: number;
  user: { name: string; phone: string };
  wasteType: string;
  weight: number;
  location: string;
  imageUrl: string;
  created_at: string;
}

export default function CollectorMissions() {
  const { user, isAuthenticated } = useUserContext();
  const [missions, setMissions] = useState<Mission[]>(MOCK_MISSIONS);
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
      setMissions(MOCK_MISSIONS);
    } catch (error) {
      console.error('Error fetching missions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAccept = (missionId: number) => {
    Alert.alert(
      "Accepter la mission",
      "Voulez-vous accepter cette mission de collecte ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Accepter", 
          onPress: () => {
            // Simuler l'acceptation
            const updatedMissions = missions.filter(m => m.id !== missionId);
            setMissions(updatedMissions);
            Alert.alert("Mission acceptée", "La mission a été ajoutée à votre planning.");
          }
        }
      ]
    );
  };

  const handleReject = (missionId: number) => {
    Alert.alert(
      "Refuser la mission",
      "Êtes-vous sûr de vouloir refuser cette mission ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Refuser", 
          onPress: () => {
            // Simuler le refus
            const updatedMissions = missions.filter(m => m.id !== missionId);
            setMissions(updatedMissions);
          },
          style: "destructive"
        }
      ]
    );
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
        <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
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
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleReject(item.id)}
        >
          <Text style={styles.rejectButtonText}>Refuser</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleAccept(item.id)}
        >
          <Text style={styles.acceptButtonText}>Accepter</Text>
        </TouchableOpacity>
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
        <Text style={styles.title}>Missions disponibles</Text>
        <Package size={24} color="#10B981" />
      </View>
      
      {missions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucune mission disponible actuellement.</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  locationIcon: {
    marginRight: 4,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#10B98110',
  },
  rejectButton: {
    backgroundColor: '#EF444410',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  acceptButtonText: {
    color: '#10B981',
    fontWeight: '600',
    fontSize: 16,
  },
  rejectButtonText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 16,
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