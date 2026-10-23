import fs from 'fs';
import path from 'path';
import { Challenge, Profile, Submission, Assessment, MentorReview } from '../types/index.ts';
import {
  SEED_PROFILES,
  SEED_CHALLENGES,
  SEED_SUBMISSIONS,
  SEED_ASSESSMENTS,
  SEED_MENTOR_REVIEWS
} from './seedData.ts';

interface DatabaseSchema {
  profiles: Profile[];
  challenges: Challenge[];
  submissions: Submission[];
  assessments: Assessment[];
  mentor_reviews: MentorReview[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.challenges) && Array.isArray(parsed.profiles)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read existing db.json, initializing fresh seed database:', e);
    }

    const initialData: DatabaseSchema = {
      profiles: [...SEED_PROFILES],
      challenges: [...SEED_CHALLENGES],
      submissions: [...SEED_SUBMISSIONS],
      assessments: [...SEED_ASSESSMENTS],
      mentor_reviews: [...SEED_MENTOR_REVIEWS]
    };
    this.save(initialData);
    return initialData;
  }

  private save(dataToSave: DatabaseSchema = this.data): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write db.json:', e);
    }
  }

  // --- Profiles ---
  getProfiles(): Profile[] {
    return this.data.profiles;
  }

  getProfileById(id: string): Profile | undefined {
    return this.data.profiles.find(p => p.id === id);
  }

  getProfileByUsername(username: string): Profile | undefined {
    return this.data.profiles.find(p => p.username.toLowerCase() === username.toLowerCase());
  }

  saveProfile(profile: Profile): Profile {
    const idx = this.data.profiles.findIndex(p => p.id === profile.id);
    if (idx >= 0) {
      this.data.profiles[idx] = { ...profile, updated_at: new Date().toISOString() };
    } else {
      this.data.profiles.push(profile);
    }
    this.save();
    return profile;
  }

  // --- Challenges ---
  getChallenges(): Challenge[] {
    return this.data.challenges;
  }

  getChallengeBySlug(slug: string): Challenge | undefined {
    return this.data.challenges.find(c => c.slug === slug);
  }

  getChallengeById(id: string): Challenge | undefined {
    return this.data.challenges.find(c => c.id === id);
  }

  // --- Submissions ---
  getSubmissions(studentId?: string): Submission[] {
    if (studentId) {
      return this.data.submissions.filter(s => s.student_id === studentId);
    }
    return this.data.submissions;
  }

  getSubmissionById(id: string): Submission | undefined {
    return this.data.submissions.find(s => s.id === id);
  }

  saveSubmission(sub: Submission): Submission {
    const idx = this.data.submissions.findIndex(s => s.id === sub.id);
    if (idx >= 0) {
      this.data.submissions[idx] = { ...sub, updated_at: new Date().toISOString() };
    } else {
      this.data.submissions.push(sub);
    }
    this.save();
    return sub;
  }

  // --- Assessments ---
  getAssessments(studentId?: string): Assessment[] {
    if (studentId) {
      return this.data.assessments.filter(a => a.student_id === studentId);
    }
    return this.data.assessments;
  }

  getAssessmentBySubmissionId(submissionId: string): Assessment | undefined {
    return this.data.assessments.find(a => a.submission_id === submissionId);
  }

  saveAssessment(assessment: Assessment): Assessment {
    const idx = this.data.assessments.findIndex(a => a.id === assessment.id);
    if (idx >= 0) {
      this.data.assessments[idx] = assessment;
    } else {
      this.data.assessments.push(assessment);
    }
    this.save();
    return assessment;
  }

  // --- Mentor Reviews ---
  getMentorReviews(): MentorReview[] {
    return this.data.mentor_reviews;
  }

  getMentorReviewBySubmissionId(submissionId: string): MentorReview | undefined {
    return this.data.mentor_reviews.find(r => r.submission_id === submissionId);
  }

  saveMentorReview(review: MentorReview): MentorReview {
    const idx = this.data.mentor_reviews.findIndex(r => r.id === review.id);
    if (idx >= 0) {
      this.data.mentor_reviews[idx] = review;
    } else {
      this.data.mentor_reviews.push(review);
    }
    this.save();
    return review;
  }

  // --- Reset Demo Data ---
  resetDemoData(): void {
    // Keep user-created profiles if any, but restore seed demo records
    const nonDemoProfiles = this.data.profiles.filter(
      p => p.id !== 'usr_alice_chen' && p.id !== 'usr_mentor_sarah'
    );
    const nonDemoSubmissions = this.data.submissions.filter(
      s => s.student_id !== 'usr_alice_chen'
    );
    const nonDemoAssessments = this.data.assessments.filter(
      a => a.student_id !== 'usr_alice_chen'
    );

    this.data = {
      profiles: [...SEED_PROFILES, ...nonDemoProfiles],
      challenges: [...SEED_CHALLENGES],
      submissions: [...SEED_SUBMISSIONS, ...nonDemoSubmissions],
      assessments: [...SEED_ASSESSMENTS, ...nonDemoAssessments],
      mentor_reviews: [...SEED_MENTOR_REVIEWS]
    };
    this.save();
  }
}

export const db = new Database();
