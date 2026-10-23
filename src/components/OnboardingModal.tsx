import React, { useState } from 'react';
import { X, Check, ArrowRight, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';
import { api } from '../api/client.ts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newUserId: string) => void;
  onSelectChallenge: (slug: string) => void;
}

const AVAILABLE_SKILLS = [
  'JavaScript & DOM',
  'Responsive CSS',
  'React & State',
  'Web Accessibility (a11y)',
  'REST APIs & Async Flow',
  'Debugging & Security'
];

export const OnboardingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  onSelectChallenge
}) => {
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [university, setUniversity] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['JavaScript & DOM']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      if (selectedSkills.length > 1) {
        setSelectedSkills(selectedSkills.filter(s => s !== skill));
      }
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleCreateProfile = async () => {
    if (!displayName.trim() || !username.trim()) {
      setError('Please provide both your display name and a unique username.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await api.createStudent({
        username: username.toLowerCase().trim(),
        display_name: displayName.trim(),
        university: university.trim() || 'University Student',
        selected_skills: selectedSkills
      });
      setIsSubmitting(false);
      onSuccess(res.user.id);
      setStep(3); // Proceed to rubric explanation
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to create account.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-sm">Welcome to SkillProof</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Dots */}
        <div className="px-6 pt-4 flex items-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full flex-1 transition-all ${
                s <= step ? 'bg-indigo-600' : 'bg-slate-100'
              }`}
            />
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* STEP 1: Name and Username */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Set up your student profile</h3>
              <p className="text-xs text-slate-500 mb-5">
                Every verified challenge and AI evaluation will be attached to your public portfolio.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Jordan Rivera"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username (Unique Portfolio Handle)
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2 bg-slate-50 border border-r-0 border-slate-200 text-slate-400 text-xs rounded-l-lg">
                      skillproof.dev/
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                      placeholder="jordan_codes"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    University or Affiliation (Optional)
                  </label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="e.g. UC Berkeley, Self-Taught, or Bootcamp"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!displayName.trim() || !username.trim()) {
                      setError('Display name and username are required.');
                      return;
                    }
                    setError(null);
                    setStep(2);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <span>Next: Choose Skills</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Select Skills to Develop */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Select your focus skills</h3>
              <p className="text-xs text-slate-500 mb-4">
                Choose the technical competencies you want to prove with real work samples.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                {AVAILABLE_SKILLS.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`p-3 text-left rounded-xl border text-xs font-medium transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span>{skill}</span>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleCreateProfile}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Creating Profile...' : 'Create Account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: How Assessments Work */}
          {step === 3 && (
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">How SkillProof works</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Unlike simple quizzes, SkillProof measures what you actually write. Here is how your work is scored:
              </p>

              <div className="space-y-3 mb-6">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Predefined, Published Rubrics</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Every challenge has explicit weightings (e.g. 35% Functionality, 25% Accessibility). Nothing is hidden.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Evidence-Based AI Evaluation</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Our Gemini 3.8 Flash model inspects your submitted source code, quoting exact lines of evidence for every awarded point.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Human Mentor Verification</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Qualified industry mentors can audit your code evidence and grant a verified green shield mark.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <span>Next: Recommended Challenge</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: First Challenge Recommendation */}
          {step === 4 && (
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Start your first proof</h3>
              <p className="text-xs text-slate-500 mb-4">
                We recommend starting with our beginner challenge to experience the rubric and feedback cycle.
              </p>

              {/* Recommended Challenge Card */}
              <div className="p-4 rounded-xl border-2 border-indigo-500/20 bg-indigo-50/20 mb-6">
                <div className="flex items-center gap-2 text-[11px] text-indigo-700 font-semibold mb-1">
                  <span>Beginner</span>
                  <span aria-hidden="true">·</span>
                  <span>20–30 mins</span>
                  <span aria-hidden="true">·</span>
                  <span>Web Development</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Responsive Login Page</h4>
                <p className="text-xs text-slate-600 mb-3">
                  Build a semantic, accessible login interface with client-side validation, error states, and responsive styling.
                </p>
                <div className="text-[11px] text-slate-500">
                  Rubric: Functionality (35 pts), Accessibility (25 pts), Responsive UI (20 pts), Validation (10 pts), Code Cleanliness (10 pts).
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800"
                >
                  Explore Dashboard First
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectChallenge('responsive-login-page');
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>Start Responsive Login Challenge</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
