// import React, { useState, useEffect, useCallback } from 'react';
// import { useMap } from '../contexts/MapContext';
// import { useUser } from '../contexts/UserContext';
// import { Plus, ChevronRight, Menu, X } from 'react-feather';
// import debounce from 'lodash/debounce';
// import MapView from '../components/map/MapView';
// import { addHuntClubToFirestore, getHuntClubsFromFirestore, addHuntOutfitterToFirestore, getHuntOutfittersFromFirestore } from '../firebase';
// import { useLocation, useNavigate } from 'react-router-dom'; // Updated to include useNavigate

// // Mapbox Geocoding API endpoint
// const GEOCODING_API = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

// interface Club {
//   id: string;
//   name: string;
//   location?: string;
//   coordinates?: [number, number];
//   notes?: string;
//   createdBy: string;
//   clubId: string;
// }

// interface Outfitter {
//   id: string;
//   name: string;
//   location?: string;
//   coordinates?: [number, number];
//   notes?: string;
//   createdBy: string;
//   outfitterId: string;
// }

// const Map: React.FC = () => {
//   const { user, isAdmin } = useUser();
//   const {
//     currentHuntArea,
//     huntAreas,
//     huntClubs,
//     huntOutfitters,
//     setCurrentHuntArea,
//     setHuntClubs,
//     setHuntOutfitters,
//     addHuntArea,
//     setMapLocation,
//   } = useMap();
//   const [showSidebar, setShowSidebar] = useState(false);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [newHuntAreaName, setNewHuntAreaName] = useState('');
//   const [newHuntAreaBounds, setNewHuntAreaBounds] = useState<[number, number, number, number]>([0, 0, 0, 0]);
//   const [newHuntAreaNotes, setNewHuntAreaNotes] = useState('');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [placeSuggestions, setPlaceSuggestions] = useState<any[]>([]);
//   const [isSearching, setIsSearching] = useState(false);
//   const [searchError, setSearchError] = useState<string | null>(null);
//   const [clubSearchQuery, setClubSearchQuery] = useState('');
//   const [clubSuggestions, setClubSuggestions] = useState<any[]>([]);
//   const [clubSearchError, setClubSearchError] = useState<string | null>(null);
//   const [isClubSearching, setIsClubSearching] = useState(false);
//   const [selectedClub, setSelectedClub] = useState<any>(null);
//   const [newClubCoordinates, setNewClubCoordinates] = useState<[number, number] | null>(null);
//   const [outfitterSearchQuery, setOutfitterSearchQuery] = useState('');
//   const [outfitterSuggestions, setOutfitterSuggestions] = useState<any[]>([]);
//   const [outfitterSearchError, setOutfitterSearchError] = useState<string | null>(null);
//   const [isOutfitterSearching, setIsOutfitterSearching] = useState(false);
//   const [selectedOutfitter, setSelectedOutfitter] = useState<any>(null);
//   const [newOutfitterCoordinates, setNewOutfitterCoordinates] = useState<[number, number] | null>(null);

//   // Derive activeTab from the current route
//   const location = useLocation();
//   const navigate = useNavigate(); // Add navigate for proper navigation
//   const activeTab = location.pathname === '/hunt-club' ? 'hunt-clubs' :
//                     location.pathname === '/hunt-outfitter' ? 'hunt-outfitters' :
//                     'hunt-areas';

//   // Debounced search function for place suggestions (Hunt Areas)
//   const fetchPlaceSuggestions = useCallback(
//     debounce(async (query: string) => {
//       if (!query) {
//         setPlaceSuggestions([]);
//         setSearchError(null);
//         return;
//       }
//       setIsSearching(true);
//       setSearchError(null);
//       try {
//         const response = await fetch(
//           `${GEOCODING_API}/${encodeURIComponent(query)}.json?access_token=${
//             import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
//           }&types=place,locality,region,country&limit=5`
//         );
//         if (!response.ok) throw new Error('Failed to fetch place suggestions');
//         const data = await response.json();
//         setPlaceSuggestions(data.features || []);
//         if (!data.features.length) setSearchError('No places found for your query.');
//       } catch (error) {
//         console.error('Error fetching place suggestions:', error);
//         setSearchError('Error fetching places. Please try again.');
//         setPlaceSuggestions([]);
//       } finally {
//         setIsSearching(false);
//       }
//     }, 300),
//     []
//   );

//   // Debounced search function for club suggestions
//   const fetchClubSuggestions = useCallback(
//     debounce(async (query: string) => {
//       if (!query) {
//         setClubSuggestions([]);
//         setClubSearchError(null);
//         return;
//       }
//       setIsClubSearching(true);
//       setClubSearchError(null);
//       try {
//         const response = await fetch(
//           `${GEOCODING_API}/${encodeURIComponent(query)}.json?access_token=${
//             import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
//           }&types=poi,place&limit=5`
//         );
//         if (!response.ok) throw new Error('Failed to fetch club suggestions');
//         const data = await response.json();
//         const suggestions = data.features.map((feature: any) => ({
//           id: feature.id,
//           name: feature.place_name,
//           location: feature.place_name.split(', ').slice(1).join(', '),
//           coordinates: feature.center,
//         }));
//         setClubSuggestions(suggestions);
//         if (!suggestions.length) setClubSearchError('No clubs found for your query.');
//       } catch (error) {
//         console.error('Error fetching club suggestions:', error);
//         setClubSearchError('Error fetching clubs. Please try again.');
//         setClubSuggestions([]);
//       } finally {
//         setIsClubSearching(false);
//       }
//     }, 300),
//     []
//   );

//   // Debounced search function for outfitter suggestions
//   const fetchOutfitterSuggestions = useCallback(
//     debounce(async (query: string) => {
//       if (!query) {
//         setOutfitterSuggestions([]);
//         setOutfitterSearchError(null);
//         return;
//       }
//       setIsOutfitterSearching(true);
//       setOutfitterSearchError(null);
//       try {
//         const response = await fetch(
//           `${GEOCODING_API}/${encodeURIComponent(query)}.json?access_token=${
//             import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
//           }&types=poi,place&limit=5`
//         );
//         if (!response.ok) throw new Error('Failed to fetch outfitter suggestions');
//         const data = await response.json();
//         const suggestions = data.features.map((feature: any) => ({
//           id: feature.id,
//           name: feature.place_name,
//           location: feature.place_name.split(', ').slice(1).join(', '),
//           coordinates: feature.center,
//         }));
//         setOutfitterSuggestions(suggestions);
//         if (!suggestions.length) setOutfitterSearchError('No outfitters found for your query.');
//       } catch (error) {
//         console.error('Error fetching outfitter suggestions:', error);
//         setOutfitterSearchError('Error fetching outfitters. Please try again.');
//         setOutfitterSuggestions([]);
//       } finally {
//         setIsOutfitterSearching(false);
//       }
//     }, 300),
//     []
//   );

//   // Fetch hunt clubs and outfitters from Firestore on mount
//   useEffect(() => {
//     const fetchHuntClubs = async () => {
//       try {
//         const clubs = await getHuntClubsFromFirestore();
//         setHuntClubs(clubs);
//       } catch (error) {
//         console.error('Error fetching hunt clubs:', error);
//       }
//     };
//     const fetchHuntOutfitters = async () => {
//       try {
//         const outfitters = await getHuntOutfittersFromFirestore();
//         setHuntOutfitters(outfitters);
//       } catch (error) {
//         console.error('Error fetching hunt outfitters:', error);
//       }
//     };
//     fetchHuntClubs();
//     fetchHuntOutfitters();
//   }, [setHuntClubs, setHuntOutfitters]);

//   // Handle search input change for Hunt Areas
//   useEffect(() => {
//     fetchPlaceSuggestions(searchQuery);
//   }, [searchQuery, fetchPlaceSuggestions]);

