'use server';

import connectToDatabase from '@/lib/db';
import { Submission } from '@/models/Submission';

function checkPassword(password: string) {
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
  return password === adminPass;
}

export async function verifyAdminPassword(password: string) {
  if (checkPassword(password)) {
    return { success: true };
  }
  return { success: false, error: 'Incorrect admin password.' };
}

export async function getAdminData(
  password: string,
  filters: { search?: string; batch?: string; course?: string } = {}
) {
  if (!checkPassword(password)) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await connectToDatabase();

    interface FilterQuery {
      name?: { $regex: string; $options: string };
      batch?: string;
      course?: string;
    }
    const query: FilterQuery = {};

    if (filters.search) {
      query.name = { $regex: filters.search.trim(), $options: 'i' };
    }

    if (filters.batch && filters.batch !== 'All') {
      query.batch = filters.batch;
    }

    if (filters.course && filters.course !== 'All') {
      query.course = filters.course;
    }

    // Fetch filtered submissions
    const docs = await Submission.find(query).sort({ submittedAt: -1 });

    const submissions = docs.map((doc) => ({
      _id: doc._id.toString(),
      name: doc.name,
      batch: doc.batch,
      course: doc.course,
      contactNumber: doc.contactNumber,
      totalScore: doc.totalScore,
      resultCategory: doc.resultCategory,
      submittedAt: doc.submittedAt.toISOString(),
    }));

    // Fetch unique options for filter lists (based on all entries in DB)
    const allBatches = await Submission.distinct('batch');
    const allCourses = await Submission.distinct('course');

    return {
      success: true,
      submissions,
      batches: allBatches.sort(),
      courses: allCourses.sort(),
    };
  } catch (error) {
    console.error('Error fetching admin data:', error);
    const msg = error instanceof Error ? error.message : 'Database error';
    return { success: false, error: msg };
  }
}

export async function getLeaderboardData(password: string) {
  if (!checkPassword(password)) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await connectToDatabase();

    // Fetch all submissions sorted by score descending
    const docs = await Submission.find().sort({ totalScore: -1, submittedAt: 1 });

    const leaderboard = docs.map((doc, idx) => ({
      rank: idx + 1,
      name: doc.name,
      totalScore: doc.totalScore,
      resultCategory: doc.resultCategory,
    }));

    return {
      success: true,
      leaderboard,
    };
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    const msg = error instanceof Error ? error.message : 'Database error';
    return { success: false, error: msg };
  }
}

export async function deleteSubmission(password: string, id: string) {
  if (!checkPassword(password)) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await connectToDatabase();
    const result = await Submission.findByIdAndDelete(id);
    if (!result) {
      return { success: false, error: 'Submission not found or already deleted.' };
    }
    return { success: true };
  } catch (error) {
    console.error('Error deleting submission:', error);
    const msg = error instanceof Error ? error.message : 'Database error';
    return { success: false, error: msg };
  }
}
