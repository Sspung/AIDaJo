import {
  aiTools,
  aiBundles,
  quizQuestions,
  usageStats,
  customPackages,
  users,
  type AiTool,
  type InsertAiTool,
  type AiBundle,
  type InsertAiBundle,
  type QuizQuestion,
  type InsertQuizQuestion,
  type UsageStats,
  type InsertUsageStats,
  type User,
  type UpsertUser,
  type CustomPackage,
  type InsertCustomPackage
} from "@shared/schema";
import { db } from "./db";
import { eq, or, sql } from "drizzle-orm";

export interface IStorage {
  // AI Tools
  getAllAiTools(): Promise<AiTool[]>;
  getAiToolsByCategory(category: string): Promise<AiTool[]>;
  getAiToolById(id: number): Promise<AiTool | undefined>;
  searchAiTools(query: string): Promise<AiTool[]>;
  addAiTool(tool: InsertAiTool): Promise<AiTool>;
  updateAiTool(id: number, tool: Partial<InsertAiTool>): Promise<AiTool | undefined>;
  
  // AI Bundles
  getAllAiBundles(): Promise<AiBundle[]>;
  getAiBundleById(id: number): Promise<AiBundle | undefined>;
  
  // Quiz
  getAllQuizQuestions(): Promise<QuizQuestion[]>;
  
  // Analytics
  getUsageStats(): Promise<UsageStats[]>;
  getCategoryRankings(): Promise<{category: string, tools: AiTool[]}[]>;
  
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Custom Packages
  getUserCustomPackages(userId: string): Promise<CustomPackage[]>;
  createCustomPackage(packageData: InsertCustomPackage): Promise<CustomPackage>;
  getCustomPackageById(id: number): Promise<CustomPackage | undefined>;
  updateCustomPackage(id: number, updates: Partial<InsertCustomPackage>): Promise<CustomPackage | undefined>;
  deleteCustomPackage(id: number): Promise<boolean>;
}



export class MemStorage implements IStorage {
  private aiTools: Map<number, AiTool>;
  private aiBundles: Map<number, AiBundle>;
  private quizQuestions: Map<number, QuizQuestion>;
  private usageStats: Map<number, UsageStats>;
  private users: Map<string, User>;
  private customPackages: Map<number, CustomPackage>;
  private currentId: number;
  private currentPackageId: number;

  constructor() {
    this.aiTools = new Map();
    this.aiBundles = new Map();
    this.quizQuestions = new Map();
    this.usageStats = new Map();
    this.users = new Map();
    this.customPackages = new Map();
    this.currentId = 1;
    this.currentPackageId = 1;
    this.initializeData();
  }

