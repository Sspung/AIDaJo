import React from "react";
import React from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase"; // 경로는 실제에 맞게 수정
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("로그인 성공:", result.user);
      navigate("/mypage"); // 로그인 성공 시 이동할 경로
    } catch (error) {
      console.error("로그인 실패:", error);
      alert("로그인에 실패했습니다.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Google 로그인</h2>
      <button onClick={handleGoogleLogin}>Google로 로그인</button>
    </div>
  );
};

export default Login;
