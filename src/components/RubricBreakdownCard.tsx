import React from 'react';
import { AssessmentCriterionResult } from '../types/index.ts';
import { CheckCircle2, AlertCircle, Quote } from 'lucide-react';

interface Props {
  criterion: AssessmentCriterionResult;
}

export const RubricBreakdownCard: React.FC<Props> = ({ criterion }) => {
  const percentage = Math.round((criterion.score / criterion.max_score) * 100);
  const isExcellent = percentage >= 85;
  const isSatisfactory = percentage >= 70 && percentage < 85;

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 hover:border-slate-300 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">{criterion.name}</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-slate-900">{criterion.score}</span>
          <span className="text-xs text-slate-400">/ {criterion.max_score} pts</span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded ${
              isExcellent
                ? 'bg-emerald-50 text-emerald-700'
                : isSatisfactory
                ? 'bg-indigo-50 text-indigo-700'
                : 'bg-amber-50 text-amber-700'
            }`}
          >
            {percentage}%
          </span>
        </div>
      </div>

      {/* Score Progress Bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isExcellent ? 'bg-emerald-500' : isSatisfactory ? 'bg-indigo-500' : 'bg-amber-500'
          }`}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>

      {/* Quoted Evidence */}
      {criterion.evidence && (
        <div className="mb-3 p-3 bg-slate-50/80 rounded-lg border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1">
            <Quote className="w-3.5 h-3.5 text-slate-400" />
            <span>Demonstrated Code Evidence</span>
          </div>
          <p className="text-xs font-mono text-slate-800 bg-white p-2 rounded border border-slate-200/60 overflow-x-auto whitespace-pre-wrap">
            {criterion.evidence}
          </p>
        </div>
      )}

      {/* Constructive Diagnostic Feedback */}
      {criterion.feedback && (
        <div className="flex items-start gap-2 text-xs text-slate-600 mt-2">
          {percentage >= 80 ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          )}
          <p className="leading-relaxed">{criterion.feedback}</p>
        </div>
      )}
    </div>
  );
};