  private initializeData() {
    // Initialize AI Tools - Expanded to 50+ tools
    const tools: InsertAiTool[] = [
      // 텍스트 AI (15개)
      {
        name: "ChatGPT",
        company: "OpenAI",
        description: "대화형 AI로 질문 답변, 글쓰기, 코딩 등 다양한 작업 수행",
        descriptionEn: "Conversational AI for Q&A, writing, coding and various tasks",
        category: "텍스트",
        pricing: "freemium",
        monthlyUsers: "180M+",
        rating: 95,
        pros: ["자연스러운 대화", "다양한 작업 지원", "높은 정확도"],
        cons: ["실시간 정보 제한", "이미지 생성 불가", "사용량 제한"],
        prosEn: ["Natural conversation", "Various task support", "High accuracy"],
        consEn: ["Real-time info limits", "No image generation", "Usage limits"],
        features: ["텍스트 생성", "코드 작성", "번역", "요약"],
        url: "https://chat.openai.com",
        iconCategory: "comment-alt"
      },
      {
        name: "Claude",
        company: "Anthropic",
        description: "안전하고 도움이 되는 AI 어시스턴트, 긴 문서 분석에 특화",
        descriptionEn: "Safe and helpful AI assistant, specialized in long document analysis",
        category: "텍스트",
        pricing: "free",
        monthlyUsers: "25M+",
        rating: 99,
        pros: ["긴 문맥 처리", "높은 안전성", "정확한 분석"],
        cons: ["제한된 기능", "느린 응답", "지역 제한"],
        prosEn: ["Long context processing", "High safety", "Accurate analysis"],
        consEn: ["Limited features", "Slow response", "Regional restrictions"],
        features: ["문서 분석", "코드 리뷰", "창작 지원"],
        url: "https://claude.ai",
        iconCategory: "comment-alt"
      },
      {
        name: "Gemini",
        company: "Google",
        description: "Google의 최신 대화형 AI, 멀티모달 기능 지원",
        descriptionEn: "Google's latest conversational AI with multimodal capabilities",
        category: "텍스트",
        pricing: "freemium",
        monthlyUsers: "45M+",
        rating: 93,
        pros: ["실시간 검색", "이미지 분석", "빠른 응답"],
        cons: ["일부 지역 제한", "창의성 부족", "편향성"],
        prosEn: ["Real-time search", "Image analysis", "Fast response"],
        consEn: ["Some regional limits", "Lack of creativity", "Bias issues"],
        features: ["대화형 AI", "이미지 분석", "실시간 검색"],
        url: "https://gemini.google.com",
        iconCategory: "comment-alt"
      },
      {
        name: "Perplexity",
        company: "Perplexity AI",
        description: "실시간 검색 기반 AI 답변 서비스",
        descriptionEn: "Real-time search-based AI answering service",
        category: "텍스트",
        pricing: "freemium",
        monthlyUsers: "10M+",
        rating: 87,
        pros: ["정확한 출처", "실시간 정보", "깔끔한 UI"],
        cons: ["제한된 무료", "느린 응답", "복잡한 질문 한계"],
        prosEn: ["Accurate sources", "Real-time info", "Clean UI"],
        consEn: ["Limited free tier", "Slow response", "Complex question limits"],
        features: ["검색 기반 답변", "출처 제공", "요약"],
        url: "https://perplexity.ai",
        iconCategory: "comment-alt"
      },
      {
        name: "Notion AI",
        company: "Notion",
        description: "노션 워크스페이스 통합 AI 글쓰기 도우미",
        descriptionEn: "Notion workspace integrated AI writing assistant",
        category: "텍스트",
        pricing: "freemium",
        monthlyUsers: "8M+",
        rating: 84,
        pros: ["노션 통합", "간편한 사용", "템플릿 제공"],
        cons: ["노션 의존", "제한된 기능", "느린 처리"],
        prosEn: ["Notion integration", "Easy to use", "Template provided"],
        consEn: ["Notion dependent", "Limited features", "Slow processing"],
        features: ["문서 작성", "요약", "번역"],
        url: "https://notion.so/ai",
        iconCategory: "comment-alt"
      },
      {
        name: "Jasper",
        company: "Jasper AI",
        description: "마케팅 콘텐츠 특화 AI 글쓰기 도구",
        descriptionEn: "Marketing content specialized AI writing tool",
        category: "텍스트",
        pricing: "paid",
        monthlyUsers: "5M+",
        rating: 82,
        pros: ["마케팅 특화", "템플릿 다양", "브랜드 톤 설정"],
        cons: ["높은 가격", "복잡한 UI", "학습 필요"],
        prosEn: ["Marketing specialized", "Various templates", "Brand tone setting"],
        consEn: ["High price", "Complex UI", "Learning required"],
        features: ["마케팅 카피", "블로그 작성", "소셜미디어"],
        url: "https://jasper.ai",
        iconCategory: "comment-alt"
      },
      {
        name: "Copy.ai",
        company: "Copy.ai",
        description: "마케팅 카피 생성에 특화된 AI 도구",
        category: "텍스트",
        pricing: "freemium",
        monthlyUsers: "4M+",
        rating: 79,
        pros: ["사용 간편", "다양한 템플릿", "무료 플랜"],
        cons: ["품질 편차", "제한된 무료", "창의성 부족"],
        features: ["카피 생성", "이메일 작성", "광고 문구"],
        url: "https://copy.ai",
        iconCategory: "comment-alt"
      },
      {
        name: "Grammarly",
        company: "Grammarly",
        description: "AI 기반 영문법 검사 및 글쓰기 개선 도구",
        category: "텍스트",
        pricing: "freemium",
        monthlyUsers: "30M+",
        rating: 91,
        pros: ["정확한 문법 검사", "스타일 개선", "플러그인 지원"],
        cons: ["영어 전용", "비싼 프리미엄", "과도한 제안"],
        features: ["문법 검사", "스타일 개선", "표절 검사"],
        url: "https://grammarly.com",
        iconCategory: "comment-alt"
      },
      {
        name: "Writesonic",
        company: "Writesonic",
        description: "다양한 형태의 콘텐츠 생성 AI 플랫폼",
        category: "텍스트",
        pricing: "freemium",
        monthlyUsers: "3M+",
        rating: 76,
        pros: ["다양한 기능", "합리적 가격", "API 제공"],
        cons: ["품질 불일치", "복잡한 인터페이스", "제한된 언어"],
        features: ["블로그 작성", "광고 카피", "소셜미디어"],
        url: "https://writesonic.com",
        iconCategory: "comment-alt"
      },
      {
        name: "QuillBot",
        company: "QuillBot",
        description: "AI 패러프레이징 및 요약 도구",
        category: "텍스트",
        pricing: "freemium",
        monthlyUsers: "12M+",
        rating: 83,
        pros: ["정확한 패러프레이징", "다양한 모드", "무료 버전"],
        cons: ["제한된 기능", "느린 처리", "번역 부정확"],
        features: ["패러프레이징", "요약", "문법 검사"],
        url: "https://quillbot.com",
        iconCategory: "comment-alt"
      },
      {
        name: "DeepL",
        company: "DeepL",
        description: "AI 기반 고품질 번역 서비스",
        category: "텍스트",
        pricing: "freemium",
        monthlyUsers: "20M+",
        rating: 94,
        pros: ["정확한 번역", "자연스러운 문체", "빠른 속도"],
        cons: ["제한된 언어", "파일 크기 제한", "비싼 프리미엄"],
        features: ["고품질 번역", "문서 번역", "API"],
        url: "https://deepl.com",
        iconCategory: "comment-alt"
      },
      {
        name: "Wordtune",
        company: "AI21 Labs",
        description: "AI 기반 영어 글쓰기 개선 도구",
        category: "텍스트",
        pricing: "freemium",
        monthlyUsers: "6M+",
        rating: 78,
        pros: ["자연스러운 개선", "간단한 사용", "실시간 제안"],
        cons: ["영어 전용", "제한된 무료", "창의성 부족"],
        features: ["문장 개선", "톤 조정", "확장/축약"],
        url: "https://wordtune.com",
        iconCategory: "comment-alt"
      },
      {
        name: "Rytr",
        company: "Rytr",
        description: "저렴한 AI 콘텐츠 생성 도구",
        category: "텍스트",
        pricing: "freemium",
        monthlyUsers: "2M+",
        rating: 74,
        pros: ["저렴한 가격", "다양한 템플릿", "사용 편의"],
        cons: ["품질 편차", "제한된 언어", "창의성 부족"],
        features: ["블로그 작성", "이메일", "광고 문구"],
        url: "https://rytr.me",
        iconCategory: "comment-alt"
      },
      {
        name: "Otter.ai",
        company: "Otter.ai",
        description: "실시간 음성 인식 및 회의 기록 AI",
        category: "텍스트",
        pricing: "freemium",
        monthlyUsers: "15M+",
        rating: 86,
        pros: ["정확한 음성 인식", "실시간 전사", "협업 기능"],
        cons: ["영어 중심", "배경 소음 민감", "제한된 무료"],
        features: ["음성 전사", "회의 기록", "요약"],
        url: "https://otter.ai",
        iconCategory: "comment-alt"
      },
      {
        name: "Character.AI",
        company: "Character.AI",
        description: "캐릭터 기반 대화형 AI 플랫폼",
        category: "텍스트",
        pricing: "freemium",
        monthlyUsers: "18M+",
        rating: 81,
        pros: ["다양한 캐릭터", "창의적 대화", "무료 사용"],
        cons: ["불안정한 서버", "품질 편차", "제한된 기능"],
        features: ["캐릭터 대화", "롤플레이", "창작"],
        url: "https://character.ai",
        iconCategory: "comment-alt"
      },

      // 이미지 AI (12개)
      {
        name: "Midjourney",
        company: "Midjourney Inc.",
        description: "텍스트 프롬프트로 고품질 아트워크와 이미지 생성",
        category: "이미지",
        pricing: "paid",
        monthlyUsers: "15M+",
        rating: 98,
        pros: ["뛰어난 이미지 품질", "예술적 스타일", "활발한 커뮤니티"],
        cons: ["디스코드 필수", "높은 가격", "학습 곡선"],
        features: ["이미지 생성", "스타일 조정", "고해상도 출력"],
        url: "https://midjourney.com",
        iconCategory: "image"
      },
      {
        name: "DALL-E 3",
        company: "OpenAI",
        description: "OpenAI의 최신 이미지 생성 AI",
        category: "이미지",
        pricing: "paid",
        monthlyUsers: "12M+",
        rating: 96,
        pros: ["정확한 프롬프트 이해", "안전성", "ChatGPT 통합"],
        cons: ["높은 비용", "속도 제한", "스타일 제한"],
        features: ["텍스트-이미지", "프롬프트 개선", "안전 필터"],
        url: "https://openai.com/dall-e-3",
        iconCategory: "image"
      },
      {
        name: "Stable Diffusion",
        company: "Stability AI",
        description: "오픈소스 이미지 생성 AI 모델",
        category: "이미지",
        pricing: "free",
        monthlyUsers: "8M+",
        rating: 89,
        pros: ["무료 사용", "커스터마이징", "로컬 실행"],
        cons: ["복잡한 설정", "하드웨어 요구", "품질 편차"],
        features: ["이미지 생성", "img2img", "인페인팅"],
        url: "https://stability.ai",
        iconCategory: "image"
      },
      {
        name: "Leonardo.ai",
        company: "Leonardo.ai",
        description: "게임 및 창작물을 위한 AI 이미지 생성",
        category: "이미지",
        pricing: "freemium",
        monthlyUsers: "5M+",
        rating: 85,
        pros: ["게임 특화", "무료 크레딧", "다양한 모델"],
        cons: ["복잡한 UI", "제한된 무료", "느린 생성"],
        features: ["캐릭터 생성", "배경 제작", "컨셉 아트"],
        url: "https://leonardo.ai",
        iconCategory: "image"
      },
      {
        name: "Adobe Firefly",
        company: "Adobe",
        description: "Adobe Creative Cloud 통합 AI 이미지 생성",
        category: "이미지",
        pricing: "freemium",
        monthlyUsers: "10M+",
        rating: 87,
        pros: ["Creative Cloud 통합", "상업적 안전", "고품질"],
        cons: ["Adobe 구독 필요", "제한된 스타일", "높은 비용"],
        features: ["이미지 생성", "텍스트 효과", "벡터 변환"],
        url: "https://firefly.adobe.com",
        iconCategory: "image"
      },
      {
        name: "Canva AI",
        company: "Canva",
        description: "Canva 통합 AI 디자인 도구",
        category: "이미지",
        pricing: "freemium",
        monthlyUsers: "22M+",
        rating: 82,
        pros: ["쉬운 사용", "템플릿 다양", "무료 기능"],
        cons: ["제한된 AI 기능", "품질 제한", "워터마크"],
        features: ["자동 디자인", "배경 제거", "이미지 생성"],
        url: "https://canva.com",
        iconCategory: "image"
      },
      {
        name: "Playground AI",
        company: "Playground AI",
        description: "사용자 친화적 AI 이미지 생성 플랫폼",
        category: "이미지",
        pricing: "freemium",
        monthlyUsers: "3M+",
        rating: 78,
        pros: ["간단한 UI", "무료 사용", "빠른 생성"],
        cons: ["제한된 기능", "품질 편차", "서버 불안정"],
        features: ["이미지 생성", "편집", "필터"],
        url: "https://playgroundai.com",
        iconCategory: "image"
      },
      {
        name: "Ideogram",
        company: "Ideogram",
        description: "텍스트가 포함된 이미지 생성에 특화",
        category: "이미지",
        pricing: "freemium",
        monthlyUsers: "2M+",
        rating: 79,
        pros: ["텍스트 렌더링", "무료 사용", "빠른 속도"],
        cons: ["제한된 스타일", "베타 상태", "기능 제한"],
        features: ["텍스트 이미지", "로고 생성", "타이포그래피"],
        url: "https://ideogram.ai",
        iconCategory: "image"
      },
      {
        name: "DreamStudio",
        company: "Stability AI",
        description: "Stable Diffusion의 웹 인터페이스",
        category: "이미지",
        pricing: "freemium",
        monthlyUsers: "4M+",
        rating: 83,
        pros: ["고급 설정", "빠른 생성", "API 접근"],
        cons: ["복잡한 UI", "크레딧 시스템", "학습 곡선"],
        features: ["이미지 생성", "스타일 믹싱", "배치 생성"],
        url: "https://dreamstudio.ai",
        iconCategory: "image"
      },
      {
        name: "Artbreeder",
        company: "Artbreeder",
        description: "유전자 알고리즘 기반 이미지 진화",
        category: "이미지",
        pricing: "freemium",
        monthlyUsers: "1M+",
        rating: 75,
        pros: ["독특한 방식", "무료 기능", "커뮤니티"],
        cons: ["제한된 컨트롤", "느린 생성", "품질 편차"],
        features: ["이미지 믹싱", "포트레이트", "풍경"],
        url: "https://artbreeder.com",
        iconCategory: "image"
      },
      {
        name: "Remove.bg",
        company: "Kaleido AI",
        description: "AI 기반 자동 배경 제거 도구",
        category: "이미지",
        pricing: "freemium",
        monthlyUsers: "25M+",
        rating: 92,
        pros: ["정확한 배경 제거", "빠른 처리", "API 제공"],
        cons: ["단일 기능", "제한된 무료", "복잡한 이미지 한계"],
        features: ["배경 제거", "배치 처리", "API"],
        url: "https://remove.bg",
        iconCategory: "image"
      },
      {
        name: "Upscale.media",
        company: "Upscale.media",
        description: "AI 기반 이미지 업스케일링 서비스",
        category: "이미지",
        pricing: "freemium",
        monthlyUsers: "6M+",
        rating: 88,
        pros: ["고품질 업스케일", "빠른 처리", "무료 사용"],
        cons: ["제한된 크기", "단일 기능", "대기 시간"],
        features: ["이미지 확대", "노이즈 제거", "선명화"],
        url: "https://upscale.media",
        iconCategory: "image"
      },

      // 영상 AI (8개)
      {
        name: "Runway ML",
        company: "Runway",
        description: "AI 기반 영상 편집 및 생성 도구",
        category: "영상",
        pricing: "freemium",
        monthlyUsers: "8M+",
        rating: 85,
        pros: ["다양한 영상 도구", "사용자 친화적", "빠른 처리"],
        cons: ["높은 구독료", "제한된 무료", "인터넷 필수"],
        features: ["영상 생성", "배경 제거", "모션 트래킹"],
        url: "https://runwayml.com",
        iconCategory: "video"
      },
      {
        name: "Synthesia",
        company: "Synthesia",
        description: "AI 아바타를 이용한 영상 생성 플랫폼",
        category: "영상",
        pricing: "paid",
        monthlyUsers: "3M+",
        rating: 89,
        pros: ["실제같은 아바타", "다국어 지원", "쉬운 사용"],
        cons: ["높은 가격", "제한된 커스터마이징", "부자연스러운 제스처"],
        features: ["아바타 영상", "다국어 음성", "템플릿"],
        url: "https://synthesia.io",
        iconCategory: "video"
      },
      {
        name: "Pika Labs",
        company: "Pika Labs",
        description: "텍스트로 영상을 생성하는 AI 도구",
        category: "영상",
        pricing: "freemium",
        monthlyUsers: "2M+",
        rating: 82,
        pros: ["간단한 텍스트 입력", "창의적 결과", "무료 사용"],
        cons: ["짧은 영상", "품질 편차", "대기 시간"],
        features: ["텍스트-영상", "이미지 애니메이션", "스타일 조정"],
        url: "https://pika.art",
        iconCategory: "video"
      },
      {
        name: "Luma Dream Machine",
        company: "Luma AI",
        description: "고품질 AI 영상 생성 도구",
        category: "영상",
        pricing: "freemium",
        monthlyUsers: "1M+",
        rating: 87,
        pros: ["고품질 출력", "실제같은 움직임", "무료 체험"],
        cons: ["제한된 무료", "긴 처리 시간", "베타 상태"],
        features: ["영상 생성", "3D 씬", "카메라 모션"],
        url: "https://lumalabs.ai",
        iconCategory: "video"
      },
      {
        name: "Invideo AI",
        company: "InVideo",
        description: "AI 기반 마케팅 영상 제작 도구",
        category: "영상",
        pricing: "freemium",
        monthlyUsers: "5M+",
        rating: 78,
        pros: ["마케팅 특화", "템플릿 다양", "자동 편집"],
        cons: ["워터마크", "제한된 무료", "복잡한 UI"],
        features: ["자동 편집", "템플릿", "음성 생성"],
        url: "https://invideo.io",
        iconCategory: "video"
      },
      {
        name: "Pictory",
        company: "Pictory",
        description: "긴 형태 콘텐츠를 짧은 영상으로 변환",
        category: "영상",
        pricing: "freemium",
        monthlyUsers: "2M+",
        rating: 76,
        pros: ["자동 요약", "쉬운 사용", "다양한 형식"],
        cons: ["제한된 커스터마이징", "품질 편차", "높은 가격"],
        features: ["콘텐츠 요약", "자동 편집", "자막 생성"],
        url: "https://pictory.ai",
        iconCategory: "video"
      },
      {
        name: "Fliki",
        company: "Fliki",
        description: "텍스트를 영상으로 변환하는 AI 도구",
        category: "영상",
        pricing: "freemium",
        monthlyUsers: "3M+",
        rating: 79,
        pros: ["간단한 사용", "다국어 지원", "무료 플랜"],
        cons: ["제한된 음성", "워터마크", "템플릿 제한"],
        features: ["텍스트-영상", "음성 생성", "자막"],
        url: "https://fliki.ai",
        iconCategory: "video"
      },
      {
        name: "Steve AI",
        company: "Steve AI",
        description: "애니메이션 영상 제작 AI 플랫폼",
        category: "영상",
        pricing: "freemium",
        monthlyUsers: "1M+",
        rating: 73,
        pros: ["애니메이션 특화", "캐릭터 다양", "템플릿"],
        cons: ["제한된 실사", "품질 편차", "복잡한 가격"],
        features: ["애니메이션", "캐릭터", "스토리보드"],
        url: "https://steve.ai",
        iconCategory: "video"
      },

      // 음성 AI (8개)
      {
        name: "ElevenLabs",
        company: "ElevenLabs",
        description: "자연스러운 AI 음성 생성 및 음성 복제",
        category: "음성",
        pricing: "freemium",
        monthlyUsers: "5M+",
        rating: 92,
        pros: ["자연스러운 음성", "다양한 언어", "음성 복제"],
        cons: ["제한된 무료", "긴 처리 시간", "윤리적 우려"],
        features: ["음성 생성", "음성 복제", "다국어 지원"],
        url: "https://elevenlabs.io",
        iconCategory: "microphone"
      },
      {
        name: "Murf AI",
        company: "Murf AI",
        description: "전문적인 음성 생성 및 편집 플랫폼",
        category: "음성",
        pricing: "freemium",
        monthlyUsers: "3M+",
        rating: 86,
        pros: ["전문적인 품질", "편집 기능", "다양한 음성"],
        cons: ["높은 가격", "제한된 무료", "복잡한 UI"],
        features: ["음성 생성", "편집", "배경음"],
        url: "https://murf.ai",
        iconCategory: "microphone"
      },
      {
        name: "Speechify",
        company: "Speechify",
        description: "텍스트를 자연스러운 음성으로 변환",
        category: "음성",
        pricing: "freemium",
        monthlyUsers: "8M+",
        rating: 84,
        pros: ["자연스러운 읽기", "빠른 속도", "다양한 음성"],
        cons: ["제한된 무료", "구독 모델", "일부 부정확"],
        features: ["텍스트 읽기", "속도 조절", "하이라이트"],
        url: "https://speechify.com",
        iconCategory: "microphone"
      },
      {
        name: "Resemble AI",
        company: "Resemble AI",
        description: "실시간 음성 복제 및 생성 API",
        category: "음성",
        pricing: "paid",
        monthlyUsers: "1M+",
        rating: 88,
        pros: ["실시간 생성", "API 제공", "높은 품질"],
        cons: ["복잡한 설정", "높은 비용", "기술적 요구"],
        features: ["음성 복제", "실시간 변환", "API"],
        url: "https://resemble.ai",
        iconCategory: "microphone"
      },
      {
        name: "PlayHT",
        company: "PlayHT",
        description: "온라인 텍스트-음성 변환 서비스",
        category: "음성",
        pricing: "freemium",
        monthlyUsers: "2M+",
        rating: 80,
        pros: ["간단한 사용", "다양한 언어", "무료 체험"],
        cons: ["제한된 무료", "품질 편차", "느린 처리"],
        features: ["텍스트-음성", "다국어", "다운로드"],
        url: "https://play.ht",
        iconCategory: "microphone"
      },
      {
        name: "Descript",
        company: "Descript",
        description: "AI 기반 오디오/비디오 편집 플랫폼",
        category: "음성",
        pricing: "freemium",
        monthlyUsers: "4M+",
        rating: 89,
        pros: ["혁신적인 편집", "음성 복제", "팟캐스트 특화"],
        cons: ["학습 곡선", "제한된 무료", "복잡한 기능"],
        features: ["오디오 편집", "음성 복제", "전사"],
        url: "https://descript.com",
        iconCategory: "microphone"
      },
      {
        name: "LOVO AI",
        company: "LOVO",
        description: "AI 음성 생성 및 비디오 제작 플랫폼",
        category: "음성",
        pricing: "freemium",
        monthlyUsers: "2M+",
        rating: 77,
        pros: ["비디오 통합", "다양한 음성", "간단한 UI"],
        cons: ["제한된 기능", "품질 편차", "높은 가격"],
        features: ["음성 생성", "비디오 제작", "자막"],
        url: "https://lovo.ai",
        iconCategory: "microphone"
      },
      {
        name: "Narakeet",
        company: "Narakeet",
        description: "PowerPoint에서 비디오로 변환하는 음성 도구",
        category: "음성",
        pricing: "freemium",
        monthlyUsers: "1M+",
        rating: 75,
        pros: ["PowerPoint 통합", "간단한 사용", "무료 체험"],
        cons: ["제한된 기능", "품질 제한", "단순한 UI"],
        features: ["프레젠테이션 음성", "비디오 변환", "자막"],
        url: "https://narakeet.com",
        iconCategory: "microphone"
      },

      // 코딩 AI (8개)
      {
        name: "GitHub Copilot",
        company: "GitHub",
        description: "AI 기반 코드 자동완성 및 생성 도구",
        category: "코딩",
        pricing: "paid",
        monthlyUsers: "1M+",
        rating: 88,
        pros: ["빠른 코딩", "다양한 언어", "IDE 통합"],
        cons: ["구독 필수", "의존성 증가", "보안 우려"],
        features: ["코드 완성", "버그 수정", "테스트 생성"],
        url: "https://github.com/features/copilot",
        iconCategory: "code"
      },
      {
        name: "Cursor",
        company: "Anysphere",
        description: "AI 기반 코드 에디터",
        category: "코딩",
        pricing: "freemium",
        monthlyUsers: "800K+",
        rating: 91,
        pros: ["직관적인 AI", "빠른 편집", "자연어 명령"],
        cons: ["새로운 툴", "제한된 확장", "학습 필요"],
        features: ["AI 편집", "자연어 코딩", "리팩토링"],
        url: "https://cursor.sh",
        iconCategory: "code"
      },
      {
        name: "Tabnine",
        company: "Tabnine",
        description: "AI 코드 자동완성 어시스턴트",
        category: "코딩",
        pricing: "freemium",
        monthlyUsers: "1.2M+",
        rating: 85,
        pros: ["다양한 IDE", "로컬 실행", "개인정보 보호"],
        cons: ["제한된 무료", "느린 반응", "설정 복잡"],
        features: ["코드 완성", "로컬 AI", "팀 학습"],
        url: "https://tabnine.com",
        iconCategory: "code"
      },
      {
        name: "Codeium",
        company: "Codeium",
        description: "무료 AI 코딩 어시스턴트",
        category: "코딩",
        pricing: "freemium",
        monthlyUsers: "600K+",
        rating: 83,
        pros: ["완전 무료", "빠른 속도", "다양한 언어"],
        cons: ["상대적으로 새로움", "제한된 기능", "품질 편차"],
        features: ["코드 완성", "검색", "채팅"],
        url: "https://codeium.com",
        iconCategory: "code"
      },
      {
        name: "Amazon CodeWhisperer",
        company: "Amazon",
        description: "AWS 통합 AI 코딩 도구",
        category: "코딩",
        pricing: "freemium",
        monthlyUsers: "500K+",
        rating: 79,
        pros: ["AWS 통합", "보안 스캔", "무료 개인용"],
        cons: ["AWS 편향", "제한된 언어", "복잡한 설정"],
        features: ["코드 완성", "보안 스캔", "AWS 통합"],
        url: "https://aws.amazon.com/codewhisperer",
        iconCategory: "code"
      },
      {
        name: "Replit Ghostwriter",
        company: "Replit",
        description: "온라인 IDE 통합 AI 코딩 도구",
        category: "코딩",
        pricing: "freemium",
        monthlyUsers: "400K+",
        rating: 81,
        pros: ["클라우드 기반", "협업 기능", "즉시 실행"],
        cons: ["인터넷 필수", "제한된 무료", "성능 제한"],
        features: ["코드 완성", "생성", "설명"],
        url: "https://replit.com",
        iconCategory: "code"
      },
      {
        name: "Sourcegraph Cody",
        company: "Sourcegraph",
        description: "코드베이스 이해를 위한 AI 어시스턴트",
        category: "코딩",
        pricing: "freemium",
        monthlyUsers: "300K+",
        rating: 82,
        pros: ["코드베이스 분석", "컨텍스트 이해", "정확한 답변"],
        cons: ["복잡한 설정", "제한된 무료", "큰 프로젝트 필요"],
        features: ["코드 분석", "질문 답변", "리팩토링"],
        url: "https://sourcegraph.com/cody",
        iconCategory: "code"
      },
      {
        name: "Kodezi",
        company: "Kodezi",
        description: "코드 최적화 및 디버깅 AI",
        category: "코딩",
        pricing: "freemium",
        monthlyUsers: "200K+",
        rating: 76,
        pros: ["코드 최적화", "버그 수정", "설명 제공"],
        cons: ["제한된 언어", "품질 편차", "느린 처리"],
        features: ["코드 최적화", "버그 수정", "성능 개선"],
        url: "https://kodezi.com",
        iconCategory: "code"
      },
      
      // 음악 생성 AI (8개)
      {
        name: "Suno AI",
        company: "Suno",
        description: "텍스트로 완전한 노래 생성",
        descriptionEn: "Generate complete songs from text",
        category: "음악",
        pricing: "freemium",
        monthlyUsers: "5M+",
        rating: 92,
        pros: ["가사 생성", "멜로디 생성", "보컬 합성"],
        cons: ["제한된 무료", "긴 처리 시간", "저작권 우려"],
        prosEn: ["Lyric generation", "Melody generation", "Vocal synthesis"],
        consEn: ["Limited free tier", "Long processing time", "Copyright concerns"],
        features: ["가사 생성", "멜로디 생성", "보컬 합성", "다양한 장르"],
        url: "https://suno.ai",
        iconCategory: "music"
      },
      {
        name: "Udio",
        company: "Udio",
        description: "고품질 AI 음악 생성 플랫폼",
        descriptionEn: "High-quality AI music generation platform",
        category: "음악",
        pricing: "freemium",
        monthlyUsers: "3M+",
        rating: 90,
        pros: ["고품질 출력", "스타일 믹싱", "보컬 생성"],
        cons: ["베타 상태", "제한된 무료", "대기 시간"],
        prosEn: ["High-quality output", "Style mixing", "Vocal generation"],
        consEn: ["Beta state", "Limited free tier", "Wait times"],
        features: ["음악 생성", "스타일 믹싱", "보컬 생성"],
        url: "https://udio.com",
        iconCategory: "music"
      },
      {
        name: "Mubert",
        company: "Mubert",
        description: "실시간 AI 음악 스트리밍",
        descriptionEn: "Real-time AI music streaming",
        category: "음악",
        pricing: "freemium",
        monthlyUsers: "2M+",
        rating: 84,
        pros: ["실시간 생성", "분위기별 음악", "API 제공"],
        cons: ["제한된 커스터마이징", "반복적 패턴", "저작권 불분명"],
        prosEn: ["Real-time generation", "Mood-based music", "API available"],
        consEn: ["Limited customization", "Repetitive patterns", "Copyright unclear"],
        features: ["실시간 생성", "분위기별 음악", "스트리밍", "API"],
        url: "https://mubert.com",
        iconCategory: "music"
      },
      {
        name: "AIVA",
        company: "AIVA Technologies",
        description: "클래식 음악 작곡 AI",
        descriptionEn: "AI classical music composer",
        category: "음악",
        pricing: "freemium",
        monthlyUsers: "500K+",
        rating: 86,
        pros: ["클래식 전문", "오케스트라", "MIDI 생성"],
        cons: ["장르 제한", "복잡한 UI", "높은 학습 곡선"],
        prosEn: ["Classical specialization", "Orchestra", "MIDI generation"],
        consEn: ["Genre limitation", "Complex UI", "High learning curve"],
        features: ["클래식 작곡", "오케스트라", "MIDI 생성"],
        url: "https://aiva.ai",
        iconCategory: "music"
      },
      {
        name: "Soundraw",
        company: "Soundraw",
        description: "로열티 프리 AI 음악 생성",
        descriptionEn: "Royalty-free AI music generation",
        category: "음악",
        pricing: "paid",
        monthlyUsers: "1M+",
        rating: 82,
        pros: ["로열티 프리", "커스터마이징", "상업적 사용"],
        cons: ["유료 전용", "제한된 장르", "단조로운 결과"],
        prosEn: ["Royalty-free", "Customization", "Commercial use"],
        consEn: ["Paid only", "Limited genres", "Monotonous results"],
        features: ["로열티 프리", "커스터마이징", "장르 선택"],
        url: "https://soundraw.io",
        iconCategory: "music"
      },
      {
        name: "Boomy",
        company: "Boomy",
        description: "쉬운 AI 음악 제작 및 수익화",
        descriptionEn: "Easy AI music creation and monetization",
        category: "음악",
        pricing: "freemium",
        monthlyUsers: "3M+",
        rating: 80,
        pros: ["간편 제작", "수익화", "플레이리스트"],
        cons: ["품질 제한", "창의성 부족", "수익 분배"],
        prosEn: ["Easy creation", "Monetization", "Playlists"],
        consEn: ["Quality limitations", "Lack of creativity", "Revenue sharing"],
        features: ["간편 제작", "수익화", "플레이리스트"],
        url: "https://boomy.com",
        iconCategory: "music"
      },
      {
        name: "Amper Music",
        company: "Shutterstock",
        description: "콘텐츠용 AI 음악 생성",
        descriptionEn: "AI music generation for content",
        category: "음악",
        pricing: "paid",
        monthlyUsers: "800K+",
        rating: 84,
        pros: ["콘텐츠 특화", "분위기 조절", "길이 조절"],
        cons: ["구독 필요", "제한된 무료", "복잡한 가격"],
        prosEn: ["Content-focused", "Mood control", "Length control"],
        consEn: ["Subscription required", "Limited free", "Complex pricing"],
        features: ["콘텐츠 음악", "분위기 조절", "길이 조절"],
        url: "https://ampermusic.com",
        iconCategory: "music"
      },
      {
        name: "Loudly",
        company: "Loudly",
        description: "크리에이터를 위한 AI 음악",
        descriptionEn: "AI music for creators",
        category: "음악",
        pricing: "freemium",
        monthlyUsers: "1.5M+",
        rating: 82,
        pros: ["크리에이터 특화", "분위기별", "라이센스"],
        cons: ["제한된 무료", "품질 편차", "느린 생성"],
        prosEn: ["Creator-focused", "Mood-based", "Licensing"],
        consEn: ["Limited free", "Quality variance", "Slow generation"],
        features: ["크리에이터 특화", "분위기별", "라이센스"],
        url: "https://loudly.com",
        iconCategory: "music"
      },
      
      // 추가 텍스트 AI (30개 더)
      {
        name: "Copy.ai",
        company: "Copy.ai",
        description: "AI 카피라이팅 도구",
        descriptionEn: "AI copywriting tool",
        category: "텍스트",
        pricing: "freemium",
        monthlyUsers: "2M+",
        rating: 85,
        pros: ["다양한 템플릿", "빠른 생성", "여러 언어"],
        cons: ["창의성 부족", "반복적", "품질 편차"],
        prosEn: ["Various templates", "Fast generation", "Multiple languages"],
        consEn: ["Lack of creativity", "Repetitive", "Quality variance"],
        features: ["카피라이팅", "이메일", "소셜미디어", "블로그"],
        url: "https://copy.ai",
        iconCategory: "text"
      },
      {
        name: "Writesonic",
        company: "Writesonic",
        description: "AI 글쓰기 어시스턴트",
        descriptionEn: "AI writing assistant",
        category: "텍스트",
        pricing: "freemium",
        monthlyUsers: "1.5M+",
        rating: 83,
        pros: ["SEO 최적화", "다양한 포맷", "실시간 편집"],
        cons: ["유료 제한", "복잡한 UI", "느린 로딩"],
        prosEn: ["SEO optimization", "Various formats", "Real-time editing"],
        consEn: ["Premium limitations", "Complex UI", "Slow loading"],
        features: ["SEO 글쓰기", "광고 카피", "이메일", "기사"],
        url: "https://writesonic.com",
        iconCategory: "text"
      },
      {
        name: "Rytr",
        company: "Rytr",
        description: "간편한 AI 콘텐츠 생성기",
        descriptionEn: "Simple AI content generator",
        category: "텍스트",
        pricing: "freemium",
        monthlyUsers: "800K+",
        rating: 81,
        pros: ["저렴한 가격", "간단한 UI", "빠른 속도"],
        cons: ["제한된 창의성", "기본적 기능", "짧은 텍스트"],
        prosEn: ["Affordable pricing", "Simple UI", "Fast speed"],
        consEn: ["Limited creativity", "Basic features", "Short text"],
        features: ["블로그", "이메일", "광고", "소셜미디어"],
        url: "https://rytr.me",
        iconCategory: "text"
      },
      {
        name: "Hypotenuse AI",
        company: "Hypotenuse AI",
        description: "제품 설명 전문 AI",
        descriptionEn: "Product description specialist AI",
        category: "텍스트",
        pricing: "paid",
        monthlyUsers: "500K+",
        rating: 84,
        pros: ["제품 특화", "대량 생성", "API 제공"],
        cons: ["높은 가격", "제한된 용도", "복잡한 설정"],
        prosEn: ["Product specialized", "Bulk generation", "API available"],
        consEn: ["High price", "Limited use", "Complex setup"],
        features: ["제품 설명", "SEO", "대량 생성", "API"],
        url: "https://hypotenuse.ai",
        iconCategory: "text"
      },
      {
        name: "Peppertype.ai",
        company: "Peppertype",
        description: "마케팅 콘텐츠 AI",
        descriptionEn: "Marketing content AI",
        category: "텍스트",
        pricing: "freemium",
        monthlyUsers: "400K+",
        rating: 82,
        pros: ["마케팅 특화", "브랜드 일관성", "협업 기능"],
        cons: ["제한된 무료", "학습 곡선", "느린 생성"],
        prosEn: ["Marketing focused", "Brand consistency", "Collaboration"],
        consEn: ["Limited free", "Learning curve", "Slow generation"],
        features: ["마케팅", "브랜드 보이스", "협업", "템플릿"],
        url: "https://peppertype.ai",
        iconCategory: "text"
      },
      
      // 추가 이미지 AI (25개 더)
      {
        name: "Stable Diffusion",
        company: "Stability AI",
        description: "오픈소스 이미지 생성 AI",
        descriptionEn: "Open-source image generation AI",
        category: "이미지",
        pricing: "free",
        monthlyUsers: "10M+",
        rating: 88,
        pros: ["오픈소스", "높은 자유도", "커뮤니티"],
        cons: ["기술적 난이도", "설정 복잡", "하드웨어 요구"],
        prosEn: ["Open source", "High flexibility", "Community"],
        consEn: ["Technical difficulty", "Complex setup", "Hardware requirements"],
        features: ["이미지 생성", "스타일 변환", "인페인팅", "커스터마이징"],
        url: "https://stability.ai",
        iconCategory: "image"
      },
      {
        name: "Leonardo.ai",
        company: "Leonardo.ai",
        description: "게임 아트 특화 AI",
        descriptionEn: "Game art specialized AI",
        category: "이미지",
        pricing: "freemium",
        monthlyUsers: "3M+",
        rating: 86,
        pros: ["게임 특화", "일관된 스타일", "3D 지원"],
        cons: ["제한된 무료", "게임 편향", "복잡한 UI"],
        prosEn: ["Game focused", "Consistent style", "3D support"],
        consEn: ["Limited free", "Game biased", "Complex UI"],
        features: ["게임 아트", "캐릭터", "환경", "3D"],
        url: "https://leonardo.ai",
        iconCategory: "image"
      },
      {
        name: "Firefly",
        company: "Adobe",
        description: "어도비 창의 AI",
        descriptionEn: "Adobe creative AI",
        category: "이미지",
        pricing: "freemium",
        monthlyUsers: "5M+",
        rating: 87,
        pros: ["어도비 통합", "상업적 안전", "고품질"],
        cons: ["구독 필요", "제한된 무료", "복잡한 라이센스"],
        prosEn: ["Adobe integration", "Commercial safe", "High quality"],
        consEn: ["Subscription required", "Limited free", "Complex licensing"],
        features: ["이미지 생성", "텍스트 효과", "벡터", "통합"],
        url: "https://firefly.adobe.com",
        iconCategory: "image"
      },
      {
        name: "BlueWillow",
        company: "BlueWillow",
        description: "무료 AI 이미지 생성기",
        descriptionEn: "Free AI image generator",
        category: "이미지",
        pricing: "free",
        monthlyUsers: "2M+",
        rating: 79,
        pros: ["완전 무료", "Discord 기반", "커뮤니티"],
        cons: ["품질 제한", "Discord 필수", "느린 생성"],
        prosEn: ["Completely free", "Discord based", "Community"],
        consEn: ["Quality limitations", "Discord required", "Slow generation"],
        features: ["이미지 생성", "스타일 다양", "커뮤니티", "무료"],
        url: "https://bluewillow.ai",
        iconCategory: "image"
      },
      {
        name: "Lexica",
        company: "Lexica",
        description: "Stable Diffusion 검색 엔진",
        descriptionEn: "Stable Diffusion search engine",
        category: "이미지",
        pricing: "freemium",
        monthlyUsers: "1.5M+",
        rating: 82,
        pros: ["프롬프트 검색", "영감 제공", "무료 생성"],
        cons: ["제한된 기능", "품질 편차", "느린 인터페이스"],
        prosEn: ["Prompt search", "Inspiration", "Free generation"],
        consEn: ["Limited features", "Quality variance", "Slow interface"],
        features: ["프롬프트 검색", "이미지 생성", "영감", "갤러리"],
        url: "https://lexica.art",
        iconCategory: "image"
      },
      
      // 추가 영상 AI (20개 더)
      {
        name: "Pika Labs",
        company: "Pika Labs",
        description: "텍스트를 영상으로 변환",
        descriptionEn: "Text to video generation",
        category: "영상",
        pricing: "freemium",
        monthlyUsers: "2M+",
        rating: 84,
        pros: ["쉬운 사용", "빠른 생성", "다양한 스타일"],
        cons: ["짧은 영상", "품질 제한", "워터마크"],
        prosEn: ["Easy to use", "Fast generation", "Various styles"],
        consEn: ["Short videos", "Quality limitations", "Watermark"],
        features: ["텍스트→영상", "스타일 변환", "애니메이션", "편집"],
        url: "https://pika.art",
        iconCategory: "video"
      },
      {
        name: "Synthesia",
        company: "Synthesia",
        description: "AI 아바타 영상 제작",
        descriptionEn: "AI avatar video creation",
        category: "영상",
        pricing: "paid",
        monthlyUsers: "1M+",
        rating: 86,
        pros: ["리얼 아바타", "다국어", "전문적"],
        cons: ["높은 가격", "제한된 커스터마이징", "구독 필수"],
        prosEn: ["Realistic avatars", "Multilingual", "Professional"],
        consEn: ["High cost", "Limited customization", "Subscription required"],
        features: ["AI 아바타", "다국어", "프레젠테이션", "교육"],
        url: "https://synthesia.io",
        iconCategory: "video"
      },
      {
        name: "D-ID",
        company: "D-ID",
        description: "사진을 말하는 영상으로",
        descriptionEn: "Turn photos into talking videos",
        category: "영상",
        pricing: "freemium",
        monthlyUsers: "800K+",
        rating: 83,
        pros: ["사진 활용", "리얼한 립싱크", "빠른 처리"],
        cons: ["제한된 무료", "얼굴만 가능", "배경 제한"],
        prosEn: ["Photo utilization", "Realistic lip sync", "Fast processing"],
        consEn: ["Limited free", "Face only", "Background limitations"],
        features: ["사진→영상", "립싱크", "아바타", "프레젠테이션"],
        url: "https://d-id.com",
        iconCategory: "video"
      },
      {
        name: "InVideo",
        company: "InVideo",
        description: "AI 영상 편집 플랫폼",
        descriptionEn: "AI video editing platform",
        category: "영상",
        pricing: "freemium",
        monthlyUsers: "1.5M+",
        rating: 85,
        pros: ["템플릿 풍부", "쉬운 편집", "자동 자막"],
        cons: ["워터마크", "제한된 무료", "느린 렌더링"],
        prosEn: ["Rich templates", "Easy editing", "Auto subtitles"],
        consEn: ["Watermark", "Limited free", "Slow rendering"],
        features: ["영상 편집", "템플릿", "자막", "음악"],
        url: "https://invideo.io",
        iconCategory: "video"
      },
      {
        name: "Fliki",
        company: "Fliki",
        description: "텍스트를 AI 음성 영상으로",
        descriptionEn: "Text to AI voice video",
        category: "영상",
        pricing: "freemium",
        monthlyUsers: "600K+",
        rating: 82,
        pros: ["AI 음성", "빠른 제작", "다국어"],
        cons: ["제한된 커스터마이징", "음성 품질", "템플릿 의존"],
        prosEn: ["AI voice", "Fast creation", "Multilingual"],
        consEn: ["Limited customization", "Voice quality", "Template dependent"],
        features: ["AI 음성", "자동 영상", "다국어", "템플릿"],
        url: "https://fliki.ai",
        iconCategory: "video"
      },
      
      // 추가 음성 AI (15개 더)
      {
        name: "Murf",
        company: "Murf",
        description: "AI 음성 생성 플랫폼",
        descriptionEn: "AI voice generation platform",
        category: "음성",
        pricing: "freemium",
        monthlyUsers: "1M+",
        rating: 85,
        pros: ["자연스러운 음성", "다양한 목소리", "감정 표현"],
        cons: ["제한된 무료", "높은 가격", "편집 제한"],
        prosEn: ["Natural voice", "Various voices", "Emotion expression"],
        consEn: ["Limited free", "High price", "Editing limitations"],
        features: ["AI 음성", "감정", "다국어", "편집"],
        url: "https://murf.ai",
        iconCategory: "voice"
      },
      {
        name: "Speechify",
        company: "Speechify",
        description: "텍스트 읽기 AI",
        descriptionEn: "Text-to-speech AI",
        category: "음성",
        pricing: "freemium",
        monthlyUsers: "2M+",
        rating: 83,
        pros: ["빠른 읽기", "다양한 속도", "모바일 앱"],
        cons: ["제한된 무료", "음성 품질", "언어 제한"],
        prosEn: ["Fast reading", "Various speeds", "Mobile app"],
        consEn: ["Limited free", "Voice quality", "Language limitations"],
        features: ["텍스트 읽기", "속도 조절", "모바일", "오디오북"],
        url: "https://speechify.com",
        iconCategory: "voice"
      },
      {
        name: "Resemble AI",
        company: "Resemble AI",
        description: "음성 복제 AI",
        descriptionEn: "Voice cloning AI",
        category: "음성",
        pricing: "paid",
        monthlyUsers: "300K+",
        rating: 87,
        pros: ["정확한 복제", "실시간", "감정 표현"],
        cons: ["높은 가격", "윤리적 우려", "복잡한 설정"],
        prosEn: ["Accurate cloning", "Real-time", "Emotion expression"],
        consEn: ["High cost", "Ethical concerns", "Complex setup"],
        features: ["음성 복제", "실시간", "감정", "API"],
        url: "https://resemble.ai",
        iconCategory: "voice"
      },
      {
        name: "Descript",
        company: "Descript",
        description: "오디오/영상 편집 AI",
        descriptionEn: "Audio/video editing AI",
        category: "음성",
        pricing: "freemium",
        monthlyUsers: "800K+",
        rating: 86,
        pros: ["텍스트 편집", "음성 복제", "협업"],
        cons: ["학습 곡선", "제한된 무료", "느린 처리"],
        prosEn: ["Text editing", "Voice cloning", "Collaboration"],
        consEn: ["Learning curve", "Limited free", "Slow processing"],
        features: ["텍스트 편집", "음성 복제", "협업", "팟캐스트"],
        url: "https://descript.com",
        iconCategory: "voice"
      },
      {
        name: "Lovo",
        company: "Lovo",
        description: "AI 음성 및 비디오",
        descriptionEn: "AI voice and video",
        category: "음성",
        pricing: "freemium",
        monthlyUsers: "500K+",
        rating: 84,
        pros: ["AI 아바타", "음성 다양", "비디오 통합"],
        cons: ["제한된 무료", "품질 편차", "복잡한 UI"],
        prosEn: ["AI avatars", "Voice variety", "Video integration"],
        consEn: ["Limited free", "Quality variance", "Complex UI"],
        features: ["AI 음성", "아바타", "비디오", "다국어"],
        url: "https://lovo.ai",
        iconCategory: "voice"
      },
      
      // 추가 코딩 AI (20개 더)
      {
        name: "Replit Ghostwriter",
        company: "Replit",
        description: "브라우저 기반 코딩 AI",
        descriptionEn: "Browser-based coding AI",
        category: "코딩",
        pricing: "freemium",
        monthlyUsers: "2M+",
        rating: 85,
        pros: ["브라우저 기반", "실시간 협업", "자동 배포"],
        cons: ["제한된 무료", "인터넷 필요", "성능 제한"],
        prosEn: ["Browser-based", "Real-time collaboration", "Auto deployment"],
        consEn: ["Limited free", "Internet required", "Performance limitations"],
        features: ["코드 완성", "협업", "배포", "멀티 언어"],
        url: "https://replit.com",
        iconCategory: "code"
      },
      {
        name: "Amazon CodeWhisperer",
        company: "Amazon",
        description: "AWS 통합 코딩 AI",
        descriptionEn: "AWS integrated coding AI",
        category: "코딩",
        pricing: "freemium",
        monthlyUsers: "1.5M+",
        rating: 84,
        pros: ["AWS 통합", "보안 스캔", "무료 개인용"],
        cons: ["AWS 편향", "제한된 언어", "복잡한 설정"],
        prosEn: ["AWS integration", "Security scan", "Free for personal"],
        consEn: ["AWS biased", "Limited languages", "Complex setup"],
        features: ["코드 생성", "보안 스캔", "AWS 통합", "자동완성"],
        url: "https://aws.amazon.com/codewhisperer",
        iconCategory: "code"
      },
      {
        name: "Cursor",
        company: "Cursor",
        description: "AI 네이티브 코드 에디터",
        descriptionEn: "AI-native code editor",
        category: "코딩",
        pricing: "freemium",
        monthlyUsers: "800K+",
        rating: 88,
        pros: ["AI 네이티브", "빠른 편집", "컨텍스트 이해"],
        cons: ["새로운 도구", "학습 필요", "제한된 플러그인"],
        prosEn: ["AI native", "Fast editing", "Context understanding"],
        consEn: ["New tool", "Learning required", "Limited plugins"],
        features: ["AI 편집", "컨텍스트", "빠른 수정", "리팩토링"],
        url: "https://cursor.sh",
        iconCategory: "code"
      },
      {
        name: "Sourcegraph Cody",
        company: "Sourcegraph",
        description: "코드베이스 이해 AI",
        descriptionEn: "Codebase understanding AI",
        category: "코딩",
        pricing: "freemium",
        monthlyUsers: "400K+",
        rating: 83,
        pros: ["코드베이스 분석", "컨텍스트 검색", "엔터프라이즈"],
        cons: ["복잡한 설정", "높은 가격", "학습 곡선"],
        prosEn: ["Codebase analysis", "Context search", "Enterprise"],
        consEn: ["Complex setup", "High cost", "Learning curve"],
        features: ["코드 분석", "검색", "설명", "리팩토링"],
        url: "https://sourcegraph.com/cody",
        iconCategory: "code"
      },
      {
        name: "Blackbox AI",
        company: "Blackbox",
        description: "코드 검색 및 생성 AI",
        descriptionEn: "Code search and generation AI",
        category: "코딩",
        pricing: "freemium",
        monthlyUsers: "600K+",
        rating: 81,
        pros: ["코드 검색", "다양한 언어", "빠른 응답"],
        cons: ["품질 편차", "제한된 컨텍스트", "광고"],
        prosEn: ["Code search", "Multiple languages", "Fast response"],
        consEn: ["Quality variance", "Limited context", "Ads"],
        features: ["코드 검색", "생성", "자동완성", "설명"],
        url: "https://blackbox.ai",
        iconCategory: "code"
      },
      
      // 새로운 카테고리들 추가
      // 데이터 분석 AI (25개)
      {
        name: "DataRobot",
        company: "DataRobot",
        description: "자동 머신러닝 플랫폼",
        descriptionEn: "Automated machine learning platform",
        category: "데이터분석",
        pricing: "paid",
        monthlyUsers: "500K+",
        rating: 89,
        pros: ["자동 ML", "엔터프라이즈", "높은 정확도"],
        cons: ["높은 가격", "복잡한 인터페이스", "학습 필요"],
        prosEn: ["Auto ML", "Enterprise", "High accuracy"],
        consEn: ["High cost", "Complex interface", "Learning required"],
        features: ["자동 ML", "예측 모델", "데이터 분석", "시각화"],
        url: "https://datarobot.com",
        iconCategory: "analytics"
      },
      {
        name: "H2O.ai",
        company: "H2O.ai",
        description: "오픈소스 AI 플랫폼",
        descriptionEn: "Open source AI platform",
        category: "데이터분석",
        pricing: "freemium",
        monthlyUsers: "800K+",
        rating: 87,
        pros: ["오픈소스", "확장성", "다양한 알고리즘"],
        cons: ["기술적 난이도", "복잡한 설정", "문서 부족"],
        prosEn: ["Open source", "Scalability", "Various algorithms"],
        consEn: ["Technical difficulty", "Complex setup", "Lack of documentation"],
        features: ["머신러닝", "딥러닝", "데이터 처리", "시각화"],
        url: "https://h2o.ai",
        iconCategory: "analytics"
      },
      {
        name: "Tableau Prep",
        company: "Tableau",
        description: "데이터 준비 및 분석",
        descriptionEn: "Data preparation and analysis",
        category: "데이터분석",
        pricing: "paid",
        monthlyUsers: "1.2M+",
        rating: 86,
        pros: ["시각화 강력", "직관적 UI", "기업 표준"],
        cons: ["높은 가격", "학습 곡선", "성능 이슈"],
        prosEn: ["Powerful visualization", "Intuitive UI", "Enterprise standard"],
        consEn: ["High cost", "Learning curve", "Performance issues"],
        features: ["데이터 시각화", "대시보드", "분석", "공유"],
        url: "https://tableau.com",
        iconCategory: "analytics"
      },
      {
        name: "Power BI",
        company: "Microsoft",
        description: "비즈니스 인텔리전스 도구",
        descriptionEn: "Business intelligence tool",
        category: "데이터분석",
        pricing: "paid",
        monthlyUsers: "2M+",
        rating: 85,
        pros: ["MS 생태계", "저렴한 가격", "클라우드 통합"],
        cons: ["제한된 커스터마이징", "복잡한 라이센스", "성능 제한"],
        prosEn: ["MS ecosystem", "Affordable", "Cloud integration"],
        consEn: ["Limited customization", "Complex licensing", "Performance limits"],
        features: ["대시보드", "리포트", "데이터 연결", "협업"],
        url: "https://powerbi.microsoft.com",
        iconCategory: "analytics"
      },
      {
        name: "Qlik Sense",
        company: "Qlik",
        description: "셀프서비스 BI 플랫폼",
        descriptionEn: "Self-service BI platform",
        category: "데이터분석",
        pricing: "paid",
        monthlyUsers: "600K+",
        rating: 84,
        pros: ["연관 분석", "직관적", "모바일 지원"],
        cons: ["높은 가격", "복잡한 설정", "제한된 커스터마이징"],
        prosEn: ["Associative analysis", "Intuitive", "Mobile support"],
        consEn: ["High cost", "Complex setup", "Limited customization"],
        features: ["연관 분석", "대시보드", "모바일", "협업"],
        url: "https://qlik.com",
        iconCategory: "analytics"
      },
      
      // 디자인 AI (20개)
      {
        name: "Canva AI",
        company: "Canva",
        description: "AI 디자인 어시스턴트",
        descriptionEn: "AI design assistant",
        category: "디자인",
        pricing: "freemium",
        monthlyUsers: "8M+",
        rating: 88,
        pros: ["쉬운 사용", "다양한 템플릿", "협업 기능"],
        cons: ["제한된 무료", "템플릿 의존", "고급 기능 부족"],
        prosEn: ["Easy to use", "Various templates", "Collaboration"],
        consEn: ["Limited free", "Template dependent", "Lack of advanced features"],
        features: ["AI 디자인", "템플릿", "협업", "브랜딩"],
        url: "https://canva.com",
        iconCategory: "design"
      },
      {
        name: "Figma AI",
        company: "Figma",
        description: "협업 디자인 도구",
        descriptionEn: "Collaborative design tool",
        category: "디자인",
        pricing: "freemium",
        monthlyUsers: "4M+",
        rating: 91,
        pros: ["실시간 협업", "강력한 기능", "플러그인 생태계"],
        cons: ["학습 곡선", "복잡한 UI", "성능"],
        prosEn: ["Real-time collaboration", "Powerful features", "Plugin ecosystem"],
        consEn: ["Learning curve", "Complex UI", "Performance"],
        features: ["UI/UX 디자인", "프로토타입", "협업", "플러그인"],
        url: "https://figma.com",
        iconCategory: "design"
      },
      {
        name: "Looka",
        company: "Looka",
        description: "AI 로고 생성기",
        descriptionEn: "AI logo generator",
        category: "디자인",
        pricing: "paid",
        monthlyUsers: "1M+",
        rating: 83,
        pros: ["빠른 로고 생성", "브랜드 키트", "다양한 포맷"],
        cons: ["제한된 커스터마이징", "유료 전용", "평범한 디자인"],
        prosEn: ["Fast logo generation", "Brand kit", "Various formats"],
        consEn: ["Limited customization", "Paid only", "Generic designs"],
        features: ["로고 생성", "브랜드 키트", "명함", "웹사이트"],
        url: "https://looka.com",
        iconCategory: "design"
      },
      {
        name: "Khroma",
        company: "Khroma",
        description: "AI 색상 팔레트 생성기",
        descriptionEn: "AI color palette generator",
        category: "디자인",
        pricing: "freemium",
        monthlyUsers: "300K+",
        rating: 81,
        pros: ["개인화된 팔레트", "무한 조합", "색상 검색"],
        cons: ["제한된 기능", "느린 학습", "단순한 UI"],
        prosEn: ["Personalized palette", "Infinite combinations", "Color search"],
        consEn: ["Limited features", "Slow learning", "Simple UI"],
        features: ["색상 팔레트", "개인화", "검색", "저장"],
        url: "https://khroma.co",
        iconCategory: "design"
      },
      {
        name: "Logomaker",
        company: "Logomaker",
        description: "온라인 로고 제작 도구",
        descriptionEn: "Online logo creation tool",
        category: "디자인",
        pricing: "paid",
        monthlyUsers: "500K+",
        rating: 79,
        pros: ["간단한 사용", "저렴한 가격", "빠른 제작"],
        cons: ["제한된 옵션", "품질 제한", "유료 전용"],
        prosEn: ["Simple use", "Affordable", "Fast creation"],
        consEn: ["Limited options", "Quality limitations", "Paid only"],
        features: ["로고 제작", "아이콘", "템플릿", "편집"],
        url: "https://logomaker.com",
        iconCategory: "design"
      },
      
      // 마케팅 AI (15개)
      {
        name: "HubSpot AI",
        company: "HubSpot",
        description: "마케팅 자동화 플랫폼",
        descriptionEn: "Marketing automation platform",
        category: "마케팅",
        pricing: "freemium",
        monthlyUsers: "3M+",
        rating: 87,
        pros: ["올인원 플랫폼", "CRM 통합", "무료 시작"],
        cons: ["복잡한 설정", "높은 가격", "학습 곡선"],
        prosEn: ["All-in-one platform", "CRM integration", "Free start"],
        consEn: ["Complex setup", "High cost", "Learning curve"],
        features: ["마케팅 자동화", "CRM", "이메일", "분석"],
        url: "https://hubspot.com",
        iconCategory: "marketing"
      },
      {
        name: "Mailchimp AI",
        company: "Mailchimp",
        description: "이메일 마케팅 AI",
        descriptionEn: "Email marketing AI",
        category: "마케팅",
        pricing: "freemium",
        monthlyUsers: "2.5M+",
        rating: 85,
        pros: ["사용 편의성", "자동화", "분석"],
        cons: ["제한된 무료", "디자인 제한", "고급 기능 부족"],
        prosEn: ["Ease of use", "Automation", "Analytics"],
        consEn: ["Limited free", "Design limitations", "Lack of advanced features"],
        features: ["이메일 마케팅", "자동화", "분석", "A/B 테스트"],
        url: "https://mailchimp.com",
        iconCategory: "marketing"
      },
      {
        name: "Hootsuite AI",
        company: "Hootsuite",
        description: "소셜미디어 관리 AI",
        descriptionEn: "Social media management AI",
        category: "마케팅",
        pricing: "paid",
        monthlyUsers: "1.8M+",
        rating: 84,
        pros: ["다중 플랫폼", "스케줄링", "분석"],
        cons: ["높은 가격", "복잡한 UI", "제한된 무료"],
        prosEn: ["Multi-platform", "Scheduling", "Analytics"],
        consEn: ["High cost", "Complex UI", "Limited free"],
        features: ["소셜미디어 관리", "스케줄링", "분석", "팀 협업"],
        url: "https://hootsuite.com",
        iconCategory: "marketing"
      },
      {
        name: "Buffer AI",
        company: "Buffer",
        description: "소셜미디어 스케줄러",
        descriptionEn: "Social media scheduler",
        category: "마케팅",
        pricing: "freemium",
        monthlyUsers: "1.5M+",
        rating: 83,
        pros: ["간단한 UI", "스케줄링", "분석"],
        cons: ["제한된 기능", "플랫폼 제한", "고급 기능 유료"],
        prosEn: ["Simple UI", "Scheduling", "Analytics"],
        consEn: ["Limited features", "Platform limitations", "Advanced features paid"],
        features: ["포스트 스케줄링", "분석", "팀 관리", "콘텐츠 계획"],
        url: "https://buffer.com",
        iconCategory: "marketing"
      },
      {
        name: "Later AI",
        company: "Later",
        description: "비주얼 소셜미디어 플래너",
        descriptionEn: "Visual social media planner",
        category: "마케팅",
        pricing: "freemium",
        monthlyUsers: "1.2M+",
        rating: 82,
        pros: ["비주얼 플래너", "Instagram 특화", "사용 편의"],
        cons: ["플랫폼 제한", "기능 제한", "고급 기능 유료"],
        prosEn: ["Visual planner", "Instagram focused", "Ease of use"],
        consEn: ["Platform limitations", "Feature limitations", "Advanced features paid"],
        features: ["비주얼 플래너", "스케줄링", "해시태그", "분석"],
        url: "https://later.com",
        iconCategory: "marketing"
      },
      
      // 추가 AI 도구들 (200개 더)
      // 생산성 AI (30개)
      {
        name: "Notion AI",
        company: "Notion",
        description: "스마트 노트 및 문서 작성",
        descriptionEn: "Smart note-taking and document writing",
        category: "생산성",
        pricing: "freemium",
        monthlyUsers: "4M+",
        rating: 89,
        pros: ["올인원 워크스페이스", "AI 글쓰기", "협업"],
        cons: ["복잡한 UI", "학습 곡선", "느린 로딩"],
        prosEn: ["All-in-one workspace", "AI writing", "Collaboration"],
        consEn: ["Complex UI", "Learning curve", "Slow loading"],
        features: ["노트 작성", "프로젝트 관리", "협업", "템플릿"],
        url: "https://notion.so",
        iconCategory: "productivity"
      },
      {
        name: "Monday.com AI",
        company: "Monday.com",
        description: "프로젝트 관리 자동화",
        descriptionEn: "Project management automation",
        category: "생산성",
        pricing: "paid",
        monthlyUsers: "2M+",
        rating: 87,
        pros: ["시각적 관리", "자동화", "통합"],
        cons: ["높은 가격", "복잡한 설정", "제한된 무료"],
        prosEn: ["Visual management", "Automation", "Integrations"],
        consEn: ["High cost", "Complex setup", "Limited free"],
        features: ["프로젝트 관리", "자동화", "대시보드", "리포트"],
        url: "https://monday.com",
        iconCategory: "productivity"
      },
      {
        name: "Asana AI",
        company: "Asana",
        description: "팀 작업 관리 AI",
        descriptionEn: "Team work management AI",
        category: "생산성",
        pricing: "freemium",
        monthlyUsers: "3M+",
        rating: 85,
        pros: ["직관적 UI", "팀 협업", "무료 플랜"],
        cons: ["고급 기능 제한", "복잡한 프로젝트", "느린 성능"],
        prosEn: ["Intuitive UI", "Team collaboration", "Free plan"],
        consEn: ["Limited advanced features", "Complex projects", "Slow performance"],
        features: ["작업 관리", "팀 협업", "타임라인", "리포트"],
        url: "https://asana.com",
        iconCategory: "productivity"
      },
      {
        name: "Slack AI",
        company: "Slack",
        description: "스마트 팀 커뮤니케이션",
        descriptionEn: "Smart team communication",
        category: "생산성",
        pricing: "freemium",
        monthlyUsers: "12M+",
        rating: 88,
        pros: ["실시간 소통", "통합", "검색"],
        cons: ["메시지 과부하", "산만함", "비싼 플랜"],
        prosEn: ["Real-time communication", "Integrations", "Search"],
        consEn: ["Message overload", "Distractions", "Expensive plans"],
        features: ["팀 채팅", "파일 공유", "통합", "워크플로우"],
        url: "https://slack.com",
        iconCategory: "productivity"
      },
      {
        name: "Zapier AI",
        company: "Zapier",
        description: "앱 연동 자동화",
        descriptionEn: "App integration automation",
        category: "생산성",
        pricing: "freemium",
        monthlyUsers: "2.5M+",
        rating: 86,
        pros: ["다양한 통합", "자동화", "사용 편의"],
        cons: ["제한된 무료", "복잡한 로직", "디버깅 어려움"],
        prosEn: ["Various integrations", "Automation", "Ease of use"],
        consEn: ["Limited free", "Complex logic", "Debugging difficulty"],
        features: ["앱 통합", "자동화", "워크플로우", "트리거"],
        url: "https://zapier.com",
        iconCategory: "productivity"
      },
      
      // 금융 AI (25개)
      {
        name: "Mint AI",
        company: "Intuit",
        description: "개인 재정 관리 AI",
        descriptionEn: "Personal finance management AI",
        category: "금융",
        pricing: "free",
        monthlyUsers: "3M+",
        rating: 84,
        pros: ["무료", "자동 분류", "예산 관리"],
        cons: ["미국 중심", "광고", "제한된 기능"],
        prosEn: ["Free", "Auto categorization", "Budget management"],
        consEn: ["US-focused", "Ads", "Limited features"],
        features: ["예산 관리", "지출 추적", "신용 점수", "알림"],
        url: "https://mint.com",
        iconCategory: "finance"
      },
      {
        name: "QuickBooks AI",
        company: "Intuit",
        description: "중소기업 회계 자동화",
        descriptionEn: "Small business accounting automation",
        category: "금융",
        pricing: "paid",
        monthlyUsers: "1.5M+",
        rating: 87,
        pros: ["완전한 회계", "세금 준비", "급여"],
        cons: ["복잡함", "높은 가격", "학습 필요"],
        prosEn: ["Complete accounting", "Tax preparation", "Payroll"],
        consEn: ["Complexity", "High cost", "Learning required"],
        features: ["회계", "인보이스", "급여", "세금"],
        url: "https://quickbooks.intuit.com",
        iconCategory: "finance"
      },
      {
        name: "Robinhood AI",
        company: "Robinhood",
        description: "AI 투자 추천",
        descriptionEn: "AI investment recommendations",
        category: "금융",
        pricing: "freemium",
        monthlyUsers: "2M+",
        rating: 82,
        pros: ["수수료 없음", "사용 편의", "모바일"],
        cons: ["제한된 연구", "기본적 도구", "고객 서비스"],
        prosEn: ["No commission", "Ease of use", "Mobile"],
        consEn: ["Limited research", "Basic tools", "Customer service"],
        features: ["주식 거래", "ETF", "옵션", "암호화폐"],
        url: "https://robinhood.com",
        iconCategory: "finance"
      },
      {
        name: "Personal Capital AI",
        company: "Personal Capital",
        description: "자산 관리 AI",
        descriptionEn: "Wealth management AI",
        category: "금융",
        pricing: "freemium",
        monthlyUsers: "800K+",
        rating: 85,
        pros: ["자산 추적", "투자 분석", "무료 도구"],
        cons: ["영업 연락", "복잡한 UI", "미국 중심"],
        prosEn: ["Asset tracking", "Investment analysis", "Free tools"],
        consEn: ["Sales calls", "Complex UI", "US-focused"],
        features: ["자산 추적", "투자 분석", "은퇴 계획", "수수료 분석"],
        url: "https://personalcapital.com",
        iconCategory: "finance"
      },
      
      // 건강 AI (20개)
      {
        name: "MyFitnessPal AI",
        company: "Under Armour",
        description: "AI 칼로리 추적",
        descriptionEn: "AI calorie tracking",
        category: "건강",
        pricing: "freemium",
        monthlyUsers: "5M+",
        rating: 86,
        pros: ["방대한 음식 DB", "바코드 스캔", "커뮤니티"],
        cons: ["광고", "프리미엄 제한", "정확도"],
        prosEn: ["Huge food database", "Barcode scan", "Community"],
        consEn: ["Ads", "Premium limitations", "Accuracy"],
        features: ["칼로리 추적", "운동 기록", "영양 분석", "목표 설정"],
        url: "https://myfitnesspal.com",
        iconCategory: "health"
      },
      {
        name: "Headspace AI",
        company: "Headspace",
        description: "AI 명상 및 마음챙김",
        descriptionEn: "AI meditation and mindfulness",
        category: "건강",
        pricing: "freemium",
        monthlyUsers: "3M+",
        rating: 88,
        pros: ["가이드 명상", "수면 도움", "스트레스 관리"],
        cons: ["구독 필요", "제한된 무료", "반복적"],
        prosEn: ["Guided meditation", "Sleep help", "Stress management"],
        consEn: ["Subscription required", "Limited free", "Repetitive"],
        features: ["명상", "수면", "스트레스 관리", "운동"],
        url: "https://headspace.com",
        iconCategory: "health"
      },
      {
        name: "Fitbit AI",
        company: "Google",
        description: "피트니스 추적 AI",
        descriptionEn: "Fitness tracking AI",
        category: "건강",
        pricing: "freemium",
        monthlyUsers: "4M+",
        rating: 85,
        pros: ["종합 추적", "심박수", "수면 분석"],
        cons: ["기기 필요", "구독 비용", "정확도"],
        prosEn: ["Comprehensive tracking", "Heart rate", "Sleep analysis"],
        consEn: ["Device required", "Subscription cost", "Accuracy"],
        features: ["활동 추적", "심박수", "수면", "목표"],
        url: "https://fitbit.com",
        iconCategory: "health"
      },
      
      // 여행 AI (15개)
      {
        name: "TripAdvisor AI",
        company: "TripAdvisor",
        description: "AI 여행 계획",
        descriptionEn: "AI travel planning",
        category: "여행",
        pricing: "free",
        monthlyUsers: "6M+",
        rating: 84,
        pros: ["리뷰 많음", "가격 비교", "무료"],
        cons: ["광고", "편향된 리뷰", "복잡한 UI"],
        prosEn: ["Many reviews", "Price comparison", "Free"],
        consEn: ["Ads", "Biased reviews", "Complex UI"],
        features: ["호텔 검색", "리뷰", "가격 비교", "여행 계획"],
        url: "https://tripadvisor.com",
        iconCategory: "travel"
      },
      {
        name: "Kayak AI",
        company: "Kayak",
        description: "항공료 예측 AI",
        descriptionEn: "Flight price prediction AI",
        category: "여행",
        pricing: "free",
        monthlyUsers: "4M+",
        rating: 83,
        pros: ["가격 예측", "알림", "비교"],
        cons: ["예측 정확도", "복잡한 검색", "광고"],
        prosEn: ["Price prediction", "Alerts", "Comparison"],
        consEn: ["Prediction accuracy", "Complex search", "Ads"],
        features: ["항공료 검색", "가격 예측", "알림", "호텔"],
        url: "https://kayak.com",
        iconCategory: "travel"
      },
      {
        name: "Google Travel AI",
        company: "Google",
        description: "구글 여행 계획 AI",
        descriptionEn: "Google travel planning AI",
        category: "여행",
        pricing: "free",
        monthlyUsers: "8M+",
        rating: 87,
        pros: ["통합 서비스", "무료", "정확한 정보"],
        cons: ["개인정보", "제한된 커스터마이징", "광고"],
        prosEn: ["Integrated services", "Free", "Accurate info"],
        consEn: ["Privacy", "Limited customization", "Ads"],
        features: ["항공편", "호텔", "여행 계획", "지도"],
        url: "https://travel.google.com",
        iconCategory: "travel"
      },
      
      // 부동산 AI (10개)
      {
        name: "Zillow AI",
        company: "Zillow",
        description: "AI 부동산 가격 추정",
        descriptionEn: "AI real estate price estimation",
        category: "부동산",
        pricing: "free",
        monthlyUsers: "5M+",
        rating: 85,
        pros: ["가격 추정", "시장 트렌드", "무료"],
        cons: ["정확도 문제", "미국 중심", "편향"],
        prosEn: ["Price estimation", "Market trends", "Free"],
        consEn: ["Accuracy issues", "US-focused", "Bias"],
        features: ["부동산 검색", "가격 추정", "시장 분석", "대출"],
        url: "https://zillow.com",
        iconCategory: "realestate"
      },
      {
        name: "Redfin AI",
        company: "Redfin",
        description: "AI 부동산 추천",
        descriptionEn: "AI real estate recommendations",
        category: "부동산",
        pricing: "free",
        monthlyUsers: "2M+",
        rating: 84,
        pros: ["정확한 데이터", "낮은 수수료", "사용 편의"],
        cons: ["지역 제한", "에이전트 필요", "기능 제한"],
        prosEn: ["Accurate data", "Low commission", "Ease of use"],
        consEn: ["Geographic limitations", "Agent required", "Limited features"],
        features: ["부동산 검색", "시장 분석", "투어 예약", "에이전트"],
        url: "https://redfin.com",
        iconCategory: "realestate"
      },
      
      // 교육 AI (25개)
      {
        name: "Khan Academy AI",
        company: "Khan Academy",
        description: "개인화 학습 AI",
        descriptionEn: "Personalized learning AI",
        category: "교육",
        pricing: "free",
        monthlyUsers: "6M+",
        rating: 91,
        pros: ["완전 무료", "개인화", "다양한 과목"],
        cons: ["영어 위주", "상호작용 제한", "고급 과정 부족"],
        prosEn: ["Completely free", "Personalized", "Various subjects"],
        consEn: ["English-focused", "Limited interaction", "Lack of advanced courses"],
        features: ["개인화 학습", "진도 추적", "연습 문제", "비디오"],
        url: "https://khanacademy.org",
        iconCategory: "education"
      },
      {
        name: "Coursera AI",
        company: "Coursera",
        description: "AI 학습 추천",
        descriptionEn: "AI learning recommendations",
        category: "교육",
        pricing: "freemium",
        monthlyUsers: "4M+",
        rating: 88,
        pros: ["대학 수준", "인증서", "다양한 과정"],
        cons: ["유료 인증", "자기 주도 필요", "언어 제한"],
        prosEn: ["University level", "Certificates", "Various courses"],
        consEn: ["Paid certification", "Self-directed", "Language limitations"],
        features: ["온라인 강의", "인증서", "과제", "프로젝트"],
        url: "https://coursera.org",
        iconCategory: "education"
      },
      {
        name: "Duolingo AI",
        company: "Duolingo",
        description: "AI 언어 학습",
        descriptionEn: "AI language learning",
        category: "교육",
        pricing: "freemium",
        monthlyUsers: "10M+",
        rating: 89,
        pros: ["게임화", "개인화", "무료"],
        cons: ["문법 설명 부족", "반복적", "광고"],
        prosEn: ["Gamification", "Personalized", "Free"],
        consEn: ["Lack of grammar explanation", "Repetitive", "Ads"],
        features: ["언어 학습", "게임화", "진도 추적", "스트릭"],
        url: "https://duolingo.com",
        iconCategory: "education"
      },
      
      // 엔터테인먼트 AI (20개)
      {
        name: "Spotify AI",
        company: "Spotify",
        description: "AI 음악 추천",
        descriptionEn: "AI music recommendations",
        category: "엔터테인먼트",
        pricing: "freemium",
        monthlyUsers: "15M+",
        rating: 90,
        pros: ["개인화 추천", "다양한 음악", "팟캐스트"],
        cons: ["광고", "오프라인 제한", "음질"],
        prosEn: ["Personalized recommendations", "Various music", "Podcasts"],
        consEn: ["Ads", "Offline limitations", "Audio quality"],
        features: ["음악 스트리밍", "플레이리스트", "팟캐스트", "추천"],
        url: "https://spotify.com",
        iconCategory: "entertainment"
      },
      {
        name: "Netflix AI",
        company: "Netflix",
        description: "AI 콘텐츠 추천",
        descriptionEn: "AI content recommendations",
        category: "엔터테인먼트",
        pricing: "paid",
        monthlyUsers: "12M+",
        rating: 89,
        pros: ["개인화 추천", "오리지널 콘텐츠", "고품질"],
        cons: ["구독 필수", "지역 제한", "콘텐츠 순환"],
        prosEn: ["Personalized recommendations", "Original content", "High quality"],
        consEn: ["Subscription required", "Regional restrictions", "Content rotation"],
        features: ["영상 스트리밍", "추천", "다운로드", "프로필"],
        url: "https://netflix.com",
        iconCategory: "entertainment"
      },
      {
        name: "YouTube AI",
        company: "Google",
        description: "AI 영상 추천",
        descriptionEn: "AI video recommendations",
        category: "엔터테인먼트",
        pricing: "freemium",
        monthlyUsers: "25M+",
        rating: 88,
        pros: ["무료", "다양한 콘텐츠", "창작자 지원"],
        cons: ["광고", "중독성", "품질 편차"],
        prosEn: ["Free", "Various content", "Creator support"],
        consEn: ["Ads", "Addictive", "Quality variance"],
        features: ["영상 스트리밍", "추천", "댓글", "구독"],
        url: "https://youtube.com",
        iconCategory: "entertainment"
      }
    ];

    tools.forEach(tool => {
      const id = this.currentId++;
      this.aiTools.set(id, { ...tool, id } as AiTool);
    });

    // Initialize AI Bundles
    const bundles: InsertAiBundle[] = [
      {
        name: "영상 제작 패키지",
        nameEn: "Video Production Package",
        description: "완전한 영상 제작 워크플로우",
        descriptionEn: "Complete video production workflow",
        category: "영상 제작",
        tools: [
          { id: 4, name: "Runway ML", role: "영상 생성", pricing: "freemium" },
          { id: 5, name: "ElevenLabs", role: "음성 생성", pricing: "freemium" },
          { id: 0, name: "Rev AI", role: "자막 생성", pricing: "paid" }
        ],
        estimatedCost: "$45-80",
        color: "red",
        icon: "video"
      },
      {
        name: "콘텐츠 제작 패키지", 
        nameEn: "Content Creation Package",
        description: "블로그부터 SNS까지 완벽 커버",
        descriptionEn: "Perfect coverage from blogs to SNS",
        category: "콘텐츠 제작",
        tools: [
          { id: 1, name: "ChatGPT", role: "텍스트 생성", pricing: "freemium" },
          { id: 2, name: "Midjourney", role: "이미지 생성", pricing: "paid" },
          { id: 0, name: "Buffer AI", role: "스케줄링", pricing: "freemium" }
        ],
        estimatedCost: "$30-50",
        color: "blue",
        icon: "pen-fancy"
      },
      {
        name: "데이터 분석 패키지",
        nameEn: "Data Analysis Package", 
        description: "데이터에서 인사이트까지",
        descriptionEn: "From data to insights",
        category: "데이터 분석",
        tools: [
          { id: 3, name: "Claude", role: "문서 분석", pricing: "free" },
          { id: 0, name: "Tableau AI", role: "차트 생성", pricing: "freemium" },
          { id: 0, name: "Gamma", role: "보고서 생성", pricing: "freemium" }
        ],
        estimatedCost: "$20-40",
        color: "green",
        icon: "chart-bar"
      },
      {
        name: "음악 제작 패키지",
        nameEn: "Music Production Package",
        description: "완전한 음악 제작 워크플로우",
        descriptionEn: "Complete music production workflow",
        category: "음악 제작",
        tools: [
          { id: 0, name: "Suno AI", role: "음악 생성", pricing: "freemium" },
          { id: 5, name: "ElevenLabs", role: "보컬 생성", pricing: "freemium" },
          { id: 0, name: "AIVA", role: "편곡", pricing: "freemium" }
        ],
        estimatedCost: "$25-50",
        color: "purple",
        icon: "music"
      },
      {
        name: "마케팅 자동화 패키지",
        nameEn: "Marketing Automation Package",
        description: "SNS부터 이메일까지 마케팅 자동화",
        descriptionEn: "Marketing automation from SNS to email",
        category: "마케팅",
        tools: [
          { id: 1, name: "ChatGPT", role: "콘텐츠 기획", pricing: "freemium" },
          { id: 0, name: "Canva AI", role: "디자인", pricing: "freemium" },
          { id: 0, name: "Hootsuite AI", role: "SNS 관리", pricing: "paid" }
        ],
        estimatedCost: "$40-70",
        color: "orange",
        icon: "megaphone"
      },
      {
        name: "디자인 스튜디오 패키지",
        nameEn: "Design Studio Package",
        description: "로고부터 웹디자인까지",
        descriptionEn: "From logo to web design",
        category: "디자인",
        tools: [
          { id: 2, name: "Midjourney", role: "이미지 생성", pricing: "paid" },
          { id: 0, name: "Figma AI", role: "UI/UX 디자인", pricing: "freemium" },
          { id: 0, name: "Looka", role: "로고 제작", pricing: "paid" }
        ],
        estimatedCost: "$35-60",
        color: "pink",
        icon: "palette"
      },
      {
        name: "교육 콘텐츠 패키지",
        nameEn: "Educational Content Package",
        description: "강의 영상 제작 올인원",
        descriptionEn: "All-in-one lecture video production",
        category: "교육",
        tools: [
          { id: 0, name: "Synthesia", role: "AI 강사", pricing: "paid" },
          { id: 1, name: "ChatGPT", role: "스크립트 작성", pricing: "freemium" },
          { id: 0, name: "InVideo", role: "영상 편집", pricing: "freemium" }
        ],
        estimatedCost: "$50-90",
        color: "blue",
        icon: "graduation-cap"
      },
      {
        name: "팟캐스트 제작 패키지",
        nameEn: "Podcast Production Package",
        description: "기획부터 배포까지 팟캐스트 제작",
        descriptionEn: "Podcast production from planning to distribution",
        category: "오디오",
        tools: [
          { id: 1, name: "ChatGPT", role: "대본 작성", pricing: "freemium" },
          { id: 5, name: "ElevenLabs", role: "음성 생성", pricing: "freemium" },
          { id: 0, name: "Descript", role: "편집", pricing: "freemium" }
        ],
        estimatedCost: "$20-45",
        color: "indigo",
        icon: "radio"
      },
      {
        name: "AI 개발자 패키지",
        nameEn: "AI Developer Package",
        description: "AI 앱 개발을 위한 완벽한 도구",
        descriptionEn: "Perfect tools for AI app development",
        category: "개발",
        tools: [
          { id: 6, name: "GitHub Copilot", role: "코드 생성", pricing: "paid" },
          { id: 0, name: "Cursor", role: "AI 에디터", pricing: "freemium" },
          { id: 1, name: "ChatGPT", role: "문서화", pricing: "freemium" }
        ],
        estimatedCost: "$25-50",
        color: "gray",
        icon: "code"
      },
      {
        name: "소셜미디어 크리에이터 패키지",
        nameEn: "Social Media Creator Package",
        description: "바이럴 콘텐츠 제작의 모든 것",
        descriptionEn: "Everything for viral content creation",
        category: "SNS",
        tools: [
          { id: 0, name: "Pika Labs", role: "숏폼 영상", pricing: "freemium" },
          { id: 2, name: "Midjourney", role: "썸네일", pricing: "paid" },
          { id: 0, name: "Buffer AI", role: "스케줄링", pricing: "freemium" }
        ],
        estimatedCost: "$30-55",
        color: "cyan",
        icon: "share"
      },
      {
        name: "번역 및 현지화 패키지",
        nameEn: "Translation & Localization Package",
        description: "글로벌 진출을 위한 번역 솔루션",
        descriptionEn: "Translation solution for global expansion",
        category: "번역",
        tools: [
          { id: 7, name: "DeepL", role: "텍스트 번역", pricing: "freemium" },
          { id: 0, name: "Murf", role: "다국어 음성", pricing: "freemium" },
          { id: 1, name: "ChatGPT", role: "문화적 현지화", pricing: "freemium" }
        ],
        estimatedCost: "$15-35",
        color: "teal",
        icon: "globe"
      },
      {
        name: "e커머스 최적화 패키지",
        nameEn: "E-commerce Optimization Package",
        description: "온라인 쇼핑몰 운영 최적화",
        descriptionEn: "Online store operation optimization",
        category: "전자상거래",
        tools: [
          { id: 0, name: "Copy.ai", role: "상품 설명", pricing: "freemium" },
          { id: 2, name: "Midjourney", role: "상품 이미지", pricing: "paid" },
          { id: 0, name: "HubSpot AI", role: "고객 관리", pricing: "freemium" }
        ],
        estimatedCost: "$35-65",
        color: "emerald",
        icon: "shopping-cart"
      },
      {
        name: "법률 문서 패키지",
        nameEn: "Legal Document Package",
        description: "법률 문서 작성 및 검토",
        descriptionEn: "Legal document writing and review",
        category: "법률",
        tools: [
          { id: 3, name: "Claude", role: "문서 분석", pricing: "free" },
          { id: 1, name: "ChatGPT", role: "초안 작성", pricing: "freemium" },
          { id: 0, name: "Grammarly", role: "문법 검사", pricing: "freemium" }
        ],
        estimatedCost: "$20-40",
        color: "slate",
        icon: "scale"
      },
      {
        name: "의료 연구 패키지",
        nameEn: "Medical Research Package",
        description: "의료 데이터 분석 및 연구",
        descriptionEn: "Medical data analysis and research",
        category: "의료",
        tools: [
          { id: 0, name: "DataRobot", role: "데이터 분석", pricing: "paid" },
          { id: 3, name: "Claude", role: "논문 리뷰", pricing: "free" },
          { id: 0, name: "Tableau Prep", role: "시각화", pricing: "paid" }
        ],
        estimatedCost: "$100-200",
        color: "red",
        icon: "heart"
      },
      {
        name: "부동산 마케팅 패키지",
        nameEn: "Real Estate Marketing Package",
        description: "부동산 마케팅 자동화",
        descriptionEn: "Real estate marketing automation",
        category: "부동산",
        tools: [
          { id: 0, name: "D-ID", role: "가상 투어", pricing: "freemium" },
          { id: 0, name: "Canva AI", role: "전단지 디자인", pricing: "freemium" },
          { id: 0, name: "Mailchimp AI", role: "이메일 마케팅", pricing: "freemium" }
        ],
        estimatedCost: "$25-50",
        color: "amber",
        icon: "home"
      },
      {
        name: "게임 개발 패키지",
        nameEn: "Game Development Package",
        description: "인디 게임 개발 필수 도구",
        descriptionEn: "Essential tools for indie game development",
        category: "게임",
        tools: [
          { id: 0, name: "Leonardo.ai", role: "게임 아트", pricing: "freemium" },
          { id: 0, name: "Mubert", role: "배경음악", pricing: "freemium" },
          { id: 6, name: "GitHub Copilot", role: "코드 생성", pricing: "paid" }
        ],
        estimatedCost: "$40-70",
        color: "violet",
        icon: "gamepad"
      },
      {
        name: "학술 논문 패키지",
        nameEn: "Academic Paper Package",
        description: "연구 논문 작성 및 발표",
        descriptionEn: "Research paper writing and presentation",
        category: "학술",
        tools: [
          { id: 3, name: "Claude", role: "연구 분석", pricing: "free" },
          { id: 0, name: "Gamma", role: "발표 자료", pricing: "freemium" },
          { id: 0, name: "Grammarly", role: "교정", pricing: "freemium" }
        ],
        estimatedCost: "$15-30",
        color: "blue",
        icon: "book"
      },
      {
        name: "여행 계획 패키지",
        nameEn: "Travel Planning Package",
        description: "완벽한 여행 계획 수립",
        descriptionEn: "Perfect travel planning",
        category: "여행",
        tools: [
          { id: 0, name: "Google Travel AI", role: "일정 계획", pricing: "free" },
          { id: 0, name: "Kayak AI", role: "항공료 예측", pricing: "free" },
          { id: 1, name: "ChatGPT", role: "여행 가이드", pricing: "freemium" }
        ],
        estimatedCost: "$0-15",
        color: "cyan",
        icon: "map"
      },
      {
        name: "개인 재정 관리 패키지",
        nameEn: "Personal Finance Package",
        description: "AI 기반 재정 관리",
        descriptionEn: "AI-based financial management",
        category: "금융",
        tools: [
          { id: 0, name: "Mint AI", role: "예산 관리", pricing: "free" },
          { id: 0, name: "Personal Capital AI", role: "투자 분석", pricing: "freemium" },
          { id: 0, name: "QuickBooks AI", role: "세금 관리", pricing: "paid" }
        ],
        estimatedCost: "$0-50",
        color: "green",
        icon: "dollar-sign"
      },
      {
        name: "건강 관리 패키지",
        nameEn: "Health Management Package",
        description: "AI 헬스케어 솔루션",
        descriptionEn: "AI healthcare solution",
        category: "건강",
        tools: [
          { id: 0, name: "MyFitnessPal AI", role: "영양 관리", pricing: "freemium" },
          { id: 0, name: "Fitbit AI", role: "활동 추적", pricing: "freemium" },
          { id: 0, name: "Headspace AI", role: "정신 건강", pricing: "freemium" }
        ],
        estimatedCost: "$20-45",
        color: "red",
        icon: "heart"
      },
      {
        name: "창업가 패키지",
        nameEn: "Entrepreneur Package",
        description: "스타트업 런칭을 위한 모든 것",
        descriptionEn: "Everything for startup launch",
        category: "비즈니스",
        tools: [
          { id: 0, name: "Notion AI", role: "비즈니스 플랜", pricing: "freemium" },
          { id: 0, name: "Canva AI", role: "브랜딩", pricing: "freemium" },
          { id: 0, name: "HubSpot AI", role: "고객 관리", pricing: "freemium" }
        ],
        estimatedCost: "$30-60",
        color: "purple",
        icon: "rocket"
      },
      {
        name: "온라인 교육 패키지",
        nameEn: "Online Education Package",
        description: "디지털 교육 콘텐츠 제작",
        descriptionEn: "Digital education content creation",
        category: "교육",
        tools: [
          { id: 0, name: "Khan Academy AI", role: "커리큘럼", pricing: "free" },
          { id: 0, name: "Synthesia", role: "강의 영상", pricing: "paid" },
          { id: 0, name: "Coursera AI", role: "코스 설계", pricing: "freemium" }
        ],
        estimatedCost: "$25-70",
        color: "blue",
        icon: "graduation-cap"
      },
      {
        name: "엔터테인먼트 스트리밍 패키지",
        nameEn: "Entertainment Streaming Package",
        description: "개인화된 엔터테인먼트",
        descriptionEn: "Personalized entertainment",
        category: "엔터테인먼트",
        tools: [
          { id: 0, name: "Spotify AI", role: "음악 추천", pricing: "freemium" },
          { id: 0, name: "Netflix AI", role: "영상 추천", pricing: "paid" },
          { id: 0, name: "YouTube AI", role: "콘텐츠 발견", pricing: "freemium" }
        ],
        estimatedCost: "$15-35",
        color: "rose",
        icon: "play"
      },
      {
        name: "디지털 노마드 패키지",
        nameEn: "Digital Nomad Package",
        description: "원격 근무를 위한 완벽한 도구",
        descriptionEn: "Perfect tools for remote work",
        category: "원격근무",
        tools: [
          { id: 0, name: "Slack AI", role: "팀 소통", pricing: "freemium" },
          { id: 0, name: "Zoom AI", role: "화상 회의", pricing: "freemium" },
          { id: 0, name: "Asana AI", role: "프로젝트 관리", pricing: "freemium" }
        ],
        estimatedCost: "$20-50",
        color: "teal",
        icon: "wifi"
      },
      {
        name: "소매업 최적화 패키지",
        nameEn: "Retail Optimization Package",
        description: "매장 운영 최적화",
        descriptionEn: "Store operation optimization",
        category: "소매",
        tools: [
          { id: 0, name: "Square AI", role: "POS 시스템", pricing: "freemium" },
          { id: 0, name: "Shopify AI", role: "온라인 스토어", pricing: "paid" },
          { id: 0, name: "Inventory AI", role: "재고 관리", pricing: "paid" }
        ],
        estimatedCost: "$50-120",
        color: "orange",
        icon: "shopping-bag"
      },
      {
        name: "크리에이터 이코노미 패키지",
        nameEn: "Creator Economy Package",
        description: "크리에이터를 위한 수익화 도구",
        descriptionEn: "Monetization tools for creators",
        category: "크리에이터",
        tools: [
          { id: 0, name: "Patreon AI", role: "구독 관리", pricing: "freemium" },
          { id: 0, name: "OnlyFans AI", role: "콘텐츠 수익화", pricing: "freemium" },
          { id: 0, name: "Twitch AI", role: "라이브 스트리밍", pricing: "freemium" }
        ],
        estimatedCost: "$15-40",
        color: "pink",
        icon: "star"
      }
    ];

    bundles.forEach(bundle => {
      const id = this.currentId++;
      this.aiBundles.set(id, { ...bundle, id } as AiBundle);
    });

    // Initialize Quiz Questions
    const questions: InsertQuizQuestion[] = [
      {
        question: "어떤 목적으로 AI를 활용하고 싶으신가요?",
        questionEn: "What purpose do you want to use AI for?",
        options: [
          { value: "work", label: "업무/비즈니스", labelEn: "Work/Business", description: "업무 효율성, 프로젝트 관리, 고객 대응 등", descriptionEn: "Work efficiency, project management, customer service, etc." },
          { value: "creative", label: "창작 활동", labelEn: "Creative Work", description: "콘텐츠 제작, 예술, 디자인, 음악 등", descriptionEn: "Content creation, art, design, music, etc." },
          { value: "learning", label: "학습/교육", labelEn: "Learning/Education", description: "공부, 연구, 기술 습득, 언어 학습 등", descriptionEn: "Study, research, skill acquisition, language learning, etc." },
          { value: "personal", label: "일상생활", labelEn: "Daily Life", description: "개인 관리, 건강, 여행 계획, 취미 등", descriptionEn: "Personal management, health, travel planning, hobbies, etc." },
          { value: "finance", label: "재정 관리", labelEn: "Financial Management", description: "투자, 예산 관리, 경제 분석 등", descriptionEn: "Investment, budget management, economic analysis, etc." }
        ],
        order: 1
      },
      // 업무/비즈니스 선택 시 질문
      {
        question: "구체적으로 어떤 업무에 도움이 필요하신가요?",
        questionEn: "What specific work tasks do you need help with?",
        options: [
          { value: "work_text", label: "문서 작성 및 커뮤니케이션", labelEn: "Document writing & communication", description: "보고서, 이메일, 제안서, 회의록 작성", descriptionEn: "Reports, emails, proposals, meeting minutes" },
          { value: "work_analysis", label: "데이터 분석 및 인사이트", labelEn: "Data analysis & insights", description: "비즈니스 분석, 시장 조사, 통계 처리", descriptionEn: "Business analysis, market research, statistics" },
          { value: "work_automation", label: "업무 자동화 및 효율성", labelEn: "Work automation & efficiency", description: "반복 작업 자동화, 워크플로우 최적화", descriptionEn: "Automating repetitive tasks, workflow optimization" },
          { value: "work_coding", label: "개발 및 프로그래밍", labelEn: "Development & programming", description: "코드 작성, 디버깅, 시스템 개발", descriptionEn: "Code writing, debugging, system development" },
          { value: "work_marketing", label: "마케팅 및 고객 대응", labelEn: "Marketing & customer service", description: "광고 문구, SNS 콘텐츠, 고객 서비스", descriptionEn: "Ad copy, social media content, customer service" }
        ],
        order: 2,
        parentOption: "work"
      },
      // 창작 활동 선택 시 질문
      {
        question: "어떤 종류의 창작을 하고 싶으신가요?",
        questionEn: "What type of creative work do you want to do?",
        options: [
          { value: "creative_visual", label: "시각적 콘텐츠", labelEn: "Visual content", description: "이미지, 일러스트, 로고, 포스터 제작", descriptionEn: "Images, illustrations, logos, poster creation" },
          { value: "creative_video", label: "영상 및 애니메이션", labelEn: "Video & animation", description: "영상 편집, 애니메이션, 모션 그래픽", descriptionEn: "Video editing, animation, motion graphics" },
          { value: "creative_music", label: "음악 및 오디오", labelEn: "Music & audio", description: "작곡, 사운드 디자인, 팟캐스트 제작", descriptionEn: "Composition, sound design, podcast creation" },
          { value: "creative_writing", label: "글쓰기 및 스토리텔링", labelEn: "Writing & storytelling", description: "소설, 시나리오, 블로그, 카피라이팅", descriptionEn: "Novels, scripts, blogs, copywriting" },
          { value: "creative_design", label: "디자인 및 아트", labelEn: "Design & art", description: "UI/UX 디자인, 아트워크, 브랜딩", descriptionEn: "UI/UX design, artwork, branding" }
        ],
        order: 2,
        parentOption: "creative"
      },
      // 학습/교육 선택 시 질문
      {
        question: "어떤 분야의 학습을 원하시나요?",
        questionEn: "What field do you want to learn about?",
        options: [
          { value: "learning_language", label: "언어 학습", labelEn: "Language learning", description: "외국어, 번역, 언어 교환, 발음 연습", descriptionEn: "Foreign languages, translation, language exchange, pronunciation" },
          { value: "learning_tech", label: "기술 및 프로그래밍", labelEn: "Technology & programming", description: "코딩, 소프트웨어 개발, IT 기술", descriptionEn: "Coding, software development, IT skills" },
          { value: "learning_research", label: "연구 및 조사", labelEn: "Research & investigation", description: "논문 작성, 자료 수집, 문헌 검토", descriptionEn: "Paper writing, data collection, literature review" },
          { value: "learning_skill", label: "새로운 기술 습득", labelEn: "New skill acquisition", description: "취미, 전문 기술, 자격증 준비", descriptionEn: "Hobbies, professional skills, certification prep" },
          { value: "learning_academic", label: "학업 지원", labelEn: "Academic support", description: "숙제, 시험 준비, 과제 도움", descriptionEn: "Homework, exam prep, assignment help" }
        ],
        order: 2,
        parentOption: "learning"
      },
      // 일상생활 선택 시 질문
      {
        question: "일상생활에서 어떤 도움이 필요하신가요?",
        questionEn: "What kind of daily life assistance do you need?",
        options: [
          { value: "personal_health", label: "건강 및 웰니스", labelEn: "Health & wellness", description: "운동 계획, 식단 관리, 건강 추적", descriptionEn: "Exercise planning, diet management, health tracking" },
          { value: "personal_travel", label: "여행 및 계획", labelEn: "Travel & planning", description: "여행 계획, 숙박 예약, 맛집 추천", descriptionEn: "Trip planning, accommodation booking, restaurant recommendations" },
          { value: "personal_entertainment", label: "엔터테인먼트", labelEn: "Entertainment", description: "게임, 영화 추천, 취미 활동", descriptionEn: "Games, movie recommendations, hobby activities" },
          { value: "personal_productivity", label: "개인 생산성", labelEn: "Personal productivity", description: "일정 관리, 할 일 정리, 목표 설정", descriptionEn: "Schedule management, to-do organization, goal setting" },
          { value: "personal_home", label: "홈 관리", labelEn: "Home management", description: "요리, 청소, 집안 정리, 인테리어", descriptionEn: "Cooking, cleaning, home organization, interior design" }
        ],
        order: 2,
        parentOption: "personal"
      },
      // 재정 관리 선택 시 질문
      {
        question: "재정 관리에서 어떤 부분에 집중하고 싶으신가요?",
        questionEn: "What aspect of financial management do you want to focus on?",
        options: [
          { value: "finance_investment", label: "투자 및 자산 관리", labelEn: "Investment & asset management", description: "주식, 부동산, 포트폴리오 분석", descriptionEn: "Stocks, real estate, portfolio analysis" },
          { value: "finance_budgeting", label: "예산 관리 및 가계부", labelEn: "Budgeting & expense tracking", description: "지출 분석, 저축 계획, 가계부 관리", descriptionEn: "Expense analysis, savings planning, household budgeting" },
          { value: "finance_business", label: "비즈니스 재무", labelEn: "Business finance", description: "회계, 세무, 비즈니스 분석", descriptionEn: "Accounting, tax planning, business analysis" },
          { value: "finance_crypto", label: "암호화폐 및 디파이", labelEn: "Cryptocurrency & DeFi", description: "암호화폐 분석, 블록체인, 디파이", descriptionEn: "Crypto analysis, blockchain, DeFi" },
          { value: "finance_planning", label: "재정 계획", labelEn: "Financial planning", description: "은퇴 계획, 보험, 재정 목표 설정", descriptionEn: "Retirement planning, insurance, financial goal setting" }
        ],
        order: 2,
        parentOption: "finance"
      },
      {
        question: "어떤 분야의 AI가 필요하신가요?",
        questionEn: "What field of AI do you need?",
        options: [
          { value: "marketing", label: "마케팅/광고", labelEn: "Marketing/Advertising", description: "SNS 콘텐츠, 광고 문구, 브랜딩 등", descriptionEn: "Social media content, ad copy, branding, etc." },
          { value: "productivity", label: "생산성 향상", labelEn: "Productivity", description: "일정 관리, 업무 자동화, 노트 정리 등", descriptionEn: "Schedule management, work automation, note organization, etc." },
          { value: "health", label: "건강/웰니스", labelEn: "Health/Wellness", description: "운동 계획, 식단 관리, 건강 추적 등", descriptionEn: "Exercise planning, diet management, health tracking, etc." },
          { value: "travel", label: "여행/계획", labelEn: "Travel/Planning", description: "여행 계획, 숙박 검색, 맛집 추천 등", descriptionEn: "Travel planning, accommodation search, restaurant recommendations, etc." },
          { value: "education", label: "교육/학습", labelEn: "Education/Learning", description: "언어 학습, 온라인 강의, 시험 준비 등", descriptionEn: "Language learning, online courses, exam preparation, etc." },
          { value: "entertainment", label: "엔터테인먼트", labelEn: "Entertainment", description: "게임, 영화 추천, 소설 창작 등", descriptionEn: "Games, movie recommendations, novel writing, etc." },
          { value: "realestate", label: "부동산", labelEn: "Real Estate", description: "부동산 검색, 시세 분석, 투자 조언 등", descriptionEn: "Property search, market analysis, investment advice, etc." },
          { value: "general", label: "범용적 사용", labelEn: "General use", description: "다양한 분야에서 광범위하게 사용", descriptionEn: "Wide range of applications across various fields" }
        ],
        order: 3
      },
      {
        question: "예산은 얼마나 고려하시나요?",
        questionEn: "How much do you consider budget?",
        options: [
          { value: "free", label: "무료만 사용", labelEn: "Free only", description: "완전 무료 도구만 찾고 있어요", descriptionEn: "Looking for completely free tools only" },
          { value: "freemium", label: "일부 기능은 유료여도 괜찮아요", labelEn: "Some paid features are okay", description: "기본 기능은 무료, 고급 기능은 유료", descriptionEn: "Basic features free, advanced features paid" },
          { value: "paid", label: "필요하면 유료 도구도 사용", labelEn: "Will use paid tools if necessary", description: "품질 좋은 도구라면 비용 지불 의향", descriptionEn: "Willing to pay for quality tools" },
          { value: "enterprise", label: "기업용 고급 도구", labelEn: "Enterprise-grade tools", description: "최고급 기능과 지원이 필요해요", descriptionEn: "Need premium features and support" }
        ],
        order: 4
      },
      {
        question: "AI 도구 사용 경험은 어느 정도인가요?",
        questionEn: "How much experience do you have using AI tools?",
        options: [
          { value: "beginner", label: "초보자", labelEn: "Beginner", description: "AI 도구를 처음 사용해봐요", descriptionEn: "First time using AI tools" },
          { value: "intermediate", label: "중급자", labelEn: "Intermediate", description: "몇 가지 도구를 사용해본 적이 있어요", descriptionEn: "Have used a few tools before" },
          { value: "advanced", label: "고급자", labelEn: "Advanced", description: "다양한 AI 도구를 자주 사용해요", descriptionEn: "Frequently use various AI tools" },
          { value: "expert", label: "전문가", labelEn: "Expert", description: "AI 도구의 고급 기능까지 활용해요", descriptionEn: "Utilize advanced features of AI tools" }
        ],
        order: 5
      },
      {
        question: "AI 도구에서 가장 중요하게 생각하는 요소는?",
        questionEn: "What is the most important factor in AI tools for you?",
        options: [
          { value: "accuracy", label: "정확성", labelEn: "Accuracy", description: "결과의 정확도와 신뢰성", descriptionEn: "Accuracy and reliability of results" },
          { value: "speed", label: "속도", labelEn: "Speed", description: "빠른 처리와 응답 시간", descriptionEn: "Fast processing and response time" },
          { value: "ease", label: "사용 편의성", labelEn: "Ease of Use", description: "직관적이고 쉬운 인터페이스", descriptionEn: "Intuitive and easy interface" },
          { value: "customization", label: "커스터마이징", labelEn: "Customization", description: "세부 설정과 개인화 옵션", descriptionEn: "Detailed settings and personalization options" },
          { value: "integration", label: "통합성", labelEn: "Integration", description: "다른 도구들과의 연동", descriptionEn: "Integration with other tools" }
        ],
        order: 6
      }
    ];

    questions.forEach(question => {
      const id = this.currentId++;
      this.quizQuestions.set(id, { ...question, id } as QuizQuestion);
    });

    // Initialize Usage Stats
    const stats: InsertUsageStats[] = [
      { aiToolId: 1, totalUsers: 180000000, dailyActiveUsers: 486000, avgSessionTime: 24, satisfactionScore: 47, monthlyGrowth: 520, category: "텍스트" },
      { aiToolId: 2, totalUsers: 15000000, dailyActiveUsers: 125000, avgSessionTime: 18, satisfactionScore: 49, monthlyGrowth: 810, category: "이미지" },
      { aiToolId: 3, totalUsers: 25000000, dailyActiveUsers: 220000, avgSessionTime: 32, satisfactionScore: 48, monthlyGrowth: 1280, category: "텍스트" }
    ];

    stats.forEach(stat => {
      const id = this.currentId++;
      this.usageStats.set(id, { ...stat, id } as UsageStats);
    });
  }

