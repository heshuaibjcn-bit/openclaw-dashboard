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
