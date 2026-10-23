
import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { db } from './src/server/db.ts';
import { evaluateSubmissionWithAI } from './src/server/geminiService.ts';
import { Submission, Profile, MentorReview, AssessmentComparison } from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS: allow the deployed Vercel frontend to call the Render API
const allowedOrigins = [
  'https://skill-proof-vert.vercel.app',
];

app.use((req: Request, res: Response, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, x-user-id'
    );
  }

  // Handle browser preflight requests
  if (req.method === 'OPTIONS') {
    if (origin && allowedOrigins.includes(origin)) {
      return res.sendStatus(204);
    }
    return res.sendStatus(403);
  }

  next();
});

app.use(express.json({ limit: '10mb' }));

// Simple in-memory active session
let currentActiveUserId = 'usr_alice_chen';

function getActiveUser(req: Request): Profile {
  const headerUserId = req.headers['x-user-id'] as string;
  const targetId = headerUserId || currentActiveUserId;
  const profile = db.getProfileById(targetId);
  if (profile) return profile;
  return db.getProfileById('usr_alice_chen')!;
}

// ================= API ROUTES =================

// 1. Session & Auth
app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getActiveUser(req);
  res.json({ user });
});

app.post('/api/auth/switch-user', (req: Request, res: Response) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  const profile = db.getProfileById(userId);
  if (!profile) {
    return res.status(404).json({ error: 'User not found' });
  }
  currentActiveUserId = userId;
  res.json({ success: true, user: profile });
});

