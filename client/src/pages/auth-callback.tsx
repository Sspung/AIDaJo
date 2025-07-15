import React from "react";
import { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface UserInfo {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

export default function AuthCallback() {
  const { language } = useLanguage();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // URL에서 access_token 추출 (최초 로그인 시)
    const hashParams = new URLSearchParams(window.location.hash.substr(1));
    const token = hashParams.get("access_token");
    
    if (token) {
      // 토큰을 localStorage에 저장
      localStorage.setItem("token", token);
      // 해시(#) 제거하고 리다이렉트
      window.location.href = window.location.pathname;
      return;
    }

    // localStorage에서 토큰 불러오기
    const savedToken = localStorage.getItem("token");

    if (savedToken) {
      // 로그인된 상태일 때 사용자 정보 표시
      fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: {
          Authorization: `Bearer ${savedToken}`
        }
      })
      .then(res => res.json())
      .then(async (userData) => {
        setUser(userData);
        
        // 사용자 정보를 localStorage에 저장
        localStorage.setItem("user_info", JSON.stringify({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          firstName: userData.given_name || userData.name?.split(' ')[0],
          lastName: userData.family_name || userData.name?.split(' ').slice(1).join(' '),
          profileImageUrl: userData.picture,
        }));

        // 서버에 사용자 정보 전송
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${savedToken}`,
            },
            body: JSON.stringify({
              id: userData.id,
              email: userData.email,
              firstName: userData.given_name || userData.name?.split(' ')[0],
              lastName: userData.family_name || userData.name?.split(' ').slice(1).join(' '),
              profileImageUrl: userData.picture,
            }),
          });

          if (response.ok) {
            // 3초 후 메인 페이지로 리다이렉트
            setTimeout(() => {
              window.location.href = "/";
            }, 3000);
          } else {
            throw new Error('Failed to register user');
          }
        } catch (err) {
          console.error("사용자 등록 실패", err);
          // 토큰은 저장했으므로 로그인은 성공으로 처리
          setTimeout(() => {
            window.location.href = "/";
          }, 3000);
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error("토큰 만료 또는 로그인 실패", err);
        localStorage.removeItem("token"); // 잘못된 토큰이면 삭제
        localStorage.removeItem("user_info");
        setError(language === "ko" ? "토큰이 만료되었습니다." : "Token has expired.");
        setLoading(false);
      });
    } else {
      setError(language === "ko" ? "인증 토큰이 없습니다." : "No authentication token found.");
      setLoading(false);
    }
  }, [language]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center p-8">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {language === "ko" ? "로그인 처리 중..." : "Processing login..."}
            </h2>
            <p className="text-gray-600 text-center">
              {language === "ko" ? "잠시만 기다려 주세요." : "Please wait a moment."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">
              {language === "ko" ? "로그인 실패" : "Login Failed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.href = "/login"}>
              {language === "ko" ? "다시 시도" : "Try Again"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-green-600">
            {language === "ko" ? "로그인 성공!" : "Login Successful!"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {user && (
            <div className="mb-6">
              {user.picture && (
                <img 
                  src={user.picture} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full mx-auto mb-4"
                />
              )}
              <p className="font-semibold text-lg">{user.name}</p>
              <p className="text-gray-600">{user.email}</p>
            </div>
          )}
          <p className="text-gray-600 mb-4">
            {language === "ko" ? "잠시 후 메인 페이지로 이동됩니다..." : "Redirecting to main page..."}
          </p>
          <Button onClick={() => window.location.href = "/"}>
            {language === "ko" ? "지금 이동" : "Go Now"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}