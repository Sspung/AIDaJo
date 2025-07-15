import React from "react";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { Button } from "./ui/button";
import { useLanguage } from "../contexts/LanguageContext";

export default function FirebaseLoginButton() {
  const { user, signInWithGoogle, logOut, loading } = useFirebaseAuth();
  const { t } = useLanguage();

  if (loading) {
    return <Button disabled>로딩 중...</Button>;
  }

  if (!user) {
    return (
      <Button onClick={signInWithGoogle} variant="outline">
        {t("auth.login_with_google")}
      </Button>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm text-gray-700">
        환영합니다, {user.displayName}
      </span>
      <Button onClick={logOut} variant="outline" size="sm">
        로그아웃
      </Button>
    </div>
  );
}