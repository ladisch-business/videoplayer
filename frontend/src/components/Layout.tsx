import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Upload, Settings, Heart, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Upload', href: '/upload', icon: Upload },
    { name: 'Favoriten', href: '/favorites', icon: Heart },
    { name: 'Einstellungen', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-dark-bg">
      <nav className="w-64 bg-dark-surface border-r border-dark-border flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-dark-text">Videoplayer</h1>
          <p className="text-sm text-dark-text-secondary mt-1">{user.email}</p>
        </div>
        
        <div className="flex-1 px-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 mb-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-dark-text-secondary hover:bg-dark-border hover:text-dark-text'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
        
        <div className="p-4">
          <button
            onClick={onLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-dark-text-secondary hover:bg-dark-border hover:text-dark-text transition-colors rounded-md"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Abmelden
          </button>
        </div>
      </nav>
      
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
