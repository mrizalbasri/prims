# PRISM Setup Guide

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Git

## Initial Setup

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
createdb prism_db
```

### 3. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/prism_db?schema=public"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Campus Configuration
ALLOWED_EMAIL_DOMAINS="student.president.ac.id,admin.president.ac.id"

# AI Services (Google Gemini)
GEMINI_API_KEY="your-gemini-api-key-here"
# Optional model overrides
GEMINI_WRITING_MODEL="gemini-2.5-flash"
GEMINI_SPEAKING_MODEL="gemini-2.5-flash-native-audio-dialog"

# Application
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Admin Default Account (for initial setup)
ADMIN_EMAIL="admin@president.ac.id"
ADMIN_PASSWORD="change-this-password"

# File Upload (for speaking audio)
MAX_AUDIO_SIZE_MB="10"
UPLOAD_DIR="./uploads/audio"

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS="100"
RATE_LIMIT_WINDOW_MS="900000"

# Scoring Configuration
VOCAB_WEIGHT="0.20"
GRAMMAR_WEIGHT="0.20"
READING_WEIGHT="0.25"
WRITING_WEIGHT="0.20"
SPEAKING_WEIGHT="0.15"

# Test Configuration
VOCAB_TIME_LIMIT_SEC="480"
GRAMMAR_TIME_LIMIT_SEC="480"
READING_TIME_LIMIT_SEC="720"
WRITING_TIME_LIMIT_SEC="600"
SPEAKING_TIME_LIMIT_SEC="420"
```

### 4. Run Database Migrations

```bash
npx prisma generate
npx prisma db push
```

### 5. Seed Initial Data (Optional)

```bash
npm run seed
```

### 6. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Database Schema

The Prisma schema includes:

- **Users**: Student and admin accounts
- **TestAttempts**: Placement test sessions
- **SectionAttempts**: Individual test sections (Vocabulary, Grammar, Reading, Writing, Speaking)
- **ObjectiveAnswers**: Multiple choice responses
- **WritingResponse**: Essay responses with AI scoring
- **SpeakingResponse**: Audio responses with AI scoring
- **FinalResult**: Computed scores and proficiency levels
- **Questions**: Question bank for objective sections
- **Prompts**: Writing and speaking prompts
- **AuditLog**: System activity tracking

## Next Steps

### Phase 1 MVP Implementation Order:

1. ✅ **Database Schema** - Completed
2. **Authentication System**
   - Register/login endpoints
   - JWT token management
   - Role-based access control
   - Campus email validation

3. **Question Bank Setup**
   - Create seed data for vocabulary questions
   - Create seed data for grammar questions
   - Create seed data for reading passages
   - Create writing prompts
   - Create speaking prompts

4. **Test Engine**
   - Test session management
   - Section timer implementation
   - Autosave functionality
   - Answer submission handling

5. **Scoring System**
   - Objective section scoring
   - AI integration for writing evaluation
   - AI integration for speaking evaluation
   - Final score calculation with weights

6. **Student Interface**
   - Test-taking UI with timers
   - Progress indicators
   - Result display page

7. **Admin Dashboard**
   - Student results listing
   - Filtering by cohort/major
   - CSV export functionality

8. **Testing & Deployment**
   - End-to-end testing
   - Production deployment
   - SSL setup

## Development Commands

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Open Prisma Studio (database GUI)
npx prisma studio

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Project Structure

```
prism/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin pages
│   ├── student/           # Student pages
│   └── login/             # Auth pages
├── lib/                   # Shared utilities
│   ├── auth.ts           # Authentication helpers
│   ├── scoring.ts        # Scoring logic
│   └── types.ts          # TypeScript types
├── prisma/               # Database schema
│   └── schema.prisma
├── public/               # Static assets
└── docs/                 # Documentation
```

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists

### Prisma Client Issues
```bash
npx prisma generate --force
```

### Migration Issues
```bash
npx prisma db push --force-reset
```

## Support

For issues or questions, refer to:
- [PRISM_PRD_v2.md](./PRISM_PRD_v2.md) - Product requirements
- [Phase 1 SRS](./docs/superpowers/specs/2026-06-12-prism-phase-1-mvp-srs.md) - Technical specifications
