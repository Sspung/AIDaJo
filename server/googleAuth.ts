import dotenv from "dotenv";
dotenv.config();

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import type { Express } from "express";
import { storage } from "./storage";

// 환경변수에서 클라이언트 ID/시크릿을 안전하게 불러옴
const clientID = process.env.GOOGLE_CLIENT_ID as string;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET as string;

// 디버깅용 로그
console.log('Google OAuth Configuration:');
console.log('- Client ID exists:', !!clientID);
console.log('- Client Secret exists:', !!clientSecret);
console.log('- Client ID length:', clientID?.length || 0);
console.log('- Client Secret length:', clientSecret?.length || 0);

export function setupGoogleAuth(app: Express) {
  // 현재 도메인을 가져와서 콜백 URL 생성
  const domain = process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000';
  const protocol = domain.includes('localhost') ? 'http' : 'https';
  const callbackURL = `${protocol}://${domain}/api/auth/google/callback`;
  
  console.log('Google OAuth callback URL:', callbackURL);
  
  // 구글 OAuth 전략 설정
  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // 사용자 정보 추출
          const userData = {
            id: profile.id,
            email: profile.emails?.[0]?.value || "",
            firstName: profile.name?.givenName || "",
            lastName: profile.name?.familyName || "",
            profileImageUrl: profile.photos?.[0]?.value || "",
          };

          // 데이터베이스에 사용자 정보 저장/업데이트
          const user = await storage.upsertUser(userData);
          return done(null, user);
        } catch (error) {
          console.error("Google OAuth error:", error);
          return done(error, false);
        }
      },
    ),
  );

  // 세션 직렬화
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // 미들웨어 설정
  app.use(passport.initialize());
  app.use(passport.session());

  // 구글 로그인 라우트
  app.get(
    "/api/auth/google",
    (req, res, next) => {
      console.log('Google OAuth request initiated');
      next();
    },
    passport.authenticate("google", {
      scope: ["profile", "email"],
    }),
  );

  // 구글 콜백 라우트
  app.get(
    "/api/auth/google/callback",
    (req, res, next) => {
      console.log('Google OAuth callback received');
      console.log('Query params:', req.query);
      next();
    },
    passport.authenticate("google", { 
      failureRedirect: "/login",
      failureMessage: true
    }),
    (req, res) => {
      console.log('Google OAuth login successful');
      res.redirect("/");
    },
  );

  // 로그아웃 라우트
  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "로그아웃 실패" });
      }
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: "세션 삭제 실패" });
        }
        res.json({ success: true, message: "로그아웃 완료" });
      });
    });
  });

  // 사용자 정보 조회 라우트
  app.get("/api/auth/user", (req: any, res) => {
    if (req.isAuthenticated() && req.user) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  console.log("Google OAuth setup completed");
}
