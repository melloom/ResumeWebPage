import { Octokit } from '@octokit/rest';

export interface GitHubFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  content?: string;
  sha: string;
  size: number;
}

export interface GitHubRepo {
  name: string;
  full_name: string;
  description: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  default_branch: string;
  private?: boolean;
}

export interface GitHubPullRequest {
  number: number;
  title: string;
  body: string;
  state: string;
  user: { login: string; avatar_url: string };
  head: { ref: string; sha: string };
  base: { ref: string; sha: string };
  changed_files: number;
  additions: number;
  deletions: number;
  created_at: string;
  updated_at: string;
  html_url: string;
  mergeable: boolean | null;
  merged: boolean;
}

export interface GitHubPRFile {
  filename: string;
  status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied' | 'changed' | 'unchanged';
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
  contents_url: string;
  sha: string;
  previous_filename?: string;
}

export interface DiffLine {
  type: 'added' | 'removed' | 'context' | 'header';
  content: string;
  oldLine: number | null;
  newLine: number | null;
}

export interface ParsedFileDiff {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  lines: DiffLine[];
  patch?: string;
}

export class GitHubService {
  private octokit: Octokit;
  private token?: string;

  constructor(token?: string) {
    // Handle browser environment safely
    const githubToken = token || 
      (typeof window !== 'undefined' && localStorage.getItem('github_token')) ||
      (typeof window !== 'undefined' && (window as any).__VITE_GITHUB_TOKEN__) ||
      (typeof import.meta !== 'undefined' && import.meta.env.VITE_GITHUB_TOKEN);
    
    this.token = githubToken;
    this.octokit = new Octokit({
      auth: githubToken,
    });
  }

