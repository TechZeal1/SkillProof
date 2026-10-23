import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';
import { Challenge, Submission } from '../types/index.ts';

interface Props {
  challenges: Challenge[];
  userSubmissions: Submission[];
  onSelectChallenge: (slug: string) => void;
}

export const ChallengeLibraryView: React.FC<Props> = ({
  challenges,
  userSubmissions,
  onSelectChallenge
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(challenges.map(c => c.skill_category));
    return ['All', ...Array.from(cats)];
  }, [challenges]);

  // Map challenge attempts
  const challengeStats = useMemo(() => {
    const map = new Map<string, { attempts: number; bestScore?: number; hasPassed: boolean }>();
    userSubmissions.forEach(sub => {
      const prev = map.get(sub.challenge_id) || { attempts: 0, hasPassed: false };
      prev.attempts += 1;
      if (sub.status === 'human_verified' || sub.status === 'ai_assessed') {
        prev.hasPassed = true;
      }
      map.set(sub.challenge_id, prev);
    });
    return map;
  }, [userSubmissions]);

  // Filter challenges
  const filteredChallenges = useMemo(() => {
    return challenges.filter(c => {
      // Search
      const matchesSearch = 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.skill_category.toLowerCase().includes(searchQuery.toLowerCase());

      // Category
      const matchesCategory = selectedCategory === 'All' || c.skill_category === selectedCategory;

      // Difficulty
      const matchesDifficulty = selectedDifficulty === 'All' || c.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

      // Status
      const stats = challengeStats.get(c.id);
      let matchesStatus = true;
      if (selectedStatus === 'completed') {
        matchesStatus = Boolean(stats?.hasPassed);
      } else if (selectedStatus === 'in_progress') {
        matchesStatus = Boolean(stats && stats.attempts > 0 && !stats.hasPassed);
      } else if (selectedStatus === 'not_started') {
        matchesStatus = !stats || stats.attempts === 0;
      }

      return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
    });
  }, [challenges, searchQuery, selectedCategory, selectedDifficulty, selectedStatus, challengeStats]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedDifficulty('All');
    setSelectedStatus('All');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            Curated Skill Library
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Practical Developer Challenges
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Each challenge includes predefined acceptance criteria and a published rubric. Submissions are scored by Gemini and verified by mentors.
          </p>
        </div>

        {/* Counter */}
        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-900">{filteredChallenges.length}</span> of {challenges.length} challenges
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-4">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search challenges by title, keyword, or skill (e.g. login, task, api, accessibility)..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Rows: Segmented Button Controls (Per Frontend Design Constitution) */}
        <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
          
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Category:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                    selectedCategory === cat
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Difficulty:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {['All', 'Beginner', 'Intermediate'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                    selectedDifficulty === diff
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Status:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {[
                { id: 'All', label: 'All' },
                { id: 'not_started', label: 'Not Started' },
                { id: 'in_progress', label: 'In Progress' },
                { id: 'completed', label: 'Verified / Passed' }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStatus(s.id)}
                  className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                    selectedStatus === s.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Action */}
          {(searchQuery || selectedCategory !== 'All' || selectedDifficulty !== 'All' || selectedStatus !== 'All') && (
            <button
              onClick={resetFilters}
              className="text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1 ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset filters</span>
            </button>
          )}

        </div>

      </div>

      {/* Challenge Cards Grid */}
      {filteredChallenges.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <p className="text-sm font-semibold text-slate-700">No challenges matched your search filters.</p>
          <button
            onClick={resetFilters}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge) => {
            const stats = challengeStats.get(challenge.id);
            const hasAttempts = Boolean(stats && stats.attempts > 0);
            const isPassed = Boolean(stats?.hasPassed);

            return (
              <div
                key={challenge.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between hover:border-indigo-300 hover:shadow-sm transition-all"
              >
                {/* Top Section */}
                <div className="space-y-3">
                  
                  {/* Clean unboxed metadata with typographic separators */}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-700 capitalize">{challenge.difficulty}</span>
                      <span aria-hidden="true">·</span>
                      <span>{challenge.estimated_minutes} mins</span>
                      <span aria-hidden="true">·</span>
                      <span>{challenge.skill_category}</span>
                    </div>

                    {isPassed && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600">
                    {challenge.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {challenge.description}
                  </p>

                  {/* Learning Objectives & Rubric summary */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Core Rubric Weights
                    </span>
                    <div className="space-y-1">
                      {challenge.rubric.criteria.slice(0, 3).map((crit) => (
                        <div key={crit.id} className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="truncate pr-2">{crit.name}</span>
                          <span className="font-medium text-slate-700 shrink-0">{crit.weight}%</span>
                        </div>
                      ))}
                      {challenge.rubric.criteria.length > 3 && (
                        <div className="text-[10px] text-slate-400">
                          +{challenge.rubric.criteria.length - 3} additional criteria (100 pts total)
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Bottom Action Footer */}
                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500">
                    {hasAttempts ? (
                      <span>{stats?.attempts} attempt{stats?.attempts === 1 ? '' : 's'} recorded</span>
                    ) : (
                      <span>Not yet attempted</span>
                    )}
                  </div>

                  <button
                    onClick={() => onSelectChallenge(challenge.slug)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <span>{hasAttempts ? 'Continue Challenge' : 'Start Challenge'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
