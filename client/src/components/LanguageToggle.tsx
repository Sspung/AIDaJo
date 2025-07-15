import React from "react";
import { Button } from "./ui/button";
import { useLanguage } from "../contexts/LanguageContext";
import { Globe } from "lucide-react";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "ko" ? "en" : "ko");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
    >
      <Globe className="h-4 w-4" />
      {language === "ko" ? "EN" : "한국어"}
    </Button>
  );
}