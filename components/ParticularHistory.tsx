import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useUserContext } from '@/context/UserContext';
import { getAllWasteDeclarations } from '@/services/api';
import { WasteDeclaration } from '@/types';
import { WasteItem } from '@/components/WasteItem';

export default function ParticularHistory() {
  const { user, isAuthenticated } = useUserContext();
  const [declarations, setDeclarations] = useState<WasteDeclaration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }
    
    fetchDeclarations();
  }, [isAuthenticated]);

  const fetchDeclarations = async () => {
    try {
      setLoading(true);
      const data = await getAllWasteDeclarations();
      setDeclarations(data);
    } catch (error) {
      console.error('Error fetching waste declarations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDeclarations();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historique des déclarations</Text>
      
      {declarations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Vous n'avez pas encore déclaré de déchets.</Text>
        </View>
      ) : (
        <FlatList
          data={declarations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <WasteItem declaration={item} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10B981']} />
          }
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    margin: 16,
    color: '#111827',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
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