  async getAllAiTools(): Promise<AiTool[]> {
    return Array.from(this.aiTools.values());
  }

  async getAiToolsByCategory(category: string): Promise<AiTool[]> {
    return Array.from(this.aiTools.values()).filter(tool => tool.category === category);
  }

  async getAiToolById(id: number): Promise<AiTool | undefined> {
    return this.aiTools.get(id);
  }

  async searchAiTools(query: string): Promise<AiTool[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.aiTools.values()).filter(tool => 
      tool.name.toLowerCase().includes(lowercaseQuery) ||
      tool.description.toLowerCase().includes(lowercaseQuery) ||
      tool.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  async getAllAiBundles(): Promise<AiBundle[]> {
    return Array.from(this.aiBundles.values());
  }

  async getAiBundleById(id: number): Promise<AiBundle | undefined> {
    return this.aiBundles.get(id);
  }

  async getAllQuizQuestions(): Promise<QuizQuestion[]> {
    return Array.from(this.quizQuestions.values()).sort((a, b) => a.order - b.order);
  }

  async getUsageStats(): Promise<UsageStats[]> {
    return Array.from(this.usageStats.values());
  }

  async getCategoryRankings(): Promise<{category: string, tools: AiTool[]}[]> {
    const categories = ["텍스트", "이미지", "영상", "음성", "음악", "코딩", "데이터분석", "디자인", "마케팅", "생산성", "금융", "건강", "여행", "부동산", "교육", "엔터테인먼트"];
    return categories.map(category => ({
      category,
      tools: Array.from(this.aiTools.values())
        .filter(tool => tool.category === category)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5)
    }));
  }

