import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Code2, 
  ArrowRight, 
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  GitCompare
} from 'lucide-react';
import { Submission, Assessment, Challenge, Profile, AssessmentComparison } from '../types/index.ts';
import { api } from '../api/client.ts';
import { VerificationBadge } from '../components/VerificationBadge.tsx';

interface Props {
  currentUser: Profile;
  userSubmissions: (Submission & { assessment?: Assessment })[];
  challenges: Challenge[];
  preselectedComparisonPair?: { subA: string; subB: string } | null;
  onOpenSubmission: (submissionId: string) => void;
  onSelectChallenge: (slug: string) => void;
  onBack: () => void;
}

export const HistoryComparisonView: React.FC<Props> = ({
  currentUser,
  userSubmissions,
  challenges,
  preselectedComparisonPair,
  onOpenSubmission,
  onSelectChallenge,
  onBack
}) => {
  const [selectedSubA, setSelectedSubA] = useState<string>('');
  const [selectedSubB, setSelectedSubB] = useState<string>('');
  const [comparison, setComparison] = useState<AssessmentComparison | null>(null);
  const [loadingComp, setLoadingComp] = useState(false);
  const [errorComp, setErrorComp] = useState<string | null>(null);

  // Group submissions by challenge
  const challengeGroups = React.useMemo(() => {
    const map = new Map<string, { challenge: Challenge; subs: typeof userSubmissions }>();
    userSubmissions.forEach(sub => {
      const ch = challenges.find(c => c.id === sub.challenge_id);
      if (!ch) return;
      const prev = map.get(ch.id) || { challenge: ch, subs: [] };
      prev.subs.push(sub);
      map.set(ch.id, prev);
    });
    return Array.from(map.values());
  }, [userSubmissions, challenges]);

  // Handle preselected pair from dashboard
  useEffect(() => {
    if (preselectedComparisonPair) {
      setSelectedSubA(preselectedComparisonPair.subA);
      setSelectedSubB(preselectedComparisonPair.subB);
      runComparison(preselectedComparisonPair.subA, preselectedComparisonPair.subB);
    }
  }, [preselectedComparisonPair]);

  const runComparison = async (subA: string, subB: string) => {
    if (!subA || !subB || subA === subB) {
      setErrorComp('Please select two distinct assessed submissions to compare.');
      setComparison(null);
      return;
    }

    setLoadingComp(true);
    setErrorComp(null);
    try {
      const res = await api.compareSubmissions(subA, subB);
      setComparison(res.comparison);
      setLoadingComp(false);
    } catch (err: any) {
      setLoadingComp(false);
      setErrorComp(err.message || 'Could not compare submissions.');
      setComparison(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Assessment History & Iteration Comparison
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Compare rubric criteria side-by-side between earlier and later attempts. Evaluate genuine score growth with inspectable evidence.
          </p>
        </div>
      </div>

      {/* Comparison Selector Tool */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900">Compare Two Evaluated Attempts</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Attempt A (Earlier Attempt) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Attempt A (Baseline / Earlier Version)
            </label>
            <select
              value={selectedSubA}
              onChange={(e) => {
                setSelectedSubA(e.target.value);
                if (selectedSubB) runComparison(e.target.value, selectedSubB);
              }}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">Select attempt...</option>
              {userSubmissions.filter(s => s.assessment).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.challenge_title} — Attempt #{s.attempt_number} ({s.assessment?.overall_score}/100)
                </option>
              ))}
            </select>
          </div>

          {/* Attempt B (Later Attempt) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Attempt B (Refactored / Newer Version)
            </label>
            <select
              value={selectedSubB}
              onChange={(e) => {
                setSelectedSubB(e.target.value);
                if (selectedSubA) runComparison(selectedSubA, e.target.value);
              }}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">Select attempt...</option>
              {userSubmissions.filter(s => s.assessment).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.challenge_title} — Attempt #{s.attempt_number} ({s.assessment?.overall_score}/100)
                </option>
              ))}
            </select>
          </div>

        </div>

        {errorComp && (
          <div className="text-xs text-rose-700 bg-rose-50 p-3 rounded-lg border border-rose-200">
            {errorComp}
          </div>
        )}
      </div>

      {/* Comparison Results Card */}
      {comparison && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Historical Delta Report
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                {comparison.attemptA.submission.challenge_title}
              </h3>
            </div>

            {/* Score Delta Badge */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Baseline vs Revision</span>
                <span className="text-xl font-extrabold text-slate-900">
                  {comparison.attemptA.assessment.overall_score} &rarr; {comparison.attemptB.assessment.overall_score}
                </span>
              </div>

              <div className={`px-3 py-1.5 rounded-xl text-sm font-black flex items-center gap-1 ${
                comparison.scoreDelta >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}>
                {comparison.scoreDelta >= 0 ? `+${comparison.scoreDelta}` : comparison.scoreDelta} pts
              </div>
            </div>
          </div>

          {/* Criteria Deltas Table */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Criterion-Level Score Deltas
            </h4>

            <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden">
              {comparison.criteriaDeltas.map((delta, i) => (
                <div key={i} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 transition-colors">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-900">{delta.criterionName}</span>
                    <div className="text-[11px] text-slate-500">
                      Score: {delta.scoreA} &rarr; {delta.scoreB} of {delta.maxScore} max pts
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden hidden sm:block">
                      <div
                        className={`h-full rounded-full ${delta.delta >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${Math.round((delta.scoreB / delta.maxScore) * 100)}%` }}
                      />
                    </div>

                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      delta.delta > 0
                        ? 'bg-emerald-50 text-emerald-700'
                        : delta.delta === 0
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-rose-50 text-rose-700'
                    }`}>
                      {delta.delta > 0 ? `+${delta.delta}` : delta.delta} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Code Difference Comparison */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Inspect Code Refactoring Across Attempts
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700">
                  Attempt #{comparison.attemptA.submission.attempt_number} Code Excerpt
                </span>
                <div className="bg-slate-950 p-4 rounded-xl text-slate-200 font-mono text-[11px] max-h-64 overflow-y-auto">
                  <pre>{comparison.attemptA.submission.source_code || '// No source code'}</pre>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700">
                  Attempt #{comparison.attemptB.submission.attempt_number} Code Excerpt
                </span>
                <div className="bg-slate-950 p-4 rounded-xl text-slate-200 font-mono text-[11px] max-h-64 overflow-y-auto">
                  <pre>{comparison.attemptB.submission.source_code || '// No source code'}</pre>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* Full Submission History List Grouped by Challenge */}
      <div className="space-y-6">
        <h2 className="text-base font-bold text-slate-900">All Historical Submissions</h2>

        {challengeGroups.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
            No submissions recorded yet. Complete a challenge to view history.
          </div>
        ) : (
          <div className="space-y-6">
            {challengeGroups.map((group) => (
              <div key={group.challenge.id} className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{group.challenge.title}</h3>
                    <span className="text-xs text-slate-500">
                      {group.subs.length} recorded attempt{group.subs.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectChallenge(group.challenge.slug)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <span>New Attempt</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {group.subs.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => onOpenSubmission(sub.id)}
                      className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/50 p-2 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">Attempt #{sub.attempt_number}</span>
                          <span className="text-[11px] text-slate-400">· {new Date(sub.created_at).toLocaleString()}</span>
                        </div>
                        <VerificationBadge
                          status={sub.status}
                          score={sub.assessment?.overall_score}
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        {sub.assessment && (
                          <div className="text-right">
                            <span className="text-sm font-bold text-slate-900">{sub.assessment.overall_score}</span>
                            <span className="text-xs text-slate-400">/100</span>
                          </div>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
