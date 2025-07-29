import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from './Layout';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface SettingsProps {
  user: any;
  onLogout: () => void;
}

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface Tag {
  id: string;
  name: string;
  description: string;
  category_id: string;
  category_name: string;
  category_color: string;
}

const Settings: React.FC<SettingsProps> = ({ user, onLogout }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showNewTag, setShowNewTag] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingTag, setEditingTag] = useState<string | null>(null);

  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color: '#3b82f6'
  });

  const [newTag, setNewTag] = useState({
    name: '',
    description: '',
    category_id: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, tagsRes] = await Promise.all([
        axios.get('/api/categories'),
        axios.get('/api/tags')
      ]);
      setCategories(categoriesRes.data);
      setTags(tagsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) return;

    try {
      await axios.post('/api/categories', newCategory);
      setNewCategory({ name: '', description: '', color: '#3b82f6' });
      setShowNewCategory(false);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Fehler beim Erstellen der Kategorie');
    }
  };

  const handleUpdateCategory = async (id: string, data: Partial<Category>) => {
    try {
      await axios.put(`/api/categories/${id}`, data);
      setEditingCategory(null);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Fehler beim Aktualisieren der Kategorie');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Sind Sie sicher? Alle zugehörigen Tags werden ebenfalls gelöscht.')) {
      return;
    }

    try {
      await axios.delete(`/api/categories/${id}`);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Fehler beim Löschen der Kategorie');
    }
  };

  const handleCreateTag = async () => {
    if (!newTag.name.trim() || !newTag.category_id) return;

    try {
      await axios.post('/api/tags', newTag);
      setNewTag({ name: '', description: '', category_id: '' });
      setShowNewTag(false);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Fehler beim Erstellen des Tags');
    }
  };

  const handleUpdateTag = async (id: string, data: Partial<Tag>) => {
    try {
      await axios.put(`/api/tags/${id}`, data);
      setEditingTag(null);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Fehler beim Aktualisieren des Tags');
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Tag löschen möchten?')) {
      return;
    }

    try {
      await axios.delete(`/api/tags/${id}`);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Fehler beim Löschen des Tags');
    }
  };

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="flex items-center justify-center h-64">
          <div className="text-dark-text-secondary">Lade Einstellungen...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-dark-text">Einstellungen</h1>
          <p className="text-dark-text-secondary mt-1">
            Verwalten Sie Kategorien und Tags für Ihre Videos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-dark-surface rounded-lg border border-dark-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-dark-text">Kategorien</h2>
              <button
                onClick={() => setShowNewCategory(true)}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Neue Kategorie
              </button>
            </div>

            {showNewCategory && (
              <div className="mb-4 p-4 bg-dark-bg rounded-lg border border-dark-border">
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Kategorie Name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    placeholder="Beschreibung (optional)"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                  <div className="flex items-center space-x-3">
                    <label className="text-dark-text text-sm">Farbe:</label>
                    <input
                      type="color"
                      value={newCategory.color}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                      className="w-12 h-8 rounded border border-dark-border"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowNewCategory(false)}
                      className="px-3 py-1 text-dark-text-secondary hover:text-dark-text transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleCreateCategory}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-dark-bg rounded-lg border border-dark-border">
                  {editingCategory === category.id ? (
                    <CategoryEditForm
                      category={category}
                      onSave={(data) => handleUpdateCategory(category.id, data)}
                      onCancel={() => setEditingCategory(null)}
                    />
                  ) : (
                    <>
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <div>
                          <h3 className="text-dark-text font-medium">{category.name}</h3>
                          {category.description && (
                            <p className="text-dark-text-secondary text-sm">{category.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingCategory(category.id)}
                          className="p-1 text-dark-text-secondary hover:text-blue-400 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-1 text-dark-text-secondary hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-dark-surface rounded-lg border border-dark-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-dark-text">Tags</h2>
              <button
                onClick={() => setShowNewTag(true)}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Neuer Tag
              </button>
            </div>

            {showNewTag && (
              <div className="mb-4 p-4 bg-dark-bg rounded-lg border border-dark-border">
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Tag Name"
                    value={newTag.name}
                    onChange={(e) => setNewTag(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    placeholder="Beschreibung (optional)"
                    value={newTag.description}
                    onChange={(e) => setNewTag(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                  <select
                    value={newTag.category_id}
                    onChange={(e) => setNewTag(prev => ({ ...prev, category_id: e.target.value }))}
                    className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Kategorie auswählen</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowNewTag(false)}
                      className="px-3 py-1 text-dark-text-secondary hover:text-dark-text transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleCreateTag}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center justify-between p-3 bg-dark-bg rounded-lg border border-dark-border">
                  {editingTag === tag.id ? (
                    <TagEditForm
                      tag={tag}
                      categories={categories}
                      onSave={(data) => handleUpdateTag(tag.id, data)}
                      onCancel={() => setEditingTag(null)}
                    />
                  ) : (
                    <>
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: tag.category_color }}
                        />
                        <div>
                          <h3 className="text-dark-text font-medium">{tag.name}</h3>
                          <p className="text-dark-text-secondary text-sm">{tag.category_name}</p>
                          {tag.description && (
                            <p className="text-dark-text-secondary text-xs">{tag.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingTag(tag.id)}
                          className="p-1 text-dark-text-secondary hover:text-blue-400 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTag(tag.id)}
                          className="p-1 text-dark-text-secondary hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

interface CategoryEditFormProps {
  category: Category;
  onSave: (data: Partial<Category>) => void;
  onCancel: () => void;
}

const CategoryEditForm: React.FC<CategoryEditFormProps> = ({ category, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: category.name,
    description: category.description,
    color: category.color
  });

  return (
    <div className="flex-1 space-y-2">
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        className="w-full px-2 py-1 bg-dark-surface border border-dark-border rounded text-dark-text text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <textarea
        value={formData.description}
        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        className="w-full px-2 py-1 bg-dark-surface border border-dark-border rounded text-dark-text text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        rows={1}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={formData.color}
            onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
            className="w-8 h-6 rounded border border-dark-border"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onCancel}
            className="px-2 py-1 text-dark-text-secondary hover:text-dark-text transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
          >
            <Save className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface TagEditFormProps {
  tag: Tag;
  categories: Category[];
  onSave: (data: Partial<Tag>) => void;
  onCancel: () => void;
}

const TagEditForm: React.FC<TagEditFormProps> = ({ tag, categories, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: tag.name,
    description: tag.description,
    category_id: tag.category_id
  });

  return (
    <div className="flex-1 space-y-2">
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        className="w-full px-2 py-1 bg-dark-surface border border-dark-border rounded text-dark-text text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <textarea
        value={formData.description}
        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        className="w-full px-2 py-1 bg-dark-surface border border-dark-border rounded text-dark-text text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        rows={1}
      />
      <select
        value={formData.category_id}
        onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
        className="w-full px-2 py-1 bg-dark-surface border border-dark-border rounded text-dark-text text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <div className="flex items-center justify-end space-x-2">
        <button
          onClick={onCancel}
          className="px-2 py-1 text-dark-text-secondary hover:text-dark-text transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
        <button
          onClick={() => onSave(formData)}
          className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
        >
          <Save className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};

export default Settings;
