import React from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Code2, 
  Users, 
  FileCheck2, 
  ExternalLink,
  ChevronRight,
  Award
} from 'lucide-react';
import { VerificationBadge } from '../components/VerificationBadge.tsx';

interface Props {
  onStartProving: () => void;
  onExploreChallenges: () => void;
  onViewDemoProfile: () => void;
}

export const LandingView: React.FC<Props> = ({
  onStartProving,
  onExploreChallenges,
  onViewDemoProfile
}) => {
  return (
    <div className="min-h-screen bg-[#fafafc] text-slate-900">
      
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Value Pitch */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Kicker */}
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-700 tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                <span>Practical Developer Assessment</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-slate-500 font-normal">Evidence-Based Verification</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                Your skills <br />
                <span className="text-indigo-600">deserve proof.</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-xl">
                Complete real challenges. Get evidence-based feedback. Build a portfolio that shows what you can actually do.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={onStartProving}
                  className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <span>Start proving your skills</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onExploreChallenges}
                  className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <span>Explore challenges</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Core Principle Tagline */}
              <div className="pt-4 flex items-center gap-6 text-xs text-slate-500 border-t border-slate-200/80">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium text-slate-700">Proof, not claims</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Predefined Rubrics</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Human Mentor Audit</span>
                </div>
              </div>

            </div>

            {/* Right Column: Interactive Profile Preview Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-6">
                
                {/* Profile Header */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                      alt="Alice Chen"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">Alice Chen</h3>
                        <span className="text-[10px] text-slate-400 font-mono">@alice_chen</span>
                      </div>
                      <p className="text-xs text-slate-500">Stanford University · Computer Science</p>
                    </div>
                  </div>
                  <button
                    onClick={onViewDemoProfile}
                    className="text-indigo-600 hover:text-indigo-700 text-xs font-semibold flex items-center gap-1"
                  >
                    <span>View Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {/* Verified Evidence Cards */}
                <div className="py-4 space-y-3">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Verified Skill Records
                  </div>

                  {/* Sample 1: Human Verified */}
                  <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/30">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900">Responsive Login Page</span>
                      <span className="text-xs font-bold text-emerald-700">92/100</span>
                    </div>
                    <VerificationBadge status="human_verified" mentorName="Dr. Sarah Marcus" />
                    <p className="text-[11px] text-slate-600 mt-2 line-clamp-2">
                      “Verified semantic form markup, aria-invalid attributes on blur, and mobile responsive card styling down to 320px.”
                    </p>
                  </div>

                  {/* Sample 2: AI Assessed with real improvement */}
                  <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/20">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900">Interactive Task Manager</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400 line-through">68</span>
                        <span className="text-xs font-bold text-indigo-700">88/100</span>
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">+20</span>
                      </div>
                    </div>
                    <VerificationBadge status="ai_assessed" score={88} />
                    <p className="text-[11px] text-slate-600 mt-2 line-clamp-2">
                      Demonstrated input trimming, duplicate item rejection, safe JSON parsing, and active task counter.
                    </p>
                  </div>
                </div>

                {/* Footer preview note */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Public Portfolio Preview</span>
                  <span className="text-emerald-600 font-medium">2 Verified Proofs</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              The Verification Flow
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 mb-3">
              How SkillProof works
            </h2>
            <p className="text-sm text-slate-600">
              A transparent, rubric-governed pipeline connecting student code to genuine evaluation and human verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Step 1 */}
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900">Select a Challenge</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose practical web-development problems from beginner to intermediate with explicit learning objectives and starter code.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900">Submit Your Evidence</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Paste source code or provide a public GitHub repository with an explanation of your architectural approach and tradeoffs.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900">AI Rubric Evaluation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gemini 3.8 Flash grades each published rubric criterion, citing quoted code evidence, strengths, and specific fixes needed.
              </p>
            </div>

            {/* Step 4 */}
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                04
              </div>
              <h3 className="text-base font-bold text-slate-900">Verified Portfolio & Audit</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Share your public profile with recruiters. Authorized mentors can inspect code evidence and grant Human Verification badges.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Sample Assessment Breakdown (Clearly Labelled) */}
      <section className="py-16 bg-[#fafafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                  Transparent Rubrics
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  Sample Assessment Breakdown
                </h3>
              </div>
              <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60">
                Sample Demonstrator Example
              </span>
            </div>

            {/* Breakdown Card Sample */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <span className="text-xs font-semibold text-slate-500">Challenge</span>
                  <h4 className="text-base font-bold text-slate-900">Interactive Task Manager</h4>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-indigo-600">88<span className="text-xs text-slate-400 font-normal">/100</span></div>
                  <div className="text-[11px] text-emerald-600 font-medium">Passed Rubric Threshold</div>
                </div>
              </div>

              {/* Rubric rows */}
              <div className="space-y-3 pt-2">
                
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800">Required Functionality & State Management</span>
                    <span className="font-bold text-slate-900">32 / 35 pts</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-2">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: '91%' }} />
                  </div>
                  <div className="text-[11px] font-mono text-slate-600 bg-white p-2 rounded border border-slate-200/60">
                    Evidence: `this.tasks.unshift(newTask); this.save(); this.render();`
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800">Input Validation & Edge Cases</span>
                    <span className="font-bold text-slate-900">9 / 10 pts</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-2">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '90%' }} />
                  </div>
                  <div className="text-[11px] font-mono text-slate-600 bg-white p-2 rounded border border-slate-200/60">
                    Evidence: `const title = rawTitle.trim(); if (!title) ... exists = this.tasks.some(...)`
                  </div>
                </div>

              </div>

              <div className="pt-2 text-xs text-slate-500 flex items-center justify-between">
                <span>Model: gemini-3.8-flash · Predefined Rubric</span>
                <button
                  onClick={onExploreChallenges}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  Try this challenge yourself &rarr;
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Benefits for Students vs Mentors */}
      <section className="py-16 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Students */}
            <div className="p-8 rounded-2xl bg-indigo-50/40 border border-indigo-100">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center mb-4">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">For Students & Learners</h3>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Replace generic resume claims with immutable, inspectable evidence of what you built.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Receive objective, line-by-line feedback rather than vague pass/fail grades.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Iterate on subsequent attempts and demonstrate measurable growth over time.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Generate a public shareable portfolio link to attach to internship applications.</span>
                </li>
              </ul>
            </div>

            {/* Mentors & Recruiters */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">For Mentors & Recruiters</h3>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Cut through resume embellishment by auditing concrete code submissions and AI rubric traces.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Clear distinction between AI assessment and authenticated Human Verification.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Audit the exact code submitted alongside the applicant's architectural reasoning.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Authorized review portal enables verified mentors to endorse standout students.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Stop claiming skills. <span className="text-indigo-400">Start proving them.</span>
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Join the evidence-based movement. Pick a challenge, submit your code, and receive your comprehensive rubric assessment.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartProving}
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-xl text-sm transition-colors flex items-center gap-2"
            >
              <span>Create Student Profile</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onViewDemoProfile}
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition-colors"
            >
              Inspect Demo Profile (@alice_chen)
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
