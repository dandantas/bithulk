/**
 * Configuration types for the application
 */

// Bitbucket configuration
export interface BitbucketConfig {
  apiUrl?: string;
  accessToken?: string;
  workspaceId?: string;
}

// OpenAI configuration
export interface OpenAIConfig {
  apiKey?: string;
  apiUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// DeepSeek configuration
export interface DeepSeekConfig {
  apiUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// AI provider configuration
export interface AIConfig {
  provider: 'openai' | 'deepseek';
  openai?: OpenAIConfig;
  deepseek?: DeepSeekConfig;
}

/**
 * Event handler configuration with both global and per-event settings
 */
export interface EventHandlerConfig {
  /** 
   * Global setting to enable/disable all handlers
   * If false, all handlers are disabled regardless of individual settings
   */
  enabled: boolean;
  
  /** Handler-specific options */
  handlers: {
    /**
     * Pull request created event handler
     * When a new pull request is created, analyze code and post comments
     */
    pullRequestCreated?: {
      enabled: boolean;
      options?: {
        /** Whether to post a comment on the pull request */
        postComment?: boolean;
        /** Level of detail for the review */
        reviewDepth?: 'basic' | 'detailed' | 'comprehensive';
        /** Maximum time to spend on analysis (seconds) */
        timeLimit?: number;
      };
    };
    
    /**
     * Repo push event handler 
     * When code is pushed directly to a repository
     */
    repoPush?: {
      enabled: boolean;
      options?: {
        /** List of branches to monitor (if empty, all branches) */
        branches?: string[];
        /** Whether to notify on Google Chat */
        notifyChat?: boolean;
      };
    };
  };
}

/**
 * Main application configuration
 */
export interface AppConfig {
  /** Bitbucket integration configuration */
  bitbucket: BitbucketConfig;
  
  /** AI provider configuration */
  ai: AIConfig;
  
  /** Language for prompts and responses */
  language?: string;
  
  /** Event handler configuration */
  events: EventHandlerConfig;
} 