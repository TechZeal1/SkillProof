import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Scale, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  HelpCircle,
  FileCheck2
} from 'lucide-react';

export const MethodologyView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-6 space-y-2">
        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
          Transparency & Principles
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Methodology & Evaluation Standards
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
          SkillProof is an evidence-based skill assessment platform. Here is how our rubrics, AI evaluations, and human verifications operate with integrity.
        </p>
      </div>

      {/* Core Principle: Proof, Not Claims */}
      <div className="bg-indigo-50/50 rounded-2xl border border-indigo-100 p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2 text-indigo-700">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">Core Principle: Proof, Not Claims</h2>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed">
          Traditional resumes and certificates rely on self-reported claims or multiple-choice trivia that fail to test practical software engineering skills. On SkillProof, no skill is credited until concrete code evidence has been submitted, parsed, and evaluated against public rubrics.
        </p>
      </div>

      {/* 6 Core Methodological Pillars */}
      <div className="space-y-6">
        
        {/* 1. What SkillProof Measures */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">1</span>
            <span>What SkillProof Measures</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            SkillProof evaluates the quality of tangible work submitted by learners. It measures:
          </p>
          <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
            <li><strong>Functional Completeness:</strong> Does the solution implement the required events, state transitions, and edge-case handling?</li>
            <li><strong>Code Architecture & Correctness:</strong> Are asynchronous flows handled without race conditions? Are APIs called defensively with safe error handling?</li>
            <li><strong>Accessibility & Web Standards:</strong> Are semantic HTML tags, explicit label bindings, ARIA live regions, and visible keyboard focus rings present?</li>
            <li><strong>Responsive Design:</strong> Does the styling adapt to mobile screens without fixed-width horizontal overflow?</li>
          </ul>
        </div>

        {/* 2. Transparent Predefined Rubrics */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">2</span>
            <span>How Challenge Rubrics Work</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every challenge features an immutable published rubric summing to 100 points. Criteria weights are known before the student writes a single line of code. For example, our Interactive Task Manager evaluates:
          </p>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 space-y-1">
            <div className="flex justify-between"><span>Required Functionality & State:</span><strong>35%</strong></div>
            <div className="flex justify-between"><span>Code Correctness & Architecture:</span><strong>25%</strong></div>
            <div className="flex justify-between"><span>UI & Responsive Interaction:</span><strong>20%</strong></div>
            <div className="flex justify-between"><span>Input Validation & Edge Cases:</span><strong>10%</strong></div>
            <div className="flex justify-between"><span>Readability & Maintainability:</span><strong>10%</strong></div>
          </div>
        </div>

        {/* 3. AI-Assisted Rubric Evaluation */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">3</span>
            <span>How AI-Assisted Assessments Are Produced</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            We utilize <strong>Gemini 3.8 Flash</strong> through a secure server-side pipeline. The model receives only the challenge requirements, published rubric, and the student's submission. The model is bound by strict constraints:
          </p>
          <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
            <li>It must quote direct lines of code as tangible evidence for every awarded point.</li>
            <li>It is prohibited from assuming code or features that are absent from the submission.</li>
            <li>It outputs structured JSON enforcing criterion bounds ($0 \le score \le max\_score$) and mathematical summing consistency.</li>
          </ul>
        </div>

        {/* 4. What AI Cannot Reliably Determine */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">4</span>
            <span>What AI Cannot Reliably Determine (Boundaries)</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            In compliance with our anti-hallucination and integrity policy, we are explicit about the boundaries of automated AI inspection:
          </p>
          <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
            <li><strong>Static AST vs Runtime Execution:</strong> Unless explicitly executed in a sandboxed runner, AI evaluates syntax, structures, and patterns; it cannot guarantee flawless browser GPU rasterization.</li>
            <li><strong>Subjective Aesthetics:</strong> Visual beauty is subjective; rubrics measure objective CSS criteria (media queries, flexbox rules, viewport tags) rather than artistic preference.</li>
            <li><strong>Author Identity:</strong> AI cannot determine whether code was authored independently or with external assistance, which is why human verification and oral defense remain essential.</li>
          </ul>
        </div>

        {/* 5. What Human Verification Means */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">5</span>
            <span>What Human Verification Means</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            A high AI score does <strong>not</strong> equal human verification. Human Verification requires an authenticated technical mentor or instructor to:
          </p>
          <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
            <li>Review the student's submission and approach explanation.</li>
            <li>Confirm that the work meets the challenge standards.</li>
            <li>Sign the endorsement with their name, title, and timestamp.</li>
          </ul>
        </div>

        {/* 6. Legal & Institutional Disclaimer */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-2">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Educational Disclaimer
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            SkillProof is an evidence and feedback platform designed for university students, mentors, and employers. It is not an accredited degree-granting authority or government-certified credentialing institution. All assessments represent formative and summative feedback on specific, demonstrated submissions.
          </p>
        </div>

      </div>

    </div>
  );
};
