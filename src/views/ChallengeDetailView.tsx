import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Code2, 
  Github, 
  Globe, 
  FileText, 
  Send, 
  Save, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Download,
  Terminal,
  Loader2
} from 'lucide-react';
import { Challenge, Submission, Profile } from '../types/index.ts';
import { api } from '../api/client.ts';

interface Props {
  challenge: Challenge;
  currentUser: Profile;
  onBack: () => void;
  onAssessmentCompleted: (submissionId: string) => void;
}

export const ChallengeDetailView: React.FC<Props> = ({
  challenge,
  currentUser,
  onBack,
  onAssessmentCompleted
}) => {
  const [activeTab, setActiveTab] = useState<'brief' | 'rubric' | 'starter' | 'submit'>('brief');
  const [copiedStarter, setCopiedStarter] = useState(false);
  
  // Submission Form State
  const [submissionType, setSubmissionType] = useState<'code' | 'github_repo' | 'live_url'>('code');
  const [sourceCode, setSourceCode] = useState(challenge.starter_code || '');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [explanation, setExplanation] = useState('');
  
  // State for GitHub inspection
  const [inspectingRepo, setInspectingRepo] = useState(false);
  const [repoInspectionResult, setRepoInspectionResult] = useState<string | null>(null);

  // Submission & AI Assessment progress state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [draftSavedMsg, setDraftSavedMsg] = useState(false);
  const [evalProgressStep, setEvalProgressStep] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Copy starter code helper
  const handleCopyStarter = () => {
    if (challenge.starter_code) {
      navigator.clipboard.writeText(challenge.starter_code);
      setCopiedStarter(true);
      setTimeout(() => setCopiedStarter(false), 2000);
    }
  };

  // Inspect public GitHub repository
  const handleInspectGitHub = async () => {
    if (!repositoryUrl.trim()) {
      setErrorMessage('Please provide a valid GitHub repository URL.');
      return;
    }

    setInspectingRepo(true);
    setErrorMessage(null);
    setRepoInspectionResult(null);

    try {
      const res = await api.inspectGitHubRepo(repositoryUrl.trim());
      setInspectingRepo(false);
      setRepoInspectionResult(
        `Retrieved public repo "${res.owner}/${res.repo}". Found ${res.files.length} top-level files (${res.files.slice(0, 4).join(', ')}...). Extracted primary snippet from ${res.primaryFile || 'code'}.`
      );
      if (res.extractedSnippet && !sourceCode) {
        setSourceCode(res.extractedSnippet);
      }
    } catch (err: any) {
      setInspectingRepo(false);
      setErrorMessage(err.message || 'Could not inspect public GitHub repository.');
    }
  };

  // Save Draft
  const handleSaveDraft = async () => {
    setIsDraftSaving(true);
    setErrorMessage(null);
    try {
      await api.createSubmission({
        challenge_id: challenge.id,
        submission_type: submissionType,
        repository_url: repositoryUrl.trim() || undefined,
        project_url: projectUrl.trim() || undefined,
        source_code: sourceCode,
        explanation: explanation.trim() || undefined,
        is_draft: true
      });
      setIsDraftSaving(false);
      setDraftSavedMsg(true);
      setTimeout(() => setDraftSavedMsg(false), 3000);
    } catch (err: any) {
      setIsDraftSaving(false);
      setErrorMessage(err.message || 'Failed to save draft.');
    }
  };

  // Submit Work for Real AI Rubric Evaluation
  const handleSubmitForAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (submissionType === 'code' && (!sourceCode || sourceCode.trim().length < 20)) {
      setErrorMessage('Please provide complete source code (at least 20 characters) for assessment.');
      return;
    }
    if (submissionType === 'github_repo' && !repositoryUrl.trim()) {
      setErrorMessage('Please provide a valid public GitHub repository URL.');
      return;
    }

    setIsSubmitting(true);
    setEvalProgressStep('Recording submission in database...');

    try {
      // 1. Create official submission
      const subRes = await api.createSubmission({
        challenge_id: challenge.id,
        submission_type: submissionType,
        repository_url: repositoryUrl.trim() || undefined,
        project_url: projectUrl.trim() || undefined,
        source_code: sourceCode,
        explanation: explanation.trim() || undefined,
        is_draft: false
      });

      const submissionId = subRes.submission.id;

      // 2. Simulate step progression while server executes real Gemini call
      setEvalProgressStep('Contacting Gemini 3.8 Flash evaluator...');
      setTimeout(() => {
        setEvalProgressStep('Inspecting code evidence against published rubric criteria...');
      }, 1200);

      // 3. Trigger server-side AI assessment
      const assessRes = await api.assessSubmission(submissionId);

      setEvalProgressStep('Rubric scores generated and verified!');
      setTimeout(() => {
        setIsSubmitting(false);
        onAssessmentCompleted(submissionId);
      }, 600);

    } catch (err: any) {
      setIsSubmitting(false);
      setEvalProgressStep(null);
      setErrorMessage(
        err.message || 'AI assessment failed. Please ensure GEMINI_API_KEY is configured or retry.'
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to challenges</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-800 capitalize">{challenge.difficulty}</span>
          <span aria-hidden="true">·</span>
          <span>{challenge.estimated_minutes} mins estimated</span>
          <span aria-hidden="true">·</span>
          <span>{challenge.skill_category}</span>
        </div>
      </div>

      {/* Challenge Title Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {challenge.title}
        </h1>
        <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
          {challenge.description}
        </p>

        {/* Tab Navigation (Segmented buttons) */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
          {[
            { id: 'brief', label: '1. Task Brief & Criteria', icon: FileText },
            { id: 'rubric', label: '2. Published Rubric (100 pts)', icon: ShieldCheck },
            { id: 'starter', label: '3. Starter Code', icon: Code2 },
            { id: 'submit', label: '4. Submit Work & Evaluate', icon: Send }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Evaluation Notice: </span>
            {errorMessage}
          </div>
        </div>
      )}

      {/* Evaluating Modal / Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto animate-pulse">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Evaluating Your Work</h3>
            <p className="text-xs text-slate-500 font-mono">
              {evalProgressStep || 'Inspecting evidence...'}
            </p>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full w-2/3 animate-pulse rounded-full" />
            </div>
            <p className="text-[11px] text-slate-400">
              Applying published criteria weights with Gemini 3.8 Flash
            </p>
          </div>
        </div>
      )}

      {/* TAB 1: Task Brief & Acceptance Criteria */}
      {activeTab === 'brief' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Required Features */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Required Features</h3>
            <div className="space-y-2.5">
              {challenge.requirements.map((req, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {idx + 1}
                  </div>
                  <span className="leading-relaxed">{req}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setActiveTab('rubric')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5"
              >
                <span>Review Published Rubric</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Acceptance Criteria & Instructions */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900">Acceptance Criteria</h3>
              <p className="text-xs text-slate-500">
                The evaluator verifies each of the following points before awarding full score.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700">
                {challenge.acceptance_criteria.map((crit, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{crit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Submission Formats Supported */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 text-xs space-y-2 text-slate-600">
              <div className="font-bold text-slate-800">Supported Evidence Formats:</div>
              <p>• <strong>Pasted Code</strong>: Direct HTML, CSS, JavaScript, or TypeScript.</p>
              <p>• <strong>GitHub Repository</strong>: Must be publicly accessible for automated AST inspection.</p>
              <p>• <strong>Approach Explanation</strong>: Explain tradeoffs, edge cases handled, and architectural choices.</p>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: Published Assessment Rubric */}
      {activeTab === 'rubric' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Published Assessment Rubric</h3>
              <p className="text-xs text-slate-500">
                Transparent grading standard applied consistently to every submission. Total points: 100.
              </p>
            </div>
            <div className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
              Pass Threshold: 75/100
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {challenge.rubric.criteria.map((criterion) => (
              <div key={criterion.id} className="py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">{criterion.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-900">
                      Weight: {criterion.weight}%
                    </span>
                    <span className="text-xs text-slate-400">({criterion.max_score} pts max)</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {criterion.description}
                </p>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${criterion.weight}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-between items-center border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Evaluator Model: gemini-3.8-flash · Zero simulation policy
            </span>
            <button
              onClick={() => setActiveTab('submit')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
            >
              <span>Proceed to Submission</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: Starter Code */}
      {activeTab === 'starter' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Starter Code {challenge.starter_filename && `(${challenge.starter_filename})`}
              </h3>
              <p className="text-xs text-slate-500">
                Use this scaffolding to build your solution. Copy it into your local editor or work directly in the submission tab.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyStarter}
                className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                {copiedStarter ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedStarter ? 'Copied to Clipboard' : 'Copy Code'}</span>
              </button>
              <button
                onClick={() => {
                  setSourceCode(challenge.starter_code || '');
                  setActiveTab('submit');
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <span>Load into Submission Editor</span>
              </button>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950 p-4">
            <pre className="text-xs font-mono text-slate-200 overflow-x-auto whitespace-pre">
              {challenge.starter_code}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 4: Submit Work & Evaluate */}
      {activeTab === 'submit' && (
        <form onSubmit={handleSubmitForAssessment} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Submit Your Work</h3>
                <p className="text-xs text-slate-500">
                  Submissions are permanently recorded with their version and evaluated against the published rubric.
                </p>
              </div>

              {/* Draft Status Badge */}
              <div className="flex items-center gap-2">
                {draftSavedMsg && (
                  <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Draft saved</span>
                  </span>
                )}
                <button
                  type="button"
                  disabled={isDraftSaving}
                  onClick={handleSaveDraft}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isDraftSaving ? 'Saving...' : 'Save Draft'}</span>
                </button>
              </div>
            </div>

            {/* Submission Format Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Submission Format
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                <button
                  type="button"
                  onClick={() => setSubmissionType('code')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    submissionType === 'code'
                      ? 'border-indigo-600 bg-indigo-50/40 text-indigo-900'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-xs mb-1">
                    <Code2 className="w-4 h-4 text-indigo-600" />
                    <span>Pasted Source Code</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Paste raw HTML, CSS, JavaScript, or TypeScript directly into the editor.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSubmissionType('github_repo')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    submissionType === 'github_repo'
                      ? 'border-indigo-600 bg-indigo-50/40 text-indigo-900'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-xs mb-1">
                    <Github className="w-4 h-4 text-slate-900" />
                    <span>Public GitHub Repo</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Link a public GitHub repository. Server inspects file contents.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSubmissionType('live_url')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    submissionType === 'live_url'
                      ? 'border-indigo-600 bg-indigo-50/40 text-indigo-900'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-xs mb-1">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    <span>Live Demo URL</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Provide deployed URL alongside your source code excerpt.
                  </div>
                </button>

              </div>
            </div>

            {/* Input fields based on format */}
            {submissionType === 'github_repo' && (
              <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-xs font-semibold text-slate-800">
                  Public GitHub Repository URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={repositoryUrl}
                    onChange={(e) => setRepositoryUrl(e.target.value)}
                    placeholder="https://github.com/your-username/your-repo"
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  />
                  <button
                    type="button"
                    disabled={inspectingRepo}
                    onClick={handleInspectGitHub}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    {inspectingRepo && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Inspect Repo</span>
                  </button>
                </div>
                {repoInspectionResult && (
                  <p className="text-xs text-emerald-700 font-medium">{repoInspectionResult}</p>
                )}
                <p className="text-[11px] text-slate-400">
                  Note: Private repositories cannot be inspected without OAuth keys. Paste source code below if your repository is private.
                </p>
              </div>
            )}

            {submissionType === 'live_url' && (
              <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-xs font-semibold text-slate-800">
                  Live Project Deployment URL
                </label>
                <input
                  type="url"
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                  placeholder="https://my-project.vercel.app"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                />
                <p className="text-[11px] text-slate-400">
                  URL will be attached to your public portfolio proof record. Please also paste the source code below for AST grading.
                </p>
              </div>
            )}

            {/* Source Code Editor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Source Code Evidence (Evaluated by Gemini)
                </label>
                <span className="text-[11px] text-slate-400">
                  {sourceCode.length} characters
                </span>
              </div>
              <textarea
                value={sourceCode}
                onChange={(e) => setSourceCode(e.target.value)}
                rows={12}
                placeholder="// Paste your complete solution code here..."
                className="w-full p-4 font-mono text-xs bg-slate-950 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                required
              />
            </div>

            {/* Approach & Explanation */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Written Approach & Architectural Decisions (Optional but Evaluated)
              </label>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                rows={3}
                placeholder="Explain why you chose this design pattern, how edge cases were handled, or tradeoffs made..."
                className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
              />
            </div>

            {/* Pre-submission Checklist */}
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2">
              <div className="text-xs font-bold text-indigo-950">Pre-Evaluation Verification:</div>
              <ul className="text-xs text-indigo-900 space-y-1">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Submission will be graded against the 5 published rubric criteria.</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Exact code lines will be quoted to substantiate awarded points.</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Scores $\ge 75$ earn a verified proof badge on your portfolio.</span>
                </li>
              </ul>
            </div>

            {/* Submit CTA */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                Evaluation runs on Gemini 3.8 Flash server-side.
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>Submit for AI Assessment</span>
              </button>
            </div>

          </div>
        </form>
      )}

    </div>
  );
};
