import React, { createContext, useState, useContext } from 'react';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState({});

  const toggleFavorite = (cafe) => {
    setFavorites(prev => {
      if (prev[cafe.id]) {
        const { [cafe.id]: removed, ...rest } = prev;
        return rest;
      } else {
        return { ...prev, [cafe.id]: cafe };
      }
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