import React, { useState } from 'react';
import { User, Settings as SettingsIcon, Bell, Map, Shield, CreditCard, HelpCircle, LogOut } from 'react-feather';
import { useUser } from '../contexts/UserContext';

const SettingsPage: React.FC = () => {
  const { user, updateUser, updatePreferences, logout } = useUser();
  const [activeTab, setActiveTab] = useState('profile');

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Please log in to access settings</h1>
          <p className="text-gray-600">You need to be logged in to view and update your settings.</p>
        </div>
      </div>
    );
  }

  const handleUpdateUser = (field: string, value: any) => {
    updateUser({
      ...user,
      [field]: value,
    });
  };

  const handleUpdatePreferences = (field: string, value: any) => {
    updatePreferences({
      ...user.preferences,
      [field]: value,
    });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-green-600 p-4 text-white">
        <h1 className="text-xl font-bold">SETTINGS</h1>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                {user.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full rounded-full" />
                ) : (
                  <User size={20} className="text-gray-500" />
                )}
              </div>
              <div className="ml-3">
                <h2 className="font-semibold text-gray-800">{user.name}</h2>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="py-2">
            <button
              className={`w-full text-left px-4 py-2 flex items-center ${
                activeTab === 'profile' ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={18} className="mr-3" />
              Profile
            </button>
            <button
              className={`w-full text-left px-4 py-2 flex items-center ${
                activeTab === 'preferences' ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('preferences')}
            >
              <SettingsIcon size={18} className="mr-3" />
              Preferences
            </button>
            <button
              className={`w-full text-left px-4 py-2 flex items-center ${
                activeTab === 'notifications' ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('notifications')}
            >
              <Bell size={18} className="mr-3" />
              Notifications
            </button>
            <button
              className={`w-full text-left px-4 py-2 flex items-center ${
                activeTab === 'maps' ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('maps')}
            >
              <Map size={18} className="mr-3" />
              Map Settings
            </button>
            <button
              className={`w-full text-left px-4 py-2 flex items-center ${
                activeTab === 'privacy' ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('privacy')}
            >
              <Shield size={18} className="mr-3" />
              Privacy
            </button>
            <button
              className={`w-full text-left px-4 py-2 flex items-center ${
                activeTab === 'billing' ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('billing')}
            >
              <CreditCard size={18} className="mr-3" />
              Billing
            </button>
            <button
              className={`w-full text-left px-4 py-2 flex items-center ${
                activeTab === 'help' ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('help')}
            >
              <HelpCircle size={18} className="mr-3" />
              Help & Support
            </button>
          </div>

          <div className="mt-auto p-4 border-t border-gray-200">
            <button
              className="w-full text-left px-4 py-2 flex items-center text-red-600 hover:bg-red-50"
              onClick={logout}
            >
              <LogOut size={18} className="mr-3" />
              Log Out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Profile Settings</h2>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={user.name}
                        onChange={(e) => handleUpdateUser('name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={user.email}
                        onChange={(e) => handleUpdateUser('email', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Subscription</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700">Current Plan: {user.subscription.charAt(0).toUpperCase() + user.subscription.slice(1)}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {user.subscription === 'free'
                            ? 'Basic features for casual hunters'
                            : user.subscription === 'pro'
                            ? 'Advanced features for serious hunters'
                            : 'Premium features for outfitters and professionals'}
                        </p>
                      </div>
                      <a href="/subscription" className="text-green-600 font-medium">
                        {user.subscription === 'free' ? 'Upgrade' : 'Manage'}
                      </a>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Profile Picture</h3>
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt={user.name} className="w-full h-full rounded-full" />
                      ) : (
                        <User size={24} className="text-gray-500" />
                      )}
                    </div>
                    <div className="ml-4">
                      <button className="bg-gray-200 text-gray-800 px-3 py-1 rounded-md text-sm mr-2">
                        Change Photo
                      </button>
                      <button className="text-red-600 text-sm">Remove</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Preferences</h2>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Display Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700">Dark Mode</p>
                        <p className="text-sm text-gray-500">Use dark theme across the application</p>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          id="toggle-dark-mode"
                          className="sr-only"
                          checked={user.preferences.darkMode}
                          onChange={(e) => handleUpdatePreferences('darkMode', e.target.checked)}
                        />
                        <label
                          htmlFor="toggle-dark-mode"
                          className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                            user.preferences.darkMode ? 'bg-green-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`block h-6 w-6 rounded-full bg-white transform transition-transform ${
                              user.preferences.darkMode ? 'translate-x-full' : 'translate-x-0'
                            }`}
                          ></span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Units</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Measurement Units</label>
                      <div className="flex space-x-4">
                        <button
                          className={`px-4 py-2 rounded-md ${
                            user.preferences.units === 'imperial'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-800'
                          }`}
                          onClick={() => handleUpdatePreferences('units', 'imperial')}
                        >
                          Imperial (mi, ft)
                        </button>
                        <button
                          className={`px-4 py-2 rounded-md ${
                            user.preferences.units === 'metric'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-800'
                          }`}
                          onClick={() => handleUpdatePreferences('units', 'metric')}
                        >
                          Metric (km, m)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Hunt Area Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Default Map Style</label>
                      <select className="w-full p-2 border border-gray-300 rounded-md">
                        <option>Satellite</option>
                        <option>Topographic</option>
                        <option>Hybrid</option>
                        <option>Street</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Notification Settings</h2>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-700">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive emails about important updates and alerts</p>
                    </div>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input
                        type="checkbox"
                        id="toggle-email"
                        className="sr-only"
                        checked={user.preferences.notifications}
                        onChange={(e) => handleUpdatePreferences('notifications', e.target.checked)}
                      />
                      <label
                        htmlFor="toggle-email"
                        className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                          user.preferences.notifications ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`block h-6 w-6 rounded-full bg-white transform transition-transform ${
                            user.preferences.notifications ? 'translate-x-full' : 'translate-x-0'
                          }`}
                        ></span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-700">Push Notifications</p>
                      <p className="text-sm text-gray-500">Receive push notifications on mobile devices</p>
                    </div>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input
                        type="checkbox"
                        id="toggle-push"
                        className="sr-only"
                        checked={true}
                      />
                      <label
                        htmlFor="toggle-push"
                        className="block overflow-hidden h-6 rounded-full bg-green-600 cursor-pointer"
                      >
                        <span
                          className="block h-6 w-6 rounded-full bg-white transform translate-x-full"
                        ></span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-700">Weather Alerts</p>
                      <p className="text-sm text-gray-500">Receive alerts about weather conditions in your hunt areas</p>
                    </div>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input
                        type="checkbox"
                        id="toggle-weather"
                        className="sr-only"
                        checked={true}
                      />
                      <label
                        htmlFor="toggle-weather"
                        className="block overflow-hidden h-6 rounded-full bg-green-600 cursor-pointer"
                      >
                        <span
                          className="block h-6 w-6 rounded-full bg-white transform translate-x-full"
                        ></span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-700">Trail Camera Alerts</p>
                      <p className="text-sm text-gray-500">Receive notifications when new photos are uploaded</p>
                    </div>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input
                        type="checkbox"
                        id="toggle-camera"
                        className="sr-only"
                        checked={true}
                      />
                      <label
                        htmlFor="toggle-camera"
                        className="block overflow-hidden h-6 rounded-full bg-green-600 cursor-pointer"
                      >
                        <span
                          className="block h-6 w-6 rounded-full bg-white transform translate-x-full"
                        ></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'maps' || activeTab === 'privacy' || activeTab === 'billing' || activeTab === 'help') && (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                {activeTab === 'maps' && <Map size={24} className="text-gray-500" />}
                {activeTab === 'privacy' && <Shield size={24} className="text-gray-500" />}
                {activeTab === 'billing' && <CreditCard size={24} className="text-gray-500" />}
                {activeTab === 'help' && <HelpCircle size={24} className="text-gray-500" />}
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {activeTab === 'maps' && 'Map Settings'}
                {activeTab === 'privacy' && 'Privacy Settings'}
                {activeTab === 'billing' && 'Billing Information'}
                {activeTab === 'help' && 'Help & Support'}
              </h2>
              <p className="text-gray-500 max-w-md">
                This feature is coming soon! Check back later for updates.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
