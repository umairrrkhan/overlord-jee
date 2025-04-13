// Server-side Firebase configuration handler
const express = require('express');
const router = express.Router();

router.get('/firebase-config', (req, res) => {
  // Only return non-sensitive configuration data
  const publicConfig = {
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
  };

  res.json(publicConfig);
});

module.exports = router;