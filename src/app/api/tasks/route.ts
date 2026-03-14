import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Read tasks from project task.json file
    const projectRoot = process.cwd();
    const taskJsonPath = path.join(projectRoot, 'task.json');

    let tasks: any[] = [];

    try {
      const taskJsonContent = await fs.readFile(taskJsonPath, 'utf-8');
      const taskData = JSON.parse(taskJsonContent);

      // Transform task.json format to Dashboard format
      tasks = (taskData.tasks || []).map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        createdAt: task.createdAt || new Date().toISOString(),
        updatedAt: task.updatedAt || new Date().toISOString(),
        tags: task.tags || [],
        // Map acceptance criteria to subtasks
        subtaskCount: task.acceptanceCriteria?.length || 0,
        completedSubtasks: task.status === 'completed' ? (task.acceptanceCriteria?.length || 0) : 0,
      }));
    } catch (error) {
      console.error('Error reading task.json:', error);
      // Return empty array if task.json not found or invalid
      tasks = [];
    }

    const paginatedTasks = tasks.slice(offset, offset + limit);

    return NextResponse.json(paginatedTasks);
  } catch (error) {
    console.error('Error in tasks API:', error);
    return NextResponse.json([], { status: 500 });
  }
}
