import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MessageSquare, Image, Video, Mic, ArrowRight, Music, Code, BarChart, Palette, TrendingUp, Zap, DollarSign, Heart, MapPin, Home, BookOpen, Play, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import type { AiTool } from "@shared/schema";

const categoryIcons = {
  "텍스트": MessageSquare,
  "이미지": Image,
  "영상": Video,
  "음성": Mic,
  "음악": Music,
  "코딩": Code,
  "데이터분석": BarChart,
  "디자인": Palette,
  "마케팅": TrendingUp,
  "생산성": Zap,
  "금융": DollarSign,
  "건강": Heart,
  "여행": MapPin,
  "부동산": Home,
  "교육": BookOpen,
  "엔터테인먼트": Play,
};

const categoryColors = {
  "텍스트": "blue",
  "이미지": "purple",
  "영상": "red", 
  "음성": "orange",
  "음악": "pink",
  "코딩": "gray",
  "데이터분석": "green",
  "디자인": "indigo",
  "마케팅": "yellow",
  "생산성": "cyan",
  "금융": "emerald",
  "건강": "rose",
  "여행": "teal",
  "부동산": "amber",
  "교육": "violet",
  "엔터테인먼트": "slate",
};

export default function RankingCard() {
  const { language, t } = useLanguage();
  const [, setLocation] = useLocation();
  const [showAll, setShowAll] = useState(false);
  
  const { data: rankings = [] } = useQuery<{category: string, tools: AiTool[]}[]>({
    queryKey: ["/api/analytics/rankings"],
    refetchInterval: 3600000, // Refetch every 1 hour (3600000ms)
  });

  if (rankings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{t("ranking.loading")}</p>
      </div>
    );
  }

  const displayedRankings = showAll ? rankings : rankings.slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedRankings.map(({ category, tools }) => {
        const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || MessageSquare;
        const color = categoryColors[category as keyof typeof categoryColors] || "gray";
        
        return (
          <Card key={category} className="bg-white rounded-xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <IconComponent className={`text-${color}-500 mr-2 h-5 w-5`} />
                  {category === "텍스트" ? t("tools.filter_text") :
                   category === "이미지" ? t("tools.filter_image") :
                   category === "영상" ? t("tools.filter_video") :
                   category === "음성" ? t("tools.filter_voice") :
                   category === "음악" ? t("tools.filter_music") :
                   category === "코딩" ? t("tools.filter_coding") :
                   category === "데이터분석" ? t("tools.filter_analytics") :
                   category === "디자인" ? t("tools.filter_design") :
                   category === "마케팅" ? t("tools.filter_marketing") :
                   category === "생산성" ? t("tools.filter_productivity") :
                   category === "금융" ? t("tools.filter_finance") :
                   category === "건강" ? t("tools.filter_health") :
                   category === "여행" ? t("tools.filter_travel") :
                   category === "부동산" ? t("tools.filter_realestate") :
                   category === "교육" ? t("tools.filter_education") :
                   category === "엔터테인먼트" ? t("tools.filter_entertainment") : category} AI
                </div>
                <span className="text-sm text-gray-500">{t("ranking.this_month")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tools.map((tool, index) => {
                  const rankColors = [
                    "bg-yellow-50 border-yellow-400 text-yellow-600",
                    "bg-gray-50 border-gray-300 text-gray-600", 
                    "bg-orange-50 border-orange-400 text-orange-600"
                  ];
                  
                  return (
                    <div 
                      key={tool.id}
                      className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${rankColors[index] || rankColors[2]}`}
                    >
                      <div className="flex items-center">
                        <span className="text-lg font-bold mr-3">
                          {index + 1}
                        </span>
                        <div>
                          <div className="font-medium">{tool.name}</div>
                          <div className="text-sm text-gray-600">{tool.monthlyUsers} {t("ranking.users")}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">
                          +{Math.round(Math.random() * 20 + 5)}.{Math.round(Math.random() * 9)}%
                        </div>
                        <div className="text-xs text-gray-500">{t("ranking.vs_last_month")}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setLocation(`/category-ranking?category=${category}`)}
                >
{t("ranking.view_all")} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
        })}
      </div>
      
      {rankings.length > 8 && (
        <div className="text-center">
          <Button 
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2"
          >
            {showAll 
              ? (language === "ko" ? "적게 보기" : "Show Less")
              : (language === "ko" ? `더 많은 카테고리 순위 보기 (${rankings.length - 8}개 더)` : `View More Category Rankings (${rankings.length - 8} more)`)
            }
            {showAll ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </div>
  );
}
