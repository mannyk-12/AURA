import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // Handle newlines in private key securely
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

export const createFirebaseAdminApp = () => {
  const apps = getApps();
  
  if (!apps.length) {
    if (!firebaseAdminConfig.projectId || !firebaseAdminConfig.clientEmail || !firebaseAdminConfig.privateKey) {
      console.warn("Firebase Admin environment variables missing. Admin SDK will not be initialized.");
      return undefined;
    }
    
    return initializeApp({
      credential: cert(firebaseAdminConfig),
    });
  }
  return apps[0];
};

const adminApp = createFirebaseAdminApp();
const adminDb = adminApp ? getFirestore(adminApp) : undefined;
const adminAuth = adminApp ? getAuth(adminApp) : undefined;

export { adminDb, adminAuth };
