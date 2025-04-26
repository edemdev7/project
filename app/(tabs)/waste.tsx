import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { useUserContext } from '@/context/UserContext';

// Importer les composants pour les différents types d'utilisateurs
import WasteDeclarationForm from '@/components/WasteDeclarationForm';
import CollectorMissions from '@/components/CollectorMissions';
import RecyclerWaste from '@/components/RecyclerWaste';
export default function WasteScreen() {
  const { user, isAuthenticated } = useUserContext();
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }
  }, [isAuthenticated]);

  // Afficher le contenu en fonction du type d'utilisateur
  if (user?.type === 'collecteur') {
    return <CollectorMissions />;
  }
  
  if (user?.type === 'recycleur') {
    return <RecyclerWaste />;
  }
  
  // Par défaut, afficher la déclaration de déchets pour les particuliers
  return <WasteDeclarationForm />;
}