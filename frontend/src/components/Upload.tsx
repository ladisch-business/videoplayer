import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from './Layout';
import { Upload as UploadIcon, X, Image, Video } from 'lucide-react';

interface UploadProps {
  user: any;
  onLogout: () => void;
}

const Upload: React.FC<UploadProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'published'
  });
  const [files, setFiles] = useState({
    video: null as File | null,
    preview: null as File | null,
    cover: null as File | null
  });
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [availableTags, setAvailableTags] = useState<any[]>([]);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const previewInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get('/api/tags');
        setAvailableTags(response.data);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };
    fetchTags();
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const videoFile = droppedFiles.find(file => file.type.startsWith('video/'));
    
    if (videoFile) {
      setFiles(prev => ({ ...prev, video: videoFile }));
    }
  };

  const handleFileSelect = (type: 'video' | 'preview' | 'cover', file: File) => {
    setFiles(prev => ({ ...prev, [type]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!files.video) {
      alert('Bitte wählen Sie eine Videodatei aus.');
      return;
    }

    if (!formData.title.trim()) {
      alert('Bitte geben Sie einen Titel ein.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('status', formData.status);
      uploadData.append('video', files.video);
      
      if (files.preview) {
        uploadData.append('preview', files.preview);
      }
      
      if (files.cover) {
        uploadData.append('cover', files.cover);
      }

      const response = await axios.post('/api/videos/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress(progress);
        },
      });

      const videoId = response.data.video.id;

      for (const tagId of selectedTags) {
        try {
          await axios.post(`/api/tags/${tagId}/videos/${videoId}`);
        } catch (tagError) {
          console.error('Error adding tag to video:', tagError);
        }
      }

      navigate('/');
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.response?.data?.error || 'Upload fehlgeschlagen');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-dark-text">Video hochladen</h1>
          <p className="text-dark-text-secondary mt-1">
            Laden Sie ein neues Video mit Metadaten hoch
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? 'border-blue-500 bg-blue-500 bg-opacity-10'
                : 'border-dark-border hover:border-gray-500'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {files.video ? (
              <div className="flex items-center justify-center space-x-4">
                <Video className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-dark-text font-medium">{files.video.name}</p>
                  <p className="text-dark-text-secondary text-sm">
                    {(files.video.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFiles(prev => ({ ...prev, video: null }))}
                  className="text-red-500 hover:text-red-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div>
                <UploadIcon className="mx-auto h-12 w-12 text-dark-text-secondary mb-4" />
                <p className="text-dark-text mb-2">
                  Video hierher ziehen oder{' '}
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    durchsuchen
                  </button>
                </p>
                <p className="text-dark-text-secondary text-sm">
                  Unterstützte Formate: MP4, AVI, MOV, WMV
                </p>
              </div>
            )}
            
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => e.target.files?.[0] && handleFileSelect('video', e.target.files[0])}
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                Preview-Bild (optional)
              </label>
              <div className="border border-dark-border rounded-lg p-4">
                {files.preview ? (
                  <div className="flex items-center space-x-3">
                    <img
                      src={URL.createObjectURL(files.preview)}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-dark-text text-sm">{files.preview.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFiles(prev => ({ ...prev, preview: null }))}
                      className="text-red-500 hover:text-red-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => previewInputRef.current?.click()}
                    className="w-full flex items-center justify-center py-4 text-dark-text-secondary hover:text-dark-text transition-colors"
                  >
                    <Image className="h-6 w-6 mr-2" />
                    Preview-Bild auswählen
                  </button>
                )}
                
                <input
                  ref={previewInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect('preview', e.target.files[0])}
                  className="hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                Cover-Bild (optional)
              </label>
              <div className="border border-dark-border rounded-lg p-4">
                {files.cover ? (
                  <div className="flex items-center space-x-3">
                    <img
                      src={URL.createObjectURL(files.cover)}
                      alt="Cover"
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-dark-text text-sm">{files.cover.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFiles(prev => ({ ...prev, cover: null }))}
                      className="text-red-500 hover:text-red-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="w-full flex items-center justify-center py-4 text-dark-text-secondary hover:text-dark-text transition-colors"
                  >
                    <Image className="h-6 w-6 mr-2" />
                    Cover-Bild auswählen
                  </button>
                )}
                
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect('cover', e.target.files[0])}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-dark-text mb-2">
              Titel *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-dark-text mb-2">
              Beschreibung
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border border-dark-border rounded-md p-3 bg-dark-bg">
              {availableTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => {
                    setSelectedTags(prev => 
                      prev.includes(tag.id) 
                        ? prev.filter(id => id !== tag.id)
                        : [...prev, tag.id]
                    );
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTags.includes(tag.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-dark-surface text-dark-text hover:bg-dark-border'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {uploading && (
            <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-dark-text">Upload läuft...</span>
                <span className="text-dark-text">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-dark-bg rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              disabled={uploading}
              className="px-6 py-2 border border-dark-border text-dark-text hover:bg-dark-border transition-colors rounded-md disabled:opacity-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={uploading || !files.video}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium rounded-md transition-colors"
            >
              {uploading ? 'Wird hochgeladen...' : 'Video hochladen'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Upload;