app.post('/api/auth/create-student', (req: Request, res: Response) => {
  const { username, display_name, bio, university, selected_skills } = req.body;
  if (!username || !display_name) {
    return res.status(400).json({ error: 'Username and display name are required' });
  }

  const normalizedUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
  const existing = db.getProfileByUsername(normalizedUsername);
  if (existing) {
    return res.status(409).json({ error: 'Username already taken' });
  }

  if (!normalizedUsername) {
    return res.status(400).json({ error: 'Please provide a valid username' });
  }

  const newProfile: Profile = {
    id: 'usr_' + Date.now(),
    username: normalizedUsername,
    display_name,
    bio: bio || 'Student on SkillProof building verified evidence.',
    university: university || 'University Student',
    avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(normalizedUsername)}`,
    github_url: '',
    selected_skills: Array.isArray(selected_skills) ? selected_skills : ['JavaScript', 'HTML & CSS'],
    is_public: true,
    role: 'student',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.saveProfile(newProfile);
  currentActiveUserId = newProfile.id;
  res.status(201).json({ success: true, user: newProfile });
});

// 2. Challenges
app.get('/api/challenges', (_req: Request, res: Response) => {
  const challenges = db.getChallenges();
  res.json({ challenges });
});

app.get('/api/challenges/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const challenge = db.getChallengeBySlug(slug);
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }
  res.json({ challenge });
});

// 3. Submissions
app.get('/api/submissions', (req: Request, res: Response) => {
  const studentId = req.query.student_id as string | undefined;
  const challengeId = req.query.challenge_id as string | undefined;

  let subs = db.getSubmissions(studentId);
  if (challengeId) {
    subs = subs.filter(s => s.challenge_id === challengeId);
  }

  const populated = subs.map(sub => ({
    ...sub,
    assessment: db.getAssessmentBySubmissionId(sub.id),
    mentor_review: db.getMentorReviewBySubmissionId(sub.id)
  }));

  res.json({ submissions: populated });
});

app.get('/api/submissions/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const sub = db.getSubmissionById(id);
  if (!sub) {
    return res.status(404).json({ error: 'Submission not found' });
  }

  res.json({
    submission: sub,
    challenge: db.getChallengeById(sub.challenge_id),
    assessment: db.getAssessmentBySubmissionId(sub.id),
    mentor_review: db.getMentorReviewBySubmissionId(sub.id)
  });
});

app.post('/api/submissions', (req: Request, res: Response) => {
  const user = getActiveUser(req);
  const {
    challenge_id,
    submission_type,
    repository_url,
    project_url,
    source_code,
    explanation,
    is_draft
  } = req.body;

  if (!challenge_id) {
    return res.status(400).json({ error: 'challenge_id is required' });
  }

  const challenge = db.getChallengeById(challenge_id);
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  const previous = db.getSubmissions(user.id).filter(s => s.challenge_id === challenge_id);

  const newSub: Submission = {
    id: 'sub_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    student_id: user.id,
    student_name: user.display_name,
    student_username: user.username,
    challenge_id,
    challenge_title: challenge.title,
    challenge_slug: challenge.slug,
    submission_type: submission_type || 'code',
    repository_url: repository_url || undefined,
    project_url: project_url || undefined,
    source_code: source_code || undefined,
    explanation: explanation || undefined,
    attempt_number: previous.length + 1,
    status: is_draft ? 'draft' : 'submitted',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const saved = db.saveSubmission(newSub);
  res.status(201).json({ submission: saved });
});

// 4. AI Evaluation with Gemini
app.post('/api/submissions/:id/assess', async (req: Request, res: Response) => {
  const { id } = req.params;
  const submission = db.getSubmissionById(id);
  if (!submission) {
    return res.status(404).json({ error: 'Submission not found' });
  }

  const challenge = db.getChallengeById(submission.challenge_id);
  if (!challenge) {
    return res.status(404).json({ error: 'Associated challenge not found' });
  }

  submission.status = 'evaluating';
  db.saveSubmission(submission);

  try {
    const assessment = await evaluateSubmissionWithAI({ submission, challenge });

    db.saveAssessment(assessment);
    submission.status = 'ai_assessed';
    db.saveSubmission(submission);

    res.json({ success: true, submission, assessment });
  } catch (error: any) {
    submission.status = 'submitted';
    db.saveSubmission(submission);
    res.status(500).json({
      error: error.message || 'AI assessment failed. Please check server logs and configuration.'
    });
  }
});

// 5. Mentor Review
app.post('/api/submissions/:id/mentor-review', (req: Request, res: Response) => {
  const user = getActiveUser(req);

  if (user.role !== 'mentor' && user.role !== 'admin') {
    return res.status(403).json({
      error: 'Unauthorized: Only verified mentors can submit a human verification review.'
    });
  }

  const { id } = req.params;
  const submission = db.getSubmissionById(id);
  if (!submission) {
    return res.status(404).json({ error: 'Submission not found' });
  }

  const { verification_status, feedback, criteria_confirmed } = req.body;
  if (!verification_status || !feedback) {
    return res.status(400).json({ error: 'verification_status and feedback are required' });
  }

  if (!['verified', 'declined', 'changes_requested'].includes(verification_status)) {
    return res.status(400).json({ error: 'Invalid verification_status' });
  }

  const mentorReview: MentorReview = {
    id: 'rev_' + Date.now(),
    submission_id: submission.id,
    mentor_id: user.id,
    mentor_name: user.display_name,
    mentor_title: user.bio ? user.bio.slice(0, 60) : 'Technical Mentor',
    verification_status,
    feedback: String(feedback).trim(),
    criteria_confirmed: Boolean(criteria_confirmed),
    reviewed_at: new Date().toISOString()
  };

  db.saveMentorReview(mentorReview);

  if (verification_status === 'verified') {
    submission.status = 'human_verified';
  } else if (verification_status === 'changes_requested') {
    submission.status = 'revision_requested';
  }

  db.saveSubmission(submission);

  res.json({ success: true, submission, mentor_review: mentorReview });
});

// 6. Public or Authenticated Profile
app.get('/api/profile/:username', (req: Request, res: Response) => {
  const { username } = req.params;
  const profile = db.getProfileByUsername(username);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  const currentUser = getActiveUser(req);
  const isOwner = currentUser.id === profile.id;

  let subs = db.getSubmissions(profile.id);
  if (!isOwner && !profile.is_public) {
    return res.status(403).json({ error: 'This profile is private.' });
  }

  if (!isOwner) {
    subs = subs.filter(s => s.status !== 'draft');
  }

  const populatedSubs = subs.map(sub => ({
    ...sub,
    assessment: db.getAssessmentBySubmissionId(sub.id),
    mentor_review: db.getMentorReviewBySubmissionId(sub.id)
  }));

  const completedChallenges = new Set(
    populatedSubs
      .filter(s => s.status === 'ai_assessed' || s.status === 'human_verified')
      .map(s => s.challenge_id)
  );

  res.json({
    profile,
    is_owner: isOwner,
    submissions: populatedSubs,
    metrics: {
      total_submissions: populatedSubs.length,
      completed_challenges_count: completedChallenges.size,
      ai_assessed_count: populatedSubs.filter(s => s.status === 'ai_assessed').length,
      human_verified_count: populatedSubs.filter(s => s.status === 'human_verified').length
    }
  });
});

app.put('/api/profile/:username', (req: Request, res: Response) => {
  const { username } = req.params;
  const profile = db.getProfileByUsername(username);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  const currentUser = getActiveUser(req);
  if (currentUser.id !== profile.id && currentUser.role !== 'admin') {
    return res.status(403).json({ error: 'You are not authorized to edit this profile' });
  }

  const { bio, university, github_url, selected_skills, is_public } = req.body;
  if (bio !== undefined) profile.bio = bio;
  if (university !== undefined) profile.university = university;
  if (github_url !== undefined) profile.github_url = github_url;
  if (selected_skills !== undefined) profile.selected_skills = selected_skills;
  if (is_public !== undefined) profile.is_public = Boolean(is_public);
  profile.updated_at = new Date().toISOString();

  const saved = db.saveProfile(profile);
  res.json({ success: true, profile: saved });
});

// 7. Attempt Comparison
app.get('/api/compare', (req: Request, res: Response) => {
  const subAId = req.query.sub_a as string;
  const subBId = req.query.sub_b as string;

  if (!subAId || !subBId) {
    return res.status(400).json({ error: 'Both sub_a and sub_b query parameters are required' });
  }

  const subA = db.getSubmissionById(subAId);
  const subB = db.getSubmissionById(subBId);
  if (!subA || !subB) {
    return res.status(404).json({ error: 'One or both submissions not found' });
  }

  const asmtA = db.getAssessmentBySubmissionId(subAId);
  const asmtB = db.getAssessmentBySubmissionId(subBId);
  if (!asmtA || !asmtB) {
    return res.status(400).json({ error: 'Both submissions must have completed AI assessments to compare' });
  }

  const scoreDelta = asmtB.overall_score - asmtA.overall_score;
  const criteriaDeltas = asmtB.criteria.map(critB => {
    const critA = asmtA.criteria.find(
      c => c.criterion_id === critB.criterion_id || c.name === critB.name
    );
    const scoreA = critA ? critA.score : 0;

    return {
      criterionName: critB.name,
      scoreA,
      scoreB: critB.score,
      maxScore: critB.max_score,
      delta: critB.score - scoreA
    };
  });

  const comparison: AssessmentComparison = {
    attemptA: { submission: subA, assessment: asmtA },
    attemptB: { submission: subB, assessment: asmtB },
    scoreDelta,
    criteriaDeltas
  };

  res.json({ comparison });
});

// 8. Public GitHub Repo Inspector
app.post('/api/github/fetch-repo', async (req: Request, res: Response) => {
  const { repositoryUrl } = req.body;

  if (typeof repositoryUrl !== 'string' || !repositoryUrl.trim()) {
    return res.status(400).json({ error: 'repositoryUrl is required' });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(repositoryUrl);
  } catch {
    return res.status(400).json({ error: 'Invalid GitHub repository URL format' });
  }

  if (parsedUrl.hostname !== 'github.com') {
    return res.status(400).json({ error: 'Only public GitHub repository URLs are supported' });
  }

  const parts = parsedUrl.pathname.split('/').filter(Boolean);
  if (parts.length < 2) {
    return res.status(400).json({ error: 'Invalid GitHub repository URL format' });
  }

  const owner = parts[0];
  const repo = parts[1].replace(/\.git$/, '');

  try {
    const apiUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    let ghRes: globalThis.Response;
    try {
      ghRes = await fetch(apiUrl, {
        signal: controller.signal,
        headers: { 'User-Agent': 'SkillProof-Hackathon-Evaluator' }
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!ghRes.ok) {
      return res.status(422).json({
        error: `Could not inspect repository (HTTP ${ghRes.status}). Verify the repository is public and accessible.`
      });
    }

    const contents = await ghRes.json();
    if (!Array.isArray(contents)) {
      return res.status(422).json({ error: 'Unexpected GitHub contents structure.' });
    }

    const fileList = contents.map((f: any) => ({
      name: f.name,
      path: f.path,
      type: f.type,
      size: f.size,
      download_url: f.download_url
    }));

    const candidate = fileList.find((f: any) =>
      /^(index\.html|app\.(js|ts|jsx|tsx)|main\.(js|ts|jsx|tsx)|readme\.md)$/i.test(f.name)
    );

    let snippet = '';
    if (candidate?.download_url) {
      const fileFetch = await fetch(candidate.download_url);
      if (fileFetch.ok) {
        const sourceText = await fileFetch.text();
        snippet = `// [Extracted from ${candidate.name}]\n` + sourceText.slice(0, 15000);
      }
    }

    res.json({
      success: true,
      owner,
      repo,
      files: fileList.map((f: any) => f.name),
      primaryFile: candidate?.name,
      extractedSnippet: snippet
    });
  } catch (err: any) {
    res.status(500).json({
      error: `Repository inspection failed: ${err.message || 'Timeout or network issue'}`
    });
  }
});

// 9. Reset Demo Data
app.post('/api/demo/reset', (_req: Request, res: Response) => {
  db.resetDemoData();
  currentActiveUserId = 'usr_alice_chen';
  res.json({ success: true, message: 'Demo dataset restored to pristine state.' });
});

// ================= VITE DEV / PRODUCTION STATIC =================
const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SkillProof full-stack server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
