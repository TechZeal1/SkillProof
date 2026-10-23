import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileCode, 
  ExternalLink, 
  Lock, 
  Sparkles,
  ChevronRight,
  Eye,
  MessageSquare,
  Clock,
  History,
  CheckSquare,
  Square,
  Info
} from 'lucide-react';
import { Submission, Challenge, Assessment, Profile, MentorReview } from '../types/index.ts';
import { api } from '../api/client.ts';
import { VerificationBadge } from '../components/VerificationBadge.tsx';

interface Props {
  currentUser: Profile;
  onSwitchToMentor: () => void;
  onOpenSubmission: (submissionId: string) => void;
}

export const MentorPortalView: React.FC<Props> = ({
  currentUser,
  onSwitchToMentor,
  onOpenSubmission
}) => {
  const [submissions, setSubmissions] = useState<(Submission & { assessment?: Assessment; mentor_review?: MentorReview })[]>([]);
  const [selectedSub, setSelectedSub] = useState<(Submission & { assessment?: Assessment; mentor_review?: MentorReview }) | null>(null);
  const [queueFilter, setQueueFilter] = useState<'all' | 'pending' | 'verified'>('all');
  
  // Review Form State
  const [feedback, setFeedback] = useState('');
  const [criteriaConfirmed, setCriteriaConfirmed] = useState(false);
  const [checkedCriteria, setCheckedCriteria] = useState<Record<string, boolean>>({});
  const [verificationStatus, setVerificationStatus] = useState<'verified' | 'declined' | 'changes_requested'>('verified');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showRubricDetails, setShowRubricDetails] = useState(false);

  const isMentor = currentUser.role === 'mentor' || currentUser.role === 'admin';

  const loadReviewQueue = async () => {
    try {
      const res = await api.getSubmissions();
      setSubmissions(res.submissions);
      if (res.submissions.length > 0) {
        // Retain current selection if possible, otherwise select first
        setSelectedSub(prev => {
          if (!prev) return res.submissions[0];
          const found = res.submissions.find(s => s.id === prev.id);
          return found || res.submissions[0];
        });
      }
    } catch (err: any) {
      console.error('Failed to load review queue:', err);
    }
  };

  useEffect(() => {
    loadReviewQueue();
  }, [currentUser.id]);

  // When selected submission changes, reset form or prepopulate existing review
  useEffect(() => {
    if (selectedSub) {
      setReviewSuccess(null);
      setErrorMessage(null);
      if (selectedSub.mentor_review) {
        setFeedback(selectedSub.mentor_review.feedback);
        setVerificationStatus(selectedSub.mentor_review.verification_status);
        setCriteriaConfirmed(selectedSub.mentor_review.criteria_confirmed);
      } else {
        setFeedback('');
        setVerificationStatus('verified');
        setCriteriaConfirmed(false);
      }
      
      // Initialize criteria checklist
      if (selectedSub.assessment) {
        const initChecks: Record<string, boolean> = {};
        selectedSub.assessment.criteria.forEach(c => {
          initChecks[c.criterion_id] = Boolean(selectedSub.mentor_review?.criteria_confirmed || c.score / c.max_score >= 0.7);
        });
        setCheckedCriteria(initChecks);
      }
    }
  }, [selectedSub?.id]);

  // Filtered queue
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(s => {
      if (queueFilter === 'pending') {
        return s.status === 'ai_assessed' && !s.mentor_review;
      }
      if (queueFilter === 'verified') {
        return s.status === 'human_verified';
      }
      return true;
    });
  }, [submissions, queueFilter]);

  // Find all attempts by this student for this challenge
  const studentAttempts = useMemo(() => {
    if (!selectedSub) return [];
    return submissions
      .filter(s => s.student_id === selectedSub.student_id && s.challenge_id === selectedSub.challenge_id)
      .sort((a, b) => a.attempt_number - b.attempt_number);
  }, [submissions, selectedSub]);

  const toggleCriterionCheck = (critId: string) => {
    setCheckedCriteria(prev => {
      const next = { ...prev, [critId]: !prev[critId] };
      const allChecked = Object.values(next).every(Boolean);
      setCriteriaConfirmed(allChecked);
      return next;
    });
  };

  const handleSelectAllCriteria = () => {
    if (!selectedSub?.assessment) return;
    const allChecked: Record<string, boolean> = {};
    selectedSub.assessment.criteria.forEach(c => {
      allChecked[c.criterion_id] = true;
    });
    setCheckedCriteria(allChecked);
    setCriteriaConfirmed(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    if (!feedback.trim()) {
      setErrorMessage('Please provide substantive written review feedback for the student.');
      return;
    }

    setSubmittingReview(true);
    setErrorMessage(null);
    setReviewSuccess(null);

    try {
      await api.submitMentorReview(selectedSub.id, {
        verification_status: verificationStatus,
        feedback: feedback.trim(),
        criteria_confirmed: criteriaConfirmed
      });

      setSubmittingReview(false);
      setReviewSuccess(`Successfully recorded ${verificationStatus} endorsement for ${selectedSub.student_name}.`);
      loadReviewQueue();
    } catch (err: any) {
      setSubmittingReview(false);
      setErrorMessage(err.message || 'Mentor review could not be saved.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60 inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Authorized Mentor Review Portal</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Student Evidence Verification Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Audit student submissions, examine cited code evidence and AI rubric traces, and grant official Human Verification endorsements.
          </p>
        </div>

        {/* Role Switcher helper for Evaluators / Mentors */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs min-w-[260px]">
          <div className="font-semibold text-slate-700 flex items-center justify-between">
            <span>Reviewer Role:</span>
            <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold ${
              isMentor ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
            }`}>
              {currentUser.role}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Active user: <strong>{currentUser.display_name}</strong>
          </p>
          {!isMentor ? (
            <button
              onClick={onSwitchToMentor}
              className="w-full px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium text-xs transition-colors shadow-xs"
            >
              Switch to Mentor Persona (Dr. Sarah Marcus)
            </button>
          ) : (
            <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Authorized to sign endorsements</span>
            </div>
          )}
        </div>
      </div>

      {/* Review Queue & Split Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Submissions Queue with Filter Tabs */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Submissions Queue</h2>
            <span className="text-xs text-slate-400">{filteredSubmissions.length} of {submissions.length}</span>
          </div>

          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setQueueFilter('all')}
              className={`flex-1 py-1.5 font-medium rounded-md transition-colors ${
                queueFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({submissions.length})
            </button>
            <button
              onClick={() => setQueueFilter('pending')}
              className={`flex-1 py-1.5 font-medium rounded-md transition-colors ${
                queueFilter === 'pending' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Awaiting Audit
            </button>
            <button
              onClick={() => setQueueFilter('verified')}
              className={`flex-1 py-1.5 font-medium rounded-md transition-colors ${
                queueFilter === 'verified' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Verified
            </button>
          </div>

          {/* Queue List */}
          <div className="space-y-3">
            {filteredSubmissions.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-400">
                No submissions in this filter category.
              </div>
            ) : (
              filteredSubmissions.map((sub) => {
                const isSelected = selectedSub?.id === sub.id;
                return (
                  <div
                    key={sub.id}
                    onClick={() => {
                      setSelectedSub(sub);
                      setReviewSuccess(null);
                      setErrorMessage(null);
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-xs ring-1 ring-indigo-500/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-900">{sub.student_name}</span>
                      <span className="text-slate-400">Attempt #{sub.attempt_number}</span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-800 mb-2">
                      {sub.challenge_title}
                    </h4>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                      <VerificationBadge
                        status={sub.status}
                        score={sub.assessment?.overall_score}
                        mentorName={sub.mentor_review?.mentor_name}
                      />

                      {sub.assessment && (
                        <span className="font-bold text-slate-900">
                          {sub.assessment.overall_score}/100
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Submission Review Inspector */}
        <div className="lg:col-span-7">
          {selectedSub ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6">
              
              {/* Header */}
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-400">
                    Student: <strong className="text-slate-800">{selectedSub.student_name}</strong> (@{selectedSub.student_username})
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    {selectedSub.challenge_title}
                  </h3>
                </div>

                <button
                  onClick={() => onOpenSubmission(selectedSub.id)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 shrink-0"
                >
                  <span>Open Full Assessment View</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* View Previous Attempts Bar (Section 5.H Requirement: "View previous attempts") */}
              {studentAttempts.length > 1 && (
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <History className="w-3.5 h-3.5 text-indigo-600" />
                    <span>All Attempts by {selectedSub.student_name} for this Challenge ({studentAttempts.length}):</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {studentAttempts.map(att => (
                      <button
                        key={att.id}
                        type="button"
                        onClick={() => setSelectedSub(att)}
                        className={`px-3 py-1 text-xs rounded-lg border transition-all ${
                          att.id === selectedSub.id
                            ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Attempt #{att.attempt_number} ({att.assessment ? `${att.assessment.overall_score}/100` : 'Draft'})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing Endorsement Banner if already verified */}
              {selectedSub.mentor_review && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Currently {selectedSub.mentor_review.verification_status.toUpperCase()}</span>
                    </span>
                    <span className="text-[11px] text-emerald-700">
                      Reviewed by {selectedSub.mentor_review.mentor_name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 italic bg-white p-3 rounded-lg border border-emerald-100">
                    “{selectedSub.mentor_review.feedback}”
                  </p>
                </div>
              )}

              {/* AI Assessment Trace & Rubric Scoring */}
              {selectedSub.assessment && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-1 text-indigo-700">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Gemini 3.8 Flash Rubric Score: {selectedSub.assessment.overall_score}/100</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowRubricDetails(!showRubricDetails)}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 underline font-normal"
                    >
                      {showRubricDetails ? 'Hide Details' : 'Inspect Criteria Details'}
                    </button>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
                    {selectedSub.assessment.criteria.map((c) => (
                      <div key={c.criterion_id} className="p-2 bg-white rounded border border-slate-100 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-800">
                          <span>{c.name}</span>
                          <span>{c.score}/{c.max_score} pts</span>
                        </div>
                        {showRubricDetails && (
                          <>
                            <p className="text-[11px] text-slate-500 font-mono bg-slate-50 p-1.5 rounded">
                              Evidence: {c.evidence}
                            </p>
                            <p className="text-[11px] text-slate-600">
                              Feedback: {c.feedback}
                            </p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submitted Code Excerpt */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                  <span>Student Code Evidence ({selectedSub.submission_type})</span>
                  {selectedSub.repository_url && (
                    <a
                      href={selectedSub.repository_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <span>View GitHub Repo</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="bg-slate-950 rounded-xl p-4 max-h-56 overflow-y-auto">
                  <pre className="text-xs font-mono text-slate-200 whitespace-pre">
                    {selectedSub.source_code || '// No pasted source code.'}
                  </pre>
                </div>
              </div>

              {/* Student Approach Explanation */}
              {selectedSub.explanation && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <span className="font-semibold text-slate-700 block mb-1">Student Approach Explanation:</span>
                  <p className="text-slate-600 leading-relaxed">{selectedSub.explanation}</p>
                </div>
              )}

              {/* Mentor Criteria Checklist (Section 5.H Requirement: "Record whether the evidence meets specified criteria") */}
              {selectedSub.assessment && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Rubric Criteria Audit Checklist
                    </span>
                    <button
                      type="button"
                      onClick={handleSelectAllCriteria}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      Confirm All Criteria
                    </button>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {selectedSub.assessment.criteria.map((c) => {
                      const checked = Boolean(checkedCriteria[c.criterion_id]);
                      return (
                        <div
                          key={c.criterion_id}
                          onClick={() => toggleCriterionCheck(c.criterion_id)}
                          className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200/80 cursor-pointer text-xs select-none hover:border-slate-300"
                        >
                          {checked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 shrink-0" />
                          )}
                          <span className={checked ? 'text-slate-900 font-medium' : 'text-slate-500'}>
                            {c.name} ({c.score}/{c.max_score} pts)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mentor Review Form */}
              <form onSubmit={handleSubmitReview} className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-900">
                  Record Mentor Review & Verification
                </h4>

                {reviewSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200">
                    {reviewSuccess}
                  </div>
                )}

                {errorMessage && (
                  <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-lg border border-rose-200">
                    {errorMessage}
                  </div>
                )}

                {/* Verification Determination Buttons */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Review Determination
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    
                    <button
                      type="button"
                      onClick={() => setVerificationStatus('verified')}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        verificationStatus === 'verified'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Grant Verification</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVerificationStatus('changes_requested')}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        verificationStatus === 'changes_requested'
                          ? 'border-amber-600 bg-amber-50 text-amber-800 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>Request Revisions</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVerificationStatus('declined')}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        verificationStatus === 'declined'
                          ? 'border-rose-600 bg-rose-50 text-rose-800 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Decline</span>
                    </button>

                  </div>
                </div>

                {/* Written Mentor Feedback */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Written Mentor Feedback (Will appear signed on student's public portfolio)
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                    placeholder="e.g. Verified responsive form attributes, aria-live alerts, and clean modular code architecture..."
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                    required
                  />
                </div>

                {/* Confirmation Checkbox */}
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={criteriaConfirmed}
                    onChange={(e) => setCriteriaConfirmed(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 mt-0.5"
                  />
                  <span>
                    I confirm that I have inspected the student's actual code evidence and that it fulfills the published rubric criteria.
                  </span>
                </label>

                {/* Submit Action */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={!isMentor || submittingReview}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 shadow-xs"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      {isMentor 
                        ? submittingReview ? 'Recording Verification...' : 'Submit Official Review'
                        : 'Requires Mentor Role'}
                    </span>
                  </button>
                </div>

              </form>

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
              Select a submission from the queue to inspect.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
