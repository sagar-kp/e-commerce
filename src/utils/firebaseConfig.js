import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { collection, getFirestore } from "firebase/firestore";

const env = import.meta.env;

const firebaseConfig = {
  apiKey: env.VITE_API_KEY,
  authDomain: env.VITE_AUTH_DOMAIN,
  projectId: env.VITE_PROJECT_ID,
  storageBucket: env.VITE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_MESSAGE_SENDER_ID,
  appId: env.VITE_APP_ID,
};

if (env.MODE === "production")
  firebaseConfig.measurementId = env.VITE_MEASUREMENT_ID;

initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();
const collectionReference = collection(db, "users");

export { auth, db, collectionReference };
