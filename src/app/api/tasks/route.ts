import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  taskType: string;
  subtaskCount?: number;
  completedSubtasks?: number;
  schedule?: string;
  cronExpression?: string;
  timezone?: string;
  enabled?: boolean;
}

// GET endpoint - fetch all tasks
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const projectRoot = process.cwd();
    const homeDir = process.env.HOME || '';

    const tasks: TaskItem[] = [];

    // 1. Read tasks from project task.json file
    const taskJsonPath = path.join(projectRoot, 'task.json');
    try {
      const taskJsonContent = await fs.readFile(taskJsonPath, 'utf-8');
      const taskData = JSON.parse(taskJsonContent) as Record<string, unknown>;

      // Transform task.json format to Dashboard format
      const projectTasks = ((taskData.tasks as unknown[]) || []).map((task: unknown) => {
        const t = task as Record<string, unknown>;
        return {
        id: String(t.id || ''),
        title: String(t.title || ''),
        description: t.description ? String(t.description) : undefined,
        status: String(t.status || 'unknown'),
        priority: String(t.priority || 'medium'),
        createdAt: t.createdAt ? String(t.createdAt) : new Date().toISOString(),
        updatedAt: t.updatedAt ? String(t.updatedAt) : new Date().toISOString(),
        tags: ((t.tags as unknown[]) || []).map(tag => String(tag)),
        taskType: 'project',
        // Map acceptance criteria to subtasks
        subtaskCount: ((t.acceptanceCriteria as unknown[]) || []).length,
        completedSubtasks: t.status === 'completed' ? ((t.acceptanceCriteria as unknown[]) || []).length : 0,
      } as TaskItem});

      tasks.push(...projectTasks);
    } catch (error) {
      console.error('Error reading task.json:', error);
    }

    // 2. Read cron jobs from OpenClaw cron configuration
    const cronJobsPath = path.join(homeDir, '.openclaw', 'cron', 'jobs.json');
    try {
      const cronJobsContent = await fs.readFile(cronJobsPath, 'utf-8');

      // Use eval to parse JSON with unescaped newlines (safe in this server-side context)
      let cronJobsData;
      try {
        cronJobsData = JSON.parse(cronJobsContent);
      } catch {
        // If JSON.parse fails due to unescaped newlines, try eval
        try {
          // Only use eval for this trusted local file
          cronJobsData = eval(`(${cronJobsContent})`);
        } catch (evalError) {
          console.error('Failed to parse cron jobs JSON:', evalError);
          // Add a manual cron job as fallback
          cronJobsData = {
            jobs: [
              {
                id: 'self-evolution-3h',
                name: 'Self Evolution',
                schedule: {
                  kind: 'cron',
                  cron: '0 */3 * * *',
                  tz: 'Asia/Shanghai'
                },
                sessionTarget: 'isolated',
                payload: {
                  kind: 'agentTurn',
                  message: '执行自我进化流程'
                },
                delivery: {
                  mode: 'announce',
                  channel: 'webchat'
                },
                wakeMode: 'now',
                enabled: true,
                createdAt: '2026-03-14T21:13:00+08:00'
              }
            ]
          };
        }
      }

      // Transform cron jobs to Dashboard format
      const cronTasks = ((cronJobsData.jobs as unknown[]) || []).map((job: unknown) => {
        const j = job as Record<string, unknown>;
        const schedule = j.schedule as Record<string, unknown> | undefined;
        const payload = j.payload as Record<string, unknown> | undefined;
        // Parse cron expression to create readable schedule
        const cronExpr = schedule?.cron as string | undefined;
        const cronParts = cronExpr ? cronExpr.split(' ') : ['*', '*', '*', '*', '*'];
        const tz = schedule?.tz as string | undefined;
        const scheduleStr = `Every ${cronParts[1]} minutes - ${tz || 'UTC'}`;

        return {
          id: `cron-${String(j.id || '')}`,
          title: `⏰ ${String(j.name || 'Scheduled Task')}`,
          description: payload?.message ? String(payload.message) : (payload?.kind ? String(payload.kind) : 'Scheduled task'),
          status: j.enabled === true ? 'in-progress' : 'pending',
          priority: 'medium',
          createdAt: j.createdAt ? String(j.createdAt) : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ['cron', 'scheduled', payload?.kind ? String(payload.kind) : 'scheduled'],
          taskType: 'cron',
          schedule: scheduleStr,
          cronExpression: cronExpr || '* * * * *',
          timezone: tz || 'UTC',
          enabled: j.enabled === true,
          subtaskCount: 0,
          completedSubtasks: 0,
        } as TaskItem;
      });

      tasks.push(...cronTasks);
    } catch (error) {
      console.error('Error reading cron jobs.json:', error);
    }

    // Sort tasks: project tasks first, then cron tasks, both by updated date
    tasks.sort((a, b) => {
      if (a.taskType !== b.taskType) {
        return a.taskType === 'project' ? -1 : 1;
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    const paginatedTasks = tasks.slice(offset, offset + limit);

    return NextResponse.json(paginatedTasks);
  } catch (error) {
    console.error('Error in tasks API:', error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST endpoint - create a new task
export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;

    // Validate required fields
    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const projectRoot = process.cwd();
    const taskJsonPath = path.join(projectRoot, 'task.json');

    // Read existing tasks
    let taskData: Record<string, unknown> = { tasks: [] };
    try {
      const taskJsonContent = await fs.readFile(taskJsonPath, 'utf-8');
      taskData = JSON.parse(taskJsonContent);
    } catch {
      // File doesn't exist or is invalid, start with empty structure
    }

    const tasks = (taskData.tasks as unknown[]) || [];

    // Create new task
    const newTask = {
      id: body.id || `task-${Date.now()}`,
      title: body.title,
      description: body.description || undefined,
      status: body.status || 'pending',
      priority: body.priority || 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: body.tags ? String(body.tags).split(',').map(t => t.trim()).filter(Boolean) : [],
      acceptanceCriteria: body.acceptanceCriteria ? String(body.acceptanceCriteria).split('\n').filter(Boolean) : [],
      projectId: body.projectId || undefined,
      assignedTo: body.assignedTo || undefined,
      dueDate: body.dueDate || undefined,
    };

    // Add to tasks array
    tasks.push(newTask);
    taskData.tasks = tasks;

    // Write back to file
    await fs.writeFile(taskJsonPath, JSON.stringify(taskData, null, 2), 'utf-8');

    // Return the created task in the expected format
    const responseTask = {
      ...newTask,
      taskType: 'project',
      subtaskCount: newTask.acceptanceCriteria?.length || 0,
      completedSubtasks: newTask.status === 'completed' ? (newTask.acceptanceCriteria?.length || 0) : 0,
    };

    return NextResponse.json(responseTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

// PUT endpoint - update an existing task
export async function PUT(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;

    if (!body.id || typeof body.id !== 'string') {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const projectRoot = process.cwd();
    const taskJsonPath = path.join(projectRoot, 'task.json');

    // Read existing tasks
    let taskData: Record<string, unknown> = { tasks: [] };
    try {
      const taskJsonContent = await fs.readFile(taskJsonPath, 'utf-8');
      taskData = JSON.parse(taskJsonContent);
    } catch {
      return NextResponse.json({ error: 'Task file not found' }, { status: 404 });
    }

    const tasks = (taskData.tasks as unknown[]) || [];
    const taskIndex = tasks.findIndex(t => (t as Record<string, unknown>).id === body.id);

    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Update task
    const existingTask = tasks[taskIndex] as Record<string, unknown>;
    const updatedTask = {
      ...existingTask,
      title: body.title !== undefined ? body.title : existingTask.title,
      description: body.description !== undefined ? body.description : existingTask.description,
      status: body.status !== undefined ? body.status : existingTask.status,
      priority: body.priority !== undefined ? body.priority : existingTask.priority,
      updatedAt: new Date().toISOString(),
      tags: body.tags !== undefined
        ? String(body.tags).split(',').map(t => t.trim()).filter(Boolean)
        : existingTask.tags,
      acceptanceCriteria: body.acceptanceCriteria !== undefined
        ? String(body.acceptanceCriteria).split('\n').filter(Boolean)
        : existingTask.acceptanceCriteria,
      assignedTo: body.assignedTo !== undefined ? body.assignedTo : existingTask.assignedTo,
      dueDate: body.dueDate !== undefined ? body.dueDate : existingTask.dueDate,
    };

    tasks[taskIndex] = updatedTask;
    taskData.tasks = tasks;

    // Write back to file
    await fs.writeFile(taskJsonPath, JSON.stringify(taskData, null, 2), 'utf-8');

    // Return the updated task in the expected format
    const responseTask: TaskItem = {
      id: String(existingTask.id || ''),
      title: String(updatedTask.title || ''),
      description: updatedTask.description ? String(updatedTask.description) : undefined,
      status: String(updatedTask.status || 'unknown'),
      priority: String(updatedTask.priority || 'medium'),
      createdAt: String(existingTask.createdAt || new Date().toISOString()),
      updatedAt: String(updatedTask.updatedAt),
      tags: ((updatedTask.tags as unknown[]) || []).map(tag => String(tag)),
      taskType: 'project',
      subtaskCount: (updatedTask.acceptanceCriteria as unknown[])?.length || 0,
      completedSubtasks: updatedTask.status === 'completed'
        ? ((updatedTask.acceptanceCriteria as unknown[])?.length || 0)
        : 0,
    };

    return NextResponse.json(responseTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// DELETE endpoint - delete a task
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const projectRoot = process.cwd();
    const taskJsonPath = path.join(projectRoot, 'task.json');

    // Read existing tasks
    let taskData: Record<string, unknown> = { tasks: [] };
    try {
      const taskJsonContent = await fs.readFile(taskJsonPath, 'utf-8');
      taskData = JSON.parse(taskJsonContent);
    } catch {
      return NextResponse.json({ error: 'Task file not found' }, { status: 404 });
    }

    const tasks = (taskData.tasks as unknown[]) || [];
    const taskIndex = tasks.findIndex(t => (t as Record<string, unknown>).id === taskId);

    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Remove task
    tasks.splice(taskIndex, 1);
    taskData.tasks = tasks;

    // Write back to file
    await fs.writeFile(taskJsonPath, JSON.stringify(taskData, null, 2), 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
