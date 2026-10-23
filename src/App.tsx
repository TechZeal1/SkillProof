import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { OnboardingModal } from './components/OnboardingModal.tsx';
import { LandingView } from './views/LandingView.tsx';
import { DashboardView } from './views/DashboardView.tsx';
import { ChallengeLibraryView } from './views/ChallengeLibraryView.tsx';
import { ChallengeDetailView } from './views/ChallengeDetailView.tsx';
import { AssessmentResultView } from './views/AssessmentResultView.tsx';
import { ProfileView } from './views/ProfileView.tsx';
import { HistoryComparisonView } from './views/HistoryComparisonView.tsx';
import { MentorPortalView } from './views/MentorPortalView.tsx';
import { MethodologyView } from './views/MethodologyView.tsx';
import { api } from './api/client.ts';
import { Profile, Challenge, Submission, Assessment, MentorReview } from './types/index.ts';

export default function App() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [submissions, setSubmissions] = useState<(Submission & { assessment?: Assessment; mentor_review?: MentorReview })[]>([]);
  const [loading, setLoading] = useState(true);

  // Navigation State
  const [currentView, setCurrentView] = useState<string>('landing');
  const [viewParam, setViewParam] = useState<string | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [comparisonPair, setComparisonPair] = useState<{ subA: string; subB: string } | null>(null);

  // Modals & Notifications
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Initial Data Fetch
  const refreshAppData = async () => {
    try {
      const [meRes, chRes, subRes] = await Promise.all([
        api.getMe(),
        api.getChallenges(),
        api.getSubmissions()
      ]);
      setCurrentUser(meRes.user);
      setChallenges(chRes.challenges);
      setSubmissions(subRes.submissions);
      setLoading(false);
    } catch (err) {
      console.error('Error loading initial app data:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAppData();
  }, []);

  // Handle URL hash changes for shareable profile URLs (e.g. #/profile/alice_chen)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#/', '');
      if (hash.startsWith('profile/')) {
        const username = hash.replace('profile/', '');
        setCurrentView('profile');
        setViewParam(username);
      } else if (hash.startsWith('challenge/')) {
        const slug = hash.replace('challenge/', '');
        setCurrentView('challenge_detail');
        setViewParam(slug);
      } else if (hash) {
        setCurrentView(hash);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleNavigate = (view: string, param?: string) => {
    setCurrentView(view);
    setViewParam(param || null);
    if (view === 'profile' && param) {
      window.location.hash = `/profile/${param}`;
    } else if (view === 'challenge_detail' && param) {
      window.location.hash = `/challenge/${param}`;
    } else if (view === 'landing') {
      window.location.hash = '';
    } else {
      window.location.hash = `/${view}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Switch persona (Alice Chen, Dr. Sarah Marcus, etc.)
  const handleSwitchUser = async (userId: string) => {
    try {
      const res = await api.switchUser(userId);
      setCurrentUser(res.user);
      showToast(`Switched active persona to ${res.user.display_name}`);
      refreshAppData();
    } catch (err: any) {
      showToast(err.message || 'Failed to switch persona.');
    }
  };

  // Reset demo data to pristine demonstration state
  const handleResetDemo = async () => {
    try {
      await api.resetDemoData();
      showToast('Demo dataset restored to pristine state.');
      refreshAppData();
      handleNavigate('dashboard');
    } catch (err: any) {
      showToast(err.message || 'Failed to reset demo data.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafc] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 rounded-full border-3 border-indigo-600 border-t-transparent animate-spin mb-4" />
        <h2 className="text-sm font-bold text-slate-800">Initializing SkillProof</h2>
        <p className="text-xs text-slate-400 mt-1">Connecting database and rubric engine...</p>
      </div>
    );
  }

  // Active Challenge for ChallengeDetailView
  const currentChallenge = viewParam 
    ? challenges.find(c => c.slug === viewParam || c.id === viewParam)
    : challenges[0];

  // Active Submission & Assessment for AssessmentResultView
  const currentSubWithAssessment = selectedSubmissionId
    ? submissions.find(s => s.id === selectedSubmissionId)
    : submissions[0];

  return (
    <div className="min-h-screen bg-[#fafafc] flex flex-col font-sans text-slate-900 antialiased selection:bg-indigo-500/20">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Navbar */}
      <Navbar
        currentUser={currentUser}
        currentView={currentView}
        onNavigate={handleNavigate}
        onSwitchUser={handleSwitchUser}
        onOpenOnboarding={() => setOnboardingOpen(true)}
        onResetDemo={handleResetDemo}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingView
            onStartProving={() => {
              if (currentUser) handleNavigate('dashboard');
              else setOnboardingOpen(true);
            }}
            onExploreChallenges={() => handleNavigate('challenges')}
            onViewDemoProfile={() => handleNavigate('profile', 'alice_chen')}
          />
        )}

        {currentView === 'dashboard' && currentUser && (
          <DashboardView
            currentUser={currentUser}
            challenges={challenges}
            submissions={submissions}
            onNavigate={handleNavigate}
            onSelectChallenge={(slug) => handleNavigate('challenge_detail', slug)}
            onOpenSubmission={(subId) => {
              setSelectedSubmissionId(subId);
              handleNavigate('assessment_result', subId);
            }}
          />
        )}

        {currentView === 'challenges' && (
          <ChallengeLibraryView
            challenges={challenges}
            userSubmissions={submissions}
            onSelectChallenge={(slug) => handleNavigate('challenge_detail', slug)}
          />
        )}

        {currentView === 'challenge_detail' && currentChallenge && currentUser && (
          <ChallengeDetailView
            challenge={currentChallenge}
            currentUser={currentUser}
            onBack={() => handleNavigate('challenges')}
            onAssessmentCompleted={(subId) => {
              refreshAppData();
              setSelectedSubmissionId(subId);
              handleNavigate('assessment_result', subId);
            }}
          />
        )}

        {currentView === 'assessment_result' && currentSubWithAssessment && currentSubWithAssessment.assessment && (
          <AssessmentResultView
            submission={currentSubWithAssessment}
            challenge={challenges.find(c => c.id === currentSubWithAssessment.challenge_id) || challenges[0]}
            assessment={currentSubWithAssessment.assessment}
            mentorReview={currentSubWithAssessment.mentor_review}
            previousSubmission={submissions.find(
              s => s.challenge_id === currentSubWithAssessment.challenge_id && 
                   s.attempt_number < currentSubWithAssessment.attempt_number
            )}
            onBack={() => handleNavigate('dashboard')}
            onTryAgain={() => {
              const ch = challenges.find(c => c.id === currentSubWithAssessment.challenge_id);
              if (ch) handleNavigate('challenge_detail', ch.slug);
            }}
            onCompareAttempts={(subAId, subBId) => {
              setComparisonPair({ subA: subAId, subB: subBId });
              handleNavigate('history');
            }}
            onViewProfile={(u) => handleNavigate('profile', u)}
            onRequestMentorReview={() => {
              showToast('Mentor audit requested! You can switch to Dr. Sarah Marcus in the top right to verify.');
            }}
          />
        )}

        {currentView === 'profile' && (
          <ProfileView
            username={viewParam || currentUser?.username || 'alice_chen'}
            currentUser={currentUser}
            onSelectChallenge={(slug) => handleNavigate('challenge_detail', slug)}
            onOpenSubmission={(subId) => {
              setSelectedSubmissionId(subId);
              handleNavigate('assessment_result', subId);
            }}
          />
        )}

        {currentView === 'history' && currentUser && (
          <HistoryComparisonView
            currentUser={currentUser}
            userSubmissions={submissions}
            challenges={challenges}
            preselectedComparisonPair={comparisonPair}
            onOpenSubmission={(subId) => {
              setSelectedSubmissionId(subId);
              handleNavigate('assessment_result', subId);
            }}
            onSelectChallenge={(slug) => handleNavigate('challenge_detail', slug)}
            onBack={() => handleNavigate('dashboard')}
          />
        )}

        {currentView === 'mentor' && currentUser && (
          <MentorPortalView
            currentUser={currentUser}
            onSwitchToMentor={() => handleSwitchUser('usr_mentor_sarah')}
            onOpenSubmission={(subId) => {
              setSelectedSubmissionId(subId);
              handleNavigate('assessment_result', subId);
            }}
          />
        )}

        {currentView === 'methodology' && (
          <MethodologyView />
        )}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">SkillProof</span>
            <span aria-hidden="true">·</span>
            <span>Prove what you can actually do</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => handleNavigate('methodology')} className="hover:text-slate-800">
              Methodology & Rubrics
            </button>
            <button onClick={() => handleNavigate('challenges')} className="hover:text-slate-800">
              Challenges
            </button>
            <button onClick={() => handleNavigate('mentor')} className="hover:text-slate-800">
              Mentor Portal
            </button>
          </div>

          <div>
            AI Rubric Evaluation powered by Gemini 3.8 Flash
          </div>
        </div>
      </footer>

      {/* Onboarding Modal for New Students */}
      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        onSuccess={(newUserId) => {
          refreshAppData();
          showToast('Student account created successfully!');
        }}
        onSelectChallenge={(slug) => {
          handleNavigate('challenge_detail', slug);
        }}
      />

    </div>
  );
}
