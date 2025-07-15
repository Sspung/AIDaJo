import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Link } from "wouter";

export default function Login() {
  const { language } = useLanguage();

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI DaJo</h1>
          <p className="text-gray-600">
            {language === "ko"
              ? "AI 도구 플랫폼에 오신 것을 환영합니다"
              : "Welcome to the AI Tools Platform"}
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {language === "ko" ? "로그인" : "Login"}
            </CardTitle>
            <CardDescription>
              {language === "ko"
                ? "Google 계정으로 간편하게 로그인하세요"
                : "Sign in with your Google account"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGoogleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
              size="lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {language === "ko" ? "Google로 로그인" : "Sign in with Google"}
            </Button>

            <div className="text-center text-sm text-gray-500 space-y-2">
              <p>
                {language === "ko"
                  ? "로그인하면 다음 서비스를 이용할 수 있습니다:"
                  : "By signing in, you can access:"}
              </p>
              <ul className="text-left space-y-1">
                <li>
                  •{" "}
                  {language === "ko"
                    ? "개인화된 AI 도구 추천"
                    : "Personalized AI tool recommendations"}
                </li>
                <li>
                  •{" "}
                  {language === "ko"
                    ? "커스텀 패키지 생성 및 저장"
                    : "Custom package creation and saving"}
                </li>
                <li>
                  •{" "}
                  {language === "ko"
                    ? "사용 기록 및 분석"
                    : "Usage history and analytics"}
                </li>
              </ul>
            </div>

            <div className="text-center text-xs text-gray-400 pt-4 border-t">
              <p>
                <a href="/privacy-policy" className="hover:underline">
                  {language === "ko" ? "개인정보처리방침" : "Privacy Policy"}
                </a>
                {" | "}
                <a href="/terms" className="hover:underline">
                  {language === "ko" ? "이용약관" : "Terms of Service"}
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
