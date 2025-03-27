import React from 'react';
import { useUser } from '../contexts/UserContext';
import { Mail, MapPin, Phone, Award, Calendar, Shield } from 'react-feather';

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
                {user.name.charAt(0)}
              </div>
            </div>
          </div>

          <div className="pt-16 pb-6 px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-gray-600">{user.role === 'admin' ? 'Administrator' : 'Member'}</p>
              </div>

              <div className="mt-4 md:mt-0">
                <button className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
                  Edit Profile
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold mb-3">Contact Information</h2>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Mail size={18} className="mr-3 text-gray-400" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone size={18} className="mr-3 text-gray-400" />
                    <span>(555) 123-4567</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin size={18} className="mr-3 text-gray-400" />
                    <span>Springfield, MO</span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-3">Account Information</h2>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Calendar size={18} className="mr-3 text-gray-400" />
                    <span>Member since January 2023</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Award size={18} className="mr-3 text-gray-400" />
                    <span>Subscription: Pro</span>
                  </div>
                  {user.clubMemberships && user.clubMemberships.length > 0 && (
                    <div className="flex items-center text-gray-600">
                      <Shield size={18} className="mr-3 text-gray-400" />
                      <span>{user.clubMemberships.length} Club Membership{user.clubMemberships.length > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="border-l-2 border-gray-200 pl-4 ml-2 space-y-6">
            <div className="relative">
              <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-green-500"></div>
              <div className="text-sm">
                <div className="font-medium">Map updated</div>
                <p className="text-gray-600 mt-1">You added 3 new markers to your map.</p>
                <p className="text-gray-400 text-xs mt-1">2 days ago</p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-blue-500"></div>
              <div className="text-sm">
                <div className="font-medium">Joined Big Deer Hunting Club</div>
                <p className="text-gray-600 mt-1">You were added as a member to the club.</p>
                <p className="text-gray-400 text-xs mt-1">1 week ago</p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-purple-500"></div>
              <div className="text-sm">
                <div className="font-medium">Subscription upgraded</div>
                <p className="text-gray-600 mt-1">Your account was upgraded to Wildpursuit Pro.</p>
                <p className="text-gray-400 text-xs mt-1">1 month ago</p>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button className="text-green-600 text-sm hover:underline">View all activity</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
