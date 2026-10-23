import React from 'react';
import { ShieldCheck, Sparkles, Clock, AlertCircle, FileEdit, CheckCircle2 } from 'lucide-react';
import { SubmissionStatus } from '../types/index.ts';

interface Props {
  status: SubmissionStatus;
  score?: number;
  mentorName?: string;
  className?: string;
}

export const VerificationBadge: React.FC<Props> = ({
  status,
  score,
  mentorName,
  className = ''
}) => {
  // Using unboxed typographic indicators per frontend design constitution
  switch (status) {
    case 'human_verified':
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 ${className}`}>
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Human Verified</span>
          {mentorName && <span className="font-normal text-emerald-600/80">by {mentorName}</span>}
        </span>
      );

    case 'ai_assessed':
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 ${className}`}>
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span>AI Assessed</span>
          {typeof score === 'number' && (
            <span className="font-normal text-indigo-900/80">· {score}/100</span>
          )}
        </span>
      );

    case 'evaluating':
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 animate-pulse ${className}`}>
          <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
          <span>Evaluating evidence...</span>
        </span>
      );

    case 'submitted':
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 ${className}`}>
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Submitted</span>
        </span>
      );

    case 'revision_requested':
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 ${className}`}>
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Revision Requested</span>
        </span>
      );

    case 'draft':
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 ${className}`}>
          <FileEdit className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Draft</span>
        </span>
      );
  }
};
