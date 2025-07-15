# AI DaJo - AI Tools Platform

## Project Overview
AI DaJo is a comprehensive AI tools discovery and recommendation platform featuring:
- 500+ AI tools across 17 categories with Korean/English bilingual support
- Enhanced 5+ question recommendation quiz system for personalized suggestions
- Custom package creation and management
- Real-time analytics dashboard
- PostgreSQL database with Replit Auth integration

## Recent Changes
- ✓ Firebase Authentication integration completed alongside existing Google OAuth
- ✓ Firebase hooks and components created for alternative auth option
- ✓ Updated Firebase configuration with actual AI DaJo project credentials
- ✓ Dual authentication system: Google OAuth (current) + Firebase Auth (optional)
- ✓ Fixed bundle routing from query parameters to path parameters (/bundle-detail/1)
- ✓ Enhanced quiz system with parentOption logic for conditional questions
- ✓ Resolved "패키지 시작하기" button navigation issues
- ✓ Database schema updated with descriptionEn field for AI tools
- ✓ Authentication framework prepared with PostgreSQL backend
- ✓ Replit Auth system activated with OpenID Connect
- ✓ Google OAuth login routes configured and working
- ✓ Google OAuth credentials provided and configured
- ✓ Replit Auth system properly configured with correct domain
- ✓ Firebase Admin SDK integrated for server-side operations
- ✓ Fixed project structure and routing issues
- ✓ Resolved ES module import/export problems 
- ✓ Server running on port 5000 with Google OAuth configured
- → Frontend module resolution issues need fixing for full UI access

## User Preferences
- **Language Approach**: Additive only - preserve original Korean content, add English translations alongside
- **Company Branding**: "AI DaJo" (completely replace all instances of "AI트리" and "AI Hub")
- **Contact Information**: foraitree@gmail.com (keep original email)
- **Technical Preferences**: PostgreSQL database, Google OAuth for authentication
- **UI/UX**: Clean, professional interface with Korean/English language toggle
- **Login Button Placement**: Only in top navigation bar, not in hero section

## Project Architecture
- **Frontend**: React + TypeScript with Vite, TailwindCSS + shadcn/ui
- **Backend**: Express.js with PostgreSQL database
- **Authentication**: Replit Auth with OpenID Connect (Google OAuth)
- **Database**: PostgreSQL with Drizzle ORM
- **Routing**: Bundle details use path parameters (/bundle-detail/:id)
- **State Management**: TanStack Query for server state
- **Language**: Context-based i18n with Korean/English support

## Database Schema
- `ai_tools`: Enhanced with descriptionEn field for English translations
- `users`: Replit Auth compatible with profile data
- `sessions`: Session storage for authentication
- `custom_packages`: User-created AI tool packages
- `ai_bundles`: Pre-configured tool packages
- `quiz_questions`: 5+ question flow with parentOption logic

## Development Status
- Core platform functionality: Complete
- Quiz recommendation system: Complete with enhanced 5+ questions
- Bundle routing and navigation: Fixed and working
- Database integration: PostgreSQL configured and connected
- Authentication system: Complete with Google OAuth and token-based auth
- Multi-language support: Korean/English implemented
- User profiles and favorites: Complete with localStorage persistence