//   // Handle search input change for Clubs
//   useEffect(() => {
//     fetchClubSuggestions(clubSearchQuery);
//   }, [clubSearchQuery, fetchClubSuggestions]);

//   // Handle search input change for Outfitters
//   useEffect(() => {
//     fetchOutfitterSuggestions(outfitterSearchQuery);
//   }, [outfitterSearchQuery, fetchOutfitterSuggestions]);

//   // Handle place selection for Hunt Areas
//   const handlePlaceSelect = (place: any) => {
//     const [lng, lat] = place.center;
//     const bounds: [number, number, number, number] = [lng - 0.01, lat - 0.01, lng + 0.01, lat + 0.01];
//     setNewHuntAreaBounds(bounds);
//     setMapLocation({ latitude: lat, longitude: lng, zoom: 12 });
//     setSearchQuery(place.place_name);
//     setPlaceSuggestions([]);
//     setSearchError(null);
//   };

//   // Clear search input for Hunt Areas
//   const handleClearSearch = () => {
//     setSearchQuery('');
//     setPlaceSuggestions([]);
//     setSearchError(null);
//     setNewHuntAreaBounds([0, 0, 0, 0]);
//   };

//   // Handle club selection
//   const handleClubSelect = (club: any) => {
//     setSelectedClub(club);
//     setClubSearchQuery(club.name);
//     setClubSuggestions([]);
//     setClubSearchError(null);
//     setNewClubCoordinates(club.coordinates);
//     setMapLocation({
//       latitude: club.coordinates[1],
//       longitude: club.coordinates[0],
//       zoom: 12,
//     });
//   };

//   // Handle outfitter selection
//   const handleOutfitterSelect = (outfitter: any) => {
//     setSelectedOutfitter(outfitter);
//     setOutfitterSearchQuery(outfitter.name);
//     setOutfitterSuggestions([]);
//     setOutfitterSearchError(null);
//     setNewOutfitterCoordinates(outfitter.coordinates);
//     setMapLocation({
//       latitude: outfitter.coordinates[1],
//       longitude: outfitter.coordinates[0],
//       zoom: 12,
//     });
//   };

//   // Handle club click from sidebar
//   const handleClubClick = async (club: Club) => {
//     if (club.coordinates) {
//       setMapLocation({
//         latitude: club.coordinates[1],
//         longitude: club.coordinates[0],
//         zoom: 12,
//       });
//     } else if (club.location) {
//       try {
//         const response = await fetch(
//           `${GEOCODING_API}/${encodeURIComponent(club.location)}.json?access_token=${
//             import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
//           }&limit=1`
//         );
//         if (!response.ok) throw new Error('Failed to fetch location coordinates');
//         const data = await response.json();
//         if (data.features && data.features.length > 0) {
//           const [lng, lat] = data.features[0].center;
//           setMapLocation({ latitude: lat, longitude: lng, zoom: 12 });
//         } else {
//           console.warn(`No coordinates found for location: ${club.location}`);
//         }
//       } catch (error) {
//         console.error('Error fetching club location coordinates:', error);
//       }
//     }
//   };

//   // Handle outfitter click from sidebar
//   const handleOutfitterClick = async (outfitter: Outfitter) => {
//     if (outfitter.coordinates) {
//       setMapLocation({
//         latitude: outfitter.coordinates[1],
//         longitude: outfitter.coordinates[0],
//         zoom: 12,
//       });
//     } else if (outfitter.location) {
//       try {
//         const response = await fetch(
//           `${GEOCODING_API}/${encodeURIComponent(outfitter.location)}.json?access_token=${
//             import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
//           }&limit=1`
//         );
//         if (!response.ok) throw new Error('Failed to fetch location coordinates');
//         const data = await response.json();
//         if (data.features && data.features.length > 0) {
//           const [lng, lat] = data.features[0].center;
//           setMapLocation({ latitude: lat, longitude: lng, zoom: 12 });
//         } else {
//           console.warn(`No coordinates found for location: ${outfitter.location}`);
//         }
//       } catch (error) {
//         console.error('Error fetching outfitter location coordinates:', error);
//       }
//     }
//   };

//   // Clear club search input
//   const handleClearClubSearch = () => {
//     setClubSearchQuery('');
//     setClubSuggestions([]);
//     setClubSearchError(null);
//     setSelectedClub(null);
//     setNewClubCoordinates(null);
//   };

//   // Clear outfitter search input
//   const handleClearOutfitterSearch = () => {
//     setOutfitterSearchQuery('');
//     setOutfitterSuggestions([]);
//     setOutfitterSearchError(null);
//     setSelectedOutfitter(null);
//     setNewOutfitterCoordinates(null);
//   };

//   // Implementation of uuidv4
//   function uuidv4(): string {
//     return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
//       const r = (Math.random() * 16) | 0;
//       const v = c === 'x' ? r : (r & 0x3) | 0x8;
//       return v.toString(16);
//     });
//   }

//   // Handle adding a new hunt area
//   const handleAddHuntArea = async () => {
//     if (!newHuntAreaName) {
//       alert('Please enter a hunt area name.');
//       return;
//     }
//     if (newHuntAreaBounds.some((coord) => coord === 0)) {
//       alert('Please select a valid location for the hunt area.');
//       return;
//     }

//     const newHuntArea = {
//       id: uuidv4(),
//       name: newHuntAreaName,
//       notes: newHuntAreaNotes,
//       markers: [],
//       bounds: newHuntAreaBounds,
//       lastUpdated: new Date().toISOString(),
//       shared: false,
//       sharedWith: [],
//       createdBy: user?.id || '',
//       clubId: 'default-club',
//     };
//     try {
//       await addHuntArea(newHuntArea);
//       setShowAddModal(false);
//       setNewHuntAreaName('');
//       setNewHuntAreaBounds([0, 0, 0, 0]);
//       setNewHuntAreaNotes('');
//       setSearchQuery('');
//       setPlaceSuggestions([]);
//       setSearchError(null);
//     } catch (error) {
//       console.error('Error adding hunt area:', error);
//       alert('Failed to add hunt area. Please try again.');
//     }
//   };

//   // Handle adding a new hunt club
//   const handleAddHuntClub = async () => {
//     if (!selectedClub || !newClubCoordinates) {
//       alert('Please select a club.');
//       return;
//     }

//     const newClub: Club = {
//       id: uuidv4(),
//       name: selectedClub.name,
//       location: selectedClub.location || '',
//       coordinates: newClubCoordinates,
//       notes: newHuntAreaNotes,
//       createdBy: user?.id || '',
//       clubId: 'default-club',
//     };

//     try {
//       const id = await addHuntClubToFirestore(newClub);
//       setHuntClubs([...huntClubs, { ...newClub, id }]);
//       alert('Club added successfully!');
//       setShowAddModal(false);
//       setClubSearchQuery('');
//       setClubSuggestions([]);
//       setClubSearchError(null);
//       setSelectedClub(null);
//       setNewClubCoordinates(null);
//       setNewHuntAreaNotes('');
//     } catch (error) {
//       console.error('Error adding hunt club:', error);
//       alert('Failed to add club. Please try again.');
//     }
//   };

//   // Handle adding a new hunt outfitter
//   const handleAddHuntOutfitter = async () => {
//     if (!selectedOutfitter || !newOutfitterCoordinates) {
//       alert('Please select an outfitter.');
//       return;
//     }

//     const newOutfitter: Outfitter = {
//       id: uuidv4(),
//       name: selectedOutfitter.name,
//       location: selectedOutfitter.location || '',
//       coordinates: newOutfitterCoordinates,
//       notes: newHuntAreaNotes,
//       createdBy: user?.id || '',
//       outfitterId: 'default-outfitter',
//     };

