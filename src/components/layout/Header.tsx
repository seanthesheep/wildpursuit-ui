import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { Bell, Menu, X, Search, HelpCircle, Gift } from 'react-feather';

const Header: React.FC = () => {
  const { user } = useUser();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Determine page title based on route
  const getPageTitle = () => {
    const path = location.pathname;

    if (path === '/' || path === '/map') return 'Map';
    if (path === '/weather') return 'Weather';
    if (path === '/trail-cameras') return 'Trail Cameras';
    if (path === '/harvest-log') return 'Harvest Log';
    if (path.startsWith('/club/')) {
      // Get club name if on club page
      const clubId = path.split('/')[2];
      return 'Club';
    }
    if (path === '/profile') return 'Profile';
    if (path === '/settings') return 'Settings';

    return 'Wildpursuit';
  };

  return (
    <header className="bg-white border-b border-gray-200 py-3 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            className="md:hidden p-1 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 mr-3"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <h1 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h1>
        </div>

        <div className="flex items-center space-x-3">
          {/* <div className="hidden md:block relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-1.5 w-56 bg-gray-100 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div> */}

          <div className="relative">
            <button
              className="p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 relative"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <div className="p-3 border-b border-gray-200">
                  <h3 className="font-semibold">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <div className="p-3 border-b border-gray-100 hover:bg-gray-50">
                    <div className="flex">
                      <div className="mr-3 flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                          <HelpCircle size={16} />
                        </div>
                      </div>
                      <div>
                        <div className="text-sm">
                          <span className="font-medium">New message from John</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          "Are you planning to hunt this weekend?"
                        </p>
                        <p className="text-xs text-gray-400 mt-1">10 minutes ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 border-b border-gray-100 hover:bg-gray-50">
                    <div className="flex">
                      <div className="mr-3 flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                          <Gift size={16} />
                        </div>
                      </div>
                      <div>
                        <div className="text-sm">
                          <span className="font-medium">Welcome to Wildpursuit Pro!</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Your subscription is now active. Enjoy all premium features.
                        </p>
                        <p className="text-xs text-gray-400 mt-1">2 days ago</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-2 text-center border-t border-gray-200">
                  <button className="text-sm text-green-600 hover:text-green-700">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center">
            <div className="mr-3 hidden md:block">
              <div className="text-sm font-medium text-gray-900">{user?.name}</div>
              <div className="text-xs text-gray-500">{user?.role === 'admin' ? 'Administrator' : 'Member'}</div>
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-700">
              {user?.name?.charAt(0) || '?'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
