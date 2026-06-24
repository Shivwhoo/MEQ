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
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="h-2 bg-[#673ab7]" />
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex h-12 w-12 rounded-full bg-indigo-50 text-[#673ab7] items-center justify-center">
                <Lock className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Admin Portal</h1>
              <p className="text-xs text-slate-500">
                Please enter password to view submissions and ranking analytics.
              </p>
            </div>

            {authError && (
              <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-md text-xs text-rose-700 font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                  Password
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#673ab7] focus:border-[#673ab7]"
                  disabled={isPending}
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 bg-[#673ab7] hover:bg-[#5e35b1] text-white font-semibold text-sm rounded shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
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
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            MEQ Assessment Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            Analyze results, compile statistics, and review circadian classifications.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex border border-slate-200 rounded p-1 bg-slate-50 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('participants')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer ${
              activeTab === 'participants'
                ? 'bg-white text-[#673ab7] shadow-sm'
                : 'text-slate-600 hover:text-slate-950'
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
                ? 'bg-white text-[#673ab7] shadow-sm'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <Trophy className="h-3.5 w-3.5" />
            Leaderboard
          </button>
        </div>
      </div>

      {/* Main View Container */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        
        {/* TAB 1: PARTICIPANTS */}
        {activeTab === 'participants' && (
          <div className="p-4 sm:p-6 space-y-6">
            
            {/* Filter controls toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
              
              <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 max-w-md w-full">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by Name..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-white rounded text-xs focus:outline-none focus:border-[#673ab7]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#673ab7] hover:bg-[#5e35b1] text-white text-xs font-semibold rounded cursor-pointer transition-colors"
                >
                  Search
                </button>
              </form>

              {/* Filters dropdowns */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-1 text-xs font-medium text-slate-600">
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
                  className="px-2.5 py-1.5 border border-slate-200 bg-white rounded text-xs focus:outline-none focus:border-[#673ab7]"
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
                  className="px-2.5 py-1.5 border border-slate-200 bg-white rounded text-xs focus:outline-none focus:border-[#673ab7]"
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
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white text-xs font-semibold rounded cursor-pointer transition-colors disabled:cursor-not-allowed ml-auto md:ml-0"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export CSV
                </button>
              </div>

            </div>

            {/* Table Listing */}
            <div className="border border-slate-200 rounded-lg overflow-x-auto">
              {isPending && submissions.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 className="h-6 w-6 text-[#673ab7] animate-spin" />
                  <span className="text-xs font-semibold">Retrieving submissions...</span>
                </div>
              ) : submissions.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No submissions match the current query criteria.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
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
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {submissions.map((sub) => (
                      <tr key={sub._id} className="hover:bg-slate-50/55 transition-colors">
                        <td className="p-3 font-semibold text-slate-900">{sub.name}</td>
                        <td className="p-3 text-slate-600">{sub.batch}</td>
                        <td className="p-3 text-slate-600">{sub.course}</td>
                        <td className="p-3 font-mono text-slate-500">{sub.contactNumber}</td>
                        <td className="p-3 text-center font-bold text-[#673ab7]">{sub.totalScore}</td>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            sub.resultCategory.includes('Definitely Morning') ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                            sub.resultCategory.includes('Moderately Morning') ? 'bg-violet-50 text-violet-700 border border-violet-100' :
                            sub.resultCategory.includes('Intermediate') ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                            sub.resultCategory.includes('Moderately Evening') ? 'bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-100' :
                            'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                            {sub.resultCategory}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 text-right whitespace-nowrap">
                          <span className="flex items-center justify-end gap-1 font-mono">
                            <Clock className="h-3 w-3" />
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
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  Biological Rhythms Leaderboard
                </h3>
                <p className="text-[11px] text-slate-500">
                  Ranking list of participants sorted by highest MEQ chronotype score.
                </p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-x-auto">
              {isPending && leaderboard.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 className="h-6 w-6 text-[#673ab7] animate-spin" />
                  <span className="text-xs font-semibold">Calculating ranks...</span>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No participant entries recorded in database yet.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                    <tr>
                      <th className="p-3 text-center w-16">Rank</th>
                      <th className="p-3">Name</th>
                      <th className="p-3 text-center w-24">MEQ Score</th>
                      <th className="p-3">Chronotype Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {leaderboard.map((item) => (
                      <tr key={item.rank} className="hover:bg-slate-50/55 transition-colors">
                        <td className="p-3 text-center">
                          <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full font-bold text-xs ${
                            item.rank === 1 ? 'bg-amber-100 text-amber-800' :
                            item.rank === 2 ? 'bg-slate-200 text-slate-800' :
                            item.rank === 3 ? 'bg-orange-100 text-orange-800' :
                            'bg-slate-50 text-slate-600'
                          }`}>
                            {item.rank}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-900">{item.name}</td>
                        <td className="p-3 text-center font-bold text-[#673ab7]">{item.totalScore}</td>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.resultCategory.includes('Definitely Morning') ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                            item.resultCategory.includes('Moderately Morning') ? 'bg-violet-50 text-violet-700 border border-violet-100' :
                            item.resultCategory.includes('Intermediate') ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                            item.resultCategory.includes('Moderately Evening') ? 'bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-100' :
                            'bg-rose-50 text-rose-700 border border-rose-100'
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
