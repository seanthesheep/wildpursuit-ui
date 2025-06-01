
import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage'; // Import Firebase Storage
import fetch from 'node-fetch';

// Initialize Firebase app (only once)
initializeApp();
const db = getFirestore();
const storage = getStorage(); // Initialize Firebase Storage
const bucket = storage.bucket(); // Reference to the default Firebase Storage bucket

export const syncSpypoint = onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password, userId } = req.body;

  if (!username || !password || !userId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // 🔐 Login to Spypoint
    const loginResponse = await fetch('https://restapi.spypoint.com/api/v3/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const loginData = await loginResponse.json();
    if (!loginResponse.ok) {
      return res.status(401).json({ message: loginData.message || 'Login failed' });
    }

    const token = loginData.token;

    // ✅ Save credentials to Firestore
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

    // 🎥 Get cameras
    const camerasResponse = await fetch('https://restapi.spypoint.com/api/v3/camera/all', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!camerasResponse.ok) {
      const errorText = await camerasResponse.text();
      console.error('Camera fetch failed:', errorText);
      return res.status(500).json({ message: 'Failed to fetch cameras' });
    }

    const cameras = await camerasResponse.json();
    if (!Array.isArray(cameras) || cameras.length === 0) {
      return res.status(404).json({ message: 'No cameras found' });
    }

    const batch = db.batch();
    let allPhotos = [];
    let photoData;

    for (const camera of cameras) {
      const cameraRef = db.collection('users').doc(userId).collection('cameras').doc(camera.id);

      const cameraData = {
        id: camera.id,
        name: camera.config?.name || 'Unnamed Camera',
        notes: camera.notes || '',
        lastSync: FieldValue.serverTimestamp(),
      };
      console.log(cameraData, 'cameraData');
      batch.set(cameraRef, cameraData, { merge: true });

      let offset = 0;
      while (true) {
        const photosResponse = await fetch('https://restapi.spypoint.com/api/v3/photo/all', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
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
          console.error('Photos fetch failed:', await photosResponse.text());
          break;
        }

        const photos = await photosResponse.json();
        console.log(photos, 'photos');
        if (!Array.isArray(photos.photos)) break;

        allPhotos.push(...photos.photos);

        for (const photo of photos.photos) {
          // 📸 Download the image from the largeUrl
          const imageUrl = `https://${photo.large.host}/${photo.large.path}`;
          const imageResponse = await fetch(imageUrl, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!imageResponse.ok) {
            console.error(`Failed to fetch image for photo ${photo.id}:`, await imageResponse.text());
            continue; // Skip this photo if the image fetch fails
          }

          const imageBuffer = await imageResponse.buffer(); // Get image as a buffer
          const fileName = `users/${userId}/cameras/${camera.id}/photos/${photo.id}.jpg`; // Define Storage path
          const file = bucket.file(fileName);

          // 💾 Upload image to Firebase Storage
          await file.save(imageBuffer, {
            metadata: {
              contentType: 'image/jpeg', // Adjust based on actual image type if needed
              metadata: {
                cameraId: camera.id,
                userId: userId,
                photoId: photo.id,
                originDate: photo.originDate,
              },
            },
          });

          // Confirm upload
          const [exists] = await file.exists();
          if (!exists) {
            console.error(`Upload failed: file does not exist after saving for photo ${photo.id}`);
            continue;
          } else {
            console.log(`Upload confirmed: file exists for photo ${photo.id}`);
          }

          // Optional: get metadata and log
          const [metadata] = await file.getMetadata();
          console.log(`File metadata for photo ${photo.id}:`, metadata);

          // 🔗 Generate a signed URL for the uploaded image (optional, expires in 7 days)
          const [signedUrl] = await file.getSignedUrl({
            action: 'read',
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          });

          // 📝 Prepare photo metadata for Firestore
          photoData = {
            cameraId: camera.id,
            userId,
            date: photo.date,
            originDate: photo.originDate,
            originName: photo.originName,
            originSize: photo.originSize,
            smallUrl: `https://${photo.small.host}/${photo.small.path}`,
            mediumUrl: `https://${photo.medium.host}/${photo.medium.path}`,
            largeUrl: `https://${photo.large.host}/${photo.large.path}`,
            tags: photo.tag || [],
            storagePath: fileName, // Store the bucket path
            signedUrl, // Store the signed URL
          };

          console.log(photoData, 'photoData');
          const photoRef = cameraRef.collection('photos').doc(photo.id);
          batch.set(photoRef, photoData);
        }

        if (!photos.nextPage) break;
        offset += 100;
      }
    }

    await batch.commit();

    return res.json({
      success: true,
      photosCount: allPhotos.length,
      cameras: cameras.length,
      photoData, // Last photoData for reference (optional)
      allPhotos,
      cameras,
    });
  } catch (err) {
    console.error('Error syncing spypoint:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});