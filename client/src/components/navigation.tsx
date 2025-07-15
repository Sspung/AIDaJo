import React from "react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Menu, X, User, LogOut } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../hooks/useAuth";
import LanguageToggle from "./LanguageToggle";


interface NavigationProps {
  onSectionClick: (sectionId: string) => void;
}

export default function Navigation({ onSectionClick }: NavigationProps) {
  const { t, language } = useLanguage();
  const { user, isAuthenticated, logout, loginWithGoogle, isLoggingOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: t("home.quiz_button"), href: "quiz" },
    { label: t("home.popular_tools"), href: "comparison" },
    { label: t("nav.rankings"), href: "rankings" },
    { label: t("nav.bundles"), href: "bundles" },
    { label: t("home.analytics"), href: "analytics" },
  ];

  const handleNavClick = (href: string) => {
    if (href === "my-packages") {
      window.location.href = "/my-packages";
    } else {
      onSectionClick(href);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">AI DaJo</h1>
            <span className="ml-2 text-sm text-gray-500">
              {language === "ko" ? "나에게 맞는 AI 찾기" : "Find AI that fits you"}
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-6">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                >
                  {item.label}
                </button>
              ))}
            </div>
            
            {/* Language Toggle */}
            <LanguageToggle />
            
            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3 ml-3">
                {(user as any)?.profileImageUrl ? (
                  <img 
                    src={(user as any).profileImageUrl} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <User className="w-8 h-8 p-1 bg-gray-100 rounded-full" />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {(user as any)?.firstName || (user as any)?.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  disabled={isLoggingOut}
                  className="text-gray-600 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={loginWithGoogle}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium ml-3"
              >
                {language === "ko" ? "로그인" : "Login"}
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => {
                    handleNavClick(item.href);
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-gray-700 hover:text-blue-600 py-2 font-medium"
                >
                  {item.label}
                </button>
              ))}
              
              {/* Mobile Language Toggle and Auth */}
              <div className="pt-3 border-t border-gray-200">
                <LanguageToggle />
                
                {isAuthenticated ? (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      {(user as any)?.profileImageUrl ? (
                        <img 
                          src={(user as any).profileImageUrl} 
                          alt="Profile" 
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <User className="w-8 h-8 p-1 bg-gray-200 rounded-full" />
                      )}
                      <span className="text-sm font-medium">
                        {(user as any)?.firstName || (user as any)?.email}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      onClick={logout}
                      disabled={isLoggingOut}
                      className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {language === "ko" ? "로그아웃" : "Logout"}
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={loginWithGoogle}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium w-full mt-3"
                  >
                    {language === "ko" ? "구글 로그인" : "Sign in with Google"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
