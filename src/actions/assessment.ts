'use server';

import connectToDatabase from '@/lib/db';
import { Submission } from '@/models/Submission';
import { getChronotypeInterpretation } from '@/utils/scoring';

interface SubmissionPayload {
  name: string;
  batch: string;
  course: string;
  contactNumber: string;
  responses: Record<string, number>;
}

export async function submitAssessment(payload: SubmissionPayload) {
  try {
    const { name, batch, course, contactNumber, responses } = payload;

    // Server-side validation
    if (!name || !batch || !course || !contactNumber) {
      return { success: false, error: 'Please fill in all participant details.' };
    }

    if (!responses || Object.keys(responses).length < 19) {
      return { success: false, error: 'Please answer all 19 questions before submitting.' };
    }

    await connectToDatabase();

    // Calculate total score
    let totalScore = 0;
    const responseMap: Record<string, number> = {};
    for (let i = 1; i <= 19; i++) {
      const val = responses[`q${i}`];
      if (val === undefined || val === null) {
        return { success: false, error: `Missing answer for question ${i}.` };
      }
      totalScore += val;
      responseMap[`q${i}`] = val;
    }

    // Determine category
    const interpretation = getChronotypeInterpretation(totalScore);

    // Save to DB
    const newSubmission = new Submission({
      name: name.trim(),
      batch: batch.trim(),
      course: course.trim(),
      contactNumber: contactNumber.trim(),
      responses: responseMap,
      totalScore,
      resultCategory: interpretation.category,
      submittedAt: new Date(),
    });

    await newSubmission.save();

    return {
      success: true,
      id: newSubmission._id.toString(),
    };
  } catch (error) {
    console.error('Error submitting assessment:', error);
    const msg = error instanceof Error ? error.message : 'Failed to submit assessment';
    return { success: false, error: msg };
  }
}

export async function getSubmission(id: string) {
  try {
    await connectToDatabase();
    const doc = await Submission.findById(id);
    if (!doc) {
      return { success: false, error: 'Submission not found.' };
    }

    // Convert mongoose document to plain object for React Server Components
    const submission = {
      _id: doc._id.toString(),
      name: doc.name,
      batch: doc.batch,
      course: doc.course,
      contactNumber: doc.contactNumber,
      responses: JSON.parse(JSON.stringify(doc.responses)),
      totalScore: doc.totalScore,
      resultCategory: doc.resultCategory,
      submittedAt: doc.submittedAt.toISOString(),
    };

    return { success: true, submission };
  } catch (error) {
    console.error('Error fetching submission:', error);
    const msg = error instanceof Error ? error.message : 'Failed to fetch submission';
    return { success: false, error: msg };
  }
}
