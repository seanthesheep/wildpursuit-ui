import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Users, MessageSquare, MapPin, Calendar, Info, Settings, Shield, Lock, AlertTriangle, Check, X, Edit, Trash2, Flag, Plus } from 'react-feather';
import MessageBoard from '../components/club/MessageBoard';
import MemberList from '../components/club/MemberList';

interface ClubParams {
  id: string;
}

// Mock announcements and message board data
interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

const Club: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, clubs, allUsers } = useUser();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('message-board');
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: 'announcement1',
      title: 'Opening Day Details',
      content: 'Opening day is scheduled for October 1st. All members must check in at the main lodge by 5:00 AM.',
      createdAt: 'Mar 10, 2025',
      createdBy: 'admin'
    },
    {
      id: 'announcement2',
      title: 'Work Weekend',
      content: 'We need all hands on deck for our work weekend on April 15-16. Please bring chainsaws and UTVs if you have them.',
      createdAt: 'Mar 5, 2025',
      createdBy: 'admin'
    }
  ]);

  const club = id ? clubs[id] : null;

  // Check if user is a member of this club
  const isMember = user && club && club.memberIds.includes(user.id);

  // Check if user is an admin of this club
  const isClubAdmin = !!(user && club && club.adminIds.includes(user.id));

  // Redirect if not a member
  useEffect(() => {
    if (!isMember && club) {
      // Redirect to 'unauthorized' page or show access denied message
      // For demo purposes, we'll just show an access denied message in the component
    }
  }, [isMember, club, navigate]);

  if (!club) {
    return (
      <div className="h-full flex items-center justify-center text-center p-4">
        <div>
          <h2 className="text-xl font-bold mb-2">Club Not Found</h2>
          <p className="text-gray-600 mb-4">The club you're looking for doesn't exist or you don't have access.</p>
          <Link to="/" className="bg-green-600 text-white px-4 py-2 rounded-md">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!isMember) {
    return (
      <div className="h-full flex items-center justify-center text-center p-4">
        <div className="max-w-lg">
          <Lock size={48} className="text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Member-Only Access</h2>
          <p className="text-gray-600 mb-4">
            This content is only available to members of {club.name}. Please contact a club administrator for access.
          </p>
          <Link to="/" className="bg-green-600 text-white px-4 py-2 rounded-md">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Club Header */}
      <div className="bg-green-800 text-white p-4 md:p-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center md:items-end justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{club.name}</h1>
            <div className="flex items-center mt-1">
              <MapPin size={16} className="mr-1" />
              <span className="text-sm">{club.location}</span>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            {isClubAdmin && (
              <button className="bg-green-700 hover:bg-green-900 text-white text-sm px-3 py-1 rounded-md flex items-center">
                <Settings size={14} className="mr-1" /> Manage Club
              </button>
            )}
            <button className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded-md flex items-center">
              <Calendar size={14} className="mr-1" /> Events
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto flex overflow-x-auto">
          <button
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'message-board' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('message-board')}
          >
            <MessageSquare size={14} className="inline mr-1" /> Message Board
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'members' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('members')}
          >
            <Users size={14} className="inline mr-1" /> Members
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'about' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('about')}
          >
            <Info size={14} className="inline mr-1" /> About
          </button>
          {isClubAdmin && (
            <button
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'admin' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('admin')}
            >
              <Shield size={14} className="inline mr-1" /> Admin
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 overflow-y-auto">
        <div className="container mx-auto p-4">
          {/* Announcements */}
          {announcements.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <h2 className="flex items-center text-yellow-800 font-semibold mb-2">
                <AlertTriangle size={16} className="mr-1" /> Announcements
              </h2>
              <div className="space-y-3">
                {announcements.map(announcement => (
                  <div key={announcement.id} className="bg-white border border-yellow-100 rounded-md p-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-yellow-900">{announcement.title}</h3>
                      <div className="text-xs text-gray-500">{announcement.createdAt}</div>
                    </div>
                    <p className="text-sm mt-1 text-gray-700">{announcement.content}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      Posted by {allUsers[announcement.createdBy]?.name || 'Unknown'}
                    </div>
                    {isClubAdmin && (
                      <div className="flex justify-end space-x-2 mt-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Edit size={14} />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {isClubAdmin && (
                <button className="mt-3 text-sm text-yellow-700 hover:text-yellow-900 flex items-center">
                  <Plus size={14} className="mr-1" /> Add Announcement
                </button>
              )}
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'message-board' && (
            <MessageBoard clubId={club.id} isAdmin={isClubAdmin} currentUser={user} />
          )}

          {activeTab === 'members' && (
            <MemberList
              clubId={club.id}
              members={club.memberIds.map(id => allUsers[id])}
              admins={club.adminIds}
              isAdmin={isClubAdmin}
            />
          )}

          {activeTab === 'about' && (
            <div className="bg-white rounded-md shadow-sm p-4">
              <h2 className="text-xl font-semibold mb-4">About {club.name}</h2>
              <div className="mb-4">
                <img
                  src={club.imageUrl || 'https://via.placeholder.com/800x400?text=Club+Image'}
                  alt={club.name}
                  className="w-full h-48 md:h-64 object-cover rounded-md mb-4"
                />
              </div>
              <div className="text-gray-700 mb-4">
                <p className="mb-3">{club.description}</p>
                <p>
                  Our club was established in 2010 and consists of 1,200 acres of prime hunting land.
                  We have a diverse terrain including hardwood ridges, pine plantations, and food plots.
                  The property features 20 permanent hunting stands and 5 shooting houses overlooking food plots.
                </p>
              </div>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="font-semibold mb-2">Club Rules</h3>
                <ul className="list-disc list-inside text-gray-700 text-sm">
                  <li>All hunters must wear orange during gun season</li>
                  <li>No guests without prior approval</li>
                  <li>All deer harvests must be reported within 24 hours</li>
                  <li>No hunting within 150 yards of food plots without permission</li>
                  <li>Members are required to participate in work days</li>
                </ul>
              </div>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <p className="text-sm text-gray-700">
                  Club President: {allUsers[club.adminIds[0]]?.name || 'Admin'}<br />
                  Email: {allUsers[club.adminIds[0]]?.email || 'admin@example.com'}<br />
                  Club established: {club.dateCreated}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'admin' && isClubAdmin && (
            <div className="bg-white rounded-md shadow-sm p-4">
              <h2 className="text-xl font-semibold mb-4">Club Administration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-md p-4">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Users size={16} className="mr-1" /> Member Management
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Add, remove, or update member information and permissions.
                  </p>
                  <button className="bg-blue-600 text-white text-sm px-3 py-1 rounded-md">
                    Manage Members
                  </button>
                </div>

                <div className="border border-gray-200 rounded-md p-4">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <MessageSquare size={16} className="mr-1" /> Message Board Moderation
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Monitor and moderate club discussions and announcements.
                  </p>
                  <button className="bg-blue-600 text-white text-sm px-3 py-1 rounded-md">
                    Moderate Messages
                  </button>
                </div>

                <div className="border border-gray-200 rounded-md p-4">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Settings size={16} className="mr-1" /> Club Settings
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Update club information, rules, and membership settings.
                  </p>
                  <button className="bg-blue-600 text-white text-sm px-3 py-1 rounded-md">
                    Edit Settings
                  </button>
                </div>

                <div className="border border-gray-200 rounded-md p-4">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <AlertTriangle size={16} className="mr-1" /> Announcements
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Create and manage club-wide announcements.
                  </p>
                  <button className="bg-blue-600 text-white text-sm px-3 py-1 rounded-md">
                    Manage Announcements
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Club;
