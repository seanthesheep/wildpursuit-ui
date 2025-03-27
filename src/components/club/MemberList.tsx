import React, { useState } from 'react';
import { User } from '../../contexts/UserContext';
import { Shield, Search, UserPlus, User as UserIcon, UserX, Mail, Phone } from 'react-feather';

interface MemberListProps {
  clubId: string;
  members: User[];
  admins: string[];
  isAdmin: boolean;
}

const MemberList: React.FC<MemberListProps> = ({ clubId, members, admins, isAdmin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');

  // Mock phone numbers for members
  const mockPhones: Record<string, string> = {
    'admin': '(555) 123-4567',
    'hunter1': '(555) 987-6543',
    'hunter2': '(555) 456-7890',
    'hunter3': '(555) 321-6548'
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMember = () => {
    // Mock implementation - in a real app, this would send an invitation
    if (newMemberEmail.trim()) {
      alert(`Invitation sent to ${newMemberEmail}`);
      setNewMemberEmail('');
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = (userId: string) => {
    // Mock implementation
    if (confirm('Are you sure you want to remove this member?')) {
      alert('Member removed');
    }
  };

  const handlePromoteToAdmin = (userId: string) => {
    // Mock implementation
    if (confirm('Are you sure you want to make this member an admin?')) {
      alert('Member promoted to admin');
    }
  };

  return (
    <div className="bg-white rounded-md shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Club Members</h2>

          {isAdmin && (
            <button
              className="bg-green-600 text-white px-3 py-1 rounded-md text-sm flex items-center"
              onClick={() => setIsAddingMember(!isAddingMember)}
            >
              <UserPlus size={14} className="mr-1" /> {isAddingMember ? 'Cancel' : 'Add Member'}
            </button>
          )}
        </div>

        {/* Add Member Form */}
        {isAdmin && isAddingMember && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium mb-2">Invite a New Member</h3>
            <div className="flex">
              <input
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="Enter email address"
                className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-sm"
              />
              <button
                className="bg-green-600 text-white px-3 py-2 rounded-r-md text-sm"
                onClick={handleAddMember}
              >
                Send Invitation
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              An invitation email will be sent with instructions to join the club.
            </p>
          </div>
        )}

        {/* Search */}
        {/* <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Search members by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div> */}
      </div> 

      {/* Member List */}
      <div className="divide-y divide-gray-200">
        {filteredMembers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <UserIcon size={32} className="mx-auto mb-2 opacity-50" />
            <p>No members found</p>
          </div>
        ) : (
          filteredMembers.map(member => (
            <div key={member.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-3">
                    <div className={`w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold ${admins.includes(member.id) ? 'border-2 border-green-500' : ''}`}>
                      {member.name.charAt(0)}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium">{member.name}</h3>
                      {admins.includes(member.id) && (
                        <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                          <Shield size={10} className="mr-1" /> Admin
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{member.email}</div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className="text-blue-600 p-1 rounded-full hover:bg-blue-50">
                    <Mail size={16} />
                  </button>
                  <button className="text-green-600 p-1 rounded-full hover:bg-green-50">
                    <Phone size={16} />
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mt-2 pl-12">
                <div className="text-xs text-gray-500">
                  Phone: {mockPhones[member.id] || '(Not provided)'}
                </div>
                <div className="text-xs text-gray-500">
                  Member since: {member.id === 'admin' ? 'Jan 2022' : 'Mar 2023'}
                </div>
              </div>

              {/* Admin Controls */}
              {isAdmin && member.id !== 'admin' && (
                <div className="mt-3 pl-12 flex space-x-2">
                  {!admins.includes(member.id) && (
                    <button
                      className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded flex items-center"
                      onClick={() => handlePromoteToAdmin(member.id)}
                    >
                      <Shield size={10} className="mr-1" /> Make Admin
                    </button>
                  )}
                  <button
                    className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded flex items-center"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    <UserX size={10} className="mr-1" /> Remove
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{members.length}</span> members
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">{admins.length}</span> admins
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberList;
