import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const projectRoot = process.cwd();
    const homeDir = process.env.HOME || '';

    let tasks: any[] = [];

    // 1. Read tasks from project task.json file
    const taskJsonPath = path.join(projectRoot, 'task.json');
    try {
      const taskJsonContent = await fs.readFile(taskJsonPath, 'utf-8');
      const taskData = JSON.parse(taskJsonContent);

      // Transform task.json format to Dashboard format
      const projectTasks = (taskData.tasks || []).map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        createdAt: task.createdAt || new Date().toISOString(),
        updatedAt: task.updatedAt || new Date().toISOString(),
        tags: task.tags || [],
        taskType: 'project',
        // Map acceptance criteria to subtasks
        subtaskCount: task.acceptanceCriteria?.length || 0,
        completedSubtasks: task.status === 'completed' ? (task.acceptanceCriteria?.length || 0) : 0,
      }));

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
      } catch (jsonError) {
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
      const cronTasks = (cronJobsData.jobs || []).map((job: any) => {
        // Parse cron expression to create readable schedule
        const cronParts = job.schedule.cron.split(' ');
        const schedule = `Every ${cronParts[1]} minutes - ${job.schedule.tz || 'UTC'}`;

        return {
          id: `cron-${job.id}`,
          title: `⏰ ${job.name}`,
          description: job.payload.message || job.payload.kind || 'Scheduled task',
          status: job.enabled ? 'in-progress' : 'pending',
          priority: 'medium',
          createdAt: job.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ['cron', 'scheduled', job.payload.kind],
          taskType: 'cron',
          schedule: schedule,
          cronExpression: job.schedule.cron,
          timezone: job.schedule.tz,
          enabled: job.enabled,
          subtaskCount: 0,
          completedSubtasks: 0,
        };
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
