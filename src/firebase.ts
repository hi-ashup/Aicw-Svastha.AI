import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';

// Firebase config loading strategy:
// 1. Environment variables (Vercel/GitHub Actions/deployment platforms)
// 2. Local JSON config file (development)
// 3. Graceful fallback (build-time when config unavailable)

const getFirebaseConfig = () => {
  // Check for environment variables first (CI/CD and deployment)
  if (import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    return {
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      firestoreDatabaseId: import.meta.env.VITE_FIRESTORE_DATABASE_ID || '(default)',
    };
  }

  // Fallback to empty config (allows build to succeed)
  // In production, Firebase will be disabled unless env vars are set
  return {
    projectId: '',
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    firestoreDatabaseId: '(default)',
  };
};

const firebaseConfig = getFirebaseConfig();

// Initialize Firebase only if we have a valid config
let app;
let db: any = null;

if (firebaseConfig.projectId) {
  try {
    app = initializeApp(firebaseConfig);
    db = initializeFirestore(
      app,
      {
        experimentalForceLongPolling: true,
      },
      firebaseConfig.firestoreDatabaseId
    );
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    db = null;
  }
} else {
  console.warn('Firebase configuration not available. Running without cloud persistence. Set VITE_FIREBASE_* environment variables to enable.');
}

export { db };
