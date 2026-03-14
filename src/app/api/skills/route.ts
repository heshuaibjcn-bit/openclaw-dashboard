import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const EXTENSIONS_PATH = path.join(process.env.HOME || '', '.openclaw', 'extensions');

interface ExtensionSkill {
  id: string;
  name: string;
  description: string;
  extension: string;
  category: string;
  tools?: string[];
}

/**
 * Get all available skills from OpenClaw extensions
 */
export async function GET() {
  try {
    const skills: ExtensionSkill[] = [];

    // Read extensions directory
    try {
      await fs.access(EXTENSIONS_PATH);
      const extensionDirs = await fs.readdir(EXTENSIONS_PATH);

      for (const extDir of extensionDirs) {
        // Skip node_modules
        if (extDir === 'node_modules' || extDir.startsWith('.')) {
          continue;
        }

        const extPath = path.join(EXTENSIONS_PATH, extDir);
        const indexFile = path.join(extPath, 'index.ts');

        try {
          // Check if it's an extension with index.ts
          await fs.access(indexFile);

          // Try to read package.json for metadata
          const packageFile = path.join(extPath, 'package.json');
          let extensionName = extDir;
          let extensionDesc = '';

          try {
            const packageContent = await fs.readFile(packageFile, 'utf-8');
            const packageData = JSON.parse(packageContent);
            extensionName = packageData.openclaw?.channel?.label || packageData.name || extDir;
            extensionDesc = packageData.openclaw?.channel?.blurb || packageData.description || '';
          } catch {
            // No package.json or invalid JSON
          }

          // Extract skills from index.ts
          const indexContent = await fs.readFile(indexFile, 'utf-8');

          // Look for register function calls to identify available skills
          const skillPatterns = [
            { pattern: /registerFeishu[A-Z]\w+\(/g, category: 'Channel' },
            { pattern: /registerFeishu[A-Z]\w+Tools\(/g, category: 'Tools' },
            { pattern: /register[A-Z]\w+Tools\(/g, category: 'Tools' },
            { pattern: /api\.registerTool\(/g, category: 'Tool' },
          ];

          const foundTools = new Set<string>();

          for (const { pattern, category } of skillPatterns) {
            const matches = indexContent.matchAll(pattern);
            for (const match of matches) {
              if (match[0].includes('registerFeishu')) {
                const toolName = match[0].replace('registerFeishu', '').replace('Tools(', '').replace('(', '');
                if (toolName && toolName.length > 0 && toolName.length < 50) {
                  foundTools.add(toolName);
                }
              }
            }
          }

          // Common skill mappings based on observed OpenClaw extensions
          const commonSkills: Record<string, ExtensionSkill[]> = {
            'feishu': [
              {
                id: 'feishu-doc',
                name: 'Feishu Documents',
                description: 'Read, create, and update Feishu/Lark documents',
                extension: 'feishu',
                category: 'Documents',
                tools: ['read', 'create', 'update', 'delete'],
              },
              {
                id: 'feishu-wiki',
                name: 'Feishu Wiki',
                description: 'Access and manage Feishu/Lark wiki knowledge base',
                extension: 'feishu',
                category: 'Knowledge',
                tools: ['search', 'read', 'update'],
              },
              {
                id: 'feishu-drive',
                name: 'Feishu Drive',
                description: 'File management in Feishu/Lark cloud drive',
                extension: 'feishu',
                category: 'Storage',
                tools: ['upload', 'download', 'list', 'delete'],
              },
              {
                id: 'feishu-perm',
                name: 'Feishu Permissions',
                description: 'Manage permissions and access control',
                extension: 'feishu',
                category: 'Admin',
                tools: ['check', 'grant', 'revoke'],
              },
              {
                id: 'feishu-bitable',
                name: 'Feishu Bitable',
                description: 'Work with Feishu/Lark multidimensional tables',
                extension: 'feishu',
                category: 'Data',
                tools: ['query', 'update', 'create'],
              },
              {
                id: 'feishu-chat',
                name: 'Feishu Messaging',
                description: 'Send messages and manage communications',
                extension: 'feishu',
                category: 'Communication',
                tools: ['send', 'reply', 'forward'],
              },
            ],
            'memory-lancedb-pro': [
              {
                id: 'memory-search',
                name: 'Memory Search',
                description: 'Hybrid vector + BM25 semantic search',
                extension: 'memory-lancedb-pro',
                category: 'Memory',
                tools: ['search', 'recall'],
              },
              {
                id: 'memory-store',
                name: 'Memory Storage',
                description: 'Store and retrieve long-term memories',
                extension: 'memory-lancedb-pro',
                category: 'Memory',
                tools: ['save', 'update', 'delete'],
              },
              {
                id: 'memory-chunking',
                name: 'Memory Chunking',
                description: 'Intelligent long-context chunking',
                extension: 'memory-lancedb-pro',
                category: 'Memory',
                tools: ['chunk', 'embed'],
              },
            ],
            'openai': [
              {
                id: 'openai-completion',
                name: 'OpenAI Completion',
                description: 'GPT model completions',
                extension: 'openai',
                category: 'AI',
                tools: ['complete', 'chat'],
              },
              {
                id: 'openai-embeddings',
                name: 'OpenAI Embeddings',
                description: 'Text embedding generation',
                extension: 'openai',
                category: 'AI',
                tools: ['embed'],
              },
            ],
          };

          // Add skills from common extensions
          if (commonSkills[extDir]) {
            skills.push(...commonSkills[extDir]);
          }

          // If we found tools but no predefined skills, create generic entries
          if (foundTools.size > 0 && !commonSkills[extDir]) {
            skills.push({
              id: `${extDir}-tools`,
              name: `${extensionName} Tools`,
              description: extensionDesc || `Various tools from ${extensionName}`,
              extension: extDir,
              category: 'Tools',
              tools: Array.from(foundTools),
            });
          }
        } catch (extError) {
          // Not a valid extension or can't be read
          continue;
        }
      }

      // Sort by extension and category
      skills.sort((a, b) => {
        const extCompare = a.extension.localeCompare(b.extension);
        if (extCompare !== 0) return extCompare;
        return a.category.localeCompare(b.category);
      });

      return NextResponse.json({
        skills,
        total: skills.length,
        extensions: skills.map(s => s.extension).filter((v, i, a) => a.indexOf(v) === i),
      });
    } catch (error) {
      console.error('Extensions directory not found or error:', error);
      // Return empty skills if extensions don't exist
      return NextResponse.json({
        skills: [],
        total: 0,
        extensions: [],
      });
    }
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch skills',
        skills: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}
