# InterviewAI — AI Mock Interview Platform

Full-stack implementation of the InterviewAI PRD: React/Vite/Tailwind frontend +
Node/Express/MongoDB backend, powered by Google Gemini for question generation,
answer evaluation, resume analysis, and job-description matching.

## What's implemented

**Candidate**
- Register / login / logout, refresh tokens, forgot/reset password, email verification
- Profile management (skills, experience, education, LinkedIn, GitHub)
- Resume upload (PDF/DOCX) → text extraction → Cloudinary storage
- AI resume analysis: ATS score, missing skills, grammar & formatting suggestions
- Job description matcher: match %, missing skills, keywords, suggestions
- Mock interview: choose role / experience level / difficulty / type / question count,
  optionally personalized from resume + a pasted job description
- Live interview session: AI-generated questions, per-answer AI evaluation
  (technical accuracy, communication, confidence, problem solving, clarity),
  model answers, improvement tips
- Final AI-generated report: overall/technical/communication/confidence scores,
  strengths, weaknesses, recommended topics, PDF export
- Dashboard: totals, average/best score, strong/weak areas, progress chart, recent interviews
- Notifications (welcome, report-ready, system broadcasts)

**Admin**
- User management (search, promote/demote role, activate/deactivate, delete)
- Platform analytics (signups & interviews over time, interviews by role/type, completion rate)
- AI usage dashboard (calls & average latency per AI action)
- System logs (login activity + AI request audit trail)
- Broadcast notifications to all users or a specific role

## Tech stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router, TanStack Query, Framer Motion, Recharts
- **Backend:** Node.js, Express
- **Database:** MongoDB + Mongoose (Users, Interviews, Questions, Answers, Reports, Resumes, Notifications, Sessions)
- **Auth:** JWT access + refresh tokens, bcrypt
- **Storage:** Cloudinary (resume files)
- **AI:** Google Gemini API (`@google/generative-ai`)
- **PDF export:** pdfkit

## Project structure

```
interviewai/
  backend/
    config/        # db.js, cloudinary.js
    models/        # 8 Mongoose schemas
    middleware/     # auth, admin, error, rateLimit, upload (multer), validate
    controllers/    # auth, user, resume, interview, report, dashboard, admin
    routes/         # one router per module, mounted under /api/*
    utils/          # geminiClient (all AI prompts), resumeParser, pdfExport,
                     # generateTokens, sendEmail, logger, seedAdmin
    server.js
  frontend/
    src/
      api/axios.js         # axios instance + refresh-token interceptor
      context/AuthContext.jsx
      components/          # Navbar, route guards, shared UI (Card, ScoreBadge, EmptyState)
      pages/                # candidate pages
      pages/admin/          # admin pages
      App.jsx, main.jsx, index.css
```

## Setup

### 1. Prerequisites
- Node.js 18+
- A MongoDB database (Atlas free tier works)
- A Google Gemini API key: https://aistudio.google.com/app/apikey
- A Cloudinary account (free tier) for resume file storage
- An SMTP account for transactional email (Gmail app password, SendGrid, etc.) — optional
  for local dev; if left blank, emails just fail silently and are logged, so registration
  and password flows still work.

### 2. Backend

```bash
cd backend
cp .env.example .env
# edit .env: MONGO_URI, JWT secrets, GEMINI_API_KEY, CLOUDINARY_*, SMTP_*
npm install
npm run seed:admin   # creates an admin user from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD
npm run dev          # starts on http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev           # starts on http://localhost:5173, proxies /api to :5000
```

Open http://localhost:5173, register an account, upload a resume, and start a mock interview.
Log in with your seeded admin account and visit `/admin` for the admin dashboard.

### 4. Deployment

- **Frontend → Vercel**: set the build command `npm run build`, output dir `dist`, and add
  a rewrite/proxy (or `VITE`-time env var) pointing `/api` at your deployed backend URL.
- **Backend → Render**: set all `.env` vars in the Render dashboard, build command
  `npm install`, start command `npm start`.

## Notes on scope

- The PRD's "AI API" module is implemented as part of the resume routes
  (`/api/resume/:id/analyze`, `/api/resume/:id/match-jd`) and interview routes
  (question generation on interview creation, evaluation on each answer submit)
  rather than as a separate standalone module — same underlying Gemini client
  (`backend/utils/geminiClient.js`), just organized by the resource it acts on.
- Rate limiting is tuned tighter on AI endpoints (`aiLimiter`, 10 req/min) since those
  are the expensive calls.
- This is a working, from-scratch codebase — it has not been run against a live
  MongoDB/Gemini/Cloudinary account in this environment (no network access here), so
  budget time for the normal first-run debugging of env vars and API keys.
