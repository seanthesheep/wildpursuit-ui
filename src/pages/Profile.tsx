import React from 'react';
import { useUser } from '../contexts/UserContext';

const Profile: React.FC = () => {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Not Signed In</h2>
          <p className="text-gray-600">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-100 p-4 md:p-6 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="bg-green-700 h-32 rounded-t-lg relative">
            <div className="absolute -bottom-12 left-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-green-700 border-4 border-white">
                {user.name.charAt(0)} {/* Display the first letter of the user's name */}
              </div>
            </div>
          </div>

          <div className="pt-16 pb-6 px-6">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
