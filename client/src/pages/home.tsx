import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "../components/navigation";
import AiCard from "../components/ai-card";
import QuizModal from "../components/quiz-modal";
import BundleCard from "../components/bundle-card";
import RankingCard from "../components/ranking-card";
import AnalyticsDashboard from "../components/analytics-dashboard";
import CustomPackageBuilder from "../components/custom-package-builder";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Search, Sparkles, ExternalLink, ArrowDown, Plus } from "lucide-react";
import type { AiTool, AiBundle } from "@shared/schema";

const getCategoryLabel = (category: string, t: (key: string) => string) => {
  switch(category) {
    case "전체": return t("tools.filter_all");
    case "텍스트": return t("tools.filter_text");
    case "이미지": return t("tools.filter_image");
    case "영상": return t("tools.filter_video");
    case "음성": return t("tools.filter_voice");
    case "음악": return t("tools.filter_music");
    case "코딩": return t("tools.filter_coding");
    case "데이터분석": return t("tools.filter_analytics");
    case "디자인": return t("tools.filter_design");
    case "마케팅": return t("tools.filter_marketing");
    case "생산성": return t("tools.filter_productivity");
    case "금융": return t("tools.filter_finance");
    case "건강": return t("tools.filter_health");
    case "여행": return t("tools.filter_travel");
    case "부동산": return t("tools.filter_realestate");
    case "교육": return t("tools.filter_education");
    case "엔터테인먼트": return t("tools.filter_entertainment");
    default: return category;
  }
};

const categories = ["전체", "텍스트", "이미지", "영상", "음성", "음악", "코딩", "데이터분석", "디자인", "마케팅", "생산성", "금융", "건강", "여행", "부동산", "교육", "엔터테인먼트"];

