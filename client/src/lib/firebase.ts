import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Firebase 프로젝트의 Firebase 설정 정보
const firebaseConfig = {
  apiKey: "AIzaSyCE7eVhWYtxT0AQ61UoyGE8rEwiR7c0l60",
  authDomain: "aidajo-5f5d0.firebaseapp.com",
  projectId: "aidajo-5f5d0",
  storageBucket: "aidajo-5f5d0.firebasestorage.app",
  messagingSenderId: "1048951050503",
  appId: "1:1048951050503:web:48ee9de087af7db016f5a2",
  measurementId: "G-BT540N6MWH",
};

// 환경 변수 디버깅 (개발 모드에서만)
if (import.meta.env.DEV) {
  console.log("🔥 Firebase Config Check:", {
    apiKey: firebaseConfig.apiKey ? "✅ Set" : "❌ Missing",
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
  });
}

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Analytics 초기화 (브라우저 환경에서만)
let analytics: any = null;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// Firebase와 관련된 설정을 export
export { auth, db, provider, analytics };
