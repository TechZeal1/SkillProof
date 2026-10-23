import React from 'react';
import { 
  Award, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  FileCode, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  PlusCircle
} from 'lucide-react';
import { Profile, Challenge, Submission, Assessment, MentorReview } from '../types/index.ts';
import { VerificationBadge } from '../components/VerificationBadge.tsx';

interface Props {
  currentUser: Profile;
  challenges: Challenge[];
  submissions: (Submission & { assessment?: Assessment; mentor_review?: MentorReview })[];
  onNavigate: (view: string, param?: string) => void;
  onSelectChallenge: (slug: string) => void;
  onOpenSubmission: (submissionId: string) => void;
}

export const DashboardView: React.FC<Props> = ({
  currentUser,
  challenges,
  submissions,
  onNavigate,
  onSelectChallenge,
  onOpenSubmission
}) => {
  // Metrics calculated from real data
  const userSubmissions = submissions.filter(s => s.student_id === currentUser.id);
  const completedChallengeIds = new Set(
    userSubmissions
      .filter(s => s.status === 'ai_assessed' || s.status === 'human_verified')
      .map(s => s.challenge_id)
  );
  
  const completedCount = completedChallengeIds.size;
  const humanVerifiedCount = userSubmissions.filter(s => s.status === 'human_verified').length;
  const aiAssessedCount = userSubmissions.filter(s => s.status === 'ai_assessed').length;

  // Calculate profile completion percentage based on real fields
  let completionScore = 20; // baseline account creation
  if (currentUser.display_name && currentUser.username) completionScore += 20;
  if (currentUser.bio && currentUser.bio.length > 10) completionScore += 20;
  if (currentUser.selected_skills && currentUser.selected_skills.length > 0) completionScore += 20;
  if (userSubmissions.length > 0) completionScore += 20;

  // Detect historical improvement (challenges with multiple assessed attempts)
  const challengeAttemptsMap = new Map<string, typeof userSubmissions>();
  userSubmissions.forEach(sub => {
    if (sub.assessment) {
      const existing = challengeAttemptsMap.get(sub.challenge_id) || [];
      existing.push(sub);
      challengeAttemptsMap.set(sub.challenge_id, existing);
    }
  });

  // Find a challenge with 2+ attempts to highlight improvement
  let improvementChallenge: {
    challenge: Challenge;
    attemptA: typeof userSubmissions[0];
    attemptB: typeof userSubmissions[0];
    delta: number;
  } | null = null;

  for (const [chId, subs] of challengeAttemptsMap.entries()) {
    if (subs.length >= 2) {
      const sorted = [...subs].sort((a, b) => a.attempt_number - b.attempt_number);
      const first = sorted[0];
      const latest = sorted[sorted.length - 1];
      if (first.assessment && latest.assessment) {
        const ch = challenges.find(c => c.id === chId);
        if (ch) {
          improvementChallenge = {
            challenge: ch,
            attemptA: first,
            attemptB: latest,
            delta: latest.assessment.overall_score - first.assessment.overall_score
          };
          break;
        }
      }
    }
  }

  // Recommended challenges (not yet completed)
  const recommendedChallenges = challenges
    .filter(c => !completedChallengeIds.has(c.id))
    .slice(0, 3);

  // Latest assessed submission for feedback spotlight
  const latestAssessed = [...userSubmissions]
    .filter(s => s.assessment)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Welcome back, {currentUser.display_name}
            </h1>
            <span className="text-xs font-mono text-slate-400">@{currentUser.username}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            {currentUser.university ? `${currentUser.university} · ` : ''}
            Prove your abilities through rigorous rubrics and inspectable code evidence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('challenges')}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-xs"
          >
            <Award className="w-4 h-4" />
            <span>Explore Challenges</span>
          </button>
          <button
            onClick={() => onNavigate('profile', currentUser.username)}
            className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
          >
            View Portfolio
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80">
          <div className="text-xs font-semibold text-slate-400 mb-1">Challenges Completed</div>
          <div className="text-3xl font-extrabold text-slate-900">{completedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Out of {challenges.length} available</div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80">
          <div className="text-xs font-semibold text-slate-400 mb-1">Human Verified Proofs</div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">{humanVerifiedCount}</span>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Audited by mentor</div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80">
          <div className="text-xs font-semibold text-slate-400 mb-1">AI Rubric Assessments</div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-extrabold text-indigo-600">{aiAssessedCount}</span>
            <Sparkles className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Evaluated by Gemini</div>
        </div>

        {/* Metric 4: Profile Completion */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80">
          <div className="text-xs font-semibold text-slate-400 mb-1">Profile Readiness</div>
          <div className="text-3xl font-extrabold text-slate-900">{completionScore}%</div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all"
              style={{ width: `${completionScore}%` }}
            />
          </div>
        </div>

      </div>

      {/* Historical Improvement Spotlight (When actual historical attempts exist!) */}
      {improvementChallenge && (
        <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                  <span>Demonstrated Growth Over Time</span>
                  <span aria-hidden="true">·</span>
                  <span>{improvementChallenge.challenge.title}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Score improved from {improvementChallenge.attemptA.assessment?.overall_score} to{' '}
                  {improvementChallenge.attemptB.assessment?.overall_score}{' '}
                  <span className="text-emerald-700">
                    (+{improvementChallenge.delta} points)
                  </span>
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Comparing Attempt #{improvementChallenge.attemptA.attempt_number} against Attempt #{improvementChallenge.attemptB.attempt_number} across published rubric criteria.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('compare', `${improvementChallenge!.attemptA.id}_${improvementChallenge!.attemptB.id}`)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shrink-0 flex items-center gap-1.5 transition-colors"
            >
              <span>Compare Both Attempts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Recent Assessment Results & Feedback */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Recent Assessment Results</h2>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View all history &rarr;
            </button>
          </div>

          {userSubmissions.length === 0 ? (
            /* Thoughtful Onboarding Empty State for Brand New Users */
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <FileCode className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">No submissions yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You haven't submitted any challenge code yet. Pick a challenge below to generate your first verified proof.
              </p>
              <button
                onClick={() => onSelectChallenge('responsive-login-page')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Start Responsive Login Challenge</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {userSubmissions.slice(0, 4).map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => onOpenSubmission(sub.id)}
                  className="bg-white rounded-xl border border-slate-200/80 p-4 hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{sub.challenge_title}</h4>
                      <span className="text-[11px] text-slate-400">· Attempt #{sub.attempt_number}</span>
                    </div>
                    <VerificationBadge
                      status={sub.status}
                      score={sub.assessment?.overall_score}
                      mentorName={sub.mentor_review?.mentor_name}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    {sub.assessment && (
                      <div className="text-right">
                        <span className="text-base font-extrabold text-slate-900">
                          {sub.assessment.overall_score}
                        </span>
                        <span className="text-xs text-slate-400">/100</span>
                      </div>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Latest Rubric Feedback Snippet */}
          {latestAssessed?.assessment && (
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-900">Latest Evaluator Feedback</span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {latestAssessed.challenge_title}
                </span>
              </div>

              <div>
                <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                  Key Strengths
                </div>
                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                  {latestAssessed.assessment.strengths.slice(0, 2).map((str, i) => (
                    <li key={i}>{str}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider mb-1">
                  Priority Fixes For Next Attempt
                </div>
                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                  {latestAssessed.assessment.improvements.slice(0, 2).map((imp, i) => (
                    <li key={i}>{imp}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => onOpenSubmission(latestAssessed.id)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  View full rubric breakdown &rarr;
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Skills Being Developed & Recommended Challenges */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Skills Developing */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Skills Being Developed</h3>
            
            <div className="flex flex-wrap gap-1.5">
              {currentUser.selected_skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 rounded-md border border-slate-200/60"
                >
                  {skill}
                </span>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Skills advance to verified status as challenges matching these topics are evaluated and approved.
            </p>
          </div>

          {/* Recommended Challenges */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Recommended Challenges</h3>
              <button
                onClick={() => onNavigate('challenges')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                All challenges
              </button>
            </div>

            <div className="space-y-3">
              {recommendedChallenges.map((ch) => (
                <div
                  key={ch.id}
                  className="p-3.5 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/50 space-y-2 transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-indigo-600 capitalize">{ch.difficulty}</span>
                    <span>{ch.estimated_minutes} mins</span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900">{ch.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{ch.description}</p>

                  <button
                    onClick={() => onSelectChallenge(ch.slug)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
                  >
                    <span>Start challenge</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
