import mongoose, { Schema, Document } from 'mongoose';
import { ITask, TaskStatus } from '../types/task';

export interface ITaskDocument extends ITask, Document {
  _id: string;
}

const TaskSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title must be at least 1 character long'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [1, 'Description must be at least 1 character long'],
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'in-progress', 'completed'] as TaskStatus[],
        message: 'Status must be one of: pending, in-progress, completed'
      },
      default: 'pending'
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Index for better query performance
TaskSchema.index({ status: 1 });
TaskSchema.index({ createdAt: -1 });
TaskSchema.index({ title: 'text', description: 'text' });

// Transform the output to remove MongoDB internal fields
TaskSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export const Task = mongoose.model<ITaskDocument>('Task', TaskSchema);