//     try {
//       const id = await addHuntOutfitterToFirestore(newOutfitter);
//       setHuntOutfitters([...huntOutfitters, { ...newOutfitter, id }]);
//       alert('Outfitter added successfully!');
//       setShowAddModal(false);
//       setOutfitterSearchQuery('');
//       setOutfitterSuggestions([]);
//       setOutfitterSearchError(null);
//       setSelectedOutfitter(null);
//       setNewOutfitterCoordinates(null);
//       setNewHuntAreaNotes('');
//     } catch (error) {
//       console.error('Error adding hunt outfitter:', error);
//       alert('Failed to add outfitter. Please try again.');
//     }
//   };

//   return (
//     <div className="flex h-full flex-col md:flex-row">
//       {/* Mobile menu button */}
//       <div className="md:hidden bg-white p-2 border-b border-gray-200 flex justify-between items-center z-10">
//         <h1 className="font-semibold">Wildpursuit Map</h1>
//         <button
//           onClick={() => setShowSidebar(!showSidebar)}
//           className="p-2 rounded-md bg-gray-100"
//         >
//           <Menu size={20} />
//         </button>
//       </div>

//       {/* Sidebar for mobile */}
//       <div
//         className={`md:hidden fixed inset-0 bg-gray-800 bg-opacity-75 z-40 transition-opacity duration-300 ${
//           showSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'
//         }`}
//       >
//         <div
//           className={`absolute top-0 left-0 h-full bg-white transform transition-transform duration-300 ease-in-out overflow-auto ${
//             showSidebar ? 'translate-x-0' : '-translate-x-full'
//           }`}
//         >
//           <div className="p-4 border-b border-gray-200 flex justify-between items-center">
//             <h2 className="font-semibold">Map Options</h2>
//             <button onClick={() => setShowSidebar(false)} className="text-gray-500">
//               <X size={16} />
//             </button>
//           </div>
//           {/* Sidebar content */}
//           <div className="w-64 h-full bg-white border-r border-gray-200 overflow-y-auto">
//             <div className="p-3 border-b border-gray-200">
//               <h1 className="text-lg font-bold text-gray-800 uppercase">HUNT AREAS</h1>
//             </div>

//             {/* Tab Navigation */}
//             <div className="p-2 flex justify-between border-b border-gray-200">
//               <div className="flex space-x-4 overflow-x-auto">
//                 <button
//                   className={`px-3 py-1 rounded-md text-sm ${
//                     activeTab === 'hunt-areas' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
//                   }`}
//                   onClick={() => navigate('/map')}
//                 >
//                   Hunt Areas
//                 </button>
//                 <button
//                   className={`px-3 py-1 rounded-md text-sm ${
//                     activeTab === 'hunt-clubs' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
//                   }`}
//                   onClick={() => navigate('/hunt-club')}
//                 >
//                   Hunt Clubs
//                 </button>
//                 <button
//                   className={`px-3 py-1 rounded-md text-sm ${
//                     activeTab === 'hunt-outfitters' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
//                   }`}
//                   onClick={() => navigate('/hunt-outfitter')}
//                 >
//                   Hunt Outfitters
//                 </button>
//               </div>
//               {isAdmin && (
//                 <button
//                   className="bg-green-600 text-white px-3 py-1 rounded-md text-sm flex items-center"
//                   onClick={() => setShowAddModal(true)}
//                 >
//                   <Plus size={16} className="mr-1" />
//                   {activeTab === 'hunt-areas' ? 'NEW AREA' : activeTab === 'hunt-clubs' ? 'NEW CLUB' : 'NEW OUTFITTER'}
//                 </button>
//               )}
//             </div>

//             {/* Tab Content */}
//             <div className="p-3">
//               {activeTab === 'hunt-areas' && (
//                 <>
//                   <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">
//                     {isAdmin ? 'ALL AREAS' : 'YOUR AREAS'}
//                   </h2>
//                   {huntAreas.length === 0 ? (
//                     <div className="text-center p-4 text-gray-500">
//                       No hunt areas available. {isAdmin && 'Click the NEW AREA button to add one.'}
//                     </div>
//                   ) : (
//                     <div className="space-y-2">
//                       {huntAreas.map((area) => (
//                         <div key={area.id} className="bg-gray-100 rounded-md">
//                           <div
//                             className="p-3 cursor-pointer flex items-center justify-between"
//                             onClick={() => {
//                               setCurrentHuntArea(area);
//                               if (area.bounds) {
//                                 const [minLng, minLat, maxLng, maxLat] = area.bounds;
//                                 setMapLocation({
//                                   latitude: (minLat + maxLat) / 2,
//                                   longitude: (minLng + maxLng) / 2,
//                                   zoom: 12,
//                                 });
//                               }
//                             }}
//                           >
//                             <span className="font-medium">{area.name}</span>
//                             <ChevronRight size={16} />
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </>
//               )}

//               {activeTab === 'hunt-clubs' && (
//                 <div>
//                   <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">HUNT CLUBS</h2>
//                   {huntClubs.length === 0 ? (
//                     <div className="text-center p-4 text-gray-500">
//                       No clubs available. {isAdmin && 'Click the NEW CLUB button to add one.'}
//                     </div>
//                   ) : (
//                     <div className="space-y-2">
//                       {huntClubs.map((club) => (
//                         <div key={club.id} className="bg-gray-100 rounded-md">
//                           <div
//                             className="p-3 cursor-pointer flex items-center justify-between"
//                             onClick={() => handleClubClick(club)}
//                           >
//                             <span className="font-medium">
//                               {club.name} {club.location ? `(${club.location})` : ''}
//                             </span>
//                             <ChevronRight size={16} />
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               )}

//               {activeTab === 'hunt-outfitters' && (
//                 <div>
//                   <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">HUNT OUTFITTERS</h2>
//                   {huntOutfitters.length === 0 ? (
//                     <div className="text-center p-4 text-gray-500">
//                       No outfitters available. {isAdmin && 'Click the NEW OUTFITTER button to add one.'}
//                     </div>
//                   ) : (
//                     <div className="space-y-2">
//                       {huntOutfitters.map((outfitter) => (
//                         <div key={outfitter.id} className="bg-gray-100 rounded-md">
//                           <div
//                             className="p-3 cursor-pointer flex items-center justify-between"
//                             onClick={() => handleOutfitterClick(outfitter)}
//                           >
//                             <span className="font-medium">
//                               {outfitter.name} {outfitter.location ? `(${outfitter.location})` : ''}
//                             </span>
//                             <ChevronRight size={16} />
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Desktop sidebar */}
//       <div className="hidden md:block w-64 h-full bg-white border-r border-gray-200 overflow-y-auto">
//         <div className="p-3 border-b border-gray-200">
//           <h1 className="text-lg font-bold text-gray-800 uppercase">HUNT AREAS</h1>
//         </div>

//         {/* Tab Navigation */}
//         <div className="p-2 flex justify-between border-b border-gray-200">
//           <div className="flex space-x-4 overflow-x-auto">
//             <button
//               className={`px-3 py-1 rounded-md text-sm ${
//                 activeTab === 'hunt-areas' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
//               }`}
//               onClick={() => navigate('/map')}
//             >
//               Hunt Areas
//             </button>
//             <button
//               className={`px-3 py-1 rounded-md text-sm ${
//                 activeTab === 'hunt-clubs' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
//               }`}
//               onClick={() => navigate('/hunt-club')}
//             >
//               Hunt Clubs
//             </button>
//             <button
//               className={`px-3 py-1 rounded-md text-sm ${
//                 activeTab === 'hunt-outfitters' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
//               }`}
//               onClick={() => navigate('/hunt-outfitter')}
//             >
//               Hunt Outfitters
//             </button>
//           </div>
//           {isAdmin && (
//             <button
//               className="bg-green-600 text-white px-3 py-1 rounded-md text-sm flex items-center"
//               onClick={() => setShowAddModal(true)}
//             >
//               <Plus size={16} className="mr-1" />
//               {activeTab === 'hunt-areas' ? 'NEW AREA' : activeTab === 'hunt-clubs' ? 'NEW CLUB' : 'NEW OUTFITTER'}
//             </button>
//           )}
//         </div>