export default function Home() {
  const { t, language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isPackageBuilderOpen, setIsPackageBuilderOpen] = useState(false);
  const [showAllTools, setShowAllTools] = useState(false);
  const [showAllBundles, setShowAllBundles] = useState(false);

  const { data: aiTools = [], isLoading: toolsLoading } = useQuery<AiTool[]>({
    queryKey: ["/api/ai-tools", selectedCategory, searchQuery],
  });

  const { data: bundles = [] } = useQuery<AiBundle[]>({
    queryKey: ["/api/ai-bundles"],
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics/stats"],
    refetchInterval: 3600000, // Refetch every 1 hour (3600000ms)
  });

  const filteredTools = aiTools.filter(tool => {
    const matchesCategory = selectedCategory === "전체" || tool.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const displayedTools = showAllTools ? filteredTools : filteredTools.slice(0, 6);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation onSectionClick={scrollToSection} />
      
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <img 
              src="https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
              alt="AI Technology Network" 
              className="mx-auto rounded-xl shadow-2xl w-full max-w-2xl"
            />
          </div>
          <h1 className="text-5xl font-bold mb-6">
            {t("home.title")}
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
            {t("home.subtitle")}
          </p>
          <Button 
            size="lg"
            className="bg-white text-primary hover:bg-gray-100 font-semibold text-lg px-8 py-4"
            onClick={() => setIsQuizOpen(true)}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            {t("home.quiz_button")}
          </Button>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">500+</div>
              <div className="text-gray-600">{t("landing.stats.tools")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary">17</div>
              <div className="text-gray-600">{t("landing.stats.categories")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">156</div>
              <div className="text-gray-600">{t("tools.pricing_free")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">25+</div>
              <div className="text-gray-600">{t("nav.bundles")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Comparison Section */}
      <section id="comparison" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("home.popular_tools")}
            </h2>
            <p className="text-gray-600">
              {language === "ko" 
                ? "인기 AI 도구들의 특징과 장단점을 한눈에 비교해보세요"
                : "Compare features and pros/cons of popular AI tools at a glance"
              }
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder={t("tools.search_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category, index) => {
                return (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="filter-btn"
                  >
                    {getCategoryLabel(category, t)}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* AI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {toolsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                </Card>
              ))
            ) : displayedTools.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">
                  {t("common.error")}
                </p>
              </div>
            ) : (
              displayedTools.map((tool) => (
                <AiCard key={tool.id} tool={tool} />
              ))
            )}
          </div>

          {filteredTools.length > 6 && (
            <div className="text-center mt-8">
              <Button 
                variant="outline"
                onClick={() => window.open('/category-ranking?category=전체', '_blank')}
              >
{language === "ko" ? `더 많은 AI 보기 (${filteredTools.length - 6}개 더)` : `View More AI (${filteredTools.length - 6} more)`} <ArrowDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Category Rankings */}
      <section id="rankings" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{language === "ko" ? "카테고리별 순위" : "Category Rankings"}</h2>
            <p className="text-gray-600">{language === "ko" ? "각 분야에서 가장 인기 있는 AI 도구들을 확인해보세요" : "Check out the most popular AI tools in each category"}</p>
          </div>
          <RankingCard />
        </div>
      </section>

      {/* AI Bundles Section */}
      <section id="bundles" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("home.recommended_bundles")}
            </h2>
            <p className="text-gray-600">
              {language === "ko" 
                ? "목적별로 최적화된 AI 도구 조합을 추천해드립니다"
                : "We recommend optimized AI tool combinations for specific purposes"
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundles.slice(0, showAllBundles ? bundles.length : 6).map((bundle, index) => (
              <BundleCard key={bundle.id} bundle={bundle} />
            ))}
          </div>
          <div className="text-center mt-8 space-y-4">
            {bundles.length > 6 && (
              <Button 
                variant="outline"
                onClick={() => setShowAllBundles(!showAllBundles)}
              >
                {showAllBundles 
                  ? (language === "ko" ? "적게 보기" : "Show Less")
                  : (language === "ko" ? `더 많은 패키지 보기 (${bundles.length - 6}개 더)` : `View More Packages (${bundles.length - 6} more)`)
                }
              </Button>
            )}
            <br />
            <Button 
              variant="outline"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
              onClick={() => setIsPackageBuilderOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("home.custom_package")}
            </Button>
          </div>
        </div>
      </section>

      {/* Usage Analytics Dashboard */}
      <section id="analytics" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("home.analytics")}
            </h2>
            <p className="text-gray-600">
              {language === "ko" 
                ? "실시간 AI 도구 사용 트렌드와 통계를 확인하세요"
                : "Check real-time AI tool usage trends and statistics"
              }
            </p>
          </div>
          <AnalyticsDashboard />
        </div>
      </section>



      <QuizModal isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
      <CustomPackageBuilder 
        isOpen={isPackageBuilderOpen} 
        onClose={() => setIsPackageBuilderOpen(false)} 
      />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 서비스 정보 */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">AI DaJo</h3>
              <p className="text-gray-300 mb-4">
                나에게 맞는 AI 도구를 찾는 가장 쉬운 방법
              </p>
              <div className="text-sm text-gray-400">
                © 2024 AI DaJo. 모든 권리 보유.
                <br />
                <div className="flex gap-4 mt-2">
                  <a href="/privacy-policy" className="text-blue-400 hover:underline">개인정보보호지침</a>
                  <a href="/terms-of-service" className="text-blue-400 hover:underline">이용약관</a>
                  <a href="mailto:foraitree@gmail.com" className="text-blue-400 hover:underline">문의하기</a>
                </div>
              </div>
            </div>

            {/* 주요 기능 */}
            <div>
              <h4 className="font-semibold mb-4">주요 기능</h4>
              <ul className="space-y-2 text-gray-300">
                <li><button onClick={() => setIsQuizOpen(true)} className="hover:text-white text-left">• AI 추천 테스트</button></li>
                <li><button onClick={() => scrollToSection("rankings")} className="hover:text-white text-left">• 카테고리별 순위</button></li>
                <li><button onClick={() => scrollToSection("bundles")} className="hover:text-white text-left">• 맞춤형 AI 패키지</button></li>
                <li><button onClick={() => scrollToSection("analytics")} className="hover:text-white text-left">• 실시간 사용량 분석</button></li>
                <li><button onClick={() => scrollToSection("comparison")} className="hover:text-white text-left">• 상세한 AI 도구 비교</button></li>
              </ul>
            </div>

            {/* 문의 및 업데이트 */}
            <div>
              <h4 className="font-semibold mb-4">문의 및 지원</h4>
              <div className="space-y-3 text-gray-300">
                <div>
                  <p className="text-sm">문의사항</p>
                  <a href="mailto:foraitree@gmail.com" className="text-blue-400 hover:text-blue-300 transition-colors">
                    foraitree@gmail.com
                  </a>
                </div>
                <div className="pt-4 border-t border-gray-700">
                  <p className="text-sm text-green-400">✓ 법적 문서</p>
                  <ul className="text-sm text-gray-300 mt-2 space-y-1">
                    <li><a href="/terms-of-service" className="hover:text-white">• 서비스 이용약관</a></li>
                    <li><a href="/privacy-policy" className="hover:text-white">• 개인정보처리방침</a></li>
                  </ul>
                  <p className="text-sm text-yellow-400 mt-4">🔄 업데이트 예정</p>
                  <ul className="text-sm text-gray-400 mt-2 space-y-1">
                    <li>• 고객지원 시스템</li>
                    <li>• 공지사항 페이지</li>
                    <li>• 자주하는 질문</li>
                    <li>• 제휴 문의 페이지</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
