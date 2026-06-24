'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { QUESTIONS } from '@/utils/questions';
import { submitAssessment } from '@/actions/assessment';
import { ClipboardList, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

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
      {/* Sticky Progress Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 py-3 px-4 -mx-4 shadow-sm flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-[#673ab7]" />
          <span className="text-sm font-semibold text-slate-700">
            Progress: {answeredCount} of {totalQuestions} answered
          </span>
        </div>
        <div className="flex items-center gap-3 w-1/3">
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-[#673ab7] h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className="text-xs font-bold text-slate-600 w-8 text-right">
            {progressPercent}%
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Banner/Header Card */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <div className="h-2.5 bg-[#673ab7]" />
          <div className="p-6 sm:p-8 space-y-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Chronotype Assessment
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              This biological clock assessment is based on the Morningness-Eveningness Questionnaire (MEQ).
              It takes about 5 minutes to complete and will determine your natural sleep-wake type.
            </p>
            <div className="text-xs text-rose-600 font-medium">
              * Required fields
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3 text-rose-800 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
            <div>
              <p className="font-semibold">Unable to submit</p>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Participant Details Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 space-y-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
            Participant Details
          </h2>

          <div className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your answer"
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#673ab7] focus:border-[#673ab7] text-sm"
                required
              />
            </div>

            {/* Batch */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Batch / Year <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                placeholder="e.g. 2026, 1st Year, UG-3"
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#673ab7] focus:border-[#673ab7] text-sm"
                required
              />
            </div>

            {/* Course */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Course <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. B.Tech CSE, MBA, B.Sc Biology"
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#673ab7] focus:border-[#673ab7] text-sm"
                required
              />
            </div>

            {/* Contact Number */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Contact Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#673ab7] focus:border-[#673ab7] text-sm"
                required
              />
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
              className={`bg-white rounded-lg border p-6 sm:p-8 space-y-4 shadow-sm transition-all duration-200 ${
                isAnswered ? 'border-slate-200' : 'border-slate-200'
              }`}
            >
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#673ab7]">
                  Question {q.number} of {totalQuestions}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {q.text} <span className="text-rose-500">*</span>
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-2 pt-2">
                {q.options.map((opt, oIdx) => {
                  const isChecked = selectedScore === opt.score;
                  return (
                    <label
                      key={oIdx}
                      className={`flex items-center gap-3 p-3 rounded-lg border text-sm cursor-pointer transition-all ${
                        isChecked
                          ? 'border-[#673ab7] bg-indigo-50/30 text-slate-900 font-semibold'
                          : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        checked={isChecked}
                        onChange={() => handleSelectOption(q.id, opt.score)}
                        className="h-4 w-4 text-[#673ab7] focus:ring-[#673ab7] border-slate-300 shrink-0"
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
        <div className="bg-white rounded-lg border border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            Ensure all fields are answered before submitting.
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto px-6 py-2.5 rounded bg-[#673ab7] hover:bg-[#5e35b1] text-white font-semibold text-sm shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Submit Form
                <CheckCircle2 className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
