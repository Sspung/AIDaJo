import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { useLanguage } from "../contexts/LanguageContext";
import { 
  ArrowLeft, 
  ExternalLink, 
  Star, 
  Users, 
  DollarSign, 
  CheckCircle, 
  Package,
  CreditCard,
  Clock,
  Shield
} from "lucide-react";
import type { AiBundle, AiTool } from "@shared/schema";

const pricingColors = {
  "free": "green",
  "freemium": "yellow", 
  "paid": "red"
};

const pricingLabels = {
  ko: {
    "free": "무료",
    "freemium": "일부 무료", 
    "paid": "유료"
  },
  en: {
    "free": "Free",
    "freemium": "Freemium",
    "paid": "Paid"
  }
};

export default function BundleDetail() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const bundleId = parseInt(params.id || '1');
  const { language, t } = useLanguage();

  const { data: bundle, isLoading: bundleLoading } = useQuery<AiBundle>({
    queryKey: ["/api/ai-bundles", bundleId],
    queryFn: async () => {
      const response = await fetch(`/api/ai-bundles/${bundleId}`);
      if (!response.ok) throw new Error("번들을 찾을 수 없습니다");
      return response.json();
    },
  });

  const { data: bundleTools = [], isLoading: toolsLoading } = useQuery<AiTool[]>({
    queryKey: ["/api/ai-bundles", bundleId, "tools"],
    queryFn: async () => {
      const response = await fetch(`/api/ai-bundles/${bundleId}/tools`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!bundle
  });

  if (bundleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="로딩 중"/>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {language === "ko" ? "번들을 찾을 수 없습니다" : "Bundle not found"}
          </h1>
          <Button onClick={() => setLocation("/")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {language === "ko" ? "홈으로 돌아가기" : "Back to Home"}
          </Button>
        </div>
      </div>
    );
  }

  const totalOriginalPrice = bundleTools.reduce((sum, tool) => {
    const basePrice = parseFloat(tool.pricing.replace(/[^0-9.]/g, '')) || 0;
    return sum + basePrice;
  }, 0);

  const bundlePrice = totalOriginalPrice * 0.8; // 20% 할인
  const savings = totalOriginalPrice - bundlePrice;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {language === "ko" ? "홈으로 돌아가기" : "Back to Home"}
          </Button>
        </div>
      </div>

      {/* Partnership Notice */}
      <div className="bg-blue-50 border-l-4 border-blue-400 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <span className="font-medium">
                  {language === "ko" ? "제휴 진행 중" : "Partnership in Progress"}
                </span> - {language === "ko" 
                  ? "현재 각 AI 서비스와 제휴 협상 중입니다. 제휴 완료 후 할인된 가격으로 패키지를 제공하며, 통합 관리 플랫폼을 통해 모든 AI 도구를 한 번에 이용할 수 있습니다."
                  : "We are currently negotiating partnerships with AI services. After completion, we'll offer discounted package prices and an integrated management platform for all AI tools."
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bundle Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Bundle Info */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl font-bold mb-2 flex items-center">
                      <Package className="mr-3 h-8 w-8 text-primary" />
                      {language === "ko" ? bundle.name : bundle.nameEn || bundle.name}
                    </CardTitle>
                    <p className="text-gray-600 text-lg">
                      {language === "ko" ? bundle.description : bundle.descriptionEn || bundle.description}
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-4">
                    {bundleTools.length}{language === "ko" ? "개 도구" : " Tools"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Package className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">{bundleTools.length}</div>
                    <div className="text-sm text-gray-600">{language === "ko" ? "AI 도구" : "AI Tools"}</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">${savings.toFixed(0)}</div>
                    <div className="text-sm text-gray-600">{language === "ko" ? "절약 금액" : "Savings"}</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Star className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">4.8</div>
                    <div className="text-sm text-gray-600">{language === "ko" ? "평균 평점" : "Avg Rating"}</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Clock className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-orange-600">{language === "ko" ? "즉시" : "Instant"}</div>
                    <div className="text-sm text-gray-600">{language === "ko" ? "이용 가능" : "Available"}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{language === "ko" ? "패키지 특징" : "Package Features"}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium">
                          {language === "ko" ? "통합 관리 (예정)" : "Integrated Management (Coming)"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {language === "ko" ? "모든 AI 도구를 하나의 대시보드에서 관리" : "Manage all AI tools from one dashboard"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium">
                          {language === "ko" ? "할인 혜택 (예정)" : "Discount Benefits (Coming)"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {language === "ko" ? "개별 구매 대비 최대 20% 할인" : "Up to 20% discount vs individual purchases"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium">
                          {language === "ko" ? "기술 지원 (예정)" : "Technical Support (Coming)"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {language === "ko" ? "AI DaJo 전용 고객 지원 서비스" : "Dedicated AI DaJo customer support service"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium">
                          {language === "ko" ? "자동 연동 (예정)" : "Auto Integration (Coming)"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {language === "ko" ? "계정 생성 및 API 키 자동 설정" : "Automatic account creation and API key setup"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Card */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-center">
                  {language === "ko" ? "패키지 가격" : "Package Price"}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div>
                  <div className="text-sm text-gray-500">
                    {language === "ko" ? `개별 구매 시: $${totalOriginalPrice.toFixed(0)}/월` : `Individual purchase: $${totalOriginalPrice.toFixed(0)}/month`}
                  </div>
                  <div className="text-4xl font-bold text-gray-400">
                    ${bundlePrice.toFixed(0)}
                    <span className="text-lg font-normal text-gray-500">
                      {language === "ko" ? "/월 (예정)" : "/month (Coming)"}
                    </span>
                  </div>
                  <div className="text-blue-600 font-medium">
                    {language === "ko" ? `최대 $${savings.toFixed(0)} 절약 가능` : `Save up to $${savings.toFixed(0)}`}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4" />
                    <span>{language === "ko" ? "30일 무료 체험" : "30-day free trial"}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <CreditCard className="h-4 w-4" />
                    <span>{language === "ko" ? "언제든 취소 가능" : "Cancel anytime"}</span>
                  </div>
                </div>

                <Button className="w-full" size="lg" disabled>
                  <CreditCard className="mr-2 h-5 w-5" />
                  {language === "ko" ? "제휴 완료 후 구매 가능" : "Available after partnership completion"}
                </Button>

                <p className="text-xs text-gray-500">
                  {language === "ko" 
                    ? <>제휴 완료 시 알림을 받으시려면 <a href="mailto:contact@aidajo.co.kr" className="text-blue-600 hover:underline">문의하기</a></>
                    : <>To receive notifications when partnership is complete, <a href="mailto:contact@aidajo.co.kr" className="text-blue-600 hover:underline">contact us</a></>
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Included Tools */}
        <Card>
          <CardHeader>
            <CardTitle>{language === "ko" ? "포함된 AI 도구" : "Included AI Tools"}</CardTitle>
            <p className="text-gray-600">
              {language === "ko" 
                ? `이 패키지에는 다음 ${bundleTools.length}개의 AI 도구가 포함되어 있습니다`
                : `This package includes the following ${bundleTools.length} AI tools`
              }
            </p>
          </CardHeader>
          <CardContent>
            {toolsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-gray-600 mt-2">
                  {language === "ko" ? "도구 정보 로딩 중..." : "Loading tool information..."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bundleTools.map((tool, index) => (
                  <Card key={tool.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold">{tool.name}</h3>
                            <Badge 
                              variant="outline" 
                              className={`text-${pricingColors[tool.pricing as keyof typeof pricingColors]}-600 border-${pricingColors[tool.pricing as keyof typeof pricingColors]}-200`}
                            >
                              {pricingLabels[language as keyof typeof pricingLabels][tool.pricing as keyof typeof pricingLabels.ko]}
                            </Badge>
                            <Badge variant="secondary">{tool.category}</Badge>
                          </div>
                          <p className="text-gray-600 mb-4">
                            {language === "ko" ? tool.description : tool.descriptionEn || tool.description}
                          </p>
                          
                          {/* Tool Details */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium">{tool.pricing}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm">{tool.rating}/5.0</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">
                                {tool.monthlyUsers} {language === "ko" ? "사용자" : "users"}
                              </span>
                            </div>
                          </div>

                          {/* Features */}
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">
                              {language === "ko" ? "주요 기능:" : "Key Features:"}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {tool.features?.slice(0, 3).map((feature, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="ml-6 text-right">
                          <div className="text-sm text-gray-500 mb-1">
                            {language === "ko" ? "개별 가격" : "Individual Price"}
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            {tool.pricing}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => setLocation(`/ai-detail?id=${tool.id}`)}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            {language === "ko" ? "상세보기" : "Details"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}