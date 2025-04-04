import { logger } from '../../infra/logger/logger';
import { BitbucketPullRequestEventPayload, BitbucketPushEventPayload } from '../../types/bitbucket';
import { BitbucketService } from './bitbucket_service';
import { ParsedDiff } from '../../types/bitbucket_api';
import { IAIProvider } from './ai_provider';

// Helper function to create code analysis prompt
function createCodeAnalysisPrompt(diffs: ParsedDiff[], author: string, repository: string, commitMessage: string): string {
  const fileChanges = diffs.map(diff => {
    return `File: ${diff.filePath}
Type: ${diff.fileType}
Stats: +${diff.stats.additions}, -${diff.stats.deletions}
Changes:
${diff.rawContent}
`;
  }).join('\n---\n');

  return `## Code Analysis Task
  
You are a senior software engineer reviewing code changes for quality and issues.

### Context
- Repository: ${repository}
- Author: ${author}
- Commit message: ${commitMessage}
- Number of files changed: ${diffs.length}

### Changes
${fileChanges}

### Analysis Instructions
Analyze these code changes and provide a concise, focused summary with these sections:
1. **Summary**: 1-2 sentence overview of what changed
2. **Files affected**: Brief list of affected files and what changed
3. **Key improvements**: Any positive patterns or improvements
4. **Potential issues**: Highlight critical problems, type errors, logic issues, security concerns, or performance problems
5. **Suggestions**: Specific, actionable recommendations for improving the code

Keep your analysis direct and focused on the most important aspects. Prioritize critical issues over style preferences.`;
}

export class WebhookService {
  private bitbucketService: BitbucketService;
  private aiProvider: IAIProvider;

  constructor(bitbucketService: BitbucketService, aiProvider: IAIProvider) {
    this.bitbucketService = bitbucketService;
    this.aiProvider = aiProvider;
  }

  /**
   * Process a Bitbucket pullrequest:created event
   * @param payload The webhook payload
   */
  async processPullRequestCreated(payload: BitbucketPullRequestEventPayload): Promise<void> {
    try {
      const { actor, repository, pullrequest } = payload;
      logger.info(`Processing pull request created event from ${actor.display_name} for repository: ${repository.full_name}`);

      const { title, description, state, type, author, created_on, updated_on, close_source_branch, closed_by, reason, comment_count, task_count, draft, source, destination, merge_commit, rendered } = pullrequest;

      logger.info(`Pull request title: ${title}`);
      logger.info(`Pull request description: ${description}`);
      logger.info(`Pull request state: ${state}`);
      logger.info(`Pull request type: ${type}`);

    } catch (error) {
      logger.error(`Error processing pull request created event: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Process a Bitbucket repo:push event
   * @param payload The webhook payload
   */
  async processRepoPush(payload: BitbucketPushEventPayload): Promise<void> {
    try {
      logger.info(`Processing push event for repository: ${payload.repository.full_name}`);

      // Extract relevant information
      const { actor, repository, push } = payload;

      const allDiffs: ParsedDiff[] = [];
      // Process each change in the push
      for (const change of push.changes) {
        if (!change.new || !change.new.target) {
          logger.warn('Change has no new target information, skipping');
          continue;
        }

        const newCommit = change.new.target;
        const targetBranch = change.new.name;

        logger.info(`Target branch: ${targetBranch}`);
        // Check if the target branch is a branch that we want to analyze

        logger.info(`New commit: ${newCommit.hash.substring(0, 7)} by ${actor.display_name}`);
        logger.info(`Commit message: ${newCommit.message}`);

        // Fetch diff from Bitbucket API
        const parsedDiffs = await this.getCommitDiffs(repository.full_name, newCommit.hash);
        logger.debug(`Retrieved ${parsedDiffs.length} diffs`);
        allDiffs.push(...parsedDiffs);
      }

      // Skip if no diffs were found
      if (allDiffs.length === 0) {
        logger.info('No code changes found to analyze');
        return;
      }

      // Generate prompt for AI analysis
      const prompt = createCodeAnalysisPrompt(
        allDiffs,
        actor.display_name,
        repository.full_name,
        push.changes[0].new?.target?.message || 'No commit message'
      );

      // Send to AI for analysis
      logger.info('Sending code changes to AI for analysis');
      const analysisResult = await this.aiProvider.generateText(prompt, {
        temperature: 0.1, // Lower temperature for more focused, deterministic responses
        max_tokens: 1000  // Limit response size
      });

      logger.info('AI analysis completed with size: ' + analysisResult.length);

      // TODO: Send the analysis result to Google Chat
      logger.info('Analysis result should be sent to Google Chat');

      logger.info('Finished processing push event');
    } catch (error) {
      logger.error(`Error processing push event: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Get diffs for a specific commit
   */
  private async getCommitDiffs(repository: string, commitHash: string): Promise<ParsedDiff[]> {
    try {
      const rawDiff = await this.bitbucketService.getCommitDiff({
        repository,
        commitHash,
        context: 3 // Include 3 lines of context around changes
      });

      // Parse the raw diff into a more structured format
      return this.bitbucketService.parseDiff(rawDiff);
    } catch (error) {
      logger.error(`Error getting commit diffs: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
} 