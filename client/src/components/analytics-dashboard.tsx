import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Star,
  MessageSquare,
  Image,
  Video,
  Mic
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import type { AiTool } from "@shared/schema";

interface AnalyticsData {
  totalUsers: number;
  dailyActiveUsers: number;
  avgSessionTime: number;
  satisfactionScore: number;
  categoryDistribution: {
    category: string;
    percentage: number;
    color: string;
  }[];
}

interface PopularTool extends AiTool {
  rank: number;
  growth: number;
}

const categoryIcons = {
  "텍스트": MessageSquare,
  "이미지": Image,
  "영상": Video,
  "음성": Mic,
};

export default function AnalyticsDashboard() {
  const { t } = useLanguage();
  const { data: analytics } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics/stats"],
    refetchInterval: 3600000, // Refetch every 1 hour (3600000ms)
  });

  const { data: popularTools = [] } = useQuery<PopularTool[]>({
    queryKey: ["/api/analytics/popular"],
    refetchInterval: 3600000, // Refetch every 1 hour (3600000ms)
  });

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{t("analytics.loading")}</p>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  };

  return (
    <>
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="bg-white rounded-xl shadow-lg border-l-4 border-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{t("analytics.total_users")}</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(analytics.totalUsers)}
                </p>
                <p className="text-green-600 text-sm font-medium">+12.5% {t("analytics.this_month")}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="text-primary h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-lg border-l-4 border-secondary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{t("analytics.daily_active")}</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(analytics.dailyActiveUsers)}
                </p>
                <p className="text-green-600 text-sm font-medium">+8.2% {t("analytics.vs_yesterday")}</p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-secondary h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-lg border-l-4 border-accent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{t("analytics.avg_session")}</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.avgSessionTime}{t("common.minutes")}</p>
                <p className="text-red-600 text-sm font-medium">-3.1% {t("analytics.vs_last_week")}</p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Clock className="text-accent h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-lg border-l-4 border-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{t("analytics.satisfaction")}</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.satisfactionScore}/5</p>
                <p className="text-green-600 text-sm font-medium">+0.2 {t("analytics.this_month")}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Star className="text-green-500 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Usage Trend Chart */}
        <Card className="bg-white rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t("analytics.usage_trend")}</span>
              <select className="text-sm border border-gray-300 rounded-lg px-3 py-1">
                <option>{t("analytics.last_7_days")}</option>
                <option>{t("analytics.last_30_days")}</option>
                <option>{t("analytics.last_3_months")}</option>
              </select>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300" 
                alt="Analytics Dashboard" 
                className="rounded-lg opacity-80 max-w-full max-h-full object-cover"
              />
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="bg-white rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t("analytics.category_distribution")}</span>
              <span className="text-sm text-gray-500">{t("analytics.this_month")} {t("analytics.based_on")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.categoryDistribution.map((item) => {
                const IconComponent = categoryIcons[item.category as keyof typeof categoryIcons] || MessageSquare;
                return (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 bg-${item.color}-500 rounded-full mr-3`}></div>
                      <span className="text-gray-700">{item.category === "텍스트" ? t("tools.filter_text") :
                                                      item.category === "이미지" ? t("tools.filter_image") :
                                                      item.category === "영상" ? t("tools.filter_video") :
                                                      item.category === "음성" ? t("tools.filter_voice") : item.category} AI</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className={`bg-${item.color}-500 h-2 rounded-full`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600">{item.percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular AI Tools This Week */}
      <Card className="bg-white rounded-xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t("analytics.rising_ai")}</span>
            <span className="text-sm text-gray-500">{t("analytics.growth_top20")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-sm font-medium text-gray-600">{t("analytics.rank")}</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600">{t("analytics.ai_tool")}</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600">{t("analytics.category")}</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600">{t("analytics.user_count")}</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600">{t("analytics.growth_rate")}</th>
                </tr>
              </thead>
              <tbody>
                {popularTools.slice(0, 20).map((tool) => {
                  const getRankColor = (rank: number) => {
                    if (rank === 1) return "bg-yellow-100 text-yellow-800";
                    if (rank === 2) return "bg-gray-100 text-gray-800";
                    if (rank === 3) return "bg-orange-100 text-orange-800";
                    if (rank <= 5) return "bg-blue-100 text-blue-800";
                    if (rank <= 10) return "bg-green-100 text-green-800";
                    return "bg-gray-50 text-gray-600";
                  };
                  
                  const getGrowthColor = (growth: number) => {
                    if (growth >= 20) return "text-green-600";
                    if (growth >= 15) return "text-green-500";
                    if (growth >= 10) return "text-yellow-600";
                    return "text-gray-600";
                  };
                  
                  const IconComponent = categoryIcons[tool.category as keyof typeof categoryIcons] || MessageSquare;
                  
                  return (
                    <tr key={tool.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4">
                        <span className={`inline-flex items-center justify-center w-7 h-7 text-sm font-bold rounded-full ${getRankColor(tool.rank)}`}>
                          {tool.rank}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 bg-${tool.category === '텍스트' ? 'blue' : tool.category === '이미지' ? 'purple' : tool.category === '영상' ? 'red' : tool.category === '음성' ? 'orange' : 'gray'}-100 rounded-lg flex items-center justify-center mr-3`}>
                            <IconComponent className={`text-${tool.category === '텍스트' ? 'blue' : tool.category === '이미지' ? 'purple' : tool.category === '영상' ? 'red' : tool.category === '음성' ? 'orange' : 'gray'}-600 h-4 w-4`} />
                          </div>
                          <div>
                            <div className="font-medium">{tool.name}</div>
                            <div className="text-xs text-gray-500">{tool.company}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge variant="secondary" className={`px-2 py-1 text-xs rounded-full bg-${tool.category === '텍스트' ? 'blue' : tool.category === '이미지' ? 'purple' : tool.category === '영상' ? 'red' : tool.category === '음성' ? 'orange' : 'gray'}-100 text-${tool.category === '텍스트' ? 'blue' : tool.category === '이미지' ? 'purple' : tool.category === '영상' ? 'red' : tool.category === '음성' ? 'orange' : 'gray'}-800`}>
                          {tool.category === "텍스트" ? t("tools.filter_text") :
                           tool.category === "이미지" ? t("tools.filter_image") :
                           tool.category === "영상" ? t("tools.filter_video") :
                           tool.category === "음성" ? t("tools.filter_voice") : tool.category}
                        </Badge>
                      </td>
                      <td className="py-4 text-gray-600">{tool.monthlyUsers}</td>
                      <td className="py-4">
                        <div className="flex items-center">
                          {tool.rank <= 3 && (
                            <span className="mr-1">
                              {tool.rank === 1 ? "🚀" : tool.rank === 2 ? "📈" : "⭐"}
                            </span>
                          )}
                          <span className={`font-medium ${getGrowthColor(tool.growth)}`}>
                            +{tool.growth}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
