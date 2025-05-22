import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  deleteDoc,
  getFirestore,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { HuntArea, Marker } from './types/types';
import { hashCredentials } from './utils/encryption';

// Club interface for type safety
interface Club {
  id: string;
  name: string;
  location?: string;
  coordinates?: [number, number]; // [longitude, latitude]
  notes?: string;
  createdBy: string;
  clubId: string;
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Google Sign-In
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    return null;
  }
};

// Email/Password Sign-Up
export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Sign-Up Error:", error);
    return null;
  }
};

// Email/Password Sign-In
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Sign-In Error:", error);
    return null;
  }
};

// Sign Out
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign-Out Error:", error);
  }
};

// Auth State Listener
export const onAuthStateChangedListener = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Add a new hunt area
export const addHuntAreaToFirestore = async (huntArea: HuntArea): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "huntAreas"), huntArea);
    return docRef.id;
  } catch (error) {
    console.error("Error adding hunt area:", error);
    throw error;
  }
};

// Add a new marker to Firestore
export const addMarkerToFirestore = async (marker: Marker): Promise<string> => {
  try {
    const markerRef = doc(db, 'markers', marker.id);
    await setDoc(markerRef, marker);
    return marker.id;
  } catch (error) {
    console.error('Error adding marker:', error);
    throw error;
  }
};

// Fetch hunt areas from Firestore
export const getHuntAreasFromFirestore = async (): Promise<HuntArea[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "huntAreas"));
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "Unnamed Area",
        notes: data.notes || "",
        markers: data.markers || [],
        bounds: data.bounds || [0, 0, 0, 0],
        lastUpdated: data.lastUpdated || new Date().toISOString(),
        shared: data.shared || false,
        sharedWith: data.sharedWith || [],
        createdBy: data.createdBy || "",
        clubId: data.clubId || "",
      } as HuntArea;
    });
  } catch (error) {
    console.error("Error fetching hunt areas:", error);
    throw error;
  }
};

// Get markers for a specific hunt area
export const getMarkersForHuntArea = async (huntAreaId: string): Promise<Marker[]> => {
  try {
    const q = query(collection(db, "markers"), where("huntAreaId", "==", huntAreaId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        type: data.type || 'unknown',
        name: data.name || 'Unnamed Marker',
        notes: data.notes || '',
        createdBy: data.createdBy || '',
        inUse: data.inUse || false,
        assignedTo: data.assignedTo || null,
        dateCreated: data.dateCreated || new Date().toISOString(),
        huntAreaId: data.huntAreaId || '',
      } as Marker;
    });
  } catch (error) {
    console.error("Error fetching markers:", error);
    throw error;
  }
};

// Update a hunt area
export const updateHuntAreaInFirestore = async (id: string, updatedFields: Partial<HuntArea>) => {
  try {
    const docRef = doc(db, "huntAreas", id);
    await updateDoc(docRef, updatedFields);
  } catch (error) {
    console.error("Error updating hunt area:", error);
    throw error;
  }
};

// Update a marker
export const updateMarkerInFirestore = async (id: string, updatedFields: Partial<Marker>) => {
  try {
    const docRef = doc(db, "markers", id);
    await updateDoc(docRef, updatedFields);
  } catch (error) {
    console.error("Error updating marker:", error);
    throw error;
  }
};

// Delete a hunt area
export const deleteHuntAreaFromFirestore = async (id: string) => {
  try {
    const docRef = doc(db, "huntAreas", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting hunt area:", error);
    throw error;
  }
};

// Delete a marker
export const deleteMarkerFromFirestore = async (id: string) => {
  try {
    const docRef = doc(db, "markers", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting marker:", error);
    throw error;
  }
};

// Add a new hunt club to Firestore
export const addHuntClubToFirestore = async (club: Club): Promise<string> => {
  try {
    console.log(club, "club")
    const docRef = await addDoc(collection(db, 'huntClubs'), club);
    return docRef.id;
  } catch (error) {
    console.error('Error adding hunt club to Firestore:', error);
    throw error;
  }
};

// Fetch hunt clubs from Firestore
export const getHuntClubsFromFirestore = async (): Promise<Club[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "huntClubs"));
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "Unnamed Club",
        location: data.location || "",
        coordinates: data.coordinates || undefined,
        notes: data.notes || "",
        createdBy: data.createdBy || "",
        clubId: data.clubId || "",
      } as Club;
    });
  } catch (error) {
    console.error("Error fetching hunt clubs:", error);
    throw error;
  }
};

interface SpypointCredentials {
  username: string;
  passwordHash: string;
  lastSync?: string;
}

export const saveSpypointCredentials = async (
  userId: string,
  credentials: { username: string; password: string }
): Promise<void> => {
  const docRef = doc(db, 'users', userId, 'integrations', 'spypoint');
  const hashedCredentials: SpypointCredentials = {
    username: credentials.username,
    passwordHash: await hashCredentials(credentials.password),
    lastSync: new Date().toISOString(),
  };
  await setDoc(docRef, hashedCredentials);
};

export const getSpypointCredentials = async (userId: string): Promise<SpypointCredentials | null> => {
  const docRef = doc(db, 'users', userId, 'integrations', 'spypoint');
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    return null;
  }
  return docSnap.data() as SpypointCredentials;
};

export { auth, db, provider };