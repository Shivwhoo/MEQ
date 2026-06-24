import { Schema, model, models } from 'mongoose';

export interface ISubmission {
  _id?: string;
  name: string;
  batch: string;
  course: string;
  contactNumber: string;
  responses: Record<string, number>; // e.g. { "q1": 5, "q2": 4, ... }
  totalScore: number;
  resultCategory: string;
  submittedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>({
  name: { type: String, required: true },
  batch: { type: String, required: true },
  course: { type: String, required: true },
  contactNumber: { type: String, required: true },
  responses: { type: Schema.Types.Map, of: Number, required: true },
  totalScore: { type: Number, required: true },
  resultCategory: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
});

export const Submission = models.Submission || model<ISubmission>('Submission', SubmissionSchema);
