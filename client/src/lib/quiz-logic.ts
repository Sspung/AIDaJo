import type { AiTool } from "@shared/schema";

export interface QuizAnswers {
  [key: string]: string;
}

export function generateRecommendations(answers: QuizAnswers, tools: AiTool[]): AiTool[] {
  let filteredTools = [...tools];
  
  // Filter by purpose
  if (answers.q1) {
    switch (answers.q1) {
      case 'content':
        filteredTools = filteredTools.filter(t => 
          ['텍스트', '이미지', '영상'].includes(t.category)
        );
        break;
      case 'analysis':
        filteredTools = filteredTools.filter(t => 
          t.category === '텍스트' || t.name.toLowerCase().includes('claude')
        );
        break;
      case 'automation':
        filteredTools = filteredTools.filter(t => 
          t.category === '코딩' || t.features.some(f => f.includes('자동화'))
        );
        break;
      case 'learning':
        filteredTools = filteredTools.filter(t => 
          t.category === '텍스트'
        );
        break;
    }
  }

  // Filter by budget
  if (answers.q2) {
    switch (answers.q2) {
      case 'free':
        filteredTools = filteredTools.filter(t => t.pricing === 'free');
        break;
      case 'low':
        filteredTools = filteredTools.filter(t => 
          t.pricing === 'free' || t.pricing === 'freemium'
        );
        break;
      case 'medium':
        // Include all except very expensive ones
        break;
      case 'high':
        // No filtering by price
        break;
    }
  }

  // Sort by rating and return top recommendations
  return filteredTools.sort((a, b) => b.rating - a.rating);
}

export function calculateMatchPercentage(tool: AiTool, answers: QuizAnswers): number {
  let score = 0;
  let maxScore = 0;

  // Question 1: Purpose matching (25% weight)
  if (answers["q1"]) {
    maxScore += 25;
    const purposeMap: Record<string, string[]> = {
      'work': ['텍스트', '생산성', '데이터분석', '코딩'],
      'creative': ['이미지', '영상', '음악', '디자인', '텍스트'],
      'learning': ['텍스트', '교육', '코딩', '데이터분석'],
      'personal': ['건강', '여행', '엔터테인먼트', '생산성'],
      'finance': ['금융', '데이터분석', '텍스트']
    };
    
    const targetCategories = purposeMap[answers["q1"]] || [];
    if (targetCategories.includes(tool.category)) {
      score += 25;
    } else if (tool.category === '텍스트') {
      score += 10; // Text tools are versatile
    }
  }

  // Question 2: Specific task matching (25% weight)
  if (answers["q2"]) {
    maxScore += 25;
    const taskMap: Record<string, string> = {
      // 업무/비즈니스 관련
      'work_text': '텍스트',
      'work_analysis': '데이터분석',
      'work_automation': '생산성',
      'work_coding': '코딩',
      'work_marketing': '마케팅',
      // 창작 활동 관련
      'creative_visual': '이미지',
      'creative_video': '영상',
      'creative_music': '음악',
      'creative_writing': '텍스트',
      'creative_design': '디자인',
      // 학습/교육 관련
      'learning_language': '텍스트',
      'learning_tech': '코딩',
      'learning_research': '텍스트',
      'learning_skill': '교육',
      'learning_academic': '교육',
      // 일상생활 관련
      'personal_health': '건강',
      'personal_travel': '여행',
      'personal_entertainment': '엔터테인먼트',
      'personal_productivity': '생산성',
      'personal_home': '생산성',
      // 재정 관리 관련
      'finance_investment': '금융',
      'finance_budgeting': '금융',
      'finance_business': '금융',
      'finance_crypto': '금융',
      'finance_planning': '금융'
    };
    
    const targetCategory = taskMap[answers["q2"]];
    if (tool.category === targetCategory) {
      score += 25;
    } else if (tool.category === '텍스트' && answers["q2"].includes('text')) {
      score += 15; // 텍스트 관련 작업에 부분 점수
    }
  }

  // Question 3: Field matching (20% weight)
  if (answers["q3"]) {
    maxScore += 20;
    const fieldMap: Record<string, string> = {
      'marketing': '마케팅',
      'productivity': '생산성',
      'health': '건강',
      'travel': '여행',
      'education': '교육',
      'entertainment': '엔터테인먼트',
      'realestate': '부동산',
      'general': ''
    };
    
    const targetField = fieldMap[answers["q3"]];
    if (targetField && tool.category === targetField) {
      score += 20;
    } else if (answers["q3"] === 'general') {
      score += 15; // General use gets good score for popular tools
    } else if (tool.category === '텍스트' || tool.category === '생산성') {
      score += 8; // Versatile tools get partial credit
    }
  }

  // Question 4: Budget matching (15% weight)
  if (answers["q4"]) {
    maxScore += 15;
    const budgetMatch = {
      'free': tool.pricing === 'free' ? 15 : 0,
      'freemium': tool.pricing === 'free' || tool.pricing === 'freemium' ? 15 : 3,
      'paid': tool.pricing !== 'enterprise' ? 15 : 8,
      'enterprise': 15
    };
    score += budgetMatch[answers["q4"] as keyof typeof budgetMatch] || 0;
  }

  // Question 5: Experience level matching (10% weight)
  if (answers["q5"]) {
    maxScore += 10;
    const experienceScore = {
      'beginner': tool.rating >= 85 ? 10 : 5,
      'intermediate': tool.rating >= 75 ? 10 : 7,
      'advanced': tool.rating >= 70 ? 10 : 8,
      'expert': 10
    };
    score += experienceScore[answers["q5"] as keyof typeof experienceScore] || 0;
  }

  // Question 6: Feature preference (5% weight)
  if (answers["q6"]) {
    maxScore += 5;
    const featureBonus = {
      'accuracy': tool.rating >= 85 ? 5 : 2,
      'speed': tool.rating >= 80 ? 5 : 3,
      'ease': tool.rating >= 75 ? 5 : 3,
      'customization': tool.rating >= 70 ? 5 : 2,
      'integration': 4
    };
    score += featureBonus[answers["q6"] as keyof typeof featureBonus] || 0;
  }

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}
