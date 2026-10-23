import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Layers, 
  History, 
  BookOpen, 
  UserCheck, 
  RotateCcw, 
  ChevronDown, 
  Menu, 
  X, 
  UserPlus, 
  ExternalLink,
  Award,
  Sparkles
} from 'lucide-react';
import { Profile } from '../types/index.ts';

interface Props {
  currentUser: Profile | null;
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  onSwitchUser: (userId: string) => void;
  onOpenOnboarding: () => void;
  onResetDemo: () => void;
}

export const Navbar: React.FC<Props> = ({
  currentUser,
  currentView,
  onNavigate,
  onSwitchUser,
  onOpenOnboarding,
  onResetDemo
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'challenges', label: 'Challenges', icon: Award },
    { id: 'history', label: 'History', icon: History },
    { id: 'methodology', label: 'Methodology', icon: BookOpen },
    { id: 'mentor', label: 'Mentor Review', icon: UserCheck, isMentorOnly: false }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-600/20 group-hover:bg-indigo-700 transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  SkillProof
                </span>
                <span className="hidden sm:inline-block text-[11px] text-slate-500 ml-2 font-medium">
                  Prove what you can actually do
                </span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = currentView === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => onNavigate(link.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'text-indigo-600 bg-indigo-50/70'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Action Controls: Persona Switcher & Demo Badge */}
          <div className="hidden md:flex items-center gap-3">
            {/* Demo Status & Reset Action */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-md border border-slate-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Demo Mode</span>
              <button
                onClick={onResetDemo}
                title="Restore demo submissions and assessments"
                className="ml-1 text-slate-400 hover:text-indigo-600 transition-colors p-0.5 rounded"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Persona Switcher Dropdown for Judges */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg shadow-xs hover:border-slate-300 focus:outline-none transition-all"
              >
                <img
                  src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={currentUser?.display_name}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <div className="text-left leading-tight">
                  <div className="font-semibold text-slate-900">{currentUser?.display_name || 'Select User'}</div>
                  <div className="text-[10px] text-slate-500 capitalize">{currentUser?.role || 'student'}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Judge / Persona Switcher
                  </div>

                  <button
                    onClick={() => {
                      onSwitchUser('usr_alice_chen');
                      setUserDropdownOpen(false);
                      onNavigate('dashboard');
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 transition-colors ${
                      currentUser?.id === 'usr_alice_chen' ? 'bg-indigo-50/60 font-semibold text-indigo-700' : 'text-slate-700'
                    }`}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                      className="w-6 h-6 rounded-full object-cover"
                      alt="Alice"
                    />
                    <div>
                      <div className="font-medium">Alice Chen (Student Demo)</div>
                      <div className="text-[10px] text-slate-500">2 attempts + 1 mentor verified</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSwitchUser('usr_mentor_sarah');
                      setUserDropdownOpen(false);
                      onNavigate('mentor');
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 transition-colors ${
                      currentUser?.id === 'usr_mentor_sarah' ? 'bg-indigo-50/60 font-semibold text-indigo-700' : 'text-slate-700'
                    }`}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100"
                      className="w-6 h-6 rounded-full object-cover"
                      alt="Sarah"
                    />
                    <div>
                      <div className="font-medium">Dr. Sarah Marcus (Mentor)</div>
                      <div className="text-[10px] text-slate-500">Authorized reviewer role</div>
                    </div>
                  </button>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenOnboarding();
                    }}
                    className="w-full text-left px-3 py-2 flex items-center gap-2 text-indigo-600 hover:bg-indigo-50/50 transition-colors font-medium"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Create Fresh Student Account</span>
                  </button>

                  {currentUser && (
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('profile', currentUser.username);
                      }}
                      className="w-full text-left px-3 py-2 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                      <span>View Public Profile</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Profile CTA */}
            {currentUser && (
              <button
                onClick={() => onNavigate('profile', currentUser.username)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
              >
                My Portfolio
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-left ${
                  isActive
                    ? 'text-indigo-600 bg-indigo-50 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </button>
            );
          })}

          <div className="border-t border-slate-100 pt-3 space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3">
              Switch Persona
            </div>
            <button
              onClick={() => {
                onSwitchUser('usr_alice_chen');
                setMobileMenuOpen(false);
                onNavigate('dashboard');
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 rounded hover:bg-slate-50"
            >
              <span>Alice Chen (Student Demo)</span>
            </button>
            <button
              onClick={() => {
                onSwitchUser('usr_mentor_sarah');
                setMobileMenuOpen(false);
                onNavigate('mentor');
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 rounded hover:bg-slate-50"
            >
              <span>Dr. Sarah Marcus (Mentor Review)</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenOnboarding();
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-indigo-600 font-medium rounded hover:bg-indigo-50"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Fresh Student</span>
            </button>
            <button
              onClick={() => {
                onResetDemo();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 rounded hover:bg-slate-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Data</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
