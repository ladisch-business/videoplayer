import React from 'react';
import { Search, Filter } from 'lucide-react';

interface Tag {
  id: string;
  name: string;
  description: string;
  category_name: string;
  category_color: string;
}

interface SidebarProps {
  tags: Tag[];
  selectedTags: string[];
  onTagToggle: (tagName: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  tags,
  selectedTags,
  onTagToggle,
  searchQuery,
  onSearchChange,
}) => {
  const groupedTags = tags.reduce((acc, tag) => {
    const category = tag.category_name || 'Ohne Kategorie';
    if (!acc[category]) {
      acc[category] = {
        color: tag.category_color || '#ffffff',
        tags: []
      };
    }
    acc[category].tags.push(tag);
    return acc;
  }, {} as Record<string, { color: string; tags: Tag[] }>);

  return (
    <div className="w-80 bg-dark-surface border-r border-dark-border p-6">
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark-text-secondary" />
          <input
            type="text"
            placeholder="Videos suchen..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="mb-4 flex items-center">
        <Filter className="h-4 w-4 text-dark-text-secondary mr-2" />
        <h3 className="text-sm font-medium text-dark-text">Filter nach Tags</h3>
      </div>
      
      <div className="space-y-4">
        {Object.entries(groupedTags).map(([categoryName, { color, tags: categoryTags }]) => (
          <div key={categoryName}>
            <div className="flex items-center mb-2">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: color }}
              />
              <h4 className="text-sm font-medium text-dark-text">{categoryName}</h4>
            </div>
            
            <div className="ml-5 space-y-1">
              {categoryTags.map((tag) => (
                <label
                  key={tag.id}
                  className="flex items-center cursor-pointer hover:bg-dark-border rounded px-2 py-1 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag.name)}
                    onChange={() => onTagToggle(tag.name)}
                    className="mr-2 rounded border-dark-border bg-dark-bg text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-dark-text-secondary">
                    {tag.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {selectedTags.length > 0 && (
        <div className="mt-6 pt-4 border-t border-dark-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-dark-text">
              Aktive Filter ({selectedTags.length})
            </span>
            <button
              onClick={() => selectedTags.forEach(tag => onTagToggle(tag))}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Alle entfernen
            </button>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center bg-blue-600 text-white text-xs px-2 py-1 rounded cursor-pointer hover:bg-blue-700"
                onClick={() => onTagToggle(tag)}
              >
                {tag}
                <span className="ml-1">×</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
