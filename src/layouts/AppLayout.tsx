import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Map, Droplet, Sun, Camera, BarChart2, Bookmark, Settings, Award } from 'react-feather';
import UserSwitcher from '../components/UserSwitcher';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const iconSize = 24;

  return (
    <div className="h-full w-16 bg-gray-900 text-white flex flex-col items-center">
      <div className="py-3">
        <Link to="/">
          <img
            src="https://same-assets.com/4c39e942-a5b8-44bc-b7f1-f2aca1f48cb2.png"
            alt="Wildpursuit Logo"
            className="w-10 h-10"
          />
        </Link>
      </div>

      <div className="flex flex-col items-center space-y-6 mt-6">
        <Link
          to="/map"
          className={`p-2 rounded-md ${isActive('/map') || isActive('/') ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
        >
          <Map size={iconSize} />
        </Link>

        <Link
          to="/weather"
          className={`p-2 rounded-md ${isActive('/weather') ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
        >
          <Sun size={iconSize} />
        </Link>

        <Link
          to="/trail-cameras"
          className={`p-2 rounded-md ${isActive('/trail-cameras') ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
        >
          <Camera size={iconSize} />
        </Link>

        <Link
          to="/scoring"
          className={`p-2 rounded-md ${isActive('/scoring') ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
        >
          <BarChart2 size={iconSize} />
        </Link>

        <Link
          to="/public-lands"
          className={`p-2 rounded-md ${isActive('/public-lands') ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
        >
          <Bookmark size={iconSize} />
        </Link>
      </div>

      <div className="mt-auto mb-6 flex flex-col items-center space-y-6">
        <Link
          to="/settings"
          className={`p-2 rounded-md ${isActive('/settings') ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
        >
          <Settings size={iconSize} />
        </Link>

        <Link
          to="/subscription"
          className={`p-2 rounded-md ${isActive('/subscription') ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
        >
          <Award size={iconSize} />
        </Link>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden relative">
        <div className="absolute top-4 right-4 z-50">
          <UserSwitcher />
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