//         {/* Tab Content */}
//         <div className="p-3">
//           {activeTab === 'hunt-areas' && (
//             <>
//               <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">
//                 {isAdmin ? 'ALL AREAS' : 'YOUR AREAS'}
//               </h2>
//               {huntAreas.length === 0 ? (
//                 <div className="text-center p-4 text-gray-500">
//                   No hunt areas available. {isAdmin && 'Click the NEW AREA button to add one.'}
//                 </div>
//               ) : (
//                 <div className="space-y-2">
//                   {huntAreas.map((area) => (
//                     <div key={area.id} className="bg-gray-100 rounded-md">
//                       <div
//                         className="p-3 cursor-pointer flex items-center justify-between"
//                         onClick={() => {
//                           setCurrentHuntArea(area);
//                           if (area.bounds) {
//                             const [minLng, minLat, maxLng, maxLat] = area.bounds;
//                             setMapLocation({
//                               latitude: (minLat + maxLat) / 2,
//                               longitude: (minLng + maxLng) / 2,
//                               zoom: 12,
//                             });
//                           }
//                         }}
//                       >
//                         <span className="font-medium">{area.name}</span>
//                         <ChevronRight size={16} />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </>
//           )}

//           {activeTab === 'hunt-clubs' && (
//             <div>
//               <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">HUNT CLUBS</h2>
//               {huntClubs.length === 0 ? (
//                 <div className="text-center p-4 text-gray-500">
//                   No clubs available. {isAdmin && 'Click the NEW CLUB button to add one.'}
//                 </div>
//               ) : (
//                 <div className="space-y-2">
//                   {huntClubs.map((club) => (
//                     <div key={club.id} className="bg-gray-100 rounded-md">
//                       <div
//                         className="p-3 cursor-pointer flex items-center justify-between"
//                         onClick={() => handleClubClick(club)}
//                       >
//                         <span className="font-medium">
//                           {club.name} {club.location ? `(${club.location})` : ''}
//                         </span>
//                         <ChevronRight size={16} />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}

//           {activeTab === 'hunt-outfitters' && (
//             <div>
//               <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">HUNT OUTFITTERS</h2>
//               {huntOutfitters.length === 0 ? (
//                 <div className="text-center p-4 text-gray-500">
//                   No outfitters available. {isAdmin && 'Click the NEW OUTFITTER button to add one.'}
//                 </div>
//               ) : (
//                 <div className="space-y-2">
//                   {huntOutfitters.map((outfitter) => (
//                     <div key={outfitter.id} className="bg-gray-100 rounded-md">
//                       <div
//                         className="p-3 cursor-pointer flex items-center justify-between"
//                         onClick={() => handleOutfitterClick(outfitter)}
//                       >
//                         <span className="font-medium">
//                           {outfitter.name} {outfitter.location ? `(${outfitter.location})` : ''}
//                         </span>
//                         <ChevronRight size={16} />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Map container */}
//       <div className="flex-1 relative">
//         <MapView activeTab={activeTab} />
//         <div className="hidden md:block absolute top-4 left-4 z-10">
//           <button
//             onClick={() => setShowSidebar(!showSidebar)}
//             className="bg-white p-2 rounded-md shadow-md hover:bg-gray-100"
//           >
//             {showSidebar ? '◀' : '▶'}
//           </button>
//         </div>
//       </div>

//       {/* Add Hunt Area, Club, or Outfitter Modal */}
//       {showAddModal && (
//         <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
//           <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-md">
//             <h2 className="text-lg font-bold mb-4">
//               {activeTab === 'hunt-areas' ? 'New Hunt Area' : activeTab === 'hunt-clubs' ? 'New Hunt Club' : 'New Hunt Outfitter'}
//             </h2>
//             <form
//               onSubmit={(e) => {
//                 e.preventDefault();
//                 if (activeTab === 'hunt-areas') handleAddHuntArea();
//                 else if (activeTab === 'hunt-clubs') handleAddHuntClub();
//                 else handleAddHuntOutfitter();
//               }}
//             >
//               {activeTab === 'hunt-areas' ? (
//                 <>
//                   <div className="mb-4">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
//                     <input
//                       type="text"
//                       className="w-full p-2 border border-gray-300 rounded-md"
//                       value={newHuntAreaName}
//                       onChange={(e) => setNewHuntAreaName(e.target.value)}
//                       required
//                       placeholder="Enter hunt area name"
//                     />
//                   </div>
//                   <div className="mb-4 relative">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Search Location</label>
//                     <div className="relative">
//                       <input
//                         type="text"
//                         className="w-full p-2 border border-gray-300 rounded-md pr-8"
//                         value={searchQuery}
//                         onChange={(e) => setSearchQuery(e.target.value)}
//                         placeholder="Search for a place (e.g., city, region)"
//                       />
//                       {searchQuery && (
//                         <button
//                           type="button"
//                           onClick={handleClearSearch}
//                           className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
//                         >
//                           <X size={16} />
//                         </button>
//                       )}
//                     </div>
//                     {isSearching && <div className="text-sm text-gray-500 mt-1">Searching...</div>}
//                     {searchError && <div className="text-sm text-red-500 mt-1">{searchError}</div>}
//                     {placeSuggestions.length > 0 && (
//                       <ul className="mt-2 border border-gray-300 rounded-md max-h-40 overflow-y-auto bg-white">
//                         {placeSuggestions.map((place) => (
//                           <li
//                             key={place.id}
//                             className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
//                             onClick={() => handlePlaceSelect(place)}
//                           >
//                             {place.place_name}
//                           </li>
//                         ))}
//                       </ul>
//                     )}
//                   </div>
//                   <div className="mb-4">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
//                     <textarea
//                       className="w-full p-2 border border-gray-300 rounded-md"
//                       value={newHuntAreaNotes}
//                       onChange={(e) => setNewHuntAreaNotes(e.target.value)}
//                       rows={3}
//                       placeholder="Add any notes about the hunt area"
//                     />
//                   </div>
//                 </>
//               ) : activeTab === 'hunt-clubs' ? (
//                 <>
//                   <div className="mb-4">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Search Hunt Club</label>
//                     <div className="relative">
//                       <input
//                         type="text"
//                         className="w-full p-2 border border-gray-300 rounded-md pr-8"
//                         value={clubSearchQuery}
//                         onChange={(e) => setClubSearchQuery(e.target.value)}
//                         placeholder="Search for a club (e.g., name or location)"
//                       />
//                       {clubSearchQuery && (
//                         <button
//                           type="button"
//                           onClick={handleClearClubSearch}
//                           className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
//                         >
//                           <X size={16} />
//                         </button>
//                       )}
//                     </div>
//                     {isClubSearching && <div className="text-sm text-gray-500 mt-1">Searching...</div>}
//                     {clubSearchError && <div className="text-sm text-red-500 mt-1">{clubSearchError}</div>}
//                     {clubSuggestions.length > 0 && (
//                       <ul className="mt-2 border border-gray-300 rounded-md max-h-40 overflow-y-auto bg-white">
//                         {clubSuggestions.map((club) => (
//                           <li
//                             key={club.id}
//                             className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
//                             onClick={() => handleClubSelect(club)}
//                           >
//                             {club.name} ({club.location})
//                           </li>
//                         ))}
//                       </ul>
//                     )}
//                   </div>
//                   <div className="mb-4">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
//                     <input
//                       type="text"
//                       className="w-full p-2 border border-gray-300 rounded-md"
//                       value={selectedClub?.name || ''}
//                       readOnly
//                     />
//                   </div>
//                   <div className="mb-4">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
//                     <input
//                       type="text"
//                       className="w-full p-2 border border-gray-300 rounded-md"
//                       value={selectedClub?.location || ''}
//                       readOnly
//                     />
//                   </div>
//                   <div className="mb-4">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
//                     <textarea
//                       className="w-full p-2 border border-gray-300 rounded-md"
//                       value={newHuntAreaNotes}
//                       onChange={(e) => setNewHuntAreaNotes(e.target.value)}
//                       rows={3}
//                       placeholder="Add any notes about the club"
//                     />
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   <div className="mb-4">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Search Hunt Outfitter</label>
//                     <div className="relative">
//                       <input
//                         type="text"
//                         className="w-full p-2 border border-gray-300 rounded-md pr-8"
//                         value={outfitterSearchQuery}
//                         onChange={(e) => setOutfitterSearchQuery(e.target.value)}
//                         placeholder="Search for an outfitter (e.g., name or location)"
//                       />
//                       {outfitterSearchQuery && (
//                         <button
//                           type="button"
//                           onClick={handleClearOutfitterSearch}
//                           className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
//                         >
//                           <X size={16} />
//                         </button>
//                       )}
//                     </div>
//                     {isOutfitterSearching && <div className="text-sm text-gray-500 mt-1">Searching...</div>}
//                     {outfitterSearchError && <div className="text-sm text-red-500 mt-1">{outfitterSearchError}</div>}
//                     {outfitterSuggestions.length > 0 && (
//                       <ul className="mt-2 border border-gray-300 rounded-md max-h-40 overflow-y-auto bg-white">
//                         {outfitterSuggestions.map((outfitter) => (
//                           <li
//                             key={outfitter.id}
//                             className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
//                             onClick={() => handleOutfitterSelect(outfitter)}
//                           >
//                             {outfitter.name} ({outfitter.location})
//                           </li>
//                         ))}
//                       </ul>
//                     )}
//                   </div>
//                   <div className="mb-4">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
//                     <input
//                       type="text"
//                       className="w-full p-2 border border-gray-300 rounded-md"
//                       value={selectedOutfitter?.name || ''}
//                       readOnly
//                     />
//                   </div>
//                   <div className="mb-4">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
//                     <input
//                       type="text"
//                       className="w-full p-2 border border-gray-300 rounded-md"
//                       value={selectedOutfitter?.location || ''}
//                       readOnly
//                     />
//                   </div>
//                   <div className="mb-4">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
//                     <textarea
//                       className="w-full p-2 border border-gray-300 rounded-md"
//                       value={newHuntAreaNotes}
//                       onChange={(e) => setNewHuntAreaNotes(e.target.value)}
//                       rows={3}
//                       placeholder="Add any notes about the outfitter"
//                     />
//                   </div>
//                 </>
//               )}
//               <div className="flex justify-end space-x-2">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowAddModal(false);
//                     setSearchQuery('');
//                     setPlaceSuggestions([]);
//                     setSearchError(null);
//                     setNewHuntAreaName('');
//                     setNewHuntAreaBounds([0, 0, 0, 0]);
//                     setNewHuntAreaNotes('');
//                     setClubSearchQuery('');
//                     setClubSuggestions([]);
//                     setClubSearchError(null);
//                     setSelectedClub(null);
//                     setNewClubCoordinates(null);
//                     setOutfitterSearchQuery('');
//                     setOutfitterSuggestions([]);
//                     setOutfitterSearchError(null);
//                     setSelectedOutfitter(null);
//                     setNewOutfitterCoordinates(null);
//                   }}
//                   className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
//                   disabled={
//                     activeTab === 'hunt-areas'
//                       ? !newHuntAreaName || newHuntAreaBounds.some((coord) => coord === 0)
//                       : activeTab === 'hunt-clubs'
//                       ? !selectedClub || !newClubCoordinates
//                       : !selectedOutfitter || !newOutfitterCoordinates
//                   }
//                 >
//                   Add {activeTab === 'hunt-areas' ? 'Area' : activeTab === 'hunt-clubs' ? 'Club' : 'Outfitter'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Map;


