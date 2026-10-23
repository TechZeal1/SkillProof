import { Challenge, Profile, Submission, Assessment, MentorReview, AssessmentComparison } from '../types/index.ts';

class ApiClient {
  private readonly baseUrl = 'https://skillproof-3e4o.onrender.com';
  private activeUserId: string = 'usr_alice_chen';

  setActiveUserId(id: string) {
    this.activeUserId = id;
    localStorage.setItem('skillproof_active_user', id);
  }

  getActiveUserId(): string {
    const saved = localStorage.getItem('skillproof_active_user');
    if (saved) {
      this.activeUserId = saved;
    }
    return this.activeUserId;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-user-id': this.getActiveUserId(),
      ...(options.headers as Record<string, string> || {})
    };

    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers
    });

    if (!res.ok) {
      let errorMsg = `Request failed: ${res.statusText}`;
      try {
        const errorJson = await res.json();
        if (errorJson.error) errorMsg = errorJson.error;
      } catch {
        // Ignore non-JSON error responses.
      }
      throw new Error(errorMsg);
    }

    return res.json();
  }

  // Auth / Profiles
  async getMe(): Promise<{ user: Profile }> {
    return this.request<{ user: Profile }>('/api/auth/me');
  }

  async switchUser(userId: string): Promise<{ success: boolean; user: Profile }> {
    this.setActiveUserId(userId);
    return this.request<{ success: boolean; user: Profile }>('/api/auth/switch-user', {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  }

  async createStudent(data: {
    username: string;
    display_name: string;
    bio?: string;
    university?: string;
    selected_skills?: string[];
  }): Promise<{ success: boolean; user: Profile }> {
    const res = await this.request<{ success: boolean; user: Profile }>('/api/auth/create-student', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (res.user?.id) {
      this.setActiveUserId(res.user.id);
    }

    return res;
  }

  // Challenges
  async getChallenges(): Promise<{ challenges: Challenge[] }> {
    return this.request<{ challenges: Challenge[] }>('/api/challenges');
  }

  async getChallengeBySlug(slug: string): Promise<{ challenge: Challenge }> {
    return this.request<{ challenge: Challenge }>(
      `/api/challenges/${encodeURIComponent(slug)}`
    );
  }

  // Submissions
  async getSubmissions(params?: {
    student_id?: string;
    challenge_id?: string;
  }): Promise<{
    submissions: (Submission & {
      assessment?: Assessment;
      mentor_review?: MentorReview;
    })[];
  }> {
    const query = new URLSearchParams();

    if (params?.student_id) query.set('student_id', params.student_id);
    if (params?.challenge_id) query.set('challenge_id', params.challenge_id);

    return this.request(`/api/submissions?${query.toString()}`);
  }

  async getSubmission(id: string): Promise<{
    submission: Submission;
    challenge: Challenge;
    assessment?: Assessment;
    mentor_review?: MentorReview;
  }> {
    return this.request(`/api/submissions/${encodeURIComponent(id)}`);
  }

  async createSubmission(data: {
    challenge_id: string;
    submission_type: 'code' | 'github_repo' | 'live_url';
    repository_url?: string;
    project_url?: string;
    source_code?: string;
    explanation?: string;
    is_draft?: boolean;
  }): Promise<{ submission: Submission }> {
    return this.request<{ submission: Submission }>('/api/submissions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // AI Assessment
  async assessSubmission(id: string): Promise<{
    success: boolean;
    submission: Submission;
    assessment: Assessment;
  }> {
    return this.request(`/api/submissions/${encodeURIComponent(id)}/assess`, {
      method: 'POST'
    });
  }

  // Mentor Review
  async submitMentorReview(
    submissionId: string,
    data: {
      verification_status: 'verified' | 'declined' | 'changes_requested';
      feedback: string;
      criteria_confirmed: boolean;
    }
  ): Promise<{
    success: boolean;
    submission: Submission;
    mentor_review: MentorReview;
  }> {
    return this.request(
      `/api/submissions/${encodeURIComponent(submissionId)}/mentor-review`,
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
  }

  // Profile
  async getProfile(username: string): Promise<{
    profile: Profile;
    is_owner: boolean;
    submissions: (Submission & {
      assessment?: Assessment;
      mentor_review?: MentorReview;
    })[];
    metrics: {
      total_submissions: number;
      completed_challenges_count: number;
      ai_assessed_count: number;
      human_verified_count: number;
    };
  }> {
    return this.request(`/api/profile/${encodeURIComponent(username)}`);
  }

  async updateProfile(
    username: string,
    data: Partial<Profile>
  ): Promise<{ success: boolean; profile: Profile }> {
    return this.request(`/api/profile/${encodeURIComponent(username)}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Comparison
  async compareSubmissions(
    subA: string,
    subB: string
  ): Promise<{ comparison: AssessmentComparison }> {
    const query = new URLSearchParams({
      sub_a: subA,
      sub_b: subB
    });

    return this.request(`/api/compare?${query.toString()}`);
  }

  // GitHub Inspection
  async inspectGitHubRepo(repositoryUrl: string): Promise<{
    success: boolean;
    owner: string;
    repo: string;
    files: string[];
    primaryFile?: string;
    extractedSnippet?: string;
  }> {
    return this.request('/api/github/fetch-repo', {
      method: 'POST',
      body: JSON.stringify({ repositoryUrl })
    });
  }

  // Reset Demo
  async resetDemoData(): Promise<{ success: boolean; message: string }> {
    const res = await this.request<{ success: boolean; message: string }>(
      '/api/demo/reset',
      { method: 'POST' }
    );

    this.setActiveUserId('usr_alice_chen');
    return res;
  }
}

export const api = new ApiClient();
