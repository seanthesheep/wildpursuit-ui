import React, { useState, useEffect } from 'react';
import { X, Camera, Check } from 'react-feather';

interface SpypointModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (username: string, password: string) => void;
  existingCredentials?: { username: string; password: string } | null;
}

const SpypointModal: React.FC<SpypointModalProps> = ({
  isOpen,
  onClose,
  onConnect,
  existingCredentials = null,
}) => {
  const [username, setUsername] = useState(existingCredentials?.username || '');
  const [password, setPassword] = useState(existingCredentials?.password || '');
  const [saveCredentials, setSaveCredentials] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(!!existingCredentials);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when closed
      setError(null);
      setIsConnecting(false);
    } else {
      // Set form values when opened
      setUsername(existingCredentials?.username || '');
      setPassword(existingCredentials?.password || '');
      setConnected(!!existingCredentials);
    }
  }, [isOpen, existingCredentials]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setIsConnecting(true);
    setError(null);

    // Simulate API call
    setTimeout(() => {
      setIsConnecting(false);
      setConnected(true);
      onConnect(username, password);
    }, 1500);
  };

  const handleDisconnect = () => {
    setUsername('');
    setPassword('');
    setConnected(false);
    onConnect('', '');
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

          <form onSubmit={handleSubmit}>
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

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={saveCredentials}
                  onChange={(e) => setSaveCredentials(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Save credentials for future use</span>
              </label>
            </div>

            {error && (
              <div className="mb-4 text-red-500 text-sm">
                {error}
              </div>
            )}

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
                    disabled={isConnecting}
                  >
                    {isConnecting ? 'Updating...' : 'Update Connection'}
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
                    disabled={isConnecting}
                  >
                    {isConnecting ? 'Connecting...' : 'Connect'}
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

export default SpypointModal;
