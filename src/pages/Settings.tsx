import React, { useState } from 'react';
import { User, Settings as SettingsIcon, Bell, Map, Shield, CreditCard, HelpCircle, LogOut } from 'react-feather';
import { useUser } from '../contexts/UserContext';

const SettingsPage: React.FC = () => {
  const { user, updateUser, updatePreferences, logout } = useUser();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <h1>settings</h1>
    </div>
  );
};

export default SettingsPage;
