import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBvgrgGEAXn7Ko22bGTXTohJqwapSmTc",
  authDomain: "journal-app-86996.firebaseapp.com",
  projectId: "journal-app-86996",
  storageBucket: "journal-app-86996.firebasestorage.app",
  messagingSenderId: "794853822094",
  appId: "1:794853822094:web:472168f6697e86525dc3df"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);