// import React, { useState, useEffect, useCallback } from 'react';
// import { useMap } from '../contexts/MapContext';
// import { useUser } from '../contexts/UserContext';
// import { Plus, ChevronRight, Menu, X } from 'react-feather';
// import debounce from 'lodash/debounce';
// import MapView from '../components/map/MapView';
// import { useLocation, useNavigate } from 'react-router-dom';

// // Mapbox Geocoding API endpoint
// const GEOCODING_API = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

// const Map: React.FC = () => {
//   const { user, isAdmin } = useUser();
//   const {
//     currentHuntArea,
//     huntAreas,
//     setCurrentHuntArea,
//     addHuntAreaToFirestore,
//     setMapLocation,
//   } = useMap();
//   const [showSidebar, setShowSidebar] = useState(false);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [newHuntAreaName, setNewHuntAreaName] = useState('');
//   const [newHuntAreaBounds, setNewHuntAreaBounds] = useState<[number, number, number, number]>([0, 0, 0, 0]);
//   const [newHuntAreaNotes, setNewHuntAreaNotes] = useState('');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [placeSuggestions, setPlaceSuggestions] = useState<any[]>([]);
//   const [isSearching, setIsSearching] = useState(false);
//   const [searchError, setSearchError] = useState<string | null>(null);

//   const location = useLocation();
//   const navigate = useNavigate();

//   // Placeholder for hunt clubs and outfitters data (to be fetched or provided by context)
//   const [huntClubs, setHuntClubs] = useState<any[]>([]);
//   const [huntOutfitters, setHuntOutfitters] = useState<any[]>([]);

//   // Debounced search function for place suggestions (Hunt Areas)
//   const fetchPlaceSuggestions = useCallback(
//     debounce(async (query: string) => {
//       if (!query) {
//         setPlaceSuggestions([]);
//         setSearchError(null);
//         return;
//       }
//       setIsSearching(true);
//       setSearchError(null);
//       try {
//         const response = await fetch(
//           `${GEOCODING_API}/${encodeURIComponent(query)}.json?access_token=${
//             import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
//           }&types=place,locality,region,country&limit=5`
//         );
//         if (!response.ok) throw new Error('Failed to fetch place suggestions');
//         const data = await response.json();
//         setPlaceSuggestions(data.features || []);
//         if (!data.features.length) setSearchError('No places found for your query.');
//       } catch (error) {
//         console.error('Error fetching place suggestions:', error);
//         setSearchError('Error fetching places. Please try again.');
//         setPlaceSuggestions([]);
//       } finally {
//         setIsSearching(false);
//       }
//     }, 300),
//     []
//   );

//   // Fetch data based on route
//   useEffect(() => {
//     if (location.pathname === '/hunt-club') {
//       // Fetch hunt clubs data (placeholder)
//       // Example: Replace with actual API call or context method
//       const fetchHuntClubs = async () => {
//         try {
//           // Simulated API call
//           const clubs: any[] = []; // Replace with actual data fetching logic
//           setHuntClubs(clubs);
//         } catch (error) {
//           console.error('Error fetching hunt clubs:', error);
//         }
//       };
//       fetchHuntClubs();
//     } else if (location.pathname === '/hunt-outfitter') {
//       // Fetch hunt outfitters data (placeholder)
//       // Example: Replace with actual API call or context method
//       const fetchHuntOutfitters = async () => {
//         try {
//           // Simulated API call
//           const outfitters: any[] = []; // Replace with actual data fetching logic
//           setHuntOutfitters(outfitters);
//         } catch (error) {
//           console.error('Error fetching hunt outfitters:', error);
//         }
//       };
//       fetchHuntOutfitters();
//     }
//     // Hunt areas are assumed to be handled by useMap context
//   }, [location.pathname]);

//   // Handle search input change for Hunt Areas
//   useEffect(() => {
//     if (location.pathname === '/map') {
//       fetchPlaceSuggestions(searchQuery);
//     }
//   }, [searchQuery, fetchPlaceSuggestions, location.pathname]);

