export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type SubmissionType = 'code' | 'github_repo' | 'live_url';

export type SubmissionStatus = 
  | 'draft' 
  | 'submitted' 
  | 'evaluating' 
  | 'ai_assessed' 
  | 'human_verified' 
  | 'revision_requested';

export type VerificationStatus = 'verified' | 'declined' | 'changes_requested';

export type UserRole = 'student' | 'mentor' | 'admin';

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  weight: number; // e.g. 35 (out of 100)
  max_score: number;
}

export interface Rubric {
  criteria: RubricCriterion[];
  total_points: number; // 100
}

export interface Challenge {
  id: string;
  slug: string;
  title: string;
  description: string;
  skill_category: string;
  difficulty: Difficulty;
  estimated_minutes: number;
  requirements: string[];
  acceptance_criteria: string[];
  starter_code?: string;
  starter_filename?: string;
  rubric: Rubric;
  is_published: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Submission {
  id: string;
  student_id: string;
  student_name?: string;
  student_username?: string;
  challenge_id: string;
  challenge_title?: string;
  challenge_slug?: string;
  submission_type: SubmissionType;
  repository_url?: string;
  project_url?: string;
  source_code?: string;
  explanation?: string;
  attempt_number: number;
  status: SubmissionStatus;
  created_at: string;
  updated_at: string;
}

export interface AssessmentCriterionResult {
  criterion_id: string;
  name: string;
  score: number;
  max_score: number;
  evidence: string;
  feedback: string;
}

export interface Assessment {
  id: string;
  submission_id: string;
  challenge_id: string;
  student_id: string;
  model_identifier: string;
  overall_score: number; // 0 - 100
  criteria: AssessmentCriterionResult[];
  strengths: string[];
  improvements: string[];
  limitations: string[];
  assessment_status: 'passed' | 'needs_work';
  generated_at: string;
}

export interface MentorReview {
  id: string;
  submission_id: string;
  mentor_id: string;
  mentor_name: string;
  mentor_title: string;
  verification_status: VerificationStatus;
  feedback: string;
  criteria_confirmed: boolean;
  reviewed_at: string;
}

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  university?: string;
  avatar_url?: string;
  github_url?: string;
  selected_skills: string[];
  is_public: boolean;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface AssessmentComparison {
  attemptA: {
    submission: Submission;
    assessment: Assessment;
  };
  attemptB: {
    submission: Submission;
    assessment: Assessment;
  };
  scoreDelta: number;
  criteriaDeltas: {
    criterionName: string;
    scoreA: number;
    scoreB: number;
    maxScore: number;
    delta: number;
  }[];
}
