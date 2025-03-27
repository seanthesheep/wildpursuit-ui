import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const handleSkip = () => {
    navigate('/map');
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="max-w-lg w-full px-6 py-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome to Wildpursuit</h1>

        <p className="text-gray-600 mb-6 text-center">
          Welcome, {user?.name || 'Hunter'}! Let's set up your account to get the most out of Wildpursuit.
        </p>

        <div className="space-y-6">
          <button
            onClick={handleSkip}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Skip and go to Map
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
