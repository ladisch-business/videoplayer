import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from './Layout';
import VideoGrid from './VideoGrid';
import Sidebar from './Sidebar';

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [videos, setVideos] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideos();
    loadTags();
  }, [selectedTags, searchQuery]);

  const loadVideos = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedTags.length > 0) {
        selectedTags.forEach(tag => params.append('tags', tag));
      }

      const response = await axios.get(`/api/videos?${params}`);
      setVideos(response.data);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const response = await axios.get('/api/tags');
      setTags(response.data);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const handleTagToggle = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const handleFavoriteToggle = async (videoId: string, isFavorite: boolean) => {
    try {
      if (isFavorite) {
        await axios.delete(`/api/favorites/${videoId}`);
      } else {
        await axios.post(`/api/favorites/${videoId}`);
      }
      loadVideos();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="flex h-full">
        <Sidebar
          tags={tags}
          selectedTags={selectedTags}
          onTagToggle={handleTagToggle}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-dark-text">Video Dashboard</h1>
            <p className="text-dark-text-secondary mt-1">
              {videos.length} Videos gefunden
            </p>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-dark-text-secondary">Lade Videos...</div>
            </div>
          ) : (
            <VideoGrid
              videos={videos}
              onFavoriteToggle={handleFavoriteToggle}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
