import React, { useState } from 'react';
import { useMap } from '../contexts/MapContext';
import { MapPin, Plus, Camera, Grid, List, Download, Trash, Share2, Edit } from 'react-feather';
import MapView from '../components/map/MapView';
import SpypointModal from '../components/modals/SpypointModal';
import { useUser } from '../contexts/UserContext';

interface CameraPhoto {
  id: string;
  url: string;
  date: string;
  cameraId: string;
  description?: string;
  tags: string[];
}

const mockPhotos: CameraPhoto[] = [
  {
    id: '1',
    url: 'https://www.whitetailhabitatsolutions.com/uploads/blog/_blogLargeImage/6145/Screen-Shot-2016-12-13-at-7.25.02-AM.jpg',
    date: 'Mar 15, 2025 9:45 AM',
    cameraId: '1',
    tags: ['buck', '8-point']
  },
  {
    id: '2',
    url: 'https://deerassociation.com/wp-content/uploads/2022/06/trail-camera-no-bait-lead-760x505.jpg',
    date: 'Mar 14, 2025 6:22 PM',
    cameraId: '1',
    tags: ['doe']
  },
  {
    id: '3',
    url: 'https://lakedarbonnelife.com/wp-content/uploads/2018/11/screen-shot-2018-07-13-at-11-09-56-pm.png?w=412&h=271',
    date: 'Mar 13, 2025 5:17 AM',
    cameraId: '1',
    tags: ['buck', '10-point']
  },
  {
    id: '4',
    url: 'https://files.osgnetworks.tv/14/files/2017/11/drinnon_1-.jpg',
    date: 'Mar 12, 2025 8:30 PM',
    cameraId: '1',
    tags: ['doe', 'fawn']
  },
];

const TrailCameras: React.FC = () => {
  const { markers, currentHuntArea } = useMap();
  const { user } = useUser();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedPhoto, setSelectedPhoto] = useState<CameraPhoto | null>(null);
  const [showMapView, setShowMapView] = useState(false);

  // Spypoint connection state
  const [isSpypointModalOpen, setIsSpypointModalOpen] = useState(false);
  const [spypointCredentials, setSpypointCredentials] = useState<{ username: string; password: string } | null>(null);

  // Filter to only show camera markers
  const cameraMarkers = markers.filter(marker => marker.type === 'camera');

  const openSpypointModal = () => {
    setIsSpypointModalOpen(true);
  };

  const closeSpypointModal = () => {
    setIsSpypointModalOpen(false);
  };

  const handleSpypointConnect = (username: string, password: string) => {
    if (username && password) {
      setSpypointCredentials({ username, password });
    } else {
      setSpypointCredentials(null);
    }
    closeSpypointModal();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">TRAIL CAMERAS</h1>
        <div className="flex space-x-4">
          <button
            className={`p-2 rounded-md ${view === 'grid' ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
            onClick={() => setView('grid')}
          >
            <Grid size={20} />
          </button>
          <button
            className={`p-2 rounded-md ${view === 'list' ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
            onClick={() => setView('list')}
          >
            <List size={20} />
          </button>
          <button
            className="p-2 rounded-md hover:bg-gray-800"
            onClick={() => setShowMapView(!showMapView)}
          >
            <MapPin size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Camera Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <span className="font-semibold">Your Cameras</span>
            <button className="text-green-600">
              <Plus size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {cameraMarkers.length === 0 ? (
              <div className="text-center p-4 text-gray-500">
                No cameras added yet. Add a camera to get started.
              </div>
            ) : (
              <div className="space-y-2">
                {cameraMarkers.map((camera) => (
                  <div
                    key={camera.id}
                    className="bg-orange-100 p-3 rounded-md flex items-center border-l-4 border-orange-500"
                  >
                    <div className="bg-orange-500 text-white rounded-md p-1 mr-2 flex-shrink-0">
                      <Camera size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{camera.name}</div>
                      <div className="text-xs text-gray-500">
                        {camera.notes || 'No description'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <button
              className="w-full bg-orange-500 text-white py-2 rounded-md flex items-center justify-center"
              onClick={openSpypointModal}
            >
              <Camera size={16} className="mr-2" />
              {spypointCredentials ? "Manage Spypoint" : "Connect to Spypoint"}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-gray-100 overflow-hidden">
          {showMapView ? (
            <div className="h-full">
              <MapView />
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-bold">Trail Camera Photos</h2>
                <div className="flex space-x-2">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Download size={18} />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Share2 size={18} />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Edit size={18} />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded text-red-500">
                    <Trash size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {mockPhotos.length === 0 ? (
                  <div className="text-center p-8">
                    <Camera size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700">No Trail Camera Photos</h3>
                    <p className="text-gray-500 mt-2">
                      {spypointCredentials
                        ? "Your connected cameras haven't uploaded any photos yet."
                        : "Connect your Spypoint account to view your trail camera photos."
                      }
                    </p>
                    {!spypointCredentials && (
                      <button
                        className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md"
                        onClick={openSpypointModal}
                      >
                        Connect Spypoint
                      </button>
                    )}
                  </div>
                ) : view === 'grid' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {mockPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className="bg-white rounded-md shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedPhoto(photo)}
                      >
                        <div className="h-40 overflow-hidden">
                          <img src={photo.url} alt="Trail cam" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-2">
                          <div className="text-sm font-semibold">{photo.date}</div>
                          <div className="flex flex-wrap mt-1">
                            {photo.tags.map((tag, idx) => (
                              <span key={idx} className="text-xs bg-gray-200 rounded-full px-2 py-0.5 mr-1 mb-1">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mockPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className="bg-white rounded-md shadow-sm overflow-hidden flex cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedPhoto(photo)}
                      >
                        <div className="w-24 h-24 flex-shrink-0 overflow-hidden">
                          <img src={photo.url} alt="Trail cam" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-3 flex-1">
                          <div className="font-semibold">{photo.date}</div>
                          <div className="flex flex-wrap mt-1">
                            {photo.tags.map((tag, idx) => (
                              <span key={idx} className="text-xs bg-gray-200 rounded-full px-2 py-0.5 mr-1 mb-1">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center p-3 space-x-2">
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <Download size={18} />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded text-red-500">
                            <Trash size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Photo Detail Modal */}
        {selectedPhoto && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold">{selectedPhoto.date}</h3>
                <button onClick={() => setSelectedPhoto(null)} className="text-gray-500 hover:text-gray-700">
                  &times;
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <img src={selectedPhoto.url} alt="Trail cam" className="max-w-full mx-auto max-h-[70vh]" />
              </div>
              <div className="p-4 border-t border-gray-200">
                <div className="flex flex-wrap">
                  {selectedPhoto.tags.map((tag, idx) => (
                    <span key={idx} className="text-sm bg-gray-200 rounded-full px-3 py-1 mr-2 mb-2">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex justify-end mt-4 space-x-2">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Download size={18} />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Share2 size={18} />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Edit size={18} />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded text-red-500">
                    <Trash size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Spypoint Modal */}
        <SpypointModal
          isOpen={isSpypointModalOpen}
          onClose={closeSpypointModal}
          onConnect={handleSpypointConnect}
          existingCredentials={spypointCredentials}
        />
      </div>
    </div>
  );
};

export default TrailCameras;
