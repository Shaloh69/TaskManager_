import { Router } from 'express';
import { TaskController } from '../controllers/taskController';
import { isArgumentsObject } from 'util/types';

const router = Router();

// GET /api/tasks - Get all tasks (with optional filtering and pagination)
// Query params: ?status=pending&search=keyword&page=1&limit=10
router.get('/', TaskController.getAllTasks);

// GET /api/tasks/stats - Get task statistics (must be before /:id route)
router.get('/stats', TaskController.getTaskStats);

// GET /api/tasks/status/:status - Get tasks by status
router.get('/status/:status', TaskController.getTasksByStatus);

// GET /api/tasks/:id - Get task by ID
router.get('/:id', TaskController.getTaskById);

// POST /api/tasks - Create new task
router.post('/', TaskController.createTask);

// PUT /api/tasks/:id - Update task (full update)
router.put('/:id', TaskController.updateTask);

// PATCH /api/tasks/:id - Update task (partial update) - same as PUT in this implementation
router.patch('/:id', TaskController.updateTask);

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', TaskController.deleteTask);

export default router;

// Title : Task 1
// Description: isArgumentsObject
// Status: completed
// id: 1

// /api/tasks/1
// Title: Task 2
// Descriptiong: Ambot Dyapon 
// status: pending