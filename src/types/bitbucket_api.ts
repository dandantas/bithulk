/**
 * Types for Bitbucket API responses and requests
 */

export interface BitbucketApiConfig {
  baseUrl: string;
  workspaceId: string;
  accessToken: string;
}

export interface BitbucketDiffOptions {
  repository: string;
  commitHash: string;
  context?: number;
  path?: string;
}

export interface BitbucketDiffResponse {
  diffstat: BitbucketDiffStat;
  diff: string;
}

export interface BitbucketDiffStat {
  status: 'added' | 'modified' | 'removed';
  lines_added: number;
  lines_removed: number;
  old: {
    path: string;
    type: string;
    offset?: number;
    length?: number;
  } | null;
  new: {
    path: string;
    type: string;
    offset?: number;
    length?: number;
  } | null;
}

export interface BitbucketApiErrorResponse {
  type: string;
  error: {
    message: string;
    detail?: string;
  };
}

// Rate limiting information
export interface BitbucketRateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

// Parsed diff structure for easier consumption
export interface ParsedDiff {
  filePath: string;
  fileType: string;
  rawContent: string;
  changes: Array<{
    oldStart: number;
    newStart: number;
    oldLines: number;
    newLines: number;
    content: string;
  }>;
  stats: {
    additions: number;
    deletions: number;
  };
} 