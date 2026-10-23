import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  ExternalLink, 
  Share2, 
  TrendingUp, 
  FileCode,
  Check,
  Award,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Submission, Challenge, Assessment, MentorReview } from '../types/index.ts';
import { RubricBreakdownCard } from '../components/RubricBreakdownCard.tsx';
import { VerificationBadge } from '../components/VerificationBadge.tsx';

interface Props {
  submission: Submission;
  challenge: Challenge;
  assessment: Assessment;
  mentorReview?: MentorReview;
  previousSubmission?: Submission;
  onBack: () => void;
  onTryAgain: () => void;
  onCompareAttempts?: (subAId: string, subBId: string) => void;
  onViewProfile: (username: string) => void;
  onRequestMentorReview?: () => void;
}

export const AssessmentResultView: React.FC<Props> = ({
  submission,
  challenge,
  assessment,
  mentorReview,
  previousSubmission,
  onBack,
  onTryAgain,
  onCompareAttempts,
  onViewProfile,
  onRequestMentorReview
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [mentorRequestSent, setMentorRequestSent] = useState(false);

  const isPassed = assessment.overall_score >= 75;

  // Trigger celebration confetti when high score is achieved
  useEffect(() => {
    if (isPassed) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    }
  }, [isPassed]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied' : 'Share Result'}</span>
          </button>
        </div>
      </div>

      {/* Hero Score Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6">
        
        {/* Header Metadata */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-indigo-600">{challenge.skill_category}</span>
              <span aria-hidden="true">·</span>
              <span>Attempt #{submission.attempt_number}</span>
              <span aria-hidden="true">·</span>
              <span>{new Date(assessment.generated_at).toLocaleDateString()}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {challenge.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <VerificationBadge
              status={submission.status}
              score={assessment.overall_score}
              mentorName={mentorReview?.mentor_name}
            />
          </div>
        </div>

        {/* Overall Score Dial & Status Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Big Score Box */}
          <div className="md:col-span-4 p-6 rounded-2xl bg-slate-50 border border-slate-200/70 text-center space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Rubric Score
            </div>
            <div className="flex items-baseline justify-center gap-1">
              <span className={`text-5xl font-black tracking-tight ${
                isPassed ? 'text-indigo-600' : 'text-amber-600'
              }`}>
                {assessment.overall_score}
              </span>
              <span className="text-sm font-semibold text-slate-400">/100</span>
            </div>
            <div className={`text-xs font-semibold ${
              isPassed ? 'text-emerald-700' : 'text-amber-700'
            }`}>
              {isPassed ? 'Pass Threshold Met (≥75)' : 'Needs Improvement (<75)'}
            </div>
            <div className="text-[11px] text-slate-400 pt-1">
              Evaluator Model: {assessment.model_identifier}
            </div>
          </div>

          {/* Evaluation Narrative & Next Steps */}
          <div className="md:col-span-8 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Assessment Summary</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your submission has been parsed via AST and checked against the 5 published challenge criteria. 
              {isPassed 
                ? ' This assessment confirms proof of practical execution and adds verified competency to your profile.'
                : ' Review the specific diagnostic feedback below to submit a revised attempt and raise your score.'}
            </p>

            {/* Improvement Prompt */}
            {previousSubmission && onCompareAttempts && (
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between text-xs">
                <span className="text-indigo-900 font-medium">
                  Previous attempt recorded (Attempt #{previousSubmission.attempt_number}).
                </span>
                <button
                  onClick={() => onCompareAttempts(previousSubmission.id, submission.id)}
                  className="font-semibold text-indigo-700 hover:text-indigo-900 underline"
                >
                  Compare changes &rarr;
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                onClick={onTryAgain}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Submit Improved Attempt #{submission.attempt_number + 1}</span>
              </button>

              {isPassed && !mentorReview && (
                <button
                  onClick={() => {
                    setMentorRequestSent(true);
                    if (onRequestMentorReview) onRequestMentorReview();
                  }}
                  disabled={mentorRequestSent}
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{mentorRequestSent ? 'Mentor Audit Requested' : 'Request Human Mentor Audit'}</span>
                </button>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Human Mentor Review (If Audited) */}
      {mentorReview && (
        <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-6 sm:p-8 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Human Verification Endorsement
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-700 font-semibold">
              Verified on {new Date(mentorReview.reviewed_at).toLocaleDateString()}
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed font-sans italic bg-white p-4 rounded-xl border border-emerald-100">
            “{mentorReview.feedback}”
          </p>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <div>
              Audited by <strong className="text-slate-900">{mentorReview.mentor_name}</strong> · {mentorReview.mentor_title}
            </div>
            <div className="text-emerald-700 font-medium">Criteria Authenticated</div>
          </div>
        </div>
      )}

      {/* Criteria Breakdown Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Criterion-by-Criterion Rubric Breakdown
          </h2>
          <span className="text-xs text-slate-500">
            All 5 criteria evaluated
          </span>
        </div>

        <div className="space-y-4">
          {assessment.criteria.map((crit) => (
            <RubricBreakdownCard key={crit.criterion_id} criterion={crit} />
          ))}
        </div>
      </div>

      {/* Strengths & Improvements 2-Column Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Strengths */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-3">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Demonstrated Strengths</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-600">
            {assessment.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                <span className="leading-relaxed">{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Priority Improvements */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-3">
          <div className="flex items-center gap-2 text-indigo-700">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Actionable Improvement Areas</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-600">
            {assessment.improvements.map((imp, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                <span className="leading-relaxed">{imp}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Evaluator Limitations Disclaimer */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 space-y-1">
        <div className="font-semibold text-slate-700">Evaluation Boundary & Limitations:</div>
        <p>
          {assessment.limitations.join(' · ')}
        </p>
        <p className="text-[11px] text-slate-400 pt-1">
          SkillProof is an evidence and feedback platform. Automated AI scores represent static AST rubric matching and do not substitute for official degree credentials.
        </p>
      </div>

    </div>
  );
};
