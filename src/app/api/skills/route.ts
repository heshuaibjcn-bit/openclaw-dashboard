import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const EXTENSIONS_PATH = path.join(process.env.HOME || '', '.openclaw', 'extensions');
const WORKSPACE_SKILLS_PATH = path.join(process.env.HOME || '', '.openclaw', 'workspace', 'skills');

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
        // Skip hidden directories but include node_modules (for skills detection)
        if (extDir.startsWith('.')) {
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

          for (const { pattern } of skillPatterns) {
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

          // Also check for skills directory in this extension
          const skillsDir = path.join(extPath, 'skills');
          try {
            await fs.access(skillsDir);
            const skillDirs = await fs.readdir(skillsDir);

            for (const skillDir of skillDirs) {
              if (skillDir.startsWith('.')) continue;

              const skillPath = path.join(skillsDir, skillDir);
              const skillMdPath = path.join(skillPath, 'SKILL.md');

              try {
                await fs.access(skillMdPath);
                const skillContent = await fs.readFile(skillMdPath, 'utf-8');

                // Parse frontmatter from SKILL.md
                const nameMatch = skillContent.match(/^name:\s*(.+)$/m);

                const skillName = nameMatch ? nameMatch[1].trim() : skillDir;
                // Handle multi-line descriptions
                const descLines: string[] = [];
                let inDesc = false;
                for (const line of skillContent.split('\n')) {
                  if (line.startsWith('description:')) {
                    inDesc = true;
                    const desc = line.replace(/^description:\s*/, '').trim();
                    if (desc && !desc.startsWith('|')) {
                      descLines.push(desc);
                    }
                  } else if (inDesc) {
                    if (line.startsWith('---') || line.match(/^\S+:/)) {
                      break;
                    }
                    const trimmed = line.trim();
                    if (trimmed && !trimmed.startsWith('|')) {
                      descLines.push(trimmed);
                    }
                  }
                }
                const skillDesc = descLines.length > 0 ? descLines.join(' ') : `Skill from ${extDir}`;

                skills.push({
                  id: `${extDir}-${skillDir}`,
                  name: skillName,
                  description: skillDesc,
                  extension: extDir,
                  category: 'Native Skill',
                  tools: [],
                });
              } catch {
                // Not a valid skill directory
                continue;
              }
            }
          } catch {
            // No skills directory in this extension
            // Ignore this error
          }
        } catch {
          // Not a valid extension or can't be read
          continue;
        }
      }

      // Also scan node_modules for skills
      const nodeModulesPath = path.join(EXTENSIONS_PATH, 'node_modules');
      try {
        await fs.access(nodeModulesPath);
        const nodeModuleDirs = await fs.readdir(nodeModulesPath);

        for (const moduleDir of nodeModuleDirs) {
          if (moduleDir.startsWith('.')) continue;

          const modulePath = path.join(nodeModulesPath, moduleDir);
          const skillsDir = path.join(modulePath, 'skills');

          // Check if this module has a skills directory
          try {
            await fs.access(skillsDir);
            const skillDirs = await fs.readdir(skillsDir);

            for (const skillDir of skillDirs) {
              if (skillDir.startsWith('.')) continue;

              const skillPath = path.join(skillsDir, skillDir);
              const skillMdPath = path.join(skillPath, 'SKILL.md');

              try {
                await fs.access(skillMdPath);
                const skillContent = await fs.readFile(skillMdPath, 'utf-8');

                // Parse frontmatter from SKILL.md
                const nameMatch = skillContent.match(/^name:\s*(.+)$/m);

                const skillName = nameMatch ? nameMatch[1].trim() : skillDir;
                const skillDesc = `Skill from ${moduleDir}`;

                skills.push({
                  id: `${moduleDir}-${skillDir}`,
                  name: skillName,
                  description: skillDesc,
                  extension: moduleDir,
                  category: 'Native Skill',
                  tools: [],
                });
              } catch {
                // Not a valid skill directory
                continue;
              }
            }
          } catch {
            // No skills directory in this module
            continue;
          }
        }
      } catch {
        // No node_modules directory
        // Ignore this error
      }

      // Also scan workspace skills directory
      try {
        await fs.access(WORKSPACE_SKILLS_PATH);
        const workspaceSkillDirs = await fs.readdir(WORKSPACE_SKILLS_PATH);

        for (const skillDir of workspaceSkillDirs) {
          if (skillDir.startsWith('.')) continue;

          const skillPath = path.join(WORKSPACE_SKILLS_PATH, skillDir);
          const skillMdPath = path.join(skillPath, 'SKILL.md');

          try {
            await fs.access(skillMdPath);
            const skillContent = await fs.readFile(skillMdPath, 'utf-8');

            // Parse frontmatter from SKILL.md
            const nameMatch = skillContent.match(/^name:\s*(.+)$/m);
            const descMatch = skillContent.match(/^description:\s*(.+)$/m);

            const skillName = nameMatch ? nameMatch[1].trim() : skillDir;
            let skillDesc = '';

            if (descMatch) {
              skillDesc = descMatch[1].trim();
              // Handle multi-line descriptions
              const descLines: string[] = [skillDesc];
              let inDesc = false;
              for (const line of skillContent.split('\n').slice(1)) {
                if (line.startsWith('description:')) {
                  inDesc = true;
                  const desc = line.replace(/^description:\s*/, '').trim();
                  if (desc && !desc.startsWith('|') && !desc.startsWith('>')) {
                    descLines.push(desc);
                  }
                } else if (inDesc) {
                  if (line.startsWith('---') || line.match(/^\S+:/)) {
                    break;
                  }
                  const trimmed = line.trim();
                  if (trimmed && !trimmed.startsWith('|') && !trimmed.startsWith('>')) {
                    descLines.push(trimmed);
                  }
                }
              }
              skillDesc = descLines.join(' ').replace(/\s+/g, ' ');
            }

            // Check for allowed-tools field
            const allowedToolsMatch = skillContent.match(/^allowed-tools:\s*(.+)$/m);
            let tools: string[] = [];
            if (allowedToolsMatch) {
              const toolsStr = allowedToolsMatch[1].trim();
              tools = toolsStr.split(',').map(t => t.trim());
            }

            skills.push({
              id: `workspace-${skillDir}`,
              name: skillName,
              description: skillDesc || `Workspace skill from ${skillDir}`,
              extension: 'workspace',
              category: 'Workspace Skill',
              tools,
            });
          } catch {
            // Not a valid skill directory
            continue;
          }
        }
      } catch {
        // No workspace skills directory
        // Ignore this error
      }

      // Sort by extension and category
      skills.sort((a, b) => {
        const extCompare = a.extension.localeCompare(b.extension);
        if (extCompare !== 0) return extCompare;
        return a.category.localeCompare(b.category);
      });

      const response = NextResponse.json({
        skills,
        total: skills.length,
        extensions: skills.map(s => s.extension).filter((v, i, a) => a.indexOf(v) === i),
      });

      // Disable caching to ensure fresh data
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');

      return response;
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
