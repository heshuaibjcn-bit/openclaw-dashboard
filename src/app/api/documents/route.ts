import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agent');

    const documents: Record<string, any[]> = {};

    // Main documents
    const mainDocs = await getDocumentsFromDir('~/.openclaw');
    documents.main = mainDocs;

    // Agent documents
    if (agentId && agentId !== 'all') {
      const agentDocs = await getDocumentsFromDir(`~/.openclaw/agents/${agentId}`);
      documents[agentId] = agentDocs;
    } else {
      // Get all agents
      const agentsPath = path.join(process.env.HOME || '', '.openclaw', 'agents');
      try {
        const agentDirs = await fs.readdir(agentsPath);
        const validAgentDirs = agentDirs.filter(dir => !dir.startsWith('.'));

        for (const agentId of validAgentDirs) {
          const agentDocs = await getDocumentsFromDir(`~/.openclaw/agents/${agentId}`);
          if (agentDocs.length > 0) {
            documents[agentId] = agentDocs;
          }
        }
      } catch {}
    }

    return NextResponse.json(documents);
  } catch (error) {
    return NextResponse.json({}, { status: 500 });
  }
}

async function getDocumentsFromDir(dirPath: string): Promise<any[]> {
  try {
    const resolvedPath = dirPath.replace('~', process.env.HOME || '');
    const entries = await fs.readdir(resolvedPath, { withFileTypes: true });

    const result: any[] = [];

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;

      const fullPath = path.join(resolvedPath, entry.name);
      const stats = await fs.stat(fullPath);

      if (entry.isDirectory()) {
        const children = await getDocumentsFromDir(fullPath);
        if (children.length > 0) {
          result.push({
            name: entry.name,
            path: fullPath.replace(process.env.HOME || '', ''),
            type: 'folder',
            children,
          });
        }
      } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.json') || entry.name.endsWith('.txt'))) {
        result.push({
          name: entry.name,
          path: fullPath.replace(process.env.HOME || '', ''),
          type: 'file',
          size: stats.size,
          modified: stats.mtime.toISOString(),
        });
      }
    }

    return result;
  } catch {
    return [];
  }
}
