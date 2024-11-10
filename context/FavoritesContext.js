import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, database } from '../Firebase/firebaseSetup';
import { doc, setDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState({});
  const userId = auth.currentUser?.uid;

    // Load initial favorites from Firestore
    useEffect(() => {
      const fetchFavorites = async () => {
        if (!userId) return;
  
        const favoritesRef = collection(database, 'users', userId, 'favorites');
        const favoriteDocs = await getDocs(favoritesRef);
        const favoritesData = {};
        favoriteDocs.forEach((doc) => {
          favoritesData[doc.id] = doc.data();
        });
        setFavorites(favoritesData);
      };
  
      fetchFavorites();
    }, [userId]);

  const toggleFavorite = async (cafe) => {
    if (!userId) return;

    const cafeRef = doc(database, 'users', userId, 'favorites', cafe.id);

    // Update Firestore and local state
    setFavorites((prev) => {
      const updatedFavorites = { ...prev };
      if (prev[cafe.id]) {
        // Remove from Firestore and local state
        deleteDoc(cafeRef);
        delete updatedFavorites[cafe.id];
      } else {
        // Add to Firestore and local state
        setDoc(cafeRef, cafe);
        updatedFavorites[cafe.id] = cafe;
      }
      return updatedFavorites;
    });
  };

  const isFavorite = (cafeId) => {
    return !!favorites[cafeId];
  };

  const getFavorites = () => {
    return Object.values(favorites);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, getFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};