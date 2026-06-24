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
        <div className="w-full max-w-md bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-6 text-center space-y-4 shadow-2xl backdrop-blur-md">
          <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto" />
          <h1 className="text-xl font-bold text-zinc-100">Result Not Found</h1>
          <p className="text-sm text-zinc-400">
            We couldn&apos;t find the chronotype assessment result for the requested submission ID.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-colors cursor-pointer"
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
    <main className="min-h-screen py-16 px-4">
      <div className="w-full max-w-xl mx-auto space-y-6">
        
        {/* Header Card */}
        <div className="bg-zinc-950/70 rounded-2xl border border-zinc-800/80 overflow-hidden shadow-2xl backdrop-blur-md relative">
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500" />
          <div className="p-6 sm:p-8 space-y-2 text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
              <Award className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              Chronotype Assessment Results
            </h1>
            <p className="text-xs text-zinc-500">
              Morningness-Eveningness Questionnaire (MEQ) Diagnostic Transcript
            </p>
          </div>
        </div>

        {/* Results Info Card */}
        <div className="bg-zinc-950/75 rounded-2xl border border-zinc-800/80 p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-md">
          {/* Demographic details summary */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-zinc-800/80 text-xs">
            <div className="space-y-1">
              <span className="text-zinc-500 block font-bold uppercase tracking-wider text-[10px]">Participant Name</span>
              <span className="text-zinc-200 font-bold flex items-center gap-1.5 text-sm">
                <User className="h-4 w-4 text-indigo-400" />
                {submission.name}
              </span>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-zinc-500 block font-bold uppercase tracking-wider text-[10px]">Date of Entry</span>
              <span className="text-zinc-300 font-semibold flex items-center justify-end gap-1.5 text-sm font-mono">
                <Calendar className="h-4 w-4 text-indigo-400" />
                {new Date(submission.submittedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Glowing Score Counter */}
          <div className="text-center space-y-2 py-6 bg-zinc-950/60 rounded-xl border border-zinc-800/60 flex flex-col justify-center items-center">
            <div className="text-6xl font-black text-indigo-400 glow-text-neon tracking-tighter font-mono">
              {submission.totalScore}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-extrabold pt-1">
              Total score (Scale: 16–86)
            </div>
          </div>

          {/* Chronotype Classification */}
          <div className="text-center space-y-2">
            <div className="inline-block px-3 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-300 uppercase tracking-wide">
              Classification
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              {submission.resultCategory}
            </h2>
          </div>

          {/* Descriptive Interpretation */}
          <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/50">
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
              {interpretation.description}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-6 py-3 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900 text-zinc-300 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            <RotateCcw className="h-4 w-4 text-zinc-400" />
            Fill Form Again
          </Link>
        </div>
      </div>
    </main>
  );
}
