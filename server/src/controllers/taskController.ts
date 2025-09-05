import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Task } from '../models/Task';
import { CreateTaskRequest, UpdateTaskRequest, TaskStatus } from '../types/task';

export class TaskController {
  // Get all tasks with optional filtering and pagination
  static async getAllTasks(req: Request, res: Response): Promise<void> {
    try {
      const { status, search, page = 1, limit = 10 } = req.query;
      
      // Build filter object
      const filter: any = {};
      
      if (status && ['pending', 'in-progress', 'completed'].includes(status as string)) {
        filter.status = status;
      }
      
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      // Calculate pagination
      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10));
      const skip = (pageNum - 1) * limitNum;

      // Get tasks with pagination
      const tasks = await Task.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      // Get total count for pagination info
      const totalTasks = await Task.countDocuments(filter);
      const totalPages = Math.ceil(totalTasks / limitNum);

      res.status(200).json({
        success: true,
        count: tasks.length,
        total: totalTasks,
        page: pageNum,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
        data: tasks
      });
    } catch (error) {
      console.error('Error in getAllTasks:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching tasks',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get task by ID
  static async getTaskById(req: Request, res: Response): Promise<void> {
    try {
const { id } = req.params;

if (!id || !mongoose.Types.ObjectId.isValid(id)) {
  res.status(400).json({
    success: false,
    message: "Invalid task ID format"
  });
  return;
}

      const task = await Task.findById(id);

      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: task
      });
    } catch (error) {
      console.error('Error in getTaskById:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching task',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Create new task
  static async createTask(req: Request, res: Response): Promise<void> {
    try {
      const taskData: CreateTaskRequest = req.body;

      // Validate required fields
      if (!taskData.title?.trim()) {
        res.status(400).json({
          success: false,
          message: 'Title is required and cannot be empty'
        });
        return;
      }

      if (!taskData.description?.trim()) {
        res.status(400).json({
          success: false,
          message: 'Description is required and cannot be empty'
        });
        return;
      }

      // Validate status if provided
      if (taskData.status && !['pending', 'in-progress', 'completed'].includes(taskData.status)) {
        res.status(400).json({
          success: false,
          message: 'Status must be one of: pending, in-progress, completed'
        });
        return;
      }

      const exists = await Task.findOne({ title: taskData.title.trim()});

      if (exists) {
        res.status(400).json({
          success: false,
          message:"Oi nakalimot man guro ka na naay pariha ug ngan ani"
        })
        return;
      }


      const task = new Task({
        title: taskData.title.trim(),
        description: taskData.description.trim(),
        status: taskData.status || 'pending'
      });

      const savedTask = await task.save();

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: savedTask
      });
    } catch (error) {
      console.error('Error in createTask:', error);
      
      // Handle validation errors
      if (error instanceof mongoose.Error.ValidationError) {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: validationErrors
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error creating task',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update task
  static async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateTaskRequest = req.body;

      // Validate MongoDB ObjectId
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid task ID format'
        });
        return;
      }

      // Validate update data
      if (Object.keys(updateData).length === 0) {
        res.status(400).json({
          success: false,
          message: 'No update data provided'
        });
        return;
      }

      // Validate status if provided
      if (updateData.status && !['pending', 'in-progress', 'completed'].includes(updateData.status)) {
        res.status(400).json({
          success: false,
          message: 'Status must be one of: pending, in-progress, completed'
        });
        return;
      }

      // Trim string fields
      if (updateData.title !== undefined) {
        updateData.title = updateData.title.trim();
        if (!updateData.title) {
          res.status(400).json({
            success: false,
            message: 'Title cannot be empty'
          });
          return;
        }
      }

      if (updateData.description !== undefined) {
        updateData.description = updateData.description.trim();
        if (!updateData.description) {
          res.status(400).json({
            success: false,
            message: 'Description cannot be empty'
          });
          return;
        }
      }

      const task = await Task.findByIdAndUpdate(
        id,
        updateData,
        { 
          new: true, 
          runValidators: true,
          context: 'query'
        }
      );

      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: task
      });
    } catch (error) {
      console.error('Error in updateTask:', error);
      
      // Handle validation errors
      if (error instanceof mongoose.Error.ValidationError) {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: validationErrors
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error updating task',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Delete task
  static async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Validate MongoDB ObjectId
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid task ID format'
        });
        return;
      }

      const task = await Task.findByIdAndDelete(id);

      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
        data: task
      });
    } catch (error) {
      console.error('Error in deleteTask:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting task',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get tasks by status
  static async getTasksByStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.params;
      
      if (!status || !['pending', 'in-progress', 'completed'].includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Invalid status. Must be: pending, in-progress, or completed'
        });
        return;
      }

      const tasks = await Task.find({ status: status as TaskStatus })
        .sort({ createdAt: -1 });
      
      res.status(200).json({
        success: true,
        count: tasks.length,
        status,
        data: tasks
      });
    } catch (error) {
      console.error('Error in getTasksByStatus:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching tasks by status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get task statistics
  static async getTaskStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await Task.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const totalTasks = await Task.countDocuments();
      
      const formattedStats = {
        total: totalTasks,
        pending: 0,
        'in-progress': 0,
        completed: 0
      };

      stats.forEach(stat => {
        formattedStats[stat._id as keyof typeof formattedStats] = stat.count;
      });

      res.status(200).json({
        success: true,
        data: formattedStats
      });
    } catch (error) {
      console.error('Error in getTaskStats:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching task statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}