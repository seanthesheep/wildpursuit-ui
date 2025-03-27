import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { ChevronDown, User, Shield, Inbox } from 'react-feather';

const UserSwitcher: React.FC = () => {
  const { user, switchUser, allUsers } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const handleSwitchUser = (userId: string) => {
    switchUser(userId as any);
    setIsOpen(false);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield size={16} className="text-red-500" />;
      case 'hunter':
        return <User size={16} className="text-green-500" />;
      default:
        return <User size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white px-3 py-2 rounded-md shadow-sm border border-gray-200"
      >
        <div className="flex items-center">
          {getRoleIcon(user?.role || '')}
          <span className="ml-2 text-sm font-medium">{user?.name}</span>
        </div>
        <ChevronDown size={16} className="text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200">
          <div className="p-2 border-b border-gray-200">
            <p className="text-xs font-medium text-gray-500">DEMO: Switch User</p>
          </div>
          <div className="py-1">
            {Object.entries(allUsers).map(([id, u]) => (
              <button
                key={id}
                onClick={() => handleSwitchUser(id)}
                className={`flex items-center w-full text-left px-3 py-2 text-sm ${
                  user?.id === u.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {getRoleIcon(u.role)}
                <div className="ml-2">
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs text-gray-500">{u.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSwitcher;