  // Missing methods implementation
  async addAiTool(tool: InsertAiTool): Promise<AiTool> {
    const id = this.currentId++;
    const newTool = { ...tool, id } as AiTool;
    this.aiTools.set(id, newTool);
    return newTool;
  }

  async updateAiTool(id: number, tool: Partial<InsertAiTool>): Promise<AiTool | undefined> {
    const existingTool = this.aiTools.get(id);
    if (existingTool) {
      const updatedTool = { ...existingTool, ...tool } as AiTool;
      this.aiTools.set(id, updatedTool);
      return updatedTool;
    }
    return undefined;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    const existingUser = this.users.get(user.id);
    const newUser = existingUser ? { ...existingUser, ...user, updatedAt: new Date() } : { 
      ...user, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    } as User;
    this.users.set(user.id, newUser);
    return newUser;
  }

  async getUserCustomPackages(userId: string): Promise<CustomPackage[]> {
    return Array.from(this.customPackages.values()).filter(pkg => pkg.userId === userId);
  }

  async createCustomPackage(packageData: InsertCustomPackage): Promise<CustomPackage> {
    const id = this.currentPackageId++;
    const newPackage = { 
      ...packageData, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    } as CustomPackage;
    this.customPackages.set(id, newPackage);
    return newPackage;
  }

