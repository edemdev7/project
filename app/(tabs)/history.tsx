import { useEffect } from 'react';
import { router } from 'expo-router';
import { useUserContext } from '@/context/UserContext';

// Importer les composants pour les différents types d'utilisateurs
import CollectorMissionHistory from '@/components/CollectorMissionHistory';
import RecyclerAppointmentHistory from '@/components/RecyclerAppointmentHistory';
import ParticularHistory from '@/components/ParticularHistory';

export default function HistoryScreen() {
  const { user, isAuthenticated } = useUserContext();
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }
  }, [isAuthenticated]);

  // Afficher l'historique en fonction du type d'utilisateur
  if (user?.type === 'collecteur') {
    return <CollectorMissionHistory />;
  }
  
  if (user?.type === 'recycleur') {
    return <RecyclerAppointmentHistory />;
  }
  
  // Par défaut, afficher l'historique pour les particuliers
  return <ParticularHistory />;
}