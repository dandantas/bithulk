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

export type BitbucketPullRequestCommitsResponse = {
  values: BitbucketPullRequestCommit[];
};
export type BitbucketPullRequestCommit = {
  type: string;
  hash: string;
  date: string;
  author: {
    type: string;
    raw: string;
    user: {
      display_name: string;
      links: {
        self: {
          href: string;
        };
        avatar: {
          href: string;
        };
        html: {
          href: string;
        };
      };
      type: string;
      uuid: string;
      account_id: string;
      nickname: string;
    };
  };
  message: string;
  summary: {
    type: string;
    raw: string;
    markup: string;
    html: string;
  };
  links: {
    self: {
      href: string;
    };
    html: {
      href: string;
    };
    diff: {
      href: string;
    };
    approve: {
      href: string;
    };
    comments: {
      href: string;
    };
    statuses: {
      href: string;
    };
    patch: {
      href: string;
    };
  };
  parents: Array<{
    hash: string;
    links: {
      self: {
        href: string;
      };
      html: {
        href: string;
      };
    };
    type: string;
  }>;
  repository: {
    type: string;
    full_name: string;
    links: {
      self: {
        href: string;
      };
      html: {
        href: string;
      };
      avatar: {
        href: string;
      };
    };
    name: string;
    uuid: string;
  };
};

/**
 * Interface for Bitbucket Pull Request comment responses
 */
export interface BitbucketPullRequestCommentResponse {
  id: number;
  content: {
    raw: string;
    markup: string;
    html: string;
    type: string;
  };
  created_on: string;
  updated_on: string;
  user: {
    uuid: string;
    display_name: string;
    account_id: string;
    links: {
      self: { href: string };
      avatar: { href: string };
      html: { href: string };
    };
  };
  deleted: boolean;
  type: string;
  links: {
    self: { href: string };
    html: { href: string };
  };
  pullrequest: {
    id: number;
    title: string;
    type: string;
    links: {
      self: { href: string };
      html: { href: string };
    };
  };
}