  async getCustomPackageById(id: number): Promise<CustomPackage | undefined> {
    return this.customPackages.get(id);
  }

  async updateCustomPackage(id: number, updates: Partial<InsertCustomPackage>): Promise<CustomPackage | undefined> {
    const existingPackage = this.customPackages.get(id);
    if (existingPackage) {
      const updatedPackage = { 
        ...existingPackage, 
        ...updates, 
        updatedAt: new Date() 
      };
      this.customPackages.set(id, updatedPackage);
      return updatedPackage;
    }
    return undefined;
  }

  async deleteCustomPackage(id: number): Promise<boolean> {
    return this.customPackages.delete(id);
  }
}

// Use DatabaseStorage for production
export class DatabaseStorage implements IStorage {
  // AI Tools
  async getAllAiTools(): Promise<AiTool[]> {
    return await db.select().from(aiTools);
  }

  async getAiToolsByCategory(category: string): Promise<AiTool[]> {
    return await db.select().from(aiTools).where(eq(aiTools.category, category));
  }

  async getAiToolById(id: number): Promise<AiTool | undefined> {
    const [tool] = await db.select().from(aiTools).where(eq(aiTools.id, id));
    return tool;
  }

  async searchAiTools(query: string): Promise<AiTool[]> {
    return await db.select().from(aiTools).where(
      or(
        sql`${aiTools.name} ILIKE ${'%' + query + '%'}`,
        sql`${aiTools.description} ILIKE ${'%' + query + '%'}`,
        sql`${aiTools.company} ILIKE ${'%' + query + '%'}`
      )
    );
  }