//   // Handle place selection for Hunt Areas
//   const handlePlaceSelect = (place: any) => {
//     const [lng, lat] = place.center;
//     const bounds: [number, number, number, number] = [lng - 0.01, lat - 0.01, lng + 0.01, lat + 0.01];
//     setNewHuntAreaBounds(bounds);
//     setMapLocation({ latitude: lat, longitude: lng, zoom: 12 });
//     setSearchQuery(place.place_name);
//     setPlaceSuggestions([]);
//     setSearchError(null);
//   };

//   // Clear search input for Hunt Areas
//   const handleClearSearch = () => {
//     setSearchQuery('');
//     setPlaceSuggestions([]);
//     setSearchError(null);
//     setNewHuntAreaBounds([0, 0, 0, 0]);
//   };

//   // Implementation of uuidv4
//   function uuidv4(): string {
//     return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
//       const r = (Math.random() * 16) | 0;
//       const v = c === 'x' ? r : (r & 0x3) | 0x8;
//       return v.toString(16);
//     });
//   }

//   // Handle adding a new hunt area
//   const handleAddHuntArea = async () => {
//     if (!newHuntAreaName) {
//       alert('Please enter a hunt area name.');
//       return;
//     }
//     if (newHuntAreaBounds.some((coord) => coord === 0)) {
//       alert('Please select a valid location for the hunt area.');
//       return;
//     }

//     const newHuntArea = {
//       id: uuidv4(),
//       name: newHuntAreaName,
//       notes: newHuntAreaNotes,
//       markers: [],
//       bounds: newHuntAreaBounds,
//       lastUpdated: new Date().toISOString(),
//       shared: false,
//       sharedWith: [],
//       createdBy: user?.id || '',
//       clubId: 'default-club',
//     };
//     try {
//       await addHuntAreaToFirestore(newHuntArea);
//       setShowAddModal(false);
//       setNewHuntAreaName('');
//       setNewHuntAreaBounds([0, 0, 0, 0]);
//       setNewHuntAreaNotes('');
//       setSearchQuery('');
//       setPlaceSuggestions([]);
//       setSearchError(null);
//     } catch (error) {
//       console.error('Error adding hunt area:', error);
//       alert('Failed to add hunt area. Please try again.');
//     }
//   };

//   // Determine content to display based on route
//   const renderSidebarContent = () => {
//     switch (location.pathname) {
//       case '/hunt-club':
//         return (
//           <>
//             <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">HUNT CLUBS</h2>
//             {huntClubs.length === 0 ? (
//               <div className="text-center p-4 text-gray-500">
//                 No hunt clubs available.
//               </div>
//             ) : (
//               <div className="space-y-2">
//                 {huntClubs.map((club) => (
//                   <div key={club.id} className="bg-gray-100 rounded-md">
//                     <div
//                       className="p-3 cursor-pointer flex items-center justify-between"
//                       onClick={() => {
//                         // Add logic to set map location or other actions
//                         if (club.bounds) {
//                           const [minLng, minLat, maxLng, maxLat] = club.bounds;
//                           setMapLocation({
//                             latitude: (minLat + maxLat) / 2,
//                             longitude: (minLng + maxLng) / 2,
//                             zoom: 12,
//                           });
//                         }
//                       }}
//                     >
//                       <span className="font-medium">{club.name}</span>
//                       <ChevronRight size={16} />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </>
//         );
//       case '/hunt-outfitter':
//         return (
//           <>
//             <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">HUNT OUTFITTERS</h2>
//             {huntOutfitters.length === 0 ? (
//               <div className="text-center p-4 text-gray-500">
//                 No hunt outfitters available.
//               </div>
//             ) : (
//               <div className="space-y-2">
//                 {huntOutfitters.map((outfitter) => (
//                   <div key={outfitter.id} className="bg-gray-100 rounded-md">
//                     <div
//                       className="p-3 cursor-pointer flex items-center justify-between"
//                       onClick={() => {
//                         // Add logic to set map location or other actions
//                         if (outfitter.bounds) {
//                           const [minLng, minLat, maxLng, maxLat] = outfitter.bounds;
//                           setMapLocation({
//                             latitude: (minLat + maxLat) / 2,
//                             longitude: (minLng + maxLng) / 2,
//                             zoom: 12,
//                           });
//                         }
//                       }}
//                     >
//                       <span className="font-medium">{outfitter.name}</span>
//                       <ChevronRight size={16} />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </>
//         );
//       case '/map':
//       default:
//         return (
//           <>
//             <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">
//               {isAdmin ? 'ALL AREAS' : 'YOUR AREAS'}
//             </h2>
//             {huntAreas.length === 0 ? (
//               <div className="text-center p-4 text-gray-500">
//                 No hunt areas available. {isAdmin && 'Click the NEW AREA button to add one.'}
//               </div>
//             ) : (
//               <div className="space-y-2">
//                 {huntAreas.map((area) => (
//                   <div key={area.id} className="bg-gray-100 rounded-md">
//                     <div
//                       className="p-3 cursor-pointer flex items-center justify-between"
//                       onClick={() => {
//                         setCurrentHuntArea(area);
//                         if (area.bounds) {
//                           const [minLng, minLat, maxLng, maxLat] = area.bounds;
//                           setMapLocation({
//                             latitude: (minLat + maxLat) / 2,
//                             longitude: (minLng + maxLng) / 2,
//                             zoom: 12,
//                           });
//                         }
//                       }}
//                     >
//                       <span className="font-medium">{area.name}</span>
//                       <ChevronRight size={16} />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </>
//         );
//     }
//   };

//   return (
//     <div className="flex h-full flex-col md:flex-row">
//       {/* Mobile menu button */}
//       <div className="md:hidden bg-white p-2 border-b border-gray-200 flex justify-between items-center z-10">
//         <h1 className="font-semibold">Wildpursuit Map</h1>
//         <button
//           onClick={() => setShowSidebar(!showSidebar)}
//           className="p-2 rounded-md bg-gray-100"
//         >
//           <Menu size={20} />
//         </button>
//       </div>

//       {/* Sidebar for mobile */}
//       <div
//         className={`md:hidden fixed inset-0 bg-gray-800 bg-opacity-75 z-40 transition-opacity duration-300 ${
//           showSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'
//         }`}
//       >
//         <div
//           className={`absolute top-0 left-0 h-full bg-white transform transition-transform duration-300 ease-in-out overflow-auto ${
//             showSidebar ? 'translate-x-0' : '-translate-x-full'
//           }`}
//         >
//           <div className="p-4 border-b border-gray-200 flex justify-between items-center">
//             <h2 className="font-semibold">Map Options</h2>
//             <button onClick={() => setShowSidebar(false)} className="text-gray-500">
//               <X size={16} />
//             </button>
//           </div>
//           {/* Sidebar content */}
//           <div className="w-64 h-full bg-white border-r border-gray-200 overflow-y-auto">
//             <div className="p-3 border-b border-gray-200">
//               <h1 className="text-lg font-bold text-gray-800 uppercase">
//                 {location.pathname === '/hunt-club'
//                   ? 'HUNT CLUBS'
//                   : location.pathname === '/hunt-outfitter'
//                   ? 'HUNT OUTFITTERS'
//                   : 'HUNT AREAS'}
//               </h1>
//             </div>

//             {/* Sidebar Content */}
//             <div className="p-3">
//               {location.pathname === '/map' && isAdmin && (
//                 <div className="mb-4">
//                   <button
//                     className="bg-green-600 text-white px-3 py-1 rounded-md text-sm flex items-center w-full"
//                     onClick={() => setShowAddModal(true)}
//                   >
//                     <Plus size={16} className="mr-1" />
//                     NEW AREA
//                   </button>
//                 </div>
//               )}
//               {renderSidebarContent()}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Desktop sidebar */}
//       <div className="hidden md:block w-64 h-full bg-white border-r border-gray-200 overflow-y-auto">
//         <div className="p-3 border-b border-gray-200">
//           <h1 className="text-lg font-bold text-gray-800 uppercase">
//             {location.pathname === '/hunt-club'
//               ? 'HUNT CLUBS'
//               : location.pathname === '/hunt-outfitter'
//               ? 'HUNT OUTFITTERS'
//               : 'HUNT AREAS'}
//           </h1>
//         </div>

