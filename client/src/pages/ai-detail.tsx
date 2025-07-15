import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Separator } from "../components/ui/separator";
import { 
  ArrowLeft, 
  ExternalLink, 
  Star, 
  Users, 
  DollarSign, 
  CheckCircle, 
  XCircle,
  MessageSquare,
  Image,
  Video,
  Mic,
  Code
} from "lucide-react";
import type { AiTool } from "@shared/schema";

const categoryIcons = {
  "텍스트": MessageSquare,
  "이미지": Image,
  "영상": Video,
  "음성": Mic,
  "코딩": Code,
};

const pricingInfo = {
  "free": {
    label: "완전 무료",
    color: "green",
    description: "모든 기능을 무료로 사용할 수 있습니다"
  },
  "freemium": {
    label: "일부 무료",
    color: "yellow", 
    description: "기본 기능은 무료, 고급 기능은 유료입니다"
  },
  "paid": {
    label: "유료",
    color: "red",
    description: "구독 또는 결제가 필요한 서비스입니다"
  }
};

const useCaseExamples = {
  "텍스트": [
    "블로그 글 작성 및 편집",
    "이메일 답변 자동화",
    "보고서 요약 및 분석",
    "언어 번역 및 교정",
    "창작 소설 및 시나리오"
  ],
  "이미지": [
    "마케팅 포스터 제작",
    "소셜미디어 썸네일",
    "제품 컨셉 아트",
    "캐릭터 일러스트",
    "배경 이미지 생성"
  ],
  "영상": [
    "유튜브 쇼츠 제작",
    "마케팅 프로모션 영상",
    "교육용 애니메이션",
    "소셜미디어 광고",
    "프레젠테이션 동영상"
  ],
  "음성": [
    "팟캐스트 나레이션",
    "오디오북 제작",
    "다국어 음성 안내",
    "유튜브 더빙",
    "회의록 음성 변환"
  ],
  "코딩": [
    "웹사이트 개발",
    "모바일 앱 제작",
    "데이터 분석 스크립트",
    "API 개발 및 연동",
    "코드 리뷰 및 최적화"
  ]
};

export default function AiDetail() {
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const aiId = params.get('id');

  const { data: aiTool, isLoading, error } = useQuery<AiTool>({
    queryKey: ["/api/ai-tools", aiId],
    queryFn: async () => {
      if (!aiId) throw new Error("AI ID is required");
      const response = await fetch(`/api/ai-tools/${aiId}`);
      if (!response.ok) throw new Error("Failed to fetch AI tool details");
      return response.json();
    },
    enabled: !!aiId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-500">AI 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !aiTool) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-red-500">AI 정보를 찾을 수 없습니다.</p>
            <Button 
              onClick={() => setLocation("/")}
              className="mt-4"
            >
              홈으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const IconComponent = categoryIcons[aiTool.category as keyof typeof categoryIcons] || MessageSquare;
  const pricing = pricingInfo[aiTool.pricing as keyof typeof pricingInfo];
  const examples = useCaseExamples[aiTool.category as keyof typeof useCaseExamples] || [];

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
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Card */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 bg-${aiTool.category === '텍스트' ? 'blue' : aiTool.category === '이미지' ? 'purple' : aiTool.category === '영상' ? 'red' : aiTool.category === '음성' ? 'orange' : 'gray'}-100 rounded-2xl flex items-center justify-center`}>
                      <IconComponent className={`text-${aiTool.category === '텍스트' ? 'blue' : aiTool.category === '이미지' ? 'purple' : aiTool.category === '영상' ? 'red' : aiTool.category === '음성' ? 'orange' : 'gray'}-600 h-8 w-8`} />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">{aiTool.name}</h1>
                      <p className="text-lg text-gray-600">{aiTool.company}</p>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`px-3 py-1 bg-${pricing.color}-100 text-${pricing.color}-800`}
                  >
                    {pricing.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-gray-700 mb-6">{aiTool.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm text-gray-600">평점</span>
                    <span className="font-semibold">{aiTool.rating}/100</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-gray-600">월 사용자</span>
                    <span className="font-semibold">{aiTool.monthlyUsers}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600">가격</span>
                    <span className="font-semibold">{pricing.label}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">사용자 만족도</span>
                    <span className="text-sm text-gray-600">{aiTool.rating}/100</span>
                  </div>
                  <Progress value={aiTool.rating} className="h-3" />
                </div>

                <Button 
                  onClick={() => window.open(aiTool.url, '_blank')}
                  className="w-full"
                  size="lg"
                >
                  <ExternalLink className="mr-2 h-5 w-5" />
                  {aiTool.name} 사용해보기
                </Button>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>주요 기능</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {aiTool.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Use Cases */}
            <Card>
              <CardHeader>
                <CardTitle>활용 예시</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {aiTool.name}은 다음과 같은 용도로 활용할 수 있습니다:
                </p>
                <div className="space-y-2">
                  {examples.map((example, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-primary font-medium">•</span>
                      <span className="text-gray-700">{example}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Pricing Details */}
            <Card>
              <CardHeader>
                <CardTitle>가격 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`p-4 rounded-lg bg-${pricing.color}-50 border border-${pricing.color}-200 mb-4`}>
                  <div className={`text-lg font-semibold text-${pricing.color}-800 mb-2`}>
                    {pricing.label}
                  </div>
                  <p className={`text-sm text-${pricing.color}-700`}>
                    {pricing.description}
                  </p>
                </div>
                
                {aiTool.pricing === 'freemium' && (
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">💡 <strong>팁:</strong> 무료 버전으로 먼저 시작해보세요!</p>
                    <p>기본 기능을 체험한 후 필요에 따라 업그레이드할 수 있습니다.</p>
                  </div>
                )}
                
                {aiTool.pricing === 'free' && (
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">🎉 <strong>완전 무료!</strong></p>
                    <p>모든 기능을 제한 없이 사용할 수 있습니다.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pros & Cons */}
            <Card>
              <CardHeader>
                <CardTitle>장단점 분석</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      장점
                    </h4>
                    <ul className="space-y-1">
                      {aiTool.pros.map((pro, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="text-green-500 mr-2">+</span>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold text-red-700 mb-2 flex items-center">
                      <XCircle className="h-4 w-4 mr-2" />
                      단점
                    </h4>
                    <ul className="space-y-1">
                      {aiTool.cons.map((con, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="text-red-500 mr-2">-</span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Info */}
            <Card>
              <CardHeader>
                <CardTitle>카테고리</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-${aiTool.category === '텍스트' ? 'blue' : aiTool.category === '이미지' ? 'purple' : aiTool.category === '영상' ? 'red' : aiTool.category === '음성' ? 'orange' : 'gray'}-100 rounded-lg flex items-center justify-center`}>
                    <IconComponent className={`text-${aiTool.category === '텍스트' ? 'blue' : aiTool.category === '이미지' ? 'purple' : aiTool.category === '영상' ? 'red' : aiTool.category === '음성' ? 'orange' : 'gray'}-600 h-5 w-5`} />
                  </div>
                  <div>
                    <div className="font-semibold">{aiTool.category} AI</div>
                    <div className="text-sm text-gray-600">
                      {aiTool.category} 관련 작업에 특화된 도구
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => window.open(`/category-ranking?category=${aiTool.category}`, '_blank')}
                >
                  {aiTool.category} AI 순위 보기
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}