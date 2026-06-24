'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { verifyAdminPassword, getAdminData, getLeaderboardData } from '@/actions/admin';
import { 
  Users, 
  Trophy, 
  Search, 
  Filter, 
  Download, 
  Lock, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  Clock
} from 'lucide-react';

interface SubmissionRow {
  _id: string;
  name: string;
  batch: string;
  course: string;
  contactNumber: string;
  totalScore: number;
  resultCategory: string;
  submittedAt: string;
}

interface LeaderboardRow {
  rank: number;
  name: string;
  totalScore: number;
  resultCategory: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Tabs: 'participants' | 'leaderboard'
  const [activeTab, setActiveTab] = useState<'participants' | 'leaderboard'>('participants');

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState('All');

  // Data States
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [availableBatches, setAvailableBatches] = useState<string[]>([]);
  const [availableCourses, setAvailableCourses] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  // Load session password on mount
  useEffect(() => {
    const cachedPass = sessionStorage.getItem('admin_pass');
    if (cachedPass) {
      setPassword(cachedPass);
      handleAuthentication(cachedPass);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAuthentication = (pass: string) => {
    startTransition(async () => {
      const res = await verifyAdminPassword(pass);
      if (res.success) {
        setIsAuthenticated(true);
        setPassword(pass);
        sessionStorage.setItem('admin_pass', pass);
        // Load initial data
        fetchAdminData(pass, { search: searchTerm, batch: selectedBatch, course: selectedCourse });
        fetchLeaderboard(pass);
      } else {
        setAuthError(res.error || 'Access denied.');
        sessionStorage.removeItem('admin_pass');
      }
    });
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!passwordInput.trim()) {
      setAuthError('Please enter the admin password.');
      return;
    }
    handleAuthentication(passwordInput.trim());
  };

  const fetchAdminData = (pass: string, currentFilters: { search: string; batch: string; course: string }) => {
    startTransition(async () => {
      const res = await getAdminData(pass, currentFilters);
      if (res.success && res.submissions) {
        setSubmissions(res.submissions);
        setAvailableBatches(res.batches || []);
        setAvailableCourses(res.courses || []);
      }
    });
  };

  const fetchLeaderboard = (pass: string) => {
    startTransition(async () => {
      const res = await getLeaderboardData(pass);
      if (res.success && res.leaderboard) {
        setLeaderboard(res.leaderboard);
      }
    });
  };

  // Triggered when filters change
  const handleFilterChange = (filtersObj: { search: string; batch: string; course: string }) => {
    if (!password) return;
    fetchAdminData(password, filtersObj);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange({ search: searchTerm, batch: selectedBatch, course: selectedCourse });
  };

  // Export Data to CSV
  const handleExportCSV = () => {
    if (submissions.length === 0) return;

    const headers = [
      'Full Name',
      'Batch',
      'Course',
      'Contact Number',
      'MEQ Score',
      'Biological Chronotype',
      'Submission Date & Time'
    ];

    const rows = submissions.map((s) => [
      s.name,
      s.batch,
      s.course,
      s.contactNumber,
      s.totalScore,
      s.resultCategory,
      new Date(s.submittedAt).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `chronotype_submissions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-zinc-950/80 border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex h-12 w-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 items-center justify-center">
                <Lock className="h-5 w-5" />
              </div>
              <h1 className="text-xl font-bold text-zinc-100">Admin Portal</h1>
              <p className="text-xs text-zinc-500">
                Verify credential to display filtered chronotype transcripts.
              </p>
            </div>

            {authError && (
              <div className="p-3.5 bg-rose-950/40 border border-rose-800/30 rounded-lg text-xs text-rose-300 font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block">
                  Password
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter secret key"
                  className="w-full px-3.5 py-2.5 bg-zinc-900/40 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  disabled={isPending}
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs tracking-wider uppercase rounded-lg shadow-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Unlock Panel
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 px-4 max-w-6xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-zinc-950/70 rounded-2xl border border-zinc-800/80 overflow-hidden shadow-2xl backdrop-blur-md flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            MEQ Assessment Dashboard
          </h1>
          <p className="text-xs text-zinc-500 font-medium">
            Analyze results, compile statistics, and review circadian classifications.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex border border-zinc-800/80 rounded p-1 bg-zinc-900/40 backdrop-blur shrink-0 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('participants')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer ${
              activeTab === 'participants'
                ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Participants
          </button>
          <button
            onClick={() => {
              setActiveTab('leaderboard');
              fetchLeaderboard(password);
            }}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Trophy className="h-3.5 w-3.5" />
            Leaderboard
          </button>
        </div>
      </div>

      {/* Main View Container */}
      <div className="bg-zinc-950/70 rounded-2xl border border-zinc-800/80 shadow-2xl backdrop-blur-md overflow-hidden">
        
        {/* TAB 1: PARTICIPANTS */}
        {activeTab === 'participants' && (
          <div className="p-4 sm:p-6 space-y-6">
            
            {/* Filter controls toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-900/20 p-4 rounded-xl border border-zinc-900">
              
              <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 max-w-md w-full">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-600" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by Name..."
                    className="w-full pl-9 pr-4 py-2 bg-zinc-950/40 border border-zinc-800 rounded text-xs text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded cursor-pointer transition-colors"
                >
                  Search
                </button>
              </form>

              {/* Filters dropdowns */}
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500">
                  <Filter className="h-3.5 w-3.5" />
                  Filters:
                </div>

                {/* Batch Filter */}
                <select
                  value={selectedBatch}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedBatch(val);
                    handleFilterChange({ search: searchTerm, batch: val, course: selectedCourse });
                  }}
                  className="px-2.5 py-1.5 bg-zinc-950/40 border border-zinc-800 text-zinc-300 rounded text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="All">All Batches</option>
                  {availableBatches.map((b) => (
                    <option key={b} value={b}>
                      Batch {b}
                    </option>
                  ))}
                </select>

                {/* Course Filter */}
                <select
                  value={selectedCourse}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedCourse(val);
                    handleFilterChange({ search: searchTerm, batch: selectedBatch, course: val });
                  }}
                  className="px-2.5 py-1.5 bg-zinc-950/40 border border-zinc-800 text-zinc-300 rounded text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="All">All Courses</option>
                  {availableCourses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                {/* Export Button */}
                <button
                  onClick={handleExportCSV}
                  disabled={submissions.length === 0}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider rounded cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-50 ml-auto lg:ml-0"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export CSV
                </button>
              </div>

            </div>

            {/* Table Listing */}
            <div className="border border-zinc-800/80 rounded-xl overflow-x-auto">
              {isPending && submissions.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-zinc-500 gap-2">
                  <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                  <span className="text-xs font-bold uppercase tracking-wider">Syncing submissions...</span>
                </div>
              ) : submissions.length === 0 ? (
                <div className="py-16 text-center text-zinc-600 text-xs">
                  No assessment transcripts match current filter criteria.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-zinc-950/50 border-b border-zinc-800/60 text-zinc-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Name</th>
                      <th className="p-3">Batch</th>
                      <th className="p-3">Course</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3 text-center">Score</th>
                      <th className="p-3">Classification</th>
                      <th className="p-3 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/60 text-zinc-300">
                    {submissions.map((sub) => (
                      <tr key={sub._id} className="hover:bg-zinc-900/20 transition-colors">
                        <td className="p-3 font-semibold text-zinc-100">{sub.name}</td>
                        <td className="p-3 text-zinc-400">{sub.batch}</td>
                        <td className="p-3 text-zinc-400">{sub.course}</td>
                        <td className="p-3 font-mono text-zinc-500">{sub.contactNumber}</td>
                        <td className="p-3 text-center font-bold text-indigo-400 font-mono text-sm">{sub.totalScore}</td>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            sub.resultCategory.includes('Definitely Morning') ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' :
                            sub.resultCategory.includes('Moderately Morning') ? 'bg-violet-500/10 text-violet-300 border border-violet-500/20' :
                            sub.resultCategory.includes('Intermediate') ? 'bg-zinc-800 text-zinc-400 border border-zinc-700/50' :
                            sub.resultCategory.includes('Moderately Evening') ? 'bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20' :
                            'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                          }`}>
                            {sub.resultCategory}
                          </span>
                        </td>
                        <td className="p-3 text-zinc-500 text-right whitespace-nowrap">
                          <span className="flex items-center justify-end gap-1.5 font-mono text-[10px]">
                            <Clock className="h-3 w-3 text-indigo-400/70" />
                            {new Date(sub.submittedAt).toLocaleDateString()} {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div>
                <h3 className="font-bold text-zinc-100 text-sm sm:text-base flex items-center gap-1.5">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  Chronobiology Ranking List
                </h3>
                <p className="text-[10px] text-zinc-500 font-medium">
                  Participants ordered by highest MEQ sleep-wake category scoring.
                </p>
              </div>
            </div>

            {/* Table Listing */}
            <div className="border border-zinc-800/80 rounded-xl overflow-x-auto">
              {isPending && leaderboard.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-zinc-500 gap-2">
                  <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                  <span className="text-xs font-bold uppercase tracking-wider">Ranking metrics...</span>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="py-16 text-center text-zinc-600 text-xs">
                  No submissions logged to rank yet.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-zinc-950/50 border-b border-zinc-800/60 text-zinc-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3 text-center w-16">Rank</th>
                      <th className="p-3">Name</th>
                      <th className="p-3 text-center w-24">MEQ Score</th>
                      <th className="p-3">Chronotype Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/60 text-zinc-300">
                    {leaderboard.map((item) => (
                      <tr key={item.rank} className="hover:bg-zinc-900/20 transition-colors">
                        <td className="p-3 text-center">
                          <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full font-bold text-xs ${
                            item.rank === 1 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            item.rank === 2 ? 'bg-zinc-700/60 text-zinc-300 border border-zinc-600/50' :
                            item.rank === 3 ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                            'bg-zinc-900 text-zinc-500'
                          }`}>
                            {item.rank}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-zinc-100">{item.name}</td>
                        <td className="p-3 text-center font-bold text-indigo-400 font-mono text-sm">{item.totalScore}</td>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.resultCategory.includes('Definitely Morning') ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' :
                            item.resultCategory.includes('Moderately Morning') ? 'bg-violet-500/10 text-violet-300 border border-violet-500/20' :
                            item.resultCategory.includes('Intermediate') ? 'bg-zinc-800 text-zinc-400 border border-zinc-700/50' :
                            item.resultCategory.includes('Moderately Evening') ? 'bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20' :
                            'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                          }`}>
                            {item.resultCategory}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
