import React, { useState } from 'react';
import { Search, MapPin, FileText, Calendar, Info } from 'react-feather';

type PublicLandType = 'wma' | 'national-forest' | 'state-park' | 'national-park' | 'blm';

interface PublicLand {
  id: string;
  name: string;
  type: PublicLandType;
  state: string;
  county: string;
  acres: number;
  description: string;
  huntingAllowed: boolean;
  huntingSeasons?: {
    species: string;
    startDate: string;
    endDate: string;
  }[];
  regulations?: string[];
  image: string;
}

const mockPublicLands: PublicLand[] = [
  {
    id: '1',
    name: 'Chattahoochee National Forest',
    type: 'national-forest',
    state: 'Georgia',
    county: 'Multiple',
    acres: 867000,
    description: 'The Chattahoochee National Forest covers 867,000 acres across 26 counties in north Georgia. It features diverse wildlife and plant species, with elevations ranging from 700 to 4,700 feet.',
    huntingAllowed: true,
    huntingSeasons: [
      { species: 'Deer (Archery)', startDate: 'Sep 12, 2025', endDate: 'Oct 16, 2025' },
      { species: 'Deer (Firearms)', startDate: 'Oct 17, 2025', endDate: 'Jan 8, 2026' },
      { species: 'Turkey (Spring)', startDate: 'Mar 20, 2026', endDate: 'May 15, 2026' },
    ],
    regulations: [
      'Georgia hunting license required',
      'WMA stamp required for certain areas',
      'No baiting allowed on federal land',
      'Hunter orange required during firearms season',
    ],
    image: 'https://same-assets.com/9ef3cc83-9b0b-460c-bf1f-70fa9a02db20.jpeg',
  },
  {
    id: '2',
    name: 'Oconee Wildlife Management Area',
    type: 'wma',
    state: 'Georgia',
    county: 'Greene',
    acres: 38000,
    description: 'Oconee WMA encompasses 38,000 acres of diverse terrain, including hardwood forests, pine stands, and open fields. It offers excellent opportunities for deer, turkey, and small game hunting.',
    huntingAllowed: true,
    huntingSeasons: [
      { species: 'Deer (Archery)', startDate: 'Sep 12, 2025', endDate: 'Oct 16, 2025' },
      { species: 'Deer (Firearms)', startDate: 'Oct 17, 2025', endDate: 'Jan 8, 2026' },
      { species: 'Turkey (Spring)', startDate: 'Mar 20, 2026', endDate: 'May 15, 2026' },
    ],
    regulations: [
      'Georgia hunting license required',
      'WMA stamp required',
      'Sign in at check station required',
      'Special quota hunts for certain dates',
    ],
    image: 'https://same-assets.com/b2db5d51-9f30-4c14-83ea-8a29303b7c6d.jpeg',
  },
  {
    id: '3',
    name: 'Great Smoky Mountains National Park',
    type: 'national-park',
    state: 'Tennessee/North Carolina',
    county: 'Multiple',
    acres: 522427,
    description: 'Great Smoky Mountains National Park is an iconic wilderness area spanning Tennessee and North Carolina. While hunting is not permitted, it offers tremendous wildlife viewing opportunities.',
    huntingAllowed: false,
    regulations: [
      'No hunting allowed within park boundaries',
      'Firearms may be transported through the park if properly stored',
    ],
    image: 'https://same-assets.com/69dffadf-8325-4c54-b7e2-16dc8246bf84.jpeg',
  },
];

const typeLabels: Record<PublicLandType, string> = {
  'wma': 'Wildlife Management Area',
  'national-forest': 'National Forest',
  'state-park': 'State Park',
  'national-park': 'National Park',
  'blm': 'Bureau of Land Management',
};

const typeColors: Record<PublicLandType, string> = {
  'wma': 'bg-green-100 text-green-800',
  'national-forest': 'bg-emerald-100 text-emerald-800',
  'state-park': 'bg-blue-100 text-blue-800',
  'national-park': 'bg-amber-100 text-amber-800',
  'blm': 'bg-orange-100 text-orange-800',
};

const PublicLandsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLand, setSelectedLand] = useState<PublicLand | null>(null);

  const filteredLands = mockPublicLands.filter((land) => {
    const matchesSearch = searchTerm === '' ||
      land.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      land.county.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesState = selectedState === 'all' || land.state.includes(selectedState);
    const matchesType = selectedType === 'all' || land.type === selectedType;

    return matchesSearch && matchesState && matchesType;
  });

  const states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia'];

  return (
    <div className="h-full flex flex-col">
      <div className="bg-green-600 p-4 text-white">
        <h1 className="text-xl font-bold">PUBLIC LANDS</h1>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search public lands..."
                className="w-full p-2 pl-10 border border-gray-300 rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          <div className="p-4 border-b border-gray-200 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
              >
                <option value="all">All States</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Land Type</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">All Types</option>
                {Object.entries(typeLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredLands.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No public lands match your search criteria.
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredLands.map((land) => (
                  <div
                    key={land.id}
                    className={`p-3 rounded-md cursor-pointer flex items-center ${
                      selectedLand?.id === land.id
                        ? 'bg-green-50 border border-green-300'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedLand(land)}
                  >
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-12 h-12 rounded overflow-hidden bg-gray-200">
                        <img
                          src={land.image}
                          alt={land.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {land.name}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        {land.county}, {land.state}
                      </p>
                      <div className="mt-1">
                        <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${typeColors[land.type]}`}>
                          {typeLabels[land.type]}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-gray-50 overflow-y-auto">
          {selectedLand ? (
            <div className="p-6">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 relative">
                  <img
                    src={selectedLand.image}
                    alt={selectedLand.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <h1 className="text-xl font-bold text-white">{selectedLand.name}</h1>
                    <div className="flex items-center text-white">
                      <MapPin size={14} className="mr-1" />
                      <span className="text-sm">{selectedLand.county}, {selectedLand.state}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${typeColors[selectedLand.type]}`}>
                      {typeLabels[selectedLand.type]}
                    </span>
                    <span className="inline-block px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded-full">
                      {selectedLand.acres.toLocaleString()} acres
                    </span>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      selectedLand.huntingAllowed
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedLand.huntingAllowed ? 'Hunting Allowed' : 'No Hunting'}
                    </span>
                  </div>

                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                      <Info size={16} className="mr-2 text-gray-500" /> About
                    </h2>
                    <p className="text-gray-600">
                      {selectedLand.description}
                    </p>
                  </div>

                  {selectedLand.huntingAllowed && selectedLand.huntingSeasons && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                        <Calendar size={16} className="mr-2 text-gray-500" /> Hunting Seasons
                      </h2>
                      <div className="bg-gray-50 rounded-md overflow-hidden">
                        <table className="min-w-full">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Species
                              </th>
                              <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Start Date
                              </th>
                              <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                End Date
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {selectedLand.huntingSeasons.map((season, idx) => (
                              <tr key={idx}>
                                <td className="px-4 py-2 text-sm text-gray-800">
                                  {season.species}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-600">
                                  {season.startDate}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-600">
                                  {season.endDate}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {selectedLand.regulations && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                        <FileText size={16} className="mr-2 text-gray-500" /> Regulations
                      </h2>
                      <ul className="list-disc pl-6 space-y-1">
                        {selectedLand.regulations.map((reg, idx) => (
                          <li key={idx} className="text-gray-600">
                            {reg}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-6 flex justify-between">
                    <button className="bg-green-600 text-white px-4 py-2 rounded-md">
                      Add to Hunt Areas
                    </button>
                    <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md">
                      Get Directions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin size={32} className="text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  Select a Public Land
                </h2>
                <p className="text-gray-500 max-w-md">
                  Choose a public land area from the list to view detailed information, including
                  hunting regulations, seasons, and access points.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicLandsPage;
