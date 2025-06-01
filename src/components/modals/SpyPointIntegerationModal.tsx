
import React, { useState } from 'react';
import { X, Camera, Check } from 'react-feather';
import { useUser } from '../../contexts/UserContext';
interface SpypointModalProps {
  isOpen: boolean;
  onClose: () => void;
   onConnect?: (username: string, password: string) => void;
  existingCredentials?: { username: string; password: string } | null;
}

const SpypointIntegerationModal: React.FC<SpypointModalProps> = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const { user } = useUser();
  if (!user || !user.id) return null;
  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);


    try {
      const response = await fetch('http://localhost:5001/wildpursuit-app/us-central1/syncSpypoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, userId:user.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Sync failed');
      }

      // Log the response to the console
      console.log('Spypoint sync response:', {
        camerasCount: Array.isArray(data.cameras) ? data.cameras.length : 0,
        photosCount: data.photosCount || 0,
        data,
      });

      // Set connected state to true to show the disconnect button
      setConnected(true);
    } catch (err: any) {
      // Log the error to the console
      console.error('Spypoint sync error:', err.message);
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setUsername('');
    setPassword('');
    setConnected(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden">
        <div className="bg-orange-500 text-white p-4 flex justify-between items-center">
          <div className="flex items-center">
            <Camera size={20} className="mr-2" />
            <h2 className="text-lg font-semibold">
              {connected ? 'Manage Spypoint Connection' : 'Connect to Spypoint'}
            </h2>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {connected && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4 flex items-center">
              <Check size={18} className="text-green-500 mr-2" />
              <span>Connected to Spypoint account: <strong>{username}</strong></span>
            </div>
          )}

          <form onSubmit={handleSync}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Spypoint Username/Email
              </label>
              <input
                type="text"
                id="username"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your Spypoint username"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Spypoint Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your Spypoint password"
              />
            </div>

            <div className="flex justify-between">
              {connected ? (
                <>
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                  >
                    Disconnect
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                    disabled={loading || !username || !password}
                  >
                    {loading ? 'Updating...' : 'Update Connection'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                    disabled={loading || !username || !password}
                  >
                    {loading ? 'Syncing...' : 'Sync Spypoint'}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>

        <div className="bg-gray-50 p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Your Spypoint credentials will be securely stored. By connecting your account, you allow Wildpursuit to access and display your trail camera photos. We will never share your credentials with third parties.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpypointIntegerationModal;