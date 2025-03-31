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
  };
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

// Event types mapping
export type BitbucketEventPayload = {
  'repo:push': BitbucketPushEventPayload;
  // Add more event types as needed
}

export type BitbucketEventType = keyof BitbucketEventPayload; 