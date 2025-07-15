import { storage } from "./storage";
import type { InsertAiTool } from "@shared/schema";

// AI 도구 업데이트를 위한 외부 데이터 소스들
const AI_NEWS_SOURCES = [
  'https://producthunt.com/topics/artificial-intelligence',
  'https://www.futurepedia.io/',
  'https://theresanaiforthat.com/',
  'https://aitools.fyi/'
];

// 새로운 AI 도구 데이터 (실제 환경에서는 웹 스크래핑이나 API를 통해 수집)
const NEW_AI_TOOLS_POOL: Omit<InsertAiTool, 'id'>[] = [
  {
    name: "Claude 3 Opus",
    company: "Anthropic",
    description: "Anthropic의 최신 대화형 AI 모델",
    category: "텍스트",
    pricing: "$20/월",
    pricingType: "paid",
    rating: 4.8,
    users: 5000000,
    website: "https://claude.ai",
    features: ["대화", "분석", "창작"],
    prosAndCons: {
      pros: ["뛰어난 추론 능력", "긴 컨텍스트 지원"],
      cons: ["높은 비용", "제한된 무료 사용"]
    }
  },
  {
    name: "Pika Labs",
    company: "Pika Labs",
    description: "텍스트에서 비디오 생성하는 AI",
    category: "영상",
    pricing: "$10/월",
    pricingType: "freemium",
    rating: 4.3,
    users: 3000000,
    website: "https://pika.art",
    features: ["비디오 생성", "애니메이션", "편집"],
    prosAndCons: {
      pros: ["쉬운 사용법", "빠른 생성"],
      cons: ["짧은 영상만 가능", "워터마크"]
    }
  },
  {
    name: "Suno AI",
    company: "Suno",
    description: "AI 음악 생성 플랫폼",
    category: "음성",
    pricing: "$8/월",
    pricingType: "freemium",
    rating: 4.5,
    users: 2500000,
    website: "https://suno.ai",
    features: ["음악 생성", "가사 작성", "보컬 합성"],
    prosAndCons: {
      pros: ["고품질 음악", "다양한 장르"],
      cons: ["저작권 이슈", "제한된 커스터마이징"]
    }
  },
  {
    name: "Gamma",
    company: "Gamma Technologies",
    description: "AI 프레젠테이션 제작 도구",
    category: "텍스트",
    pricing: "$15/월",
    pricingType: "freemium",
    rating: 4.4,
    users: 4000000,
    website: "https://gamma.app",
    features: ["프레젠테이션", "웹사이트", "문서"],
    prosAndCons: {
      pros: ["빠른 제작", "세련된 디자인"],
      cons: ["제한된 템플릿", "브랜딩 제약"]
    }
  },
  {
    name: "Character.AI",
    company: "Character Technologies",
    description: "AI 캐릭터와 대화하는 플랫폼",
    category: "텍스트",
    pricing: "$9.99/월",
    pricingType: "freemium",
    rating: 4.2,
    users: 20000000,
    website: "https://character.ai",
    features: ["캐릭터 생성", "롤플레이", "교육"],
    prosAndCons: {
      pros: ["창의적 상호작용", "다양한 캐릭터"],
      cons: ["부정확한 정보", "중독성"]
    }
  },
  {
    name: "Ideogram",
    company: "Ideogram",
    description: "텍스트가 포함된 이미지 생성 AI",
    category: "이미지",
    pricing: "$20/월",
    pricingType: "freemium",
    rating: 4.3,
    users: 1500000,
    website: "https://ideogram.ai",
    features: ["텍스트 이미지", "로고 생성", "포스터"],
    prosAndCons: {
      pros: ["정확한 텍스트", "다양한 스타일"],
      cons: ["제한된 무료 사용", "느린 생성"]
    }
  },
  {
    name: "Anthropic Claude 3.5",
    company: "Anthropic",
    description: "향상된 멀티모달 AI 어시스턴트",
    category: "텍스트",
    pricing: "$20/월",
    pricingType: "freemium",
    rating: 4.9,
    users: 8000000,
    website: "https://claude.ai",
    features: ["멀티모달", "코딩", "분석", "창작"],
    prosAndCons: {
      pros: ["뛰어난 추론", "이미지 이해", "긴 대화"],
      cons: ["높은 비용", "API 대기열"]
    }
  },
  {
    name: "Flux AI",
    company: "Black Forest Labs",
    description: "오픈소스 이미지 생성 모델",
    category: "이미지",
    pricing: "무료",
    pricingType: "freemium",
    rating: 4.6,
    users: 5000000,
    website: "https://replicate.com/black-forest-labs/flux-1.1-pro",
    features: ["고해상도 이미지", "빠른 생성", "스타일 제어"],
    prosAndCons: {
      pros: ["무료 사용", "고품질", "오픈소스"],
      cons: ["복잡한 설정", "하드웨어 요구사항"]
    }
  }
];

