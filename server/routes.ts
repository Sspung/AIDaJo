import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiUpdater } from "./ai-updater";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { setupGoogleAuth } from "./googleAuth";
import type { AiTool } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Replit Auth 설정
  await setupAuth(app);
  
  // Google OAuth 설정
  setupGoogleAuth(app);

  // Replit Auth routes (disabled for now - using Google OAuth)
  /*
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  */

  // Login endpoint to register user (token-based)
  app.post("/api/auth/login", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }

      const { id, email, firstName, lastName, profileImageUrl } = req.body;
      
      // Create or update user in database
      const user = await storage.upsertUser({
        id,
        email,
        firstName,
        lastName,
        profileImageUrl,
      });

      res.json({ success: true, user });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Get current user route is handled by Google OAuth in googleAuth.ts

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session = null;
    res.json({ success: true });
  });

  // User favorites endpoints (token-based)
  app.get("/api/user/favorites", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Verify token and get user info
      const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${token}`);
      if (!response.ok) {
        return res.status(401).json({ error: "Invalid token" });
      }

      const googleUser = await response.json();
      
      // Mock data for now
      const favorites = [
        { id: 1, name: "영상 제작 패키지", type: "bundle", userId: googleUser.id },
        { id: 2, name: "ChatGPT", type: "tool", userId: googleUser.id },
        { id: 3, name: "Midjourney", type: "tool", userId: googleUser.id }
      ];

      res.json(favorites);
    } catch (error) {
      console.error("Get favorites error:", error);
      res.status(500).json({ error: "Failed to get favorites" });
    }
  });

  app.post("/api/user/favorites", async (req, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      if (!sessionUser) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { itemId, itemType, itemName } = req.body;
      // Add favorite logic here
      res.json({ success: true, message: "Added to favorites" });
    } catch (error) {
      console.error("Add favorite error:", error);
      res.status(500).json({ error: "Failed to add favorite" });
    }
  });

  app.delete("/api/user/favorites/:id", async (req, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      if (!sessionUser) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      // Remove favorite logic here
      res.json({ success: true, message: "Removed from favorites" });
    } catch (error) {
      console.error("Remove favorite error:", error);
      res.status(500).json({ error: "Failed to remove favorite" });
    }
  });

  // AI Tools endpoints
  app.get("/api/ai-tools", async (req, res) => {
    try {
      const { category, search } = req.query;
      
      let tools;
      if (search) {
        tools = await storage.searchAiTools(search as string);
      } else if (category && category !== "전체") {
        tools = await storage.getAiToolsByCategory(category as string);
      } else {
        tools = await storage.getAllAiTools();
      }
      
      res.json(tools);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch AI tools" });
    }
  });

  app.get("/api/ai-tools/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tool = await storage.getAiToolById(id);
      
      if (!tool) {
        return res.status(404).json({ error: "AI tool not found" });
      }
      
      res.json(tool);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch AI tool" });
    }
  });

  // AI Bundles endpoints
  app.get("/api/ai-bundles", async (req, res) => {
    try {
      const bundles = await storage.getAllAiBundles();
      res.json(bundles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch AI bundles" });
    }
  });

  app.get("/api/ai-bundles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const bundle = await storage.getAiBundleById(id);
      
      if (!bundle) {
        return res.status(404).json({ error: "AI bundle not found" });
      }
      
      res.json(bundle);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch AI bundle" });
    }
  });

  // Get tools included in a bundle
  app.get("/api/ai-bundles/:id/tools", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const bundle = await storage.getAiBundleById(id);
      if (!bundle) {
        return res.status(404).json({ message: "Bundle not found" });
      }
      
      // Get tools that match the bundle's category or are specifically included
      const tools = await storage.getAllAiTools();
      let bundleTools: AiTool[] = [];
      
      if (id === 1) { // 영상 제작 패키지
        bundleTools = tools.filter(tool => 
          tool.category === "영상" || 
          ["Runway ML", "Synthesia", "Descript", "DALL-E 3"].includes(tool.name)
        );
      } else if (id === 2) { // 텍스트 작업 패키지  
        bundleTools = tools.filter(tool => 
          tool.category === "텍스트" || 
          ["ChatGPT", "Claude", "Jasper", "Copy.ai"].includes(tool.name)
        );
      } else if (id === 3) { // 개발자 패키지
        bundleTools = tools.filter(tool => 
          tool.category === "코딩" || 
          ["GitHub Copilot", "Replit Ghostwriter", "Cursor", "Tabnine"].includes(tool.name)
        );
      }
      
      res.json(bundleTools);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch bundle tools: " + error.message });
    }
  });

  // Quiz endpoints
  app.get("/api/quiz/questions", async (req, res) => {
    try {
      const questions = await storage.getAllQuizQuestions();
      res.json(questions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quiz questions" });
    }
  });

  app.post("/api/quiz/recommend", async (req, res) => {
    try {
      const { answers } = req.body;
      
      if (!answers || typeof answers !== 'object') {
        return res.status(400).json({ error: "Invalid answers provided" });
      }

      const tools = await storage.getAllAiTools();
      const bundles = await storage.getAllAiBundles();
      let recommendations = [...tools];
      let scoreModifiers: {[key: number]: number} = {};

      // Initialize scores
      recommendations.forEach(tool => {
        scoreModifiers[tool.id] = 0;
      });

      // NEW QUIZ STRUCTURE MATCHING
      for (const [questionKey, answer] of Object.entries(answers)) {
        recommendations.forEach(tool => {
          // Q1: 목적별 매칭
          if (questionKey === "q1") {
            if (answer === "work" && ["텍스트", "생산성", "데이터분석", "코딩", "마케팅"].includes(tool.category)) {
              scoreModifiers[tool.id] += 25;
            } else if (answer === "creative" && ["이미지", "영상", "음악", "디자인", "텍스트"].includes(tool.category)) {
              scoreModifiers[tool.id] += 25;
            } else if (answer === "learning" && ["텍스트", "교육", "코딩", "데이터분석"].includes(tool.category)) {
              scoreModifiers[tool.id] += 25;
            } else if (answer === "personal" && ["건강", "여행", "엔터테인먼트", "생산성"].includes(tool.category)) {
              scoreModifiers[tool.id] += 25;
            } else if (answer === "finance" && ["금융", "데이터분석", "텍스트"].includes(tool.category)) {
              scoreModifiers[tool.id] += 25;
            }
          }
          
          // Q2: 세부 작업별 매칭
          if (questionKey === "q2") {
            const taskCategoryMap: {[key: string]: string} = {
              // 업무 관련
              'work_text': '텍스트', 'work_analysis': '데이터분석', 'work_automation': '생산성',
              'work_coding': '코딩', 'work_marketing': '마케팅',
              // 창작 관련
              'creative_visual': '이미지', 'creative_video': '영상', 'creative_music': '음악',
              'creative_writing': '텍스트', 'creative_design': '디자인',
              // 학습 관련
              'learning_language': '텍스트', 'learning_tech': '코딩', 'learning_research': '텍스트',
              'learning_skill': '교육', 'learning_academic': '교육',
              // 일상 관련
              'personal_health': '건강', 'personal_travel': '여행', 'personal_entertainment': '엔터테인먼트',
              'personal_productivity': '생산성', 'personal_home': '생산성',
              // 재정 관련
              'finance_investment': '금융', 'finance_budgeting': '금융', 'finance_business': '금융',
              'finance_crypto': '금융', 'finance_planning': '금융'
            };
            
            if (taskCategoryMap[answer] === tool.category) {
              scoreModifiers[tool.id] += 40; // 정확한 매칭에 높은 점수
            }
          }
          
          // 예산 고려
          if (questionKey === "q4") {
            if (answer === "free" && tool.pricing === "free") {
              scoreModifiers[tool.id] += 15;
            } else if (answer === "freemium" && ["free", "freemium"].includes(tool.pricing)) {
              scoreModifiers[tool.id] += 12;
            } else if (answer === "paid" && tool.pricing !== "enterprise") {
              scoreModifiers[tool.id] += 8;
            }
          }
          
          // 경험 수준
          if (questionKey === "q5") {
            if (answer === "beginner" && tool.rating >= 85) {
              scoreModifiers[tool.id] += 10;
            } else if (answer === "expert" && tool.rating >= 70) {
              scoreModifiers[tool.id] += 8;
            }
          }
        });
      }

      // 점수 기반 정렬
      const scored = recommendations.map(tool => ({
        ...tool,
        matchPercentage: Math.min(95, Math.max(50, tool.rating + scoreModifiers[tool.id]))
      })).sort((a, b) => b.matchPercentage - a.matchPercentage);

      // 패키지 추천
      const packageRecommendations = bundles.filter(bundle => {
        const firstAnswer = answers["q1"];
        const secondAnswer = answers["q2"];
        
        // 목적과 세부 작업에 따른 패키지 매칭
        if (firstAnswer === "creative" && ["영상 제작", "디자인", "크리에이터", "소셜미디어"].includes(bundle.category)) return true;
        if (firstAnswer === "work" && ["비즈니스", "마케팅", "개발자", "생산성"].includes(bundle.category)) return true;
        if (firstAnswer === "personal" && ["건강 관리", "여행", "소셜미디어", "엔터테인먼트"].includes(bundle.category)) return true;
        if (firstAnswer === "finance" && ["투자", "금융", "비즈니스"].includes(bundle.category)) return true;
        if (firstAnswer === "learning" && ["교육", "학습", "개발자"].includes(bundle.category)) return true;
        
        // 세부 작업별 매칭
        if (secondAnswer === "personal_health" && bundle.category === "건강 관리") return true;
        if (secondAnswer === "personal_travel" && bundle.category === "여행") return true;
        if (secondAnswer === "creative_video" && bundle.category === "영상 제작") return true;
        if (secondAnswer === "work_marketing" && bundle.category === "마케팅") return true;
        
        return false;
      }).slice(0, 5);

      res.json({
        tools: scored.slice(0, 10),
        packages: packageRecommendations
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate recommendations" });
    }
  });

  // Analytics endpoints with real-time simulation
  app.get("/api/analytics/stats", async (req, res) => {
    try {
      const stats = await storage.getUsageStats();
      
      // Simulate real-time changes
      const now = Date.now();
      const variance = Math.sin(now / 60000) * 0.05; // 5% variance based on time
      
      // Calculate aggregate stats with real-time simulation
      const baseTotal = stats.reduce((sum, stat) => sum + stat.totalUsers, 0);
      const totalUsers = Math.round(baseTotal * (1 + variance));
      
      const baseDailyUsers = Math.round(stats.reduce((sum, stat) => sum + stat.dailyActiveUsers, 0) / stats.length);
      const dailyActiveUsers = Math.round(baseDailyUsers * (1 + variance * 2));
      
      const avgSessionTime = Math.round(stats.reduce((sum, stat) => sum + stat.avgSessionTime, 0) / stats.length);
      const avgSatisfaction = (stats.reduce((sum, stat) => sum + stat.satisfactionScore, 0) / stats.length / 10);

      // Dynamic category distribution
      const timeOffset = Math.floor(now / 10000) % 4;
      const distributions = [
        [68, 18, 8, 6],
        [70, 16, 9, 5],
        [66, 20, 8, 6],
        [69, 17, 9, 5]
      ];
      const currentDist = distributions[timeOffset];

      res.json({
        totalUsers,
        dailyActiveUsers,
        avgSessionTime,
        satisfactionScore: Math.round(avgSatisfaction * 10) / 10,
        categoryDistribution: [
          { category: "텍스트", percentage: currentDist[0], color: "blue" },
          { category: "이미지", percentage: currentDist[1], color: "purple" },
          { category: "영상", percentage: currentDist[2], color: "red" },
          { category: "음성", percentage: currentDist[3], color: "orange" }
        ]
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.get("/api/analytics/rankings", async (req, res) => {
    try {
      const rankings = await storage.getCategoryRankings();
      res.json(rankings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rankings" });
    }
  });

  app.get("/api/analytics/popular", async (req, res) => {
    try {
      const tools = await storage.getAllAiTools();
      const now = Date.now();
      
      // Create growth-based ranking (simulate trending tools)
      const toolsWithGrowth = tools.map(tool => {
        // Simulate growth based on rating and random factors
        const baseGrowth = Math.max(0, (tool.rating - 70) / 2); // Higher rated tools tend to grow more
        const randomFactor = Math.sin(now / 25000 + tool.id) * 10; // Random fluctuation
        const growth = Math.round(baseGrowth + randomFactor + 5);
        
        return {
          ...tool,
          growth: Math.max(1, growth) // Ensure positive growth
        };
      });
      
      // Sort by growth rate for trending
      const trendingTools = toolsWithGrowth
        .sort((a, b) => b.growth - a.growth)
        .slice(0, 20) // Top 20 trending
        .map((tool, index) => ({
          ...tool,
          rank: index + 1
        }));

      res.json(trendingTools);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch popular tools" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
