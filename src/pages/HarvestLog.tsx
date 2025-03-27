import React from 'react';

const HarvestLog: React.FC = () => {
  return (
    <div className="h-full flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Harvest Log</h1>
        <p className="text-gray-600 mb-6">
          This feature is coming soon! You'll be able to track and manage all your harvests.
        </p>
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-sm text-gray-500">
          <p>The Harvest Log will include:</p>
          <ul className="mt-2 list-disc list-inside text-left">
            <li>Track deer, turkey, and other game harvests</li>
            <li>Record harvest details, photos, and measurements</li>
            <li>View harvest statistics and trends</li>
            <li>Share your success with your hunting club</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HarvestLog;
