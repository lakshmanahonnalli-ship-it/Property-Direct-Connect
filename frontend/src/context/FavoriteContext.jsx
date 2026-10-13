import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const FavoriteContext = createContext(null);

export const FavoriteProvider = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = async () => {
    if (!user) {
      setFavorites([]);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/favorites');
      if (res.data.success) {
        setFavorites(res.data.favorites);
      }
    } catch (err) {
      console.warn('Could not load favorites:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const isFavorite = (propertyId) => {
    if (!propertyId) return false;
    return favorites.some((fav) => {
      const pId = fav.property?._id || fav.property;
      return pId?.toString() === propertyId.toString();
    });
  };

  const toggleFavorite = async (property) => {
    if (!user) {
      toast.error('Please log in to save properties to your Favorites!', {
        icon: '🔒',
        duration: 4000,
      });
      return false;
    }

    const propId = property._id || property;
    const currentlyFav = isFavorite(propId);

    try {
      if (currentlyFav) {
        await api.delete(`/favorites/${propId}`);
        setFavorites((prev) =>
          prev.filter((f) => (f.property?._id || f.property)?.toString() !== propId.toString())
        );
        toast.success('Removed from Favorites');
        return false;
      } else {
        const res = await api.post('/favorites', { propertyId: propId });
        if (res.data.success) {
          await fetchFavorites();
          toast.success('Added to Favorites!', { icon: '❤️' });
          return true;
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not update favorites.';
      toast.error(msg);
      return currentlyFav;
    }
  };

  return (
    <FavoriteContext.Provider
      value={{
        favorites,
        loading,
        isFavorite,
        toggleFavorite,
        count: favorites.length,
        fetchFavorites,
      }}
    >
      {children}
    </FavoriteContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoriteProvider');
  }
  return context;
};
