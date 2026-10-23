import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Share2, 
  Check, 
  Globe, 
  Github, 
  ExternalLink, 
  Lock, 
  Eye, 
  Code2, 
  X, 
  FileCode, 
  ChevronRight,
  Award,
  Layers,
  Clock
} from 'lucide-react';
import { Profile, Submission, Assessment, MentorReview } from '../types/index.ts';
import { api } from '../api/client.ts';
import { VerificationBadge } from '../components/VerificationBadge.tsx';

interface Props {
  username: string;
  currentUser: Profile | null;
  onSelectChallenge: (slug: string) => void;
  onOpenSubmission: (submissionId: string) => void;
}

export const ProfileView: React.FC<Props> = ({
  username,
  currentUser,
  onSelectChallenge,
  onOpenSubmission
}) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [submissions, setSubmissions] = useState<(Submission & { assessment?: Assessment; mentor_review?: MentorReview })[]>([]);
  const [metrics, setMetrics] = useState<{
    total_submissions: number;
    completed_challenges_count: number;
    ai_assessed_count: number;
    human_verified_count: number;
  }>({ total_submissions: 0, completed_challenges_count: 0, ai_assessed_count: 0, human_verified_count: 0 });

  const [copiedLink, setCopiedLink] = useState(false);
  const [inspectEvidenceSub, setInspectEvidenceSub] = useState<Submission | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Profile editing state
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [isPublicState, setIsPublicState] = useState(true);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getProfile(username);
      setProfile(res.profile);
      setIsOwner(res.is_owner);
      setSubmissions(res.submissions);
      setMetrics(res.metrics);
      setBioInput(res.profile.bio);
      setIsPublicState(res.profile.is_public);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Profile could not be loaded.');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username, currentUser?.id]);

  const handleCopyPublicUrl = () => {
    const url = window.location.origin + `#/profile/${username}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveBio = async () => {
    if (!profile) return;
    try {
      await api.updateProfile(username, { bio: bioInput, is_public: isPublicState });
      setIsEditingBio(false);
      fetchProfile();
    } catch (err: any) {
      alert(err.message || 'Failed to update profile.');
    }
  };

  const handleToggleVisibility = async () => {
    if (!profile) return;
    const nextVal = !isPublicState;
    setIsPublicState(nextVal);
    try {
      await api.updateProfile(username, { is_public: nextVal });
    } catch (err: any) {
      setIsPublicState(!nextVal);
      alert('Could not update visibility.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading student proof portfolio...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-900">Portfolio Unavailable</h2>
        <p className="text-xs text-slate-500">{error || 'This profile is either private or does not exist.'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Portfolio Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src={profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={profile.display_name}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900">{profile.display_name}</h1>
                <span className="text-xs font-mono text-slate-400">@{profile.username}</span>
              </div>
              <p className="text-xs text-slate-500">
                {profile.university || 'University Student'}
              </p>
              
              {/* Bio display or edit */}
              {!isEditingBio ? (
                <p className="text-xs text-slate-600 max-w-xl pt-1 leading-relaxed">
                  {profile.bio || 'Building proof of practical abilities on SkillProof.'}
                </p>
              ) : (
                <div className="pt-2 space-y-2">
                  <textarea
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    rows={2}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveBio}
                      className="px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded"
                    >
                      Save Bio
                    </button>
                    <button
                      onClick={() => setIsEditingBio(false)}
                      className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Owner & Share Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyPublicUrl}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied' : 'Share Portfolio'}</span>
            </button>

            {isOwner && (
              <>
                <button
                  onClick={() => setIsEditingBio(!isEditingBio)}
                  className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium rounded-lg transition-colors"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleToggleVisibility}
                  className={`px-3 py-2 border text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                    isPublicState
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                  title="Toggle whether recruiters can see your profile publicly"
                >
                  {isPublicState ? <Eye className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>{isPublicState ? 'Public Portfolio' : 'Private Drafts'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Verification Status Legend (Per Prompt Requirements) */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Verification Legend:</span>
          
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-medium text-slate-800">Human Verified</span>
            <span className="text-[11px] text-slate-400">(Mentor Audited)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-medium text-slate-800">AI Assessed</span>
            <span className="text-[11px] text-slate-400">(Rubric Graded)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Submitted / In Progress</span>
          </div>
        </div>

      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200/80">
          <div className="text-xs font-semibold text-slate-400">Completed Challenges</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{metrics.completed_challenges_count}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80">
          <div className="text-xs font-semibold text-slate-400">Human Verified Proofs</div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-2xl font-black text-emerald-600">{metrics.human_verified_count}</span>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80">
          <div className="text-xs font-semibold text-slate-400">AI Rubric Evals</div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-2xl font-black text-indigo-600">{metrics.ai_assessed_count}</span>
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80">
          <div className="text-xs font-semibold text-slate-400">Total Attempts</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{metrics.total_submissions}</div>
        </div>

      </div>

      {/* Verified Skills Showcase */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Demonstrated Competencies</h3>
        
        <div className="flex flex-wrap gap-2">
          {profile.selected_skills.map((skill) => (
            <span
              key={skill}
              className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg inline-flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-indigo-600" />
              <span>{skill}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Submissions & Proof Records */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Verified Evidence Records</h2>
          <span className="text-xs text-slate-400">{submissions.length} total submissions</span>
        </div>

        {submissions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
            No public submissions yet.
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 hover:border-slate-300 transition-colors"
              >
                {/* Submission Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>Attempt #{sub.attempt_number}</span>
                      <span aria-hidden="true">·</span>
                      <span>{new Date(sub.created_at).toLocaleDateString()}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{sub.submission_type.replace('_', ' ')}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {sub.challenge_title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <VerificationBadge
                      status={sub.status}
                      score={sub.assessment?.overall_score}
                      mentorName={sub.mentor_review?.mentor_name}
                    />

                    {sub.assessment && (
                      <div className="text-right">
                        <span className="text-lg font-black text-slate-900">
                          {sub.assessment.overall_score}
                        </span>
                        <span className="text-xs text-slate-400">/100</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mentor Endorsement Quote (if verified) */}
                {sub.mentor_review && (
                  <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs text-slate-700 leading-relaxed">
                    <div className="font-semibold text-emerald-800 mb-1 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Mentor Audit Verdict: {sub.mentor_review.mentor_name}</span>
                    </div>
                    <p className="italic">“{sub.mentor_review.feedback}”</p>
                  </div>
                )}

                {/* AI Assessment Highlights */}
                {sub.assessment && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
                        Demonstrated Strengths
                      </span>
                      <ul className="text-slate-600 space-y-1 list-disc list-inside">
                        {sub.assessment.strengths.slice(0, 2).map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider block mb-1">
                        Criteria Scored
                      </span>
                      <div className="space-y-1">
                        {sub.assessment.criteria.slice(0, 2).map((c) => (
                          <div key={c.criterion_id} className="flex items-center justify-between text-slate-600">
                            <span>{c.name}</span>
                            <span className="font-medium text-slate-900">{c.score}/{c.max_score}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Controls: Inspect Evidence & Full Rubric */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setInspectEvidenceSub(sub)}
                      className="font-medium text-slate-700 hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
                    >
                      <FileCode className="w-3.5 h-3.5 text-slate-400" />
                      <span>Inspect Code Evidence</span>
                    </button>

                    {sub.repository_url && (
                      <a
                        href={sub.repository_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-500 hover:text-slate-800 flex items-center gap-1"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>GitHub Repo</span>
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => onOpenSubmission(sub.id)}
                    className="font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <span>View full rubric breakdown</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Code Evidence Inspection Modal */}
      {inspectEvidenceSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Code Evidence: {inspectEvidenceSub.challenge_title} (Attempt #{inspectEvidenceSub.attempt_number})
                </h3>
                <span className="text-[11px] text-slate-400">
                  Format: {inspectEvidenceSub.submission_type}
                </span>
              </div>
              <button
                onClick={() => setInspectEvidenceSub(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {inspectEvidenceSub.explanation && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div className="font-semibold text-slate-700 mb-1">Architectural Explanation:</div>
                  <p className="text-slate-600 leading-relaxed">{inspectEvidenceSub.explanation}</p>
                </div>
              )}

              {inspectEvidenceSub.source_code ? (
                <div className="bg-slate-950 rounded-xl p-4 overflow-x-auto">
                  <pre className="text-xs font-mono text-slate-200 whitespace-pre">
                    {inspectEvidenceSub.source_code}
                  </pre>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No pasted source code snippet available.</p>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setInspectEvidenceSub(null)}
                className="px-4 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
