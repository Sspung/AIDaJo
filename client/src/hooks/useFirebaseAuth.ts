import { useState, useEffect } from "react";
import { auth, provider } from "../lib/firebase";
import { signInWithPopup, onAuthStateChanged, signOut, User } from "firebase/auth";

// Firebase용 useAuth 훅 정의
export const useFirebaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 사용자 로그인 상태 변화 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Google 로그인 처리 함수
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google login error: ", error);
    }
  };

  // 로그아웃 처리 함수
  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error: ", error);
    }
  };

  return { 
    user, 
    loading,
    signInWithGoogle, 
    logOut,
    isAuthenticated: !!user 
  };
};