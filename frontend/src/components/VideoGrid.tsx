import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Play, Clock } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  description: string;
  cover_path: string;
  duration: number;
  is_favorite: boolean;
  tag_names: string[];
  status: string;
}

interface VideoGridProps {
  videos: Video[];
  onFavoriteToggle: (videoId: string, isFavorite: boolean) => void;
}

const VideoGrid: React.FC<VideoGridProps> = ({ videos, onFavoriteToggle }) => {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-dark-text-secondary">
        <div className="text-lg mb-2">Keine Videos gefunden</div>
        <Link to="/upload" className="text-blue-400 hover:text-blue-300">
          Erstes Video hochladen
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {videos.map((video) => (
        <div key={video.id} className="bg-dark-surface rounded-lg overflow-hidden border border-dark-border hover:border-gray-500 transition-colors">
          <div className="relative aspect-video bg-gray-800">
            {video.cover_path ? (
              <img
                src={`/${video.cover_path}`}
                alt={video.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Play className="h-12 w-12 text-gray-500" />
              </div>
            )}
            
            <div className="absolute top-2 right-2">
              <button
                onClick={() => onFavoriteToggle(video.id, video.is_favorite)}
                className={`p-2 rounded-full transition-colors ${
                  video.is_favorite
                    ? 'bg-red-600 text-white'
                    : 'bg-black bg-opacity-50 text-white hover:bg-opacity-70'
                }`}
              >
                <Heart className={`h-4 w-4 ${video.is_favorite ? 'fill-current' : ''}`} />
              </button>
            </div>
            
            {video.duration && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formatDuration(video.duration)}
              </div>
            )}
            
            <Link
              to={`/video/${video.id}`}
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all group"
            >
              <Play className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
          
          <div className="p-4">
            <h3 className="font-medium text-dark-text mb-2 line-clamp-2">
              {video.title}
            </h3>
            
            {video.description && (
              <p className="text-sm text-dark-text-secondary mb-3 line-clamp-2">
                {video.description}
              </p>
            )}
            
            {video.tag_names && video.tag_names.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {video.tag_names.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
                {video.tag_names.length > 3 && (
                  <span className="text-xs text-dark-text-secondary">
                    +{video.tag_names.length - 3} mehr
                  </span>
                )}
              </div>
            )}
            
            {video.status === 'draft' && (
              <div className="mt-2">
                <span className="inline-block bg-yellow-600 text-white text-xs px-2 py-1 rounded">
                  Entwurf
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;
