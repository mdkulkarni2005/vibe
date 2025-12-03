import { prisma } from '@/lib/db';

interface FileContent {
  path: string;
  content: string;
  language?: string;
}

/**
 * Extracts code files from project messages for review
 */
export async function getProjectFilesForReview(projectId: string): Promise<FileContent[]> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      messages: {
        include: {
          fragment: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        where: {
          role: 'ASSISTANT',
          fragment: {
            isNot: null,
          },
        },
        take: 1, // Get the latest message with code
      },
    },
  });

  if (!project || !project.messages.length) {
    return [];
  }

  const files: FileContent[] = [];

  // Extract files from fragments
  for (const message of project.messages) {
    if (message.fragment?.files) {
      // Handle both possible structures: string values or object with content property
      const fragmentFiles = message.fragment.files as Record<string, string | { content: string }>;
      
      for (const [path, fileData] of Object.entries(fragmentFiles)) {
        let content: string;
        
        // Check if fileData is a string or an object with content
        if (typeof fileData === 'string') {
          content = fileData;
        } else if (fileData && typeof fileData === 'object' && 'content' in fileData) {
          content = fileData.content;
        } else {
          continue; // Skip invalid entries
        }

        const extension = path.split('.').pop()?.toLowerCase();
        const languageMap: Record<string, string> = {
          ts: 'typescript',
          tsx: 'typescript',
          js: 'javascript',
          jsx: 'javascript',
          py: 'python',
          java: 'java',
          go: 'go',
          rs: 'rust',
          cpp: 'cpp',
          c: 'c',
          cs: 'csharp',
          php: 'php',
          rb: 'ruby',
          swift: 'swift',
          kt: 'kotlin',
        };

        files.push({
          path,
          content,
          language: extension ? languageMap[extension] : undefined,
        });
      }
    }
  }

  return files;
}

/**
 * Get language-specific file extensions to analyze
 */
export function getAnalyzableExtensions(): string[] {
  return [
    'ts', 'tsx', 'js', 'jsx',
    'py', 'java', 'go', 'rs',
    'cpp', 'c', 'cs', 'php',
    'rb', 'swift', 'kt', 'dart',
  ];
}

/**
 * Calculate basic file metrics
 */
export function calculateFileMetrics(content: string) {
  const lines = content.split('\n');
  const linesOfCode = lines.filter(line => line.trim().length > 0).length;
  
  // Simple complexity calculation based on control flow keywords
  const complexityKeywords = [
    'if', 'else', 'for', 'while', 'switch', 'case',
    'catch', 'try', 'throw', '&&', '||', '?',
  ];
  
  let complexity = 1; // Base complexity
  for (const keyword of complexityKeywords) {
    const matches = content.match(new RegExp(`\\b${keyword}\\b`, 'g'));
    if (matches) {
      complexity += matches.length;
    }
  }

  return { linesOfCode, complexity };
}
