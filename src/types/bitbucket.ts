// Bitbucket webhook common types
export interface BitbucketUser {
  uuid: string;
  display_name: string;
  nickname?: string;
  account_id: string;
  links?: Record<string, Array<{ href: string }>>;
}

export interface BitbucketRepository {
  name: string;
  full_name: string;
  uuid: string;
  links?: Record<string, Array<{ href: string }>>;
  owner: BitbucketUser;
  project?: {
    key: string;
    name: string;
    uuid: string;
    links?: Record<string, Array<{ href: string }>>;
    type?: string;
  };
  workspace?: {
    uuid: string;
    name: string;
    slug: string;
    type?: string;
    links?: Record<string, Array<{ href: string }>>;
  };
  parent?: {
    type?: string;
    full_name: string;
    name: string;
    uuid: string;
    links?: Record<string, Array<{ href: string }>>;
  };
  type?: string;
  is_private?: boolean;
  scm?: string;
}

export interface BitbucketCommit {
  hash: string;
  links?: Record<string, Array<{ href: string }>>;
  author: {
    raw: string;
    user?: BitbucketUser;
  };
  message: string;
  date: string;
  type?: string;
}

// repo:push event types
export interface BitbucketPushEventPayload {
  actor: BitbucketUser;
  repository: BitbucketRepository;
  push: {
    changes: Array<{
      new: {
        name: string;
        target: BitbucketCommit;
      } | null;
      old: {
        name: string;
        target: BitbucketCommit;
      } | null;
      created: boolean;
      forced: boolean;
      closed: boolean;
      truncated: boolean;
      links?: Record<string, Array<{ href: string }>>;
    }>;
  };
}

// pullrequest:created event types
export interface BitbucketPullRequestEventPayload {
  actor: BitbucketUser;
  repository: BitbucketRepository;
  pullrequest: {
    id: number;
    title: string;
    description: string;
    state: string;
    type?: string;
    author: BitbucketUser;
    created_on: string;
    updated_on: string;
    close_source_branch: boolean;
    closed_by: BitbucketUser | null;
    reason: string;
    comment_count: number;
    task_count: number;
    draft: boolean;
    source: {
      branch: {
        name: string;
        links?: Record<string, any>;
        sync_strategies?: string[];
      };
      commit: BitbucketCommit;
      repository: BitbucketRepository;
    };
    destination: {
      branch: {
        name: string;
      };
      commit: BitbucketCommit;
      repository: BitbucketRepository;
    };
    merge_commit: any | null;
    rendered?: {
      title?: {
        type: string;
        raw: string;
        markup: string;
        html: string;
      };
      description?: {
        type: string;
        raw: string;
        markup: string;
        html: string;
      };
    };
    summary?: {
      type: string;
      raw: string;
      markup: string;
      html: string;
    };
    reviewers?: BitbucketUser[];
    participants?: Array<{
      type?: string;
      user: BitbucketUser;
      role: string;
      approved: boolean;
      state: string | null;
      participated_on: string | null;
    }>;
    links?: Record<string, Array<{ href: string }>>;
  };
}

// Event types mapping
export type BitbucketEventPayload = {
  'repo:push': BitbucketPushEventPayload;
  'pullrequest:created': BitbucketPullRequestEventPayload;
  // Add more event types as needed
}

export type BitbucketEventType = keyof BitbucketEventPayload; 