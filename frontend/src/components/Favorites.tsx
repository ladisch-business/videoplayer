import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from './Layout';
import VideoGrid from './VideoGrid';

interface FavoritesProps {
  user: any;
  onLogout: () => void;
}

const Favorites: React.FC<FavoritesProps> = ({ user, onLogout }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const response = await axios.get('/api/favorites');
      setFavorites(response.data);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async (videoId: string, isFavorite: boolean) => {
    try {
      if (isFavorite) {
        await axios.delete(`/api/favorites/${videoId}`);
        setFavorites(prev => prev.filter((video: any) => video.id !== videoId));
      } else {
        await axios.post(`/api/favorites/${videoId}`);
        loadFavorites();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-dark-text">Favoriten</h1>
          <p className="text-dark-text-secondary mt-1">
            {favorites.length} Videos als Favoriten markiert
          </p>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-dark-text-secondary">Lade Favoriten...</div>
          </div>
        ) : (
          <VideoGrid
            videos={favorites}
            onFavoriteToggle={handleFavoriteToggle}
          />
        )}
      </div>
    </Layout>
  );
};

export default Favorites;