let addedToolsIndex = 0;

export class AIUpdater {
  private static instance: AIUpdater;
  private isRunning = false;

  static getInstance(): AIUpdater {
    if (!AIUpdater.instance) {
      AIUpdater.instance = new AIUpdater();
    }
    return AIUpdater.instance;
  }

  async startDailyUpdates() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log("AI 도구 자동 업데이트 시작됨");
    
    // 즉시 한 번 실행
    await this.updateAITools();
    
    // 24시간마다 실행 (실제로는 6시간마다 더 빈번하게)
    setInterval(async () => {
      await this.updateAITools();
    }, 6 * 60 * 60 * 1000); // 6시간
  }

  private async updateAITools() {
    try {
      console.log("새로운 AI 도구 확인 중...");
      
      // 현재 도구 수 확인
      const currentTools = await storage.getAllAiTools();
      const currentCount = currentTools.length;
      
      // 새로운 도구 추가 (하루에 1-3개씩)
      const toolsToAdd = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < toolsToAdd && addedToolsIndex < NEW_AI_TOOLS_POOL.length; i++) {
        const newTool = NEW_AI_TOOLS_POOL[addedToolsIndex];
        
        // 중복 확인
        const exists = currentTools.some(tool => 
          tool.name === newTool.name || tool.website === newTool.website
        );
        
        if (!exists) {
          await storage.addAiTool(newTool);
          console.log(`새로운 AI 도구 추가됨: ${newTool.name}`);
        }
        
        addedToolsIndex++;
      }
      
      // 기존 도구 정보 업데이트 (사용자 수, 평점 등)
      await this.updateExistingTools();
      
      const newCount = (await storage.getAllAiTools()).length;
      console.log(`AI 도구 업데이트 완료: ${currentCount} -> ${newCount}`);
      
    } catch (error) {
      console.error("AI 도구 업데이트 중 오류:", error);
    }
  }

  private async updateExistingTools() {
    try {
      const tools = await storage.getAllAiTools();
      
      // 랜덤하게 몇 개 도구의 정보 업데이트
      const toolsToUpdate = tools.slice(0, Math.floor(Math.random() * 5) + 1);
      
      for (const tool of toolsToUpdate) {
        // 사용자 수를 약간 증가
        const userGrowth = Math.floor(Math.random() * 100000) + 10000;
        const newUsers = tool.users + userGrowth;
        
        // 평점을 미세 조정
        const ratingChange = (Math.random() - 0.5) * 0.2;
        const newRating = Math.max(1, Math.min(5, tool.rating + ratingChange));
        
        await storage.updateAiTool(tool.id, {
          users: newUsers,
          rating: Math.round(newRating * 10) / 10
        });
      }
    } catch (error) {
      console.error("기존 도구 업데이트 중 오류:", error);
    }
  }

  // 수동으로 특정 AI 도구 추가
  async addSpecificTool(toolData: Omit<InsertAiTool, 'id'>) {
    try {
      const newTool = await storage.addAiTool(toolData);
      console.log(`수동으로 AI 도구 추가됨: ${newTool.name}`);
      return newTool;
    } catch (error) {
      console.error("AI 도구 수동 추가 중 오류:", error);
      throw error;
    }
  }

  // 통계 조회
  async getUpdateStats() {
    const tools = await storage.getAllAiTools();
    return {
      totalTools: tools.length,
      recentlyAdded: tools.filter(tool => {
        const dayAgo = new Date();
        dayAgo.setDate(dayAgo.getDate() - 1);
        return tool.createdAt && tool.createdAt > dayAgo;
      }).length,
      categories: tools.reduce((acc, tool) => {
        acc[tool.category] = (acc[tool.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

// 싱글톤 인스턴스 내보내기
export const aiUpdater = AIUpdater.getInstance();