//         {/* Sidebar Content */}
//         <div className="p-3">
//           {location.pathname === '/map' && isAdmin && (
//             <div className="mb-4">
//               <button
//                 className="bg-green-600 text-white px-3 py-1 rounded-md text-sm flex items-center w-full"
//                 onClick={() => setShowAddModal(true)}
//               >
//                 <Plus size={16} className="mr-1" />
//                 NEW AREA
//               </button>
//             </div>
//           )}
//           {renderSidebarContent()}
//         </div>
//       </div>

//       {/* Map container */}
//       <div className="flex-1 relative">
//         <MapView />
//         <div className="hidden md:block absolute top-4 left-4 z-10">
//           <button
//             onClick={() => setShowSidebar(!showSidebar)}
//             className="bg-white p-2 rounded-md shadow-md hover:bg-gray-100"
//           >
//             {showSidebar ? '◀' : '▶'}
//           </button>
//         </div>
//       </div>

//       {/* Add Hunt Area Modal */}
//       {showAddModal && (
//         <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
//           <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-md">
//             <h2 className="text-lg font-bold mb-4">New Hunt Area</h2>
//             <form
//               onSubmit={(e) => {
//                 e.preventDefault();
//                 handleAddHuntArea();
//               }}
//             >
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
//                 <input
//                   type="text"
//                   className="w-full p-2 border border-gray-300 rounded-md"
//                   value={newHuntAreaName}
//                   onChange={(e) => setNewHuntAreaName(e.target.value)}
//                   required
//                   placeholder="Enter hunt area name"
//                 />
//               </div>
//               <div className="mb-4 relative">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Search Location</label>
//                 <div className="relative">
//                   <input
//                     type="text"
//                     className="w-full p-2 border border-gray-300 rounded-md pr-8"
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     placeholder="Search for a place (e.g., city, region)"
//                   />
//                   {searchQuery && (
//                     <button
//                       type="button"
//                       onClick={handleClearSearch}
//                       className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
//                     >
//                       <X size={16} />
//                     </button>
//                   )}
//                 </div>
//                 {isSearching && <div className="text-sm text-gray-500 mt-1">Searching...</div>}
//                 {searchError && <div className="text-sm text-red-500 mt-1">{searchError}</div>}
//                 {placeSuggestions.length > 0 && (
//                   <ul className="mt-2 border border-gray-300 rounded-md max-h-40 overflow-y-auto bg-white">
//                     {placeSuggestions.map((place) => (
//                       <li
//                         key={place.id}
//                         className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
//                         onClick={() => handlePlaceSelect(place)}
//                       >
//                         {place.place_name}
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//               </div>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
//                 <textarea
//                   className="w-full p-2 border border-gray-300 rounded-md"
//                   value={newHuntAreaNotes}
//                   onChange={(e) => setNewHuntAreaNotes(e.target.value)}
//                   rows={3}
//                   placeholder="Add any notes about the hunt area"
//                 />
//               </div>
//               <div className="flex justify-end space-x-2">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowAddModal(false);
//                     setSearchQuery('');
//                     setPlaceSuggestions([]);
//                     setSearchError(null);
//                     setNewHuntAreaName('');
//                     setNewHuntAreaBounds([0, 0, 0, 0]);
//                     setNewHuntAreaNotes('');
//                   }}
//                   className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
//                   disabled={!newHuntAreaName || newHuntAreaBounds.some((coord) => coord === 0)}
//                 >
//                   Add Area
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Map;




import React, { useState, useEffect, useCallback } from 'react';
import { useMap } from '../contexts/MapContext';
import { useUser } from '../contexts/UserContext';
import { Plus, ChevronRight, Menu, X } from 'react-feather';
import debounce from 'lodash/debounce';
import MapView from '../components/map/MapView';
import { useLocation, useNavigate } from 'react-router-dom';

// Mapbox Geocoding API endpoint
const GEOCODING_API = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

// Define Club type with coordinates property
type Club = {
  id: string;
  name: string;
  coordinates?: [number, number];
  // Add other properties as needed
};

