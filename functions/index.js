import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fetch from 'node-fetch';

initializeApp();
const db = getFirestore();

export const syncSpypointPhotos = onRequest({
  cors: ['http://localhost:5173', 'http://localhost:3000'],
  maxInstances: 10,
  memory: '256MiB',
  timeoutSeconds: 300,
}, async (req, res) => {
  const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];
  const origin = req.headers.origin;
  res.set('Access-Control-Allow-Origin', allowedOrigins.includes(origin) ? origin : allowedOrigins[0]);
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Access-Control-Max-Age', '3600');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (!['GET', 'POST'].includes(req.method)) {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const userId = req.method === 'POST' ? req.body.userId : req.query.userId;
    let { username, password } = req.body || {};

    if (typeof userId !== 'string' || userId.trim() === '') {
      res.status(400).send('Invalid User ID');
      return;
    }

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

    console.log(`Logging in for user ${userId}`);
    const loginResponse = await fetch('https://restapi.spypoint.com/api/v3/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.error('Login failed:', errorText);
      res.status(401).send('Invalid Spypoint credentials');
      return;
    }

    const loginData = await loginResponse.json();
    if (!loginData?.token) {
      console.error('Login response missing token:', loginData);
      res.status(500).send('Invalid response from Spypoint API');
      return;
    }

    const token = loginData.token;
    console.log('Login successful, token:', token);

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

      res.json({ success: true, message: 'Credentials verified and saved' });
      return;
    }

    console.log(`Fetching cameras for user ${userId}`);
    const camerasResponse = await fetch('https://restapi.spypoint.com/api/v3/camera/all', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
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

    console.log('Cameras found:', cameras.length);
    let allPhotos = [];
    const batch = db.batch();

    for (const camera of cameras) {
      const cameraData = {
        id: camera.id,
        name: camera.config?.name || 'Unnamed Camera',
        notes: camera.notes || '',
        lastSync: FieldValue.serverTimestamp(),
      };

      const cameraRef = db.collection('users').doc(userId).collection('cameras').doc(camera.id);
      batch.set(cameraRef, cameraData, { merge: true });

      let offset = 0;
      while (true) {
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
            offset,
            mediaTypes: [],
            species: [],
          }),
        });

        if (!photosResponse.ok) {
          const errorText = await photosResponse.text();
          console.error(`Failed to fetch photos for camera ${camera.id}:`, errorText);
          break;
        }

        const photos = await photosResponse.json();
        allPhotos.push(...photos.photos);

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

          const photoRef = cameraRef.collection('photos').doc(photo.id);
          batch.set(photoRef, photoData);
        }

        if (!photos.nextPage) break; // Adjust based on actual API response
        offset += 100;
      }
    }

    await batch.commit();
    res.json({
      success: true,
      photosCount: allPhotos.length,
      cameras: cameras.length,
    });
  } catch (error) {
    console.error('Error:', error);
    if (error.code === 'ENOTFOUND') {
      res.status(503).send('Network error: Unable to reach Spypoint API');
    } else if (error.code?.startsWith('firestore/')) {
      res.status(500).send('Firestore error: Unable to save data');
    } else {
      res.status(500).send('Internal server error');
    }
  }
});