  async getRepo(owner: string, repo: string): Promise<GitHubRepo> {
    try {
      const response = await this.octokit.rest.repos.get({
        owner,
        repo,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch repository: ${error}`);
    }
  }

  async getRepoContents(
    owner: string,
    repo: string,
    path: string = '',
    branch?: string
  ): Promise<GitHubFile[]> {
    try {
      const response = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref: branch,
      });

      const data = response.data;
      if (Array.isArray(data)) {
        return data.map(item => ({
          name: item.name,
          path: item.path,
          type: item.type as 'file' | 'dir',
          sha: item.sha,
          size: item.size || 0,
        }));
      } else {
        return [{
          name: data.name,
          path: data.path,
          type: data.type as 'file' | 'dir',
          sha: data.sha,
          size: data.size || 0,
        }];
      }
    } catch (error) {
      throw new Error(`Failed to fetch repository contents: ${error}`);
    }
  }

  async getFileContent(
    owner: string,
    repo: string,
    path: string,
    branch?: string
  ): Promise<string> {
    try {
      const response = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref: branch,
      });

      const data = response.data;
      if (Array.isArray(data)) {
        throw new Error('Path points to a directory, not a file');
      }

      if (data.type === 'file' && data.content) {
        return atob(data.content);
      }

      throw new Error('File content not available');
    } catch (error) {
      throw new Error(`Failed to fetch file content: ${error}`);
    }
  }

  async getAllCodeFiles(
    owner: string,
    repo: string,
    branch?: string,
    extensions: string[] = ['.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.cpp', '.c', '.go', '.rs']
  ): Promise<GitHubFile[]> {
    const codeFiles: GitHubFile[] = [];
    const visited = new Set<string>();

    const traverse = async (path: string) => {
      if (visited.has(path)) return;
      visited.add(path);

      try {
        const contents = await this.getRepoContents(owner, repo, path, branch);
        
        for (const item of contents) {
          if (item.type === 'dir') {
            // Skip common directories that don't contain code
            if (!['node_modules', '.git', 'dist', 'build', 'coverage', '.vscode', '.idea'].includes(item.name)) {
              await traverse(item.path);
            }
          } else if (item.type === 'file') {
            const extension = item.name.includes('.') ? '.' + item.name.split('.').pop()?.toLowerCase() : '';
            if (extensions.includes(extension)) {
              try {
                const content = await this.getFileContent(owner, repo, item.path, branch);
                codeFiles.push({
                  ...item,
                  content,
                });
              } catch (error) {
                console.warn(`Could not fetch content for ${item.path}:`, error);
              }
            }
          }
        }
      } catch (error) {
        console.warn(`Could not traverse ${path}:`, error);
      }
    };

    await traverse('');
    return codeFiles;
  }

  // ── Pull Request Methods ──

  async getPullRequest(
    owner: string,
    repo: string,
    pullNumber: number
  ): Promise<GitHubPullRequest> {
    try {
      const response = await this.octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: pullNumber,
      });
      return response.data as unknown as GitHubPullRequest;
    } catch (error) {
      throw new Error(`Failed to fetch pull request: ${error}`);
    }
  }

  async getPullRequestFiles(
    owner: string,
    repo: string,
    pullNumber: number
  ): Promise<GitHubPRFile[]> {
    try {
      const files: GitHubPRFile[] = [];
      let page = 1;
      while (true) {
        const response = await this.octokit.rest.pulls.listFiles({
          owner,
          repo,
          pull_number: pullNumber,
          per_page: 100,
          page,
        });
        if (response.data.length === 0) break;
        files.push(...(response.data as unknown as GitHubPRFile[]));
        if (response.data.length < 100) break;
        page++;
      }
      return files;
    } catch (error) {
      throw new Error(`Failed to fetch PR files: ${error}`);
    }
  }

  async getPullRequestFileContent(
    owner: string,
    repo: string,
    path: string,
    ref: string
  ): Promise<string> {
    return this.getFileContent(owner, repo, path, ref);
  }

  parsePatch(patch: string): DiffLine[] {
    if (!patch) return [];
    const lines = patch.split('\n');
    const result: DiffLine[] = [];
    let oldLine = 0;
    let newLine = 0;

    for (const line of lines) {
      if (line.startsWith('@@')) {
        const match = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
        if (match) {
          oldLine = parseInt(match[1], 10);
          newLine = parseInt(match[2], 10);
        }
        result.push({ type: 'header', content: line, oldLine: null, newLine: null });
      } else if (line.startsWith('+')) {
        result.push({ type: 'added', content: line.slice(1), oldLine: null, newLine: newLine });
        newLine++;
      } else if (line.startsWith('-')) {
        result.push({ type: 'removed', content: line.slice(1), oldLine: oldLine, newLine: null });
        oldLine++;
      } else {
        // Context line (starts with space or is empty)
        result.push({ type: 'context', content: line.startsWith(' ') ? line.slice(1) : line, oldLine: oldLine, newLine: newLine });
        oldLine++;
        newLine++;
      }
    }
    return result;
  }

  parseFileDiffs(prFiles: GitHubPRFile[]): ParsedFileDiff[] {
    return prFiles.map((file) => ({
      filename: file.filename,
      status: file.status,
      additions: file.additions,
      deletions: file.deletions,
      lines: this.parsePatch(file.patch || ''),
      patch: file.patch,
    }));
  }

  async listPullRequests(
    owner: string,
    repo: string,
    state: 'open' | 'closed' | 'all' = 'open'
  ): Promise<GitHubPullRequest[]> {
    try {
      const response = await this.octokit.rest.pulls.list({
        owner,
        repo,
        state,
        per_page: 30,
        sort: 'updated',
        direction: 'desc',
      });
      return response.data as unknown as GitHubPullRequest[];
    } catch (error) {
      throw new Error(`Failed to list pull requests: ${error}`);
    }
  }

  parseRepoUrl(url: string): { owner: string; repo: string } | null {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
    if (match) {
      return { owner: match[1], repo: match[2].replace('.git', '') };
    }
    return null;
  }

  parsePrUrl(url: string): { owner: string; repo: string; pullNumber: number } | null {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/);
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace('.git', ''),
        pullNumber: parseInt(match[3], 10),
      };
    }
    return null;
  }
}

export const githubService = new GitHubService();