-- SkillProof Database Migration
-- PostgreSQL / Supabase Schema with Row Level Security (RLS)

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT DEFAULT '',
  university TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  github_url TEXT DEFAULT '',
  selected_skills TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'mentor', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Challenges Table
CREATE TABLE IF NOT EXISTS public.challenges (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  skill_category TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_minutes INTEGER NOT NULL,
  requirements TEXT[] NOT NULL,
  acceptance_criteria TEXT[] NOT NULL,
  starter_code TEXT,
  starter_filename TEXT,
  rubric_json JSONB NOT NULL,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Submissions Table
CREATE TABLE IF NOT EXISTS public.submissions (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  submission_type TEXT NOT NULL CHECK (submission_type IN ('code', 'github_repo', 'live_url')),
  repository_url TEXT,
  project_url TEXT,
  source_code TEXT,
  explanation TEXT,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'evaluating', 'ai_assessed', 'human_verified', 'revision_requested')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Assessments Table
CREATE TABLE IF NOT EXISTS public.assessments (
  id TEXT PRIMARY KEY,
  submission_id TEXT UNIQUE NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  model_identifier TEXT NOT NULL,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  criteria_json JSONB NOT NULL,
  strengths_json JSONB NOT NULL,
  improvements_json JSONB NOT NULL,
  limitations_json JSONB NOT NULL,
  assessment_status TEXT NOT NULL CHECK (assessment_status IN ('passed', 'needs_work')),
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Mentor Reviews Table
CREATE TABLE IF NOT EXISTS public.mentor_reviews (
  id TEXT PRIMARY KEY,
  submission_id TEXT UNIQUE NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  mentor_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mentor_name TEXT NOT NULL,
  mentor_title TEXT NOT NULL,
  verification_status TEXT NOT NULL CHECK (verification_status IN ('verified', 'declined', 'changes_requested')),
  feedback TEXT NOT NULL,
  criteria_confirmed BOOLEAN DEFAULT false,
  reviewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Skills Table
CREATE TABLE IF NOT EXISTS public.skills (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  description TEXT DEFAULT ''
);

-- 7. Profile Skills Junction Table
CREATE TABLE IF NOT EXISTS public.profile_skills (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  UNIQUE(profile_id, skill_id)
);

-- Indexes for Fast Querying
CREATE INDEX IF NOT EXISTS idx_submissions_student ON public.submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_challenge ON public.submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_assessments_submission ON public.assessments(submission_id);
CREATE INDEX IF NOT EXISTS idx_mentor_reviews_submission ON public.mentor_reviews(submission_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: Anyone can view public profiles; users can update their own
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (is_public = true OR auth.uid()::text = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid()::text = id);

-- Challenges: Published challenges are readable by all
CREATE POLICY "Published challenges are viewable by everyone" 
  ON public.challenges FOR SELECT USING (is_published = true);

-- Submissions: Students can view/edit their own; mentors can view all
CREATE POLICY "Students can view their own submissions" 
  ON public.submissions FOR SELECT USING (auth.uid()::text = student_id);

CREATE POLICY "Students can insert their own submissions" 
  ON public.submissions FOR INSERT WITH CHECK (auth.uid()::text = student_id);

CREATE POLICY "Students can update their own draft submissions" 
  ON public.submissions FOR UPDATE USING (auth.uid()::text = student_id);

-- Assessments: Visible to the submission student and mentors
CREATE POLICY "Assessments are viewable by submission owner" 
  ON public.assessments FOR SELECT USING (auth.uid()::text = student_id);

-- Mentor Reviews: Viewable by submission owner and mentors
CREATE POLICY "Mentor reviews viewable by everyone with submission access" 
  ON public.mentor_reviews FOR SELECT USING (true);
