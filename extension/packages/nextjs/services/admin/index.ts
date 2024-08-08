import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function initAppFromEnv() {
  if (getApps().length > 0) return;

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log("Initializing LIVE Firestore with GOOGLE_APPLICATION_CREDENTIALS");
    initializeApp({
      credential: applicationDefault(),
    });
  } else if (process.env.FIREBASE_PRIVATE_KEY) {
    console.log("Initializing LIVE Firestore with FIREBASE_PRIVATE_KEY");
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
  } else {
    console.log("Initializing local Firestore instance");
    initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }
}

const getAuthConnector = () => {
  initAppFromEnv();

  return getAuth();
};

export const adminAuth = getAuthConnector();
