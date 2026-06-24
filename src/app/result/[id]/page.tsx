import React from 'react';
import Link from 'next/link';
import { getSubmission } from '@/actions/assessment';
import { getChronotypeInterpretation } from '@/utils/scoring';
import { Award, Calendar, RotateCcw, AlertTriangle, ArrowRight, User } from 'lucide-react';

interface ResultPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ResultPage({ params }: ResultPageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const res = await getSubmission(id);

  if (!res.success || !res.submission) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-sm p-6 text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto" />
          <h1 className="text-xl font-bold text-slate-900">Result Not Found</h1>
          <p className="text-sm text-slate-600">
            We couldn&apos;t find the chronotype assessment result for the requested submission ID.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#673ab7] hover:bg-[#5e35b1] text-white font-semibold text-xs rounded transition-colors"
            >
              Take Assessment
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { submission } = res;
  const interpretation = getChronotypeInterpretation(submission.totalScore);

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="w-full max-w-xl mx-auto space-y-6">
        
        {/* Header Card */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <div className="h-2.5 bg-[#673ab7]" />
          <div className="p-6 sm:p-8 space-y-2 text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-indigo-50 text-[#673ab7] mb-2">
              <Award className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Your Chronotype Report</h1>
            <p className="text-xs text-slate-500">
              Morningness-Eveningness Questionnaire (MEQ) Diagnostic Result
            </p>
          </div>
        </div>

        {/* Results Info Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Demographic summary */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 text-xs">
            <div className="space-y-0.5">
              <span className="text-slate-400 block font-medium">Participant Name</span>
              <span className="text-slate-900 font-bold flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-slate-400" />
                {submission.name}
              </span>
            </div>
            <div className="space-y-0.5 text-right">
              <span className="text-slate-400 block font-medium">Submission Date</span>
              <span className="text-slate-900 font-semibold flex items-center justify-end gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {new Date(submission.submittedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Score Counter */}
          <div className="text-center space-y-2 py-4 bg-slate-50 rounded-lg">
            <div className="text-5xl font-black tracking-tight text-[#673ab7]">
              {submission.totalScore}
            </div>
            <div className="text-xs uppercase tracking-wider text-slate-500 font-bold">
              Total Score (Scale: 16–86)
            </div>
          </div>

          {/* Chronotype Category */}
          <div className="text-center space-y-2">
            <div className="inline-block px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-[#673ab7]">
              Biological Classification
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {submission.resultCategory}
            </h2>
          </div>

          {/* Narrative */}
          <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100">
            <p className="text-sm text-slate-700 leading-relaxed font-normal">
              {interpretation.description}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-6 py-2.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-sm transition-colors cursor-pointer"
          >
            <RotateCcw className="h-4 w-4 text-slate-400" />
            Take Form Again
          </Link>
        </div>
      </div>
    </main>
  );
}