const Map: React.FC = () => {
  const { user, isAdmin } = useUser();
  const {
    currentHuntArea,
    huntAreas,
    huntClubs,
    huntOutfitters,
    setCurrentHuntArea,
    addHuntAreaToFirestore,
    setMapLocation,
    getHuntClubsFromFirestore,
    getHuntOutfittersFromFirestore,
  } = useMap();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHuntAreaName, setNewHuntAreaName] = useState('');
  const [newHuntAreaBounds, setNewHuntAreaBounds] = useState<[number, number, number, number]>([0, 0, 0, 0]);
  const [newHuntAreaNotes, setNewHuntAreaNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [placeSuggestions, setPlaceSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Debounced search function for place suggestions (Hunt Areas)
  const fetchPlaceSuggestions = useCallback(
    debounce(async (query: string) => {
      if (!query) {
        setPlaceSuggestions([]);
        setSearchError(null);
        return;
      }
      setIsSearching(true);
      setSearchError(null);
      try {
        const response = await fetch(
          `${GEOCODING_API}/${encodeURIComponent(query)}.json?access_token=${
            import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
          }&types=place,locality,region,country&limit=5`
        );
        if (!response.ok) throw new Error('Failed to fetch place suggestions');
        const data = await response.json();
        setPlaceSuggestions(data.features || []);
        if (!data.features.length) setSearchError('No places found for your query.');
      } catch (error) {
        console.error('Error fetching place suggestions:', error);
        setSearchError('Error fetching places. Please try again.');
        setPlaceSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  // Fetch data based on route
  useEffect(() => {
    if (location.pathname === '/hunt-club') {
      const fetchHuntClubs = async () => {
        try {
          const clubs = await getHuntClubsFromFirestore();
          // No need to set local state since MapContext manages huntClubs
        } catch (error) {
          console.error('Error fetching hunt clubs:', error);
        }
      };
      fetchHuntClubs();
    } else if (location.pathname === '/hunt-outfitter') {
      const fetchHuntOutfitters = async () => {
        try {
          const outfitters = await getHuntOutfittersFromFirestore();
          // No need to set local state since MapContext manages huntOutfitters
        } catch (error) {
          console.error('Error fetching hunt outfitters:', error);
        }
      };
      fetchHuntOutfitters();
    }
    // Hunt areas are handled by MapContext
  }, [location.pathname, getHuntClubsFromFirestore, getHuntOutfittersFromFirestore]);

  // Handle search input change for Hunt Areas
  useEffect(() => {
    if (location.pathname === '/map') {
      fetchPlaceSuggestions(searchQuery);
    }
  }, [searchQuery, fetchPlaceSuggestions, location.pathname]);

  // Handle place selection for Hunt Areas
  const handlePlaceSelect = (place: any) => {
    const [lng, lat] = place.center;
    const bounds: [number, number, number, number] = [lng - 0.01, lat - 0.01, lng + 0.01, lat + 0.01];
    setNewHuntAreaBounds(bounds);
    setMapLocation({ latitude: lat, longitude: lng, zoom: 12 });
    setSearchQuery(place.place_name);
    setPlaceSuggestions([]);
    setSearchError(null);
  };

  // Clear search input for Hunt Areas
  const handleClearSearch = () => {
    setSearchQuery('');
    setPlaceSuggestions([]);
    setSearchError(null);
    setNewHuntAreaBounds([0, 0, 0, 0]);
  };

  // Implementation of uuidv4
  function uuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // Handle adding a new hunt area
  const handleAddHuntArea = async () => {
    if (!newHuntAreaName) {
      alert('Please enter a hunt area name.');
      return;
    }
    if (newHuntAreaBounds.some((coord) => coord === 0)) {
      alert('Please select a valid location for the hunt area.');
      return;
    }

    const newHuntArea = {
      id: uuidv4(),
      name: newHuntAreaName,
      notes: newHuntAreaNotes,
      markers: [],
      bounds: newHuntAreaBounds,
      lastUpdated: new Date().toISOString(),
      shared: false,
      sharedWith: [],
      createdBy: user?.id || '',
      clubId: 'default-club',
    };
    try {
      await addHuntAreaToFirestore(newHuntArea);
      setShowAddModal(false);
      setNewHuntAreaName('');
      setNewHuntAreaBounds([0, 0, 0, 0]);
      setNewHuntAreaNotes('');
      setSearchQuery('');
      setPlaceSuggestions([]);
      setSearchError(null);
    } catch (error) {
      console.error('Error adding hunt area:', error);
      alert('Failed to add hunt area. Please try again.');
    }
  };

  // Determine content to display based on route
  const renderSidebarContent = () => {
    switch (location.pathname) {
      case '/hunt-club':
        return (
          <>
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">HUNT CLUBS</h2>
            {huntClubs.length === 0 ? (
              <div className="text-center p-4 text-gray-500">
                No hunt clubs available.
              </div>
            ) : (
              <div className="space-y-2">
                {huntClubs.map((club) => (
                  <div key={club.id} className="bg-gray-100 rounded-md">
                    <div
                      className="p-3 cursor-pointer flex items-center justify-between"
                      onClick={() => {
                        // Handle map location for clubs (using location or coordinates if available)
                        if (club.coordinates) {
                          const [lng, lat] = club.coordinates;
                          setMapLocation({
                            latitude: lat,
                            longitude: lng,
                            zoom: 12,
                          });
                        }
                      }}
                    >
                      <span className="font-medium">{club.name}</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        );
      case '/hunt-outfitter':
        return (
          <>
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">HUNT OUTFITTERS</h2>
            {huntOutfitters.length === 0 ? (
              <div className="text-center p-4 text-gray-500">
                No hunt outfitters available.
              </div>
            ) : (
              <div className="space-y-2">
                {huntOutfitters.map((outfitter) => (
                  <div key={outfitter.id} className="bg-gray-100 rounded-md">
                    <div
                      className="p-3 cursor-pointer flex items-center justify-between"
                      onClick={() => {
                        // Handle map location for outfitters (using coordinates)
                        if (outfitter.coordinates) {
                          const [lng, lat] = outfitter.coordinates;
                          setMapLocation({
                            latitude: lat,
                            longitude: lng,
                            zoom: 12,
                          });
                        }
                      }}
                    >
                      <span className="font-medium">{outfitter.name}</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        );
      case '/map':
      default:
        return (
          <>
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              {isAdmin ? 'ALL AREAS' : 'YOUR AREAS'}
            </h2>
            {huntAreas.length === 0 ? (
              <div className="text-center p-4 text-gray-500">
                No hunt areas available. {isAdmin && 'Click the NEW AREA button to add one.'}
              </div>
            ) : (
              <div className="space-y-2">
                {huntAreas.map((area) => (
                  <div key={area.id} className="bg-gray-100 rounded-md">
                    <div
                      className="p-3 cursor-pointer flex items-center justify-between"
                      onClick={() => {
                        setCurrentHuntArea(area);
                        if (area.bounds) {
                          const [minLng, minLat, maxLng, maxLat] = area.bounds;
                          setMapLocation({
                            latitude: (minLat + maxLat) / 2,
                            longitude: (minLng + maxLng) / 2,
                            zoom: 12,
                          });
                        }
                      }}
                    >
                      <span className="font-medium">{area.name}</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        );
    }
  };

  return (
    <div className="flex h-full flex-col md:flex-row">
      {/* Mobile menu button */}
      <div className="md:hidden bg-white p-2 border-b border-gray-200 flex justify-between items-center z-10">
        <h1 className="font-semibold">Wildpursuit Map</h1>
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="p-2 rounded-md bg-gray-100"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Sidebar for mobile */}
      <div
        className={`md:hidden fixed inset-0 bg-gray-800 bg-opacity-75 z-40 transition-opacity duration-300 ${
          showSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className={`absolute top-0 left-0 h-full bg-white transform transition-transform duration-300 ease-in-out overflow-auto ${
            showSidebar ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold">Map Options</h2>
            <button onClick={() => setShowSidebar(false)} className="text-gray-500">
              <X size={16} />
            </button>
          </div>
          {/* Sidebar content */}
          <div className="w-64 h-full bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-3 border-b border-gray-200">
              <h1 className="text-lg font-bold text-gray-800 uppercase">
                {location.pathname === '/hunt-club'
                  ? 'HUNT CLUBS'
                  : location.pathname === '/hunt-outfitter'
                  ? 'HUNT OUTFITTERS'
                  : 'HUNT AREAS'}
              </h1>
            </div>

            {/* Sidebar Content */}
            <div className="p-3">
              {location.pathname === '/map' && isAdmin && (
                <div className="mb-4">
                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded-md text-sm flex items-center w-full"
                    onClick={() => setShowAddModal(true)}
                  >
                    <Plus size={16} className="mr-1" />
                    NEW AREA
                  </button>
                </div>
              )}
              {renderSidebarContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:block w-64 h-full bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-3 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-800 uppercase">
            {location.pathname === '/hunt-club'
              ? 'HUNT CLUBS'
              : location.pathname === '/hunt-outfitter'
              ? 'HUNT OUTFITTERS'
              : 'HUNT AREAS'}
          </h1>
        </div>

        {/* Sidebar Content */}
        <div className="p-3">
          {location.pathname === '/map' && isAdmin && (
            <div className="mb-4">
              <button
                className="bg-green-600 text-white px-3 py-1 rounded-md text-sm flex items-center w-full"
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={16} className="mr-1" />
                NEW AREA
              </button>
            </div>
          )}
          {renderSidebarContent()}
        </div>
      </div>

      {/* Map container */}
      <div className="flex-1 relative">
        <MapView />
        <div className="hidden md:block absolute top-4 left-4 z-10">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="bg-white p-2 rounded-md shadow-md hover:bg-gray-100"
          >
            {showSidebar ? '◀' : '▶'}
          </button>
        </div>
      </div>

      {/* Add Hunt Area Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">New Hunt Area</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddHuntArea();
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newHuntAreaName}
                  onChange={(e) => setNewHuntAreaName(e.target.value)}
                  required
                  placeholder="Enter hunt area name"
                />
              </div>
              <div className="mb-4 relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Location</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md pr-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for a place (e.g., city, region)"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                {isSearching && <div className="text-sm text-gray-500 mt-1">Searching...</div>}
                {searchError && <div className="text-sm text-red-500 mt-1">{searchError}</div>}
                {placeSuggestions.length > 0 && (
                  <ul className="mt-2 border border-gray-300 rounded-md max-h-40 overflow-y-auto bg-white">
                    {placeSuggestions.map((place) => (
                      <li
                        key={place.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => handlePlaceSelect(place)}
                      >
                        {place.place_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newHuntAreaNotes}
                  onChange={(e) => setNewHuntAreaNotes(e.target.value)}
                  rows={3}
                  placeholder="Add any notes about the hunt area"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setSearchQuery('');
                    setPlaceSuggestions([]);
                    setSearchError(null);
                    setNewHuntAreaName('');
                    setNewHuntAreaBounds([0, 0, 0, 0]);
                    setNewHuntAreaNotes('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={!newHuntAreaName || newHuntAreaBounds.some((coord) => coord === 0)}
                >
                  Add Area
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;