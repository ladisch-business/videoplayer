import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from './Layout';
import { Heart, ArrowLeft, Trash2 } from 'lucide-react';

interface VideoPlayerProps {
  user: any;
  onLogout: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ user, onLogout }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadVideo();
    }
  }, [id]);

  const loadVideo = async () => {
    try {
      const response = await axios.get(`/api/videos/${id}`);
      setVideo(response.data);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Video konnte nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!video) return;

    try {
      if (video.is_favorite) {
        await axios.delete(`/api/favorites/${video.id}`);
      } else {
        await axios.post(`/api/favorites/${video.id}`);
      }
      setVideo((prev: any) => ({ ...prev, is_favorite: !prev.is_favorite }));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleDelete = async () => {
    if (!video || !confirm('Sind Sie sicher, dass Sie dieses Video löschen möchten?')) {
      return;
    }

    try {
      await axios.delete(`/api/videos/${video.id}`);
      navigate('/');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Fehler beim Löschen des Videos');
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="flex items-center justify-center h-64">
          <div className="text-dark-text-secondary">Video wird geladen...</div>
        </div>
      </Layout>
    );
  }

  if (error || !video) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="p-6">
          <div className="text-center">
            <div className="text-red-500 mb-4">{error || 'Video nicht gefunden'}</div>
            <button
              onClick={() => navigate('/')}
              className="text-blue-400 hover:text-blue-300"
            >
              Zurück zum Dashboard
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-dark-text-secondary hover:text-dark-text transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Zurück
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleFavoriteToggle}
              className={`p-2 rounded-full transition-colors ${
                video.is_favorite
                  ? 'bg-red-600 text-white'
                  : 'bg-dark-surface text-dark-text-secondary hover:text-red-500'
              }`}
            >
              <Heart className={`h-5 w-5 ${video.is_favorite ? 'fill-current' : ''}`} />
            </button>
            
            <button
              onClick={handleDelete}
              className="p-2 rounded-full bg-dark-surface text-dark-text-secondary hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-dark-surface rounded-lg overflow-hidden border border-dark-border">
            <div className="aspect-video bg-black">
              <video
                controls
                className="w-full h-full"
                poster={video.cover_path ? `/${video.cover_path}` : undefined}
              >
                <source src={`/api/videos/${video.id}/stream`} type="video/mp4" />
                Ihr Browser unterstützt das Video-Element nicht.
              </video>
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-dark-text mb-2">
                    {video.title}
                  </h1>
                  
                  <div className="flex items-center space-x-4 text-sm text-dark-text-secondary">
                    {video.duration && (
                      <span>Dauer: {formatDuration(video.duration)}</span>
                    )}
                    <span>
                      Erstellt: {new Date(video.created_at).toLocaleDateString('de-DE')}
                    </span>
                    {video.status === 'draft' && (
                      <span className="bg-yellow-600 text-white px-2 py-1 rounded text-xs">
                        Entwurf
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {video.description && (
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-dark-text mb-2">Beschreibung</h3>
                  <p className="text-dark-text-secondary whitespace-pre-wrap">
                    {video.description}
                  </p>
                </div>
              )}
              
              {video.tag_names && video.tag_names.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-dark-text mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {video.tag_names.map((tag: string) => (
                      <span
                        key={tag}
                        className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VideoPlayer;
