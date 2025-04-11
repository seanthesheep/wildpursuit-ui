import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fetch from 'node-fetch'; // Use node-fetch for making HTTP requests

initializeApp();
const db = getFirestore();

export const syncSpypointPhotos = onRequest({
  cors: ['http://localhost:5173', 'http://localhost:3000'],
  maxInstances: 10,
  memory: '256MiB',
}, async (req, res) => {
  // Set CORS headers for preflight requests
  res.set('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Access-Control-Max-Age', '3600');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const userId = req.method === 'POST' ? req.body.userId : req.query.userId;
    let { username, password } = req.body || {};

    if (!userId) {
      res.status(400).send('User ID is required');
      return;
    }

    // For GET requests, retrieve credentials from Firestore
    if (req.method === 'GET') {
      const userDoc = await db
        .collection('users')
        .doc(userId)
        .collection('integrations')
        .doc('spypoint')
        .get();

      if (!userDoc.exists) {
        res.status(404).send('Spypoint credentials not found');
        return;
      }

      const storedCredentials = userDoc.data();
      username = storedCredentials.username;
      password = storedCredentials.password;
    }

    if (!username || !password) {
      res.status(400).send('Username and password are required');
      return;
    }

    // Login to Spypoint API
    const loginResponse = await fetch('https://restapi.spypoint.com/api/v3/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.error('Login failed:', errorText);
      res.status(401).send('Invalid Spypoint credentials');
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;

    // Debug: Log token after login
    console.log('Login successful, token:', token);

    // If this is a POST request, save the credentials
    if (req.method === 'POST') {
      await db
        .collection('users')
        .doc(userId)
        .collection('integrations')
        .doc('spypoint')
        .set({
          username,
          password,
          lastSync: FieldValue.serverTimestamp(),
          token,
        });

      res.json({
        success: true,
        message: 'Credentials verified and saved',
      });
      return;
    }

    // For GET requests, fetch cameras and photos
    const camerasResponse = await fetch('https://restapi.spypoint.com/api/v3/camera/all', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!camerasResponse.ok) {
      const errorText = await camerasResponse.text();
      console.error('Failed to fetch cameras:', errorText);
      res.status(500).send('Failed to fetch cameras');
      return;
    }

    const cameras = await camerasResponse.json();
    if (!cameras || cameras.length === 0) {
      res.status(404).send('No cameras found');
      return;
    }

    // Debug: Log cameras
    console.log('Cameras found:', cameras);

    let allPhotos = [];
    for (const camera of cameras) {
      // Use the name from camera.config.name if available
      const cameraData = {
        id: camera.id,
        name: camera.config?.name || 'Unnamed Camera', // Use config.name if available
        notes: camera.notes || '', // Add notes if available
        lastSync: FieldValue.serverTimestamp(),
      };

      await db
        .collection('users')
        .doc(userId)
        .collection('cameras')
        .doc(camera.id)
        .set(cameraData, { merge: true }); // Use merge to avoid overwriting existing data

      const photosResponse = await fetch('https://restapi.spypoint.com/api/v3/photo/all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          camera: [camera.id],
          dateEnd: '2100-01-01T00:00:00.000Z',
          limit: 100,
          mediaTypes: [],
          species: [],
        }),
      });

      if (!photosResponse.ok) {
        const errorText = await photosResponse.text();
        console.error(`Failed to fetch photos for camera ${camera.id}:`, errorText);
        continue;
      }

      const photos = await photosResponse.json();

      // Store photos in Firestore
      for (const photo of photos.photos) {
        const photoData = {
          cameraId: camera.id,
          userId: userId,
          date: photo.date,
          originDate: photo.originDate,
          originName: photo.originName,
          originSize: photo.originSize,
          smallUrl: `https://${photo.small.host}/${photo.small.path}`,
          mediumUrl: `https://${photo.medium.host}/${photo.medium.path}`,
          largeUrl: `https://${photo.large.host}/${photo.large.path}`,
          tags: photo.tag || [],
        };

        await db
          .collection('users')
          .doc(userId)
          .collection('cameras')
          .doc(camera.id)
          .collection('photos')
          .doc(photo.id)
          .set(photoData);
      }
    }

    res.json({
      success: true,
      photosCount: allPhotos.length,
      cameras: cameras.length,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send(error.message);
  }
});