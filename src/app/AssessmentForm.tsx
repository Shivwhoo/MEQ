'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { QUESTIONS } from '@/utils/questions';
import { submitAssessment } from '@/actions/assessment';
import { ClipboardList, CheckCircle2, AlertCircle, Loader2, Sparkles, User } from 'lucide-react';

export default function AssessmentForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Participant details
  const [name, setName] = useState('');
  const [batch, setBatch] = useState('');
  const [course, setCourse] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  // Questionnaire responses
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Calculate progress
  const answeredCount = Object.keys(responses).length;
  const totalQuestions = QUESTIONS.length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const handleSelectOption = (qId: string, score: number) => {
    setResponses((prev) => ({
      ...prev,
      [qId]: score,
    }));
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation checks
    if (!name.trim()) {
      setErrorMsg('Please enter your Full Name.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!batch.trim()) {
      setErrorMsg('Please enter your Batch (e.g. 2026).');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!course.trim()) {
      setErrorMsg('Please enter your Course (e.g. B.Tech CSE).');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!contactNumber.trim()) {
      setErrorMsg('Please enter your Contact Number.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (answeredCount < totalQuestions) {
      // Find the first unanswered question
      const firstUnanswered = QUESTIONS.find((q) => responses[q.id] === undefined);
      if (firstUnanswered) {
        setErrorMsg(`Please answer all questions. Question ${firstUnanswered.number} is still unanswered.`);
        const element = document.getElementById(firstUnanswered.id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    startTransition(async () => {
      const res = await submitAssessment({
        name,
        batch,
        course,
        contactNumber,
        responses,
      });

      if (res.success && res.id) {
        router.push(`/result/${res.id}`);
      } else {
        setErrorMsg(res.error || 'Something went wrong. Please try again.');
      }
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto pb-16 px-4">
      {/* Premium Sticky Progress Bar */}
      <div className="sticky top-0 z-40 bg-zinc-950/85 border-b border-zinc-800/80 py-3.5 px-4 -mx-4 backdrop-blur-md flex items-center justify-between mb-8 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-indigo-400" />
          <span className="text-xs sm:text-sm font-bold text-zinc-300">
            Progress: {answeredCount} of {totalQuestions} answered
          </span>
        </div>
        <div className="flex items-center gap-3 w-1/3 sm:w-1/2 justify-end">
          <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden border border-zinc-700/30 max-w-[200px]">
            <div
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className="text-xs font-black text-indigo-400 w-8 text-right font-mono">
            {progressPercent}%
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Banner/Header Card */}
        <div className="glow-card rounded-2xl overflow-hidden border border-zinc-800/80 relative">
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500" />
          <div className="p-6 sm:p-8 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] uppercase tracking-wider font-extrabold text-indigo-300">
              <Sparkles className="h-3 w-3" />
              Chronobiology Instrument
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-zinc-400">
              Discover Your Biological Rhythm
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
              Based on the Morningness-Eveningness Questionnaire (MEQ).
              Align your schedule with your biological preferences to optimize productivity and cognitive focus.
            </p>
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
              * ALL QUESTIONS MANDATORY
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-4 bg-rose-950/30 border border-rose-500/30 rounded-2xl flex items-start gap-3 text-rose-200 text-sm animate-pulse">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
            <div>
              <p className="font-bold">Form Validation Error</p>
              <p className="text-xs text-rose-300">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Participant Details Card */}
        <div className="glow-card rounded-2xl border border-zinc-800/80 p-6 sm:p-8 space-y-5">
          <h2 className="text-base font-black uppercase tracking-wider text-zinc-300 border-b border-zinc-800/80 pb-2 flex items-center gap-2">
            <User className="h-4.5 w-4.5 text-indigo-400" />
            Demographics
          </h2>

          <div className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full pl-3 pr-3 py-2.5 bg-zinc-950/40 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Batch */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Batch
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    placeholder="e.g. 2026 or 1st Year"
                    className="w-full pl-3 pr-3 py-2.5 bg-zinc-950/40 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              {/* Course */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Course
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="e.g. B.Tech CSE"
                    className="w-full pl-3 pr-3 py-2.5 bg-zinc-950/40 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Number */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Contact Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="Enter contact number"
                  className="w-full pl-3 pr-3 py-2.5 bg-zinc-950/40 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Questions list */}
        {QUESTIONS.map((q) => {
          const selectedScore = responses[q.id];
          const isAnswered = selectedScore !== undefined;

          return (
            <div
              key={q.id}
              id={q.id}
              className={`glow-card rounded-2xl border p-6 sm:p-8 space-y-4 transition-all duration-300 ${
                isAnswered ? 'border-zinc-800/80 bg-zinc-900/30' : 'border-zinc-800/80 bg-zinc-900/20'
              }`}
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                  Question {q.number} of {totalQuestions}
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-zinc-100 leading-snug">
                  {q.text}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-2 pt-2">
                {q.options.map((opt, oIdx) => {
                  const isChecked = selectedScore === opt.score;
                  return (
                    <label
                      key={oIdx}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-xs sm:text-sm cursor-pointer transition-all duration-200 ${
                        isChecked
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 font-bold shadow-[0_0_15px_rgba(99,102,241,0.12)]'
                          : 'border-zinc-800/50 bg-zinc-950/45 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700/60 hover:bg-zinc-900/30'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        checked={isChecked}
                        onChange={() => handleSelectOption(q.id, opt.score)}
                        className="h-4 w-4 text-indigo-500 focus:ring-indigo-500 border-zinc-700 bg-zinc-900 shrink-0 cursor-pointer accent-indigo-500"
                      />
                      <span>{opt.text}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Submission button card */}
        <div className="glow-card rounded-2xl border border-zinc-800/80 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xs text-zinc-500 text-center sm:text-left">
            Verify all questionnaire slots are filled before submitting metrics.
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto px-8 py-3 rounded-xl glow-btn text-white font-extrabold text-sm tracking-wider uppercase flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                Validating...
              </>
            ) : (
              <>
                Calculate Result
                <CheckCircle2 className="h-4.5 w-4.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
