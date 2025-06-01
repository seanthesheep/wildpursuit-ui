import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import {
  Map,
  CloudLightning,
  Camera,
  Users,
  User,
  Menu,
  X,
} from 'react-feather';
import LogoutButton from '../LogoutButton';

const Sidebar: React.FC = () => {
  const { user, switchUser, clubs } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State to toggle sidebar

  return (
    <div className="relative">
      {!isSidebarOpen && (
        <button
          className="lg:hidden fixed top-4 left-4 z-40 bg-gray-900 text-white p-1.5 rounded-md"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu size={18} /> 
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`bg-gray-900 text-white h-full fixed lg:static z-40 transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 w-64 lg:w-64 pt-6`} 
      >
        {/* Close Button Inside Sidebar */}
        {isSidebarOpen && (
          <button
            className="lg:hidden absolute top-4 right-4 z-40 bg-gray-900 text-white p-2 rounded-md"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        )}

        <div className="p-4 flex items-center justify-center lg:justify-start">
          <span className="lg:ml-2 hidden lg:block text-lg font-bold">Wildpursuit</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          <nav className="px-2 py-4">
            <ul className="space-y-1">
              <li>
                <NavLink
                  to="/map"
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm rounded-md transition-colors ${
                      isActive
                        ? 'bg-green-700 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`
                  }
                >
                  <Map size={20} className="flex-shrink-0" />
                  <span className="lg:block ml-3">Map</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/weather"
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm rounded-md transition-colors ${
                      isActive
                        ? 'bg-green-700 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`
                  }
                >
                  <CloudLightning size={20} className="flex-shrink-0" />
                  <span className="lg:block ml-3">Weather</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/trail-cameras"
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm rounded-md transition-colors ${
                      isActive
                        ? 'bg-green-700 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`
                  }
                >
                  <Camera size={20} className="flex-shrink-0" />
                  <span className="lg:block ml-3">Trail Cameras</span>
                </NavLink>
              </li>

              {/* Club Sections */}
              {user?.clubMemberships && user.clubMemberships.length > 0 && (
                <li className="mt-6">
                  <div className="px-4 py-2">
                    <h3 className="text-xs text-gray-500 uppercase tracking-wider hidden lg:block">
                      My Clubs
                    </h3>
                    <div className="lg:hidden flex justify-center">
                      <Users size={16} className="text-gray-500" />
                    </div>
                  </div>
                  <ul className="mt-1 space-y-1">
                    {user.clubMemberships.map((clubId) => {
                      const club = clubs[clubId];
                      if (!club) return null;

                      return (
                        <li key={clubId}>
                          <NavLink
                            to={`/club/${clubId}`}
                            className={({ isActive }) =>
                              `flex items-center px-4 py-3 text-sm rounded-md transition-colors ${
                                isActive
                                  ? 'bg-green-700 text-white'
                                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
                              }`
                            }
                          >
                            <Users size={20} className="flex-shrink-0" />
                            <span className="lg:block ml-3 truncate" title={club.name}>
                              {club.name}
                            </span>
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              )}

              {/* Hunt Management Section */}
              <li className="mt-6">
                <div className="px-4 py-2">
                  <h3 className="text-xs text-gray-500 uppercase tracking-wider hidden lg:block">
                    Hunt Management
                  </h3>
                  <div className="lg:hidden flex justify-center">
                    <Users size={16} className="text-gray-500" />
                  </div>
                </div>
                <ul className="mt-1 space-y-1">
                  <li>
                    <NavLink
                      to="/hunt-club"
                      className={({ isActive }) =>
                        `flex items-center px-4 py-3 text-sm rounded-md transition-colors ${
                          isActive
                            ? 'bg-green-700 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`
                      }
                    >
                      <Users size={20} className="flex-shrink-0" />
                      <span className="lg:block ml-3">Hunt Clubs</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/hunt-outfitter"
                      className={({ isActive }) =>
                        `flex items-center px-4 py-3 text-sm rounded-md transition-colors ${
                          isActive
                            ? 'bg-green-700 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`
                      }
                    >
                      <Users size={20} className="flex-shrink-0" />
                      <span className="lg:block ml-3">Hunt Outfitters</span>
                    </NavLink>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800">
          <select
            onChange={(e) => switchUser(e.target.value)}
            value={user?.id || ''}
            className="w-full bg-gray-800 text-white border-none rounded py-1 text-sm mb-2"
          >
            <option value="admin">Admin</option>
            <option value="hunter1">Hunter 1</option>
            <option value="hunter2">Hunter 2</option>
            <option value="hunter3">Hunter 3</option>
            <option value="viewer">Viewer</option>
          </select>

          <div className="flex items-center justify-center lg:justify-start">
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex items-center py-2 px-4 rounded-md transition-colors w-full ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <User size={18} className="flex-shrink-0" />
              <span className="lg:block ml-3">Profile</span>
            </NavLink>
          </div>

          <div className="mt-6 w-full">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;