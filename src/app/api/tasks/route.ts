import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Try to read tasks from workspace state or create sample tasks
    const workspaceStatePath = path.join(process.env.HOME || '', '.openclaw', 'workspace', '.openclaw', 'workspace-state.json');

    let tasks: any[] = [];

    try {
      const workspaceState = JSON.parse(await fs.readFile(workspaceStatePath, 'utf-8'));
      tasks = workspaceState.tasks || [];
    } catch {
      // Return sample tasks if no workspace state found
      tasks = [
        {
          id: 'task-1',
          title: 'Review code changes',
          description: 'Review and approve pending PRs',
          status: 'in-progress',
          priority: 'high',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'task-2',
          title: 'Update documentation',
          description: 'Update API documentation with new endpoints',
          status: 'pending',
          priority: 'medium',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
    }

    const paginatedTasks = tasks.slice(offset, offset + limit);

    return NextResponse.json(paginatedTasks);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}
