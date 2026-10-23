# SkillProof — Prove What You Can Actually Do

> **Category**: Education & Career Development  
> **Target Audience**: University students, self-taught developers, internship applicants, mentors, and recruiters.  
> **Core Principle**: *Proof, not claims.* A completed challenge is not automatically a verified skill. Every result demonstrates its assessment status, published rubric breakdown, and supporting code evidence.

---

## 🌟 Overview

Students often list certificates or arbitrary skills on their CVs but struggle to demonstrate what they can practically build. Meanwhile, recruiters and mentors spend hours filtering claims.

**SkillProof** provides an evidence-based skill evaluation platform where students complete practical developer challenges, submit inspectable code or repository links, receive objective AI-assisted rubric feedback powered by **Gemini 3.8 Flash**, track measurable improvement across versions, and build a shareable portfolio audited by human mentors.

---

## 🛠️ Technical Architecture

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Motion.
- **Backend**: Node.js & Express server with TypeScript (`server.ts`).
- **AI Evaluator**: `@google/genai` TypeScript SDK using `gemini-3.8-flash` on the server side with structured JSON rubric parsing and zero client-side key exposure.
- **Database & Persistence**:
  - Built-in persistent file engine storing state atomically in `data/db.json` across server restarts.
  - Complete Supabase / PostgreSQL schema migrations with Row Level Security (RLS) located in `migrations/001_initial_schema.sql` and `migrations/seed.sql`.
- **Public URL Sharing**: Hash routing supporting deep links (`#/profile/:username`, `#/challenge/:slug`, `#/history`).

---

## 🚀 Key Features

1. **Transparent, Predefined Rubrics**: Every challenge publishes its exact criterion weights (totaling 100 points) before a student begins.
2. **Evidence-Based AI Evaluation**: Gemini 3.8 Flash inspects submitted code, quoting exact lines of evidence for every awarded point.
3. **Historical Attempt Comparison**: Side-by-side comparison between Attempt 1 and Attempt 2 with exact criteria deltas (+/- points) and code refactoring inspectable side-by-side.
4. **Distinction of Verification Status**:
   - `Submitted`: Work has been uploaded.
   - `AI Assessed`: Evaluated by Gemini against the published rubric.
   - `Human Verified`: Audited and signed by an authorized mentor.
   - `In Progress / Draft`: Student is actively refining their code.
5. **Mentor Review Portal**: Protected workflow for authorized mentors (e.g. Dr. Sarah Marcus) to review student code evidence, add feedback, and grant official Human Verification badges.
6. **Public Shareable Portfolio**: Generates a shareable URL (`/profile/username`) with customizable public visibility and code evidence inspector.
7. **Judge & Demo Mode**: One-click persona switching in the header between:
   - **Alice Chen (Student Demo)**: 2 attempts on Interactive Task Manager showing real improvement (68 &rarr; 88), plus 1 Human-Verified Responsive Login Page.
   - **Dr. Sarah Marcus (Mentor)**: Access to the mentor verification portal.
   - **+ New Student Account**: Guided 4-step onboarding flow for fresh evaluations.
   - **Reset Demo Data**: Instant restore button in the header.

---

## 📂 Project Structure

```
├── data/
│   └── db.json                    # Persistent local database state
├── migrations/
│   ├── 001_initial_schema.sql      # Supabase PostgreSQL schema with RLS
│   └── seed.sql                   # SQL seed script
├── src/
│   ├── api/
│   │   └── client.ts              # Typed API client
│   ├── components/
│   │   ├── Navbar.tsx             # Brand header with persona switcher & demo reset
│   │   ├── OnboardingModal.tsx    # 4-step student onboarding modal
│   │   ├── RubricBreakdownCard.tsx# Criterion score bar & code evidence card
│   │   └── VerificationBadge.tsx  # Unboxed zero-pill status badge
│   ├── server/
│   │   ├── db.ts                  # Persistent database engine
│   │   ├── geminiService.ts       # Server-side Gemini 3.8 Flash rubric evaluator
│   │   └── seedData.ts            # Realistic seed challenges, rubrics & demo history
│   ├── types/
│   │   └── index.ts               # Shared TypeScript domain models
│   ├── views/
│   │   ├── LandingView.tsx        # High-converting value proposition landing page
│   │   ├── DashboardView.tsx      # Student metrics, readiness score & recent reviews
│   │   ├── ChallengeLibraryView.tsx # Searchable, filterable challenge catalog
│   │   ├── ChallengeDetailView.tsx # Brief, published rubric, starter code & submission
│   │   ├── AssessmentResultView.tsx# AI score breakdown, evidence & confetti
│   │   ├── ProfileView.tsx        # Shareable public portfolio & evidence modal
│   │   ├── HistoryComparisonView.tsx # Attempt 1 vs Attempt 2 side-by-side diff
│   │   ├── MentorPortalView.tsx   # Authorized mentor review & verification queue
│   │   └── MethodologyView.tsx    # Transparency & evaluation standards
│   ├── App.tsx                    # Main app routing & state
│   └── main.tsx                   # Client mount
├── server.ts                      # Express backend & Vite middleware
├── .env.example                   # Environment configuration template
└── package.json                   # Dependencies and npm scripts
```

---

## 💻 Local Setup & Development

1. **Clone the repository and install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your `GEMINI_API_KEY`:
   ```bash
   GEMINI_API_KEY="your-gemini-api-key"
   ```

3. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Build for Production**:
   ```bash
   npm run build
   npm run start
   ```

---

## 🗄️ Supabase PostgreSQL Deployment (Optional)

To connect SkillProof to Supabase:
1. Create a new Supabase project at [supabase.com](https://supabase.com).
2. Run the SQL script from `migrations/001_initial_schema.sql` in the Supabase SQL Editor.
3. Run `migrations/seed.sql` to populate initial skills and demo records.
4. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your environment.

---

## ⚖️ Assessment Methodology & Limitations

- **Evidence-Based Evaluation**: Gemini 3.8 Flash performs static AST inspection of the provided code against published rubric criteria.
- **Limitations**:
  - Automated AI assessment performs pattern and AST inspection. It does not execute untrusted student code inside an isolated OS container.
  - Responsive layout is verified through viewport CSS media queries and flexbox/grid definitions.
  - SkillProof provides formative feedback and verified evidence portfolios; it is not an accredited degree-granting institution.
