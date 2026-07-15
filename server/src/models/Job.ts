import mongoose, { Document, Schema, Types } from 'mongoose';

export type JobStatus = 'draft' | 'open' | 'closed';
export type EmploymentType = 'Remote' | 'Onsite' | 'Hybrid';

export interface IJob extends Document {
  title: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  summary: string;
  description: string;
  requirements: string[];
  status: JobStatus;
  createdBy: Types.ObjectId;
  deletedAt?: Date; // For soft delete
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    employmentType: {
      type: String,
      enum: ['Remote', 'Onsite', 'Hybrid'],
      required: [true, 'Employment type is required'],
    },
    summary: {
      type: String,
      required: [true, 'Job summary is required'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    requirements: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['draft', 'open', 'closed'],
      default: 'draft',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Add index on status for faster queries
JobSchema.index({ status: 1 });

export const Job = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);
