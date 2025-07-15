import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { ArrowLeft, Crown, Medal, Award, ExternalLink } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import type { AiTool } from "@shared/schema";

interface CategoryRankingProps {
  category: string;
}

const pricingColors = {
  "free": "green",
  "freemium": "yellow",
  "paid": "red"
};

const pricingLabels = {
  "free": "무료",
  "freemium": "일부 무료",
  "paid": "유료"
};

export default function CategoryRanking() {
  const { language, t } = useLanguage();
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const category = params.get('category') || '전체';

  const { data: tools = [], isLoading } = useQuery<AiTool[]>({
    queryKey: ["/api/ai-tools", category],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (category !== "전체") queryParams.append("category", category);
      
      const response = await fetch(`/api/ai-tools?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch AI tools");
      return response.json();
    }
  });

  // Sort tools by rating for ranking
  const rankedTools = [...tools].sort((a, b) => b.rating - a.rating);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-orange-500" />;
    return null;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return "border-l-4 border-yellow-400 bg-yellow-50";
    if (rank === 2) return "border-l-4 border-gray-400 bg-gray-50";
    if (rank === 3) return "border-l-4 border-orange-400 bg-orange-50";
    if (rank <= 10) return "border-l-4 border-blue-300 bg-blue-50";
    return "border-l-4 border-gray-200 bg-white";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-500">랭킹 데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            홈으로 돌아가기
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {category} AI 도구 순위
            </h1>
            <p className="text-gray-600">
              사용자 평점과 만족도를 기준으로 한 전체 순위입니다
            </p>
            <div className="mt-4 text-sm text-gray-500">
              총 {rankedTools.length}개의 도구
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        {rankedTools.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* 2nd Place */}
            <Card className="order-2 md:order-1 border-2 border-gray-300 bg-gray-50">
              <CardContent className="p-6 text-center">
                <Medal className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  2위. {rankedTools[1].name}
                </h3>
                <p className="text-gray-600 mb-3">{rankedTools[1].company}</p>
                <div className="text-3xl font-bold text-gray-700 mb-2">
                  {rankedTools[1].rating}점
                </div>
                <Badge variant="secondary" className={`mb-3 bg-${pricingColors[rankedTools[1].pricing as keyof typeof pricingColors]}-100 text-${pricingColors[rankedTools[1].pricing as keyof typeof pricingColors]}-800`}>
                  {pricingLabels[rankedTools[1].pricing as keyof typeof pricingLabels]}
                </Badge>
              </CardContent>
            </Card>

            {/* 1st Place */}
            <Card className="order-1 md:order-2 border-2 border-yellow-400 bg-yellow-50 transform md:scale-105">
              <CardContent className="p-6 text-center">
                <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  1위. {rankedTools[0].name}
                </h3>
                <p className="text-gray-600 mb-3">{rankedTools[0].company}</p>
                <div className="text-4xl font-bold text-yellow-600 mb-2">
                  {rankedTools[0].rating}점
                </div>
                <Badge variant="secondary" className={`mb-3 bg-${pricingColors[rankedTools[0].pricing as keyof typeof pricingColors]}-100 text-${pricingColors[rankedTools[0].pricing as keyof typeof pricingColors]}-800`}>
                  {pricingLabels[rankedTools[0].pricing as keyof typeof pricingLabels]}
                </Badge>
                <div className="text-sm text-yellow-700 font-medium">🏆 최고 점수</div>
              </CardContent>
            </Card>

            {/* 3rd Place */}
            <Card className="order-3 border-2 border-orange-300 bg-orange-50">
              <CardContent className="p-6 text-center">
                <Award className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  3위. {rankedTools[2].name}
                </h3>
                <p className="text-gray-600 mb-3">{rankedTools[2].company}</p>
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {rankedTools[2].rating}점
                </div>
                <Badge variant="secondary" className={`mb-3 bg-${pricingColors[rankedTools[2].pricing as keyof typeof pricingColors]}-100 text-${pricingColors[rankedTools[2].pricing as keyof typeof pricingColors]}-800`}>
                  {pricingLabels[rankedTools[2].pricing as keyof typeof pricingLabels]}
                </Badge>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Complete Ranking List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">{t("ranking.overall_ranking")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rankedTools.map((tool, index) => {
                const rank = index + 1;
                const pricingColor = pricingColors[tool.pricing as keyof typeof pricingColors] || "gray";
                const pricingLabel = pricingLabels[tool.pricing as keyof typeof pricingLabels] || tool.pricing;

                return (
                  <div
                    key={tool.id}
                    className={`p-4 rounded-lg ${getRankStyle(rank)} transition-all hover:shadow-md`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <div className="flex items-center justify-center w-12 h-12 mr-4">
                          {getRankIcon(rank) || (
                            <div className="text-lg font-bold text-gray-600">
                              {rank}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {tool.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="secondary" 
                                className={`text-xs px-2 py-1 bg-${pricingColor}-100 text-${pricingColor}-800`}
                              >
                                {pricingLabel}
                              </Badge>
                              <div className="text-lg font-bold text-gray-900">
                                {tool.rating}점
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-2">
                            {tool.company} | {language === "ko" ? tool.description : tool.descriptionEn || tool.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{t("ranking.monthly_users")}: {tool.monthlyUsers}</span>
                              <div className="flex items-center gap-1">
                                <span>{t("tools.ease_of_use")}:</span>
                                <Progress value={tool.rating} className="w-16 h-2" />
                              </div>
                            </div>
                            
                            <a
                              href={tool.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80 text-sm font-medium flex items-center"
                            >
                              {t("ranking.visit_now")} <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary mb-2">
                {Math.round(rankedTools.reduce((sum, tool) => sum + tool.rating, 0) / rankedTools.length)}{t("ranking.score")}
              </div>
              <div className="text-gray-600">{language === "ko" ? "평균 점수" : "Average Score"}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {rankedTools.filter(tool => tool.pricing === 'free').length}{language === "ko" ? "개" : ""}
              </div>
              <div className="text-gray-600">{t("tools.pricing_free")} {language === "ko" ? "도구" : "Tools"}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                {rankedTools.filter(tool => tool.rating >= 90).length}개
              </div>
              <div className="text-gray-600">고품질 도구 (90점 이상)</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}