  async addAiTool(tool: InsertAiTool): Promise<AiTool> {
    const [newTool] = await db.insert(aiTools).values([tool]).returning();
    return newTool;
  }

  async updateAiTool(id: number, tool: Partial<InsertAiTool>): Promise<AiTool | undefined> {
    const [updatedTool] = await db.update(aiTools)
      .set(tool as any)
      .where(eq(aiTools.id, id))
      .returning();
    return updatedTool;
  }

  // AI Bundles
  async getAllAiBundles(): Promise<AiBundle[]> {
    return await db.select().from(aiBundles);
  }

  async getAiBundleById(id: number): Promise<AiBundle | undefined> {
    const [bundle] = await db.select().from(aiBundles).where(eq(aiBundles.id, id));
    return bundle;
  }

  // Quiz
  async getAllQuizQuestions(): Promise<QuizQuestion[]> {
    return await db.select().from(quizQuestions).orderBy(quizQuestions.order);
  }

  // Analytics
  async getUsageStats(): Promise<UsageStats[]> {
    return await db.select().from(usageStats);
  }

  async getCategoryRankings(): Promise<{category: string, tools: AiTool[]}[]> {
    const tools = await db.select().from(aiTools);
    const groupedByCategory = tools.reduce((acc, tool) => {
      if (!acc[tool.category]) {
        acc[tool.category] = [];
      }
      acc[tool.category].push(tool);
      return acc;
    }, {} as Record<string, AiTool[]>);

    return Object.entries(groupedByCategory).map(([category, tools]) => ({
      category,
      tools: tools.sort((a, b) => b.rating - a.rating)
    }));
  }

  // User operations - mandatory for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Custom Packages
  async getUserCustomPackages(userId: string): Promise<CustomPackage[]> {
    return await db.select().from(customPackages).where(eq(customPackages.userId, userId));
  }

  async createCustomPackage(packageData: InsertCustomPackage): Promise<CustomPackage> {
    const [newPackage] = await db.insert(customPackages).values(packageData).returning();
    return newPackage;
  }

  async getCustomPackageById(id: number): Promise<CustomPackage | undefined> {
    const [customPackage] = await db.select().from(customPackages).where(eq(customPackages.id, id));
    return customPackage;
  }

  async updateCustomPackage(id: number, updates: Partial<InsertCustomPackage>): Promise<CustomPackage | undefined> {
    const [updatedPackage] = await db.update(customPackages)
      .set(updates)
      .where(eq(customPackages.id, id))
      .returning();
    return updatedPackage;
  }

  async deleteCustomPackage(id: number): Promise<boolean> {
    const result = await db.delete(customPackages).where(eq(customPackages.id, id));
    return (result.rowCount || 0) > 0;
  }
}

// Use MemStorage temporarily while we migrate data to database
export const storage = new MemStorage();
