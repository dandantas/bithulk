import type { BitbucketHttpClient } from '../../infra/http/bitbucket_http_client';
import { logger } from '../../infra/logger/logger';
import type {
  BitbucketDiffOptions,
  BitbucketPullRequestCommentResponse,
  BitbucketPullRequestCommitsResponse,
  ParsedDiff,
} from '../../types/bitbucket_api';

/**
 * Service for interacting with Bitbucket API
 */
export class BitbucketService {
  private httpClient: BitbucketHttpClient;

  constructor(httpClient: BitbucketHttpClient) {
    this.httpClient = httpClient;
  }

  private async getPullRequestCommits(
    repository: string,
    pullRequestId: number,
  ): Promise<BitbucketPullRequestCommitsResponse> {
    const endpoint = `https://api.bitbucket.org/2.0/repositories/${repository}/pullrequests/${pullRequestId}/commits`;
    const response = await this.httpClient.get<BitbucketPullRequestCommitsResponse>(endpoint);
    return response;
  }

  async getPullRequestDiff(repository: string, pullRequestId: number): Promise<string[]> {
    try {
      logger.info(`Fetching diff for pull request ${pullRequestId} in ${repository}`);
      const commits = await this.getPullRequestCommits(repository, pullRequestId);

      const diffs = [];
      for (const commit of commits.values) {
        const commitDiff = await this.getCommitDiff({
          repository,
          commitHash: commit.hash,
        });
        diffs.push(commitDiff);
      }
      return diffs;
    } catch (error) {
      logger.error(
        `Error fetching pull request diff: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
  /**
   * Get the diff for a specific commit
   */
  async getCommitDiff(options: BitbucketDiffOptions): Promise<string> {
    try {
      logger.info(`Fetching diff for commit ${options.commitHash} in ${options.repository}`);

      const endpoint = `/repositories/${options.repository}/diff/${options.commitHash}`;
      const params: Record<string, any> = {};

      if (options.context !== undefined) {
        params.context = options.context;
      }

      if (options.path) {
        params.path = options.path;
      }

      const response = await this.httpClient.get<string>(endpoint, { params });
      return response;
    } catch (error) {
      logger.error(
        `Error fetching commit diff: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Parse raw diff content into a more structured format
   */
  parseDiff(rawDiff: string): ParsedDiff[] {
    logger.debug('Parsing raw diff content');
    const parsedDiffs: ParsedDiff[] = [];

    // Basic parsing of diff content
    // This is a simplified parser and could be expanded for more complex diffs
    const fileRegex = /^diff --git a\/(.*?) b\/(.*?)$/gm;
    let match: RegExpExecArray | null;
    let currentIndex = 0;

    match = fileRegex.exec(rawDiff);
    while (match !== null) {
      const filePath = match[2]; // Use the 'b' path (new file path)
      const startIndex = match.index;
      const endIndex = fileRegex.lastIndex;

      // Get the next match ready for the next iteration
      match = fileRegex.exec(rawDiff);

      // Find the next file's start or use the end of the string
      let nextMatchIndex = rawDiff.indexOf('diff --git', endIndex);
      if (nextMatchIndex === -1) nextMatchIndex = rawDiff.length;

      // Extract this file's diff content
      const fileDiffContent = rawDiff.substring(startIndex, nextMatchIndex);

      // Determine file type based on extension
      const fileType = this.getFileTypeFromPath(filePath);

      // Calculate stats
      const additions = (fileDiffContent.match(/^\+(?![\+]{3})/gm) || []).length;
      const deletions = (fileDiffContent.match(/^-(?![\-]{3})/gm) || []).length;

      // Parse diff hunks
      const hunkRegex = /^@@\s+-(\d+),?(\d*)\s+\+(\d+),?(\d*)\s+@@/gm;
      const changes: ParsedDiff['changes'] = [];
      let hunkMatch: RegExpExecArray | null;

      hunkMatch = hunkRegex.exec(fileDiffContent);
      while (hunkMatch !== null) {
        const oldStart = Number.parseInt(hunkMatch[1], 10);
        const oldLines = hunkMatch[2] ? Number.parseInt(hunkMatch[2], 10) : 0;
        const newStart = Number.parseInt(hunkMatch[3], 10);
        const newLines = hunkMatch[4] ? Number.parseInt(hunkMatch[4], 10) : 0;

        // Find the end of this hunk
        let hunkEndIndex = fileDiffContent.indexOf('@@', hunkMatch.index + 2);
        if (hunkEndIndex === -1) hunkEndIndex = fileDiffContent.length;

        // Extract the hunk content (excluding the hunk header)
        const hunkHeaderEndIndex = fileDiffContent.indexOf('\n', hunkMatch.index) + 1;
        const hunkContent = fileDiffContent.substring(hunkHeaderEndIndex, hunkEndIndex).trim();

        changes.push({
          oldStart,
          newStart,
          oldLines,
          newLines,
          content: hunkContent,
        });
      }

      parsedDiffs.push({
        filePath,
        fileType,
        changes,
        rawContent: fileDiffContent,
        stats: {
          additions,
          deletions,
        },
      });

      currentIndex = nextMatchIndex;
    }

    logger.debug(`Parsed ${parsedDiffs.length} files from diff`);
    return parsedDiffs;
  }

  /**
   * Get file type based on file extension
   */
  private getFileTypeFromPath(filePath: string): string {
    const extension = filePath.split('.').pop()?.toLowerCase() || '';

    // Map common extensions to file types
    const extensionMap: Record<string, string> = {
      js: 'javascript',
      ts: 'typescript',
      jsx: 'jsx',
      tsx: 'tsx',
      css: 'css',
      scss: 'scss',
      html: 'html',
      json: 'json',
      md: 'markdown',
      py: 'python',
      go: 'go',
      java: 'java',
      rb: 'ruby',
      php: 'php',
      swift: 'swift',
      c: 'c',
      cpp: 'cpp',
      h: 'c',
      hpp: 'cpp',
      cs: 'csharp',
      sh: 'shell',
    };

    return extensionMap[extension] || 'plaintext';
  }

  /**
   * Create a comment on a pull request
   * @param repository Repository identifier in format workspace/repo-slug
   * @param pullRequestId Pull request identifier
   * @param content Comment content (supports markdown)
   * @returns Comment response from the API
   */
  async createPullRequestComment(
    repository: string,
    pullRequestId: number,
    content: string,
  ): Promise<BitbucketPullRequestCommentResponse> {
    try {
      logger.info(`Creating comment on pull request ${pullRequestId} in ${repository}`);

      const endpoint = `/repositories/${repository}/pullrequests/${pullRequestId}/comments`;

      const data = {
        content: {
          raw: content,
        },
      };
      const response = await this.httpClient.post<BitbucketPullRequestCommentResponse>(
        endpoint,
        data,
      );

      logger.info(`Comment created successfully on PR #${pullRequestId}`);
      return response;
    } catch (error) {
      logger.error(
        `Error creating pull request comment: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
