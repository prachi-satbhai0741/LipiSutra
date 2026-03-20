import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, addDoc, serverTimestamp, 
  query, orderBy, limit, getDocs 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export async function saveDocument(data, role) {
  try {
    return await addDoc(collection(db, "documents"), {
      ...data,
      savedByRole: role,
      timestamp: serverTimestamp()
    });
  } catch (err) {
    console.log("Firestore save failed:", err.message);
  }
}

export async function getRecentDocuments(max = 20) {
  try {
    const q = query(collection(db, "documents"), orderBy("timestamp", "desc"), limit(max));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Fetch failed:", err);
    return [];
  }
}

export async function saveCorrection(correction) {
  try {
    return await addDoc(collection(db, "corrections"), {
      ...correction,
      savedByRole: "historian",
      timestamp: serverTimestamp()
    });
  } catch (err) {
    console.log("Correction save failed:", err.message);
  }
}