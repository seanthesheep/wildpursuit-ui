import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Map from './pages/Map';
import Weather from './pages/Weather';
import TrailCameras from './pages/TrailCameras';
import HarvestLog from './pages/HarvestLog';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Club from './pages/Club';
import Login from './pages/Login'; // Import the Login component
import { MapProvider } from './contexts/MapContext';
import { UserProvider } from './contexts/UserContext';
import { AuthProvider } from './contexts/AuthContext';
import { CameraProvider } from './contexts/CameraContext';
import ProtectedRoute from './components/ProtectedRoute';
import SpypointIntegration from './pages/Spypoint';
import './App.css';

const App = () => {
  const location = useLocation();

  // Hide layout on auth pages
  const hideLayout = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(location.pathname);

  return (
    <AuthProvider>
      <UserProvider>
        <CameraProvider>
          <MapProvider>
            {hideLayout ? (
              <Routes>
                <Route path="/login" element={<Login />} /> {/* Use the Login component */}
                <Route path="/signup" element={<div>Signup Page</div>} />
                <Route path="/forgot-password" element={<div>Forgot Password Page</div>} />
                <Route path="/reset-password" element={<div>Reset Password Page</div>} />
                <Route path="*" element={<Navigate to="/login" />} /> {/* Redirect to login by default */}
              </Routes>
            ) : (
              <Layout>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Map />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/map"
                    element={
                      <ProtectedRoute>
                        <Map />
                      </ProtectedRoute>
                    }
                  />
                  <Route path='/test' element={
                    <ProtectedRoute>
                      <SpypointIntegration isOpen={true} onClose={() => {}} />
                    </ProtectedRoute>
                  }/>
                  <Route path='/hunt-club' element={<ProtectedRoute>
                    <Map/>
                  </ProtectedRoute>}/>
                  <Route path='/hunt-outfitter' element={<ProtectedRoute>
                    <Map/>
                  </ProtectedRoute>}/>
                  <Route
                    path="/weather"
                    element={
                      <ProtectedRoute>
                        <Weather />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/trail-cameras"
                    element={
                      <ProtectedRoute>
                        <TrailCameras />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/harvest-log"
                    element={
                      <ProtectedRoute>
                        <HarvestLog />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/club/:id"
                    element={
                      <ProtectedRoute>
                        <Club />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" />} /> {/* Redirect to home */}
                </Routes>
              </Layout>
            )}
          </MapProvider>
        </CameraProvider>
      </UserProvider>
    </AuthProvider>
  );
};

export default App;
