import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, addDoc, serverTimestamp, 
  query, orderBy, limit, getDocs, setDoc, doc, getDoc, updateDoc, increment
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

export async function checkExistingHash(hash) {
  console.log('>>> [CACHE_CHECK] checkExistingHash Initiated for hash:', hash);
  try {
    const docRef = doc(db, "documents", hash);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('>>> [CACHE_CHECK] HIT! Found existing document, status:', data.status);
      if (data.status === 'verified') return data.historian_output;
      if (data.status === 'pending') return data.ai_output;
    }
    console.log('>>> [CACHE_CHECK] MISS! Document does not exist in Firebase.');
  } catch (err) {
    console.error(">>> [CACHE_CHECK] Fatal Error:", err.message);
  }
  return null;
}

export async function saveDocument(geminiResult, role, hash) {
  console.log('>>> [SAVE_DOC] saveDocument Initiated for hash:', hash);
  try {
    await setDoc(doc(db, "documents", hash), {
      view_count: 1,
      status: 'pending',
      priority_score: 80,
      ai_output: geminiResult,
      historian_output: null,
      timestamp: serverTimestamp()
    });
    console.log('>>> [SAVE_DOC] SUCCESS: Wrote to Firestore successfully.');
  } catch (err) {
    console.error(">>> [SAVE_DOC ERROR] Firestore Rejected the Save! Error Details:", err.code, err.message);
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