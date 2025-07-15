import React, { createContext, useContext, useState, useMemo } from "react";

type Language = "ko" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("ko");

  const translations = useMemo(() => {
    if (language === "ko") {
      return {
        // Landing page
        "landing.hero.badge": "AI 도구 플랫폼",
        "landing.hero.title": "최고의 AI 도구를 ",
        "landing.hero.highlight": "한 곳에서",
        "landing.hero.subtitle": "업무 효율성을 높이고 창의성을 발휘할 수 있는 AI 솔루션을 찾아보세요",
        "landing.hero.cta": "지금 시작하기",
        "landing.hero.rating": "4.9/5 (2,000+ 리뷰)",
        
        "landing.stats.tools": "AI 도구",
        "landing.stats.users": "사용자",
        "landing.stats.satisfaction": "만족도",
        "landing.stats.categories": "카테고리",
        
        "landing.features.title": "왜 우리 플랫폼을 선택해야 할까요?",
        "landing.features.subtitle": "AI 도구 선택부터 활용까지, 모든 것을 간편하게",
        "landing.features.personalized.title": "개인화된 추천",
        "landing.features.personalized.desc": "사용자의 요구사항에 맞는 AI 도구를 추천해드립니다",
        "landing.features.curated.title": "엄선된 도구",
        "landing.features.curated.desc": "검증된 AI 도구만을 엄선하여 제공합니다",
        "landing.features.analytics.title": "상세한 분석",
        "landing.features.analytics.desc": "실시간 통계와 사용자 리뷰를 통한 객관적 정보",
        "landing.features.secure.title": "안전한 연동",
        "landing.features.secure.desc": "Google 인증을 통한 안전하고 간편한 로그인",
        
        "landing.cta.title": "지금 바로 시작하세요",
        "landing.cta.subtitle": "무료로 가입하고 당신에게 맞는 AI 도구를 찾아보세요",
        "landing.cta.button": "무료로 시작하기",
        "landing.cta.benefit1": "무료 가입",
        "landing.cta.benefit2": "즉시 사용 가능",
        
        // Navigation
        "nav.home": "홈",
        "nav.categories": "카테고리",
        "nav.bundles": "패키지",
        "nav.my_packages": "내 패키지",
        "nav.login": "로그인",
        "nav.logout": "로그아웃",
        "nav.privacy": "개인정보보호지침",
        "nav.rankings": "순위",
        
        // Home page
        "home.title": "나에게 맞는 AI는 무엇일까?",
        "home.subtitle": "50+ 엄선된 AI 도구 중에서 당신의 목적과 예산에 맞는 최적의 AI를 찾아보세요. 개인화된 추천부터 카테고리별 순위까지, 모든 정보가 한 곳에.",
        "home.quiz_button": "AI 추천 테스트",
        "home.custom_package": "맞춤 패키지 만들기",
        "home.popular_tools": "인기 AI 도구",
        "home.recommended_bundles": "추천 패키지",
        "home.analytics": "통계",
        "home.rankings": "순위",
        
        // AI Tools
        "tools.search_placeholder": "AI 도구 검색...",
        "tools.filter_all": "전체",
        "tools.filter_text": "텍스트",
        "tools.filter_image": "이미지", 
        "tools.filter_video": "영상",
        "tools.filter_voice": "음성",
        "tools.filter_music": "음악",
        "tools.filter_coding": "코딩",
        "tools.filter_analytics": "데이터분석",
        "tools.filter_design": "디자인",
        "tools.filter_marketing": "마케팅",
        "tools.filter_productivity": "생산성",
        "tools.filter_finance": "금융",
        "tools.filter_health": "건강",
        "tools.filter_travel": "여행",
        "tools.filter_realestate": "부동산",
        "tools.filter_education": "교육",
        "tools.filter_entertainment": "엔터테인먼트",
        "tools.pricing_free": "무료",
        "tools.pricing_freemium": "부분유료",
        "tools.pricing_paid": "유료",
        "tools.rating": "평점",
        "tools.visit_website": "웹사이트 방문",
        "tools.pros": "장점",
        "tools.cons": "단점",
        "tools.monthly_users": "월 사용자",
        "tools.ease_of_use": "사용 편의성",
        
        // Quiz
        "quiz.title": "AI 추천 테스트",
        "quiz.progress": "진행률",
        "quiz.next": "다음",
        "quiz.previous": "이전",
        "quiz.show_results": "결과 보기",
        "quiz.analyzing": "분석 중...",
        "quiz.results_title": "당신에게 추천하는 AI는...",
        "quiz.results_subtitle": "6가지 질문 분석을 바탕으로 개인화된 AI 도구를 추천해드립니다.",
        "quiz.match": "일치",
        "quiz.try_again": "다시 테스트하기",
        
        // Bundles
        "bundles.video_package": "영상 제작 패키지",
        "bundles.content_package": "콘텐츠 제작 패키지", 
        "bundles.data_package": "데이터 분석 패키지",
        "bundles.estimated_cost": "예상 비용",
        "bundles.view_details": "자세히 보기",
        "bundle.estimated_cost": "예상 월 비용",
        "bundle.start_package": "패키지 시작하기",
        
        // Analytics
        "analytics.total_users": "총 사용자",
        "analytics.daily_active": "일일 활성 사용자",
        "analytics.avg_session": "평균 세션 시간",
        "analytics.satisfaction": "만족도 점수",
        "analytics.category_distribution": "카테고리 분포",
        "analytics.popular_tools": "인기 도구",
        "analytics.growth": "성장률",
        "analytics.loading": "분석 데이터를 불러오는 중...",
        "analytics.usage_trend": "사용량 트렌드",
        "analytics.rising_ai": "이주의 급상승 AI",
        "analytics.rank": "순위",
        "analytics.ai_tool": "AI 도구",
        "analytics.category": "카테고리",
        "analytics.user_count": "사용자 수",
        "analytics.growth_rate": "성장률",
        "analytics.this_month": "이번 달",
        "analytics.vs_yesterday": "어제 대비",
        "analytics.vs_last_week": "전주 대비",
        "analytics.last_7_days": "지난 7일",
        "analytics.last_30_days": "지난 30일",
        "analytics.last_3_months": "지난 3개월",
        "analytics.based_on": "기준",
        "analytics.growth_top20": "성장률 기준 TOP 20",
        
        // Ranking
        "ranking.loading": "순위 데이터를 불러오는 중...",
        "ranking.this_month": "이번 달 기준",
        "ranking.users": "사용자",
        "ranking.vs_last_month": "전월 대비",
        "ranking.view_all": "전체 순위 보기",
        "ranking.all_tools_title": "전체 AI 도구 순위",
        "ranking.all_tools_subtitle": "사용자 평점과 인기도를 기준으로 한 전체 순위입니다",
        "ranking.total_tools": "총 51개의 도구",
        "ranking.overall_ranking": "전체 순위",
        "ranking.score": "점",
        
        // Package Builder
        "package.create_title": "커스텀 AI 패키지 만들기",
        "package.my_title": "내 패키지",
        "package.select_tools": "AI 도구 선택",
        "package.add": "추가",
        "package.package_details": "패키지 정보",
        "package.name": "패키지 이름",
        "package.description": "설명",
        "package.selected_tools": "선택된 도구",
        "package.remove": "제거",
        "package.estimated_cost": "예상 비용",
        "package.cancel": "취소",
        "package.save": "패키지 저장",
        "package.free": "무료",
        "package.role": "역할",
        "ranking.monthly_users": "월 사용자",
        "ranking.visit_now": "사용해보기",
        
        // Auth
        "auth.login_with_google": "Google로 로그인",
        "auth.unauthorized": "인증이 필요합니다",
        "auth.logging_in": "로그인 중...",
        
        // Common
        "common.loading": "로딩 중...",
        "common.error": "오류",
        "common.close": "닫기",
        "common.save": "저장",
        "common.cancel": "취소",
        "common.confirm": "확인",
        "common.edit": "편집",
        "common.delete": "삭제",
        "common.create": "생성",
        "common.update": "업데이트",
        "common.back_to_home": "홈으로 돌아가기",
        "common.view_more": "더 보기",
        "common.minutes": "분",
        
        // Helper for language checking
        "language": "ko",
      };
    } else {
      return {
        // Landing page
        "landing.hero.badge": "AI Tools Platform",
        "landing.hero.title": "Discover the Best AI Tools ",
        "landing.hero.highlight": "All in One Place",
        "landing.hero.subtitle": "Find AI solutions that boost your productivity and unleash your creativity",
        "landing.hero.cta": "Get Started Now",
        "landing.hero.rating": "4.9/5 (2,000+ reviews)",
        
        "landing.stats.tools": "AI Tools",
        "landing.stats.users": "Users",
        "landing.stats.satisfaction": "Satisfaction",
        "landing.stats.categories": "Categories",
        
        "landing.features.title": "Why Choose Our Platform?",
        "landing.features.subtitle": "From AI tool selection to utilization, everything made simple",
        "landing.features.personalized.title": "Personalized Recommendations",
        "landing.features.personalized.desc": "We recommend AI tools that match your specific requirements",
        "landing.features.curated.title": "Curated Tools",
        "landing.features.curated.desc": "Only verified and high-quality AI tools are featured",
        "landing.features.analytics.title": "Detailed Analytics",
        "landing.features.analytics.desc": "Objective information through real-time stats and user reviews",
        "landing.features.secure.title": "Secure Integration",
        "landing.features.secure.desc": "Safe and convenient login through Google authentication",
        
        "landing.cta.title": "Start Right Now",
        "landing.cta.subtitle": "Sign up for free and find the AI tools that fit you",
        "landing.cta.button": "Get Started Free",
        "landing.cta.benefit1": "Free Sign Up",
        "landing.cta.benefit2": "Instant Access",
        
        // Navigation
        "nav.home": "Home",
        "nav.categories": "Categories",
        "nav.bundles": "Bundles",
        "nav.my_packages": "My Packages",
        "nav.login": "Login",
        "nav.logout": "Logout",
        "nav.privacy": "Privacy Policy",
        "nav.rankings": "Rankings",
        
        // Home page
        "home.title": "Discover the Best AI Tools",
        "home.subtitle": "Find the perfect AI from 50+ curated tools that match your goals and budget. From personalized recommendations to category rankings, all the information in one place.",
        "home.quiz_button": "AI Recommendation Test",
        "home.custom_package": "Create Custom Package",
        "home.popular_tools": "Popular AI Tools",
        "home.recommended_bundles": "Recommended Bundles",
        "home.analytics": "Analytics",
        "home.rankings": "Rankings",
        
        // AI Tools
        "tools.search_placeholder": "Search AI tools...",
        "tools.filter_all": "All",
        "tools.filter_text": "Text",
        "tools.filter_image": "Image",
        "tools.filter_video": "Video", 
        "tools.filter_voice": "Voice",
        "tools.filter_music": "Music",
        "tools.filter_coding": "Coding",
        "tools.filter_analytics": "Analytics",
        "tools.filter_design": "Design",
        "tools.filter_marketing": "Marketing",
        "tools.filter_productivity": "Productivity",
        "tools.filter_finance": "Finance",
        "tools.filter_health": "Health",
        "tools.filter_travel": "Travel",
        "tools.filter_realestate": "Real Estate",
        "tools.filter_education": "Education",
        "tools.filter_entertainment": "Entertainment",
        "tools.pricing_free": "Free",
        "tools.pricing_freemium": "Freemium",
        "tools.pricing_paid": "Paid",
        "tools.rating": "Rating",
        "tools.visit_website": "Visit Website",
        "tools.pros": "Pros",
        "tools.cons": "Cons",
        "tools.monthly_users": "Monthly Users",
        "tools.ease_of_use": "Ease of Use",
        
        // Quiz
        "quiz.title": "AI Recommendation Test",
        "quiz.progress": "Progress",
        "quiz.next": "Next",
        "quiz.previous": "Previous",
        "quiz.show_results": "Show Results",
        "quiz.analyzing": "Analyzing...",
        "quiz.results_title": "AI Tools Recommended for You",
        "quiz.results_subtitle": "Personalized AI tool recommendations based on 6 question analysis.",
        "quiz.match": "match",
        "quiz.try_again": "Take Test Again",
        
        // Bundles
        "bundles.video_package": "Video Production Package",
        "bundles.content_package": "Content Creation Package",
        "bundles.data_package": "Data Analysis Package", 
        "bundles.estimated_cost": "Estimated Cost",
        "bundles.view_details": "View Details",
        "bundle.estimated_cost": "Estimated Monthly Cost",
        "bundle.start_package": "Start Package",
        
        // Analytics
        "analytics.total_users": "Total Users",
        "analytics.daily_active": "Daily Active Users",
        "analytics.avg_session": "Avg Session Time",
        "analytics.satisfaction": "Satisfaction Score",
        "analytics.category_distribution": "Category Distribution",
        "analytics.popular_tools": "Popular Tools",
        "analytics.growth": "Growth Rate",
        "analytics.loading": "Loading analytics data...",
        "analytics.usage_trend": "Usage Trends",
        "analytics.rising_ai": "Rising AI This Week",
        "analytics.rank": "Rank",
        "analytics.ai_tool": "AI Tool",
        "analytics.category": "Category",
        "analytics.user_count": "User Count",
        "analytics.growth_rate": "Growth Rate",
        "analytics.this_month": "this month",
        "analytics.vs_yesterday": "vs yesterday",
        "analytics.vs_last_week": "vs last week",
        "analytics.last_7_days": "Last 7 days",
        "analytics.last_30_days": "Last 30 days",
        "analytics.last_3_months": "Last 3 months",
        "analytics.based_on": "based on",
        "analytics.growth_top20": "TOP 20 by Growth Rate",
        
        // Ranking
        "ranking.loading": "Loading ranking data...",
        "ranking.this_month": "Based on this month",
        "ranking.users": "users",
        "ranking.vs_last_month": "vs last month",
        "ranking.view_all": "View All Rankings",
        "ranking.all_tools_title": "All AI Tools Ranking",
        "ranking.all_tools_subtitle": "Complete ranking based on user ratings and popularity",
        "ranking.total_tools": "Total 51 tools",
        "ranking.overall_ranking": "Overall Ranking",
        "ranking.score": "score",
        "ranking.monthly_users": "monthly users",
        "ranking.visit_now": "Visit Now",
        
        // Custom Package Builder
        "package.create_title": "Create Custom AI Package",
        "package.my_title": "My Packages",
        "package.select_tools": "Select AI Tools",
        "package.package_details": "Package Details",
        "package.name": "Package Name",
        "package.description": "Description",
        "package.selected_tools": "Selected Tools",
        "package.estimated_cost": "Estimated Cost",
        "package.save": "Save Package",
        "package.cancel": "Cancel",
        "package.free": "Free",
        "package.add": "Add",
        "package.remove": "Remove",
        "package.role": "Role",
        
        // Auth
        "auth.login_with_google": "Login with Google",
        "auth.unauthorized": "Authentication required",
        "auth.logging_in": "Logging in...",
        
        // Common
        "common.loading": "Loading...",
        "common.error": "Error",
        "common.close": "Close",
        "common.save": "Save",
        "common.cancel": "Cancel",
        "common.confirm": "Confirm",
        "common.edit": "Edit",
        "common.delete": "Delete",
        "common.create": "Create",
        "common.update": "Update",
        "common.back_to_home": "Back to Home",
        "common.view_more": "View More",
        "common.minutes": "min",
        
        // Helper for language checking
        "language": "en",
      };
    }
  }, [language]);

  const t = (key: string): string => {
    if (translations[key as keyof typeof translations]) {
      return translations[key as keyof typeof translations];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}