import type { ParsedDiff } from '../../types/bitbucket_api';

/**
 * Options for PR analysis prompt
 */
export interface PRAnalysisOptions {
  reviewDepth?: 'basic' | 'detailed' | 'comprehensive';
}

/**
 * Interface for prompt creation services
 */
export interface IPromptService {
  createCodePushAnalysisPrompt(
    diffs: ParsedDiff[],
    author: string,
    repository: string,
    commitMessage: string,
  ): string;

  createPullRequestAnalysisPrompt(
    diffs: ParsedDiff[],
    author: string,
    repository: string,
    prTitle: string,
    prDescription: string,
    options?: PRAnalysisOptions,
  ): string;
}

/**
 * Service responsible for creating prompts for different AI analysis scenarios
 */
export class PromptService implements IPromptService {
  constructor(private readonly mainLanguage: string) {}

  /**
   * Creates a prompt for analyzing code push events
   */
  createCodePushAnalysisPrompt(
    diffs: ParsedDiff[],
    author: string,
    repository: string,
    commitMessage: string,
  ): string {
    const fileChanges = diffs
      .map((diff) => {
        return `File: ${diff.filePath}
Type: ${diff.fileType}
Stats: +${diff.stats.additions}, -${diff.stats.deletions}
Changes:
${diff.rawContent}
`;
      })
      .join('\n---\n');

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

- Keep your analysis direct and focused on the most important aspects. Prioritize critical issues over style preferences.
- You must write your analysis in ${this.mainLanguage}.
`;
  }

  /**
   * Creates a prompt for analyzing pull request events
   */
  createPullRequestAnalysisPrompt(
    diffs: ParsedDiff[],
    author: string,
    repository: string,
    prTitle: string,
    prDescription: string,
    options?: PRAnalysisOptions,
  ): string {
    const fileChanges = diffs
      .map((diff) => {
        return `File: ${diff.filePath}
Type: ${diff.fileType}
Stats: +${diff.stats.additions}, -${diff.stats.deletions}
Changes:
${diff.rawContent}
`;
      })
      .join('\n---\n');

    // Adjust review depth based on options
    const depth = options?.reviewDepth || 'detailed';
    let depthInstructions = '';
    
    switch (depth) {
      case 'basic':
        depthInstructions = 'Focus only on critical issues. Keep your review brief and to the point.';
        break;
      case 'comprehensive':
        depthInstructions = 'Provide a comprehensive, detailed review. Consider edge cases, performance implications, and potential future issues.';
        break;
      default:
        depthInstructions = 'Provide a balanced review with attention to important details while staying concise.';
        break;
    }

    return `## Pull Request Review Task
    
You are a senior software engineer reviewing a pull request.

### Pull Request Details
- Repository: ${repository}
- Author: ${author}
- Title: ${prTitle}
- Description: ${prDescription}
- Number of files changed: ${diffs.length}

### Changes
${fileChanges}

### Review Instructions
Review this pull request and provide detailed feedback with these sections:
1. **Summary**: Brief overview of what this PR accomplishes, with most important changes highlighted (maximum 2 sentences)
2. **Implementation**: Analysis of how well the implementation addresses the stated goal
3. **Code quality**: Assessment of code readability, structure, and adherence to best practices
4. **Potential issues**: Highlight any bugs, edge cases, or design problems
5. **Testing considerations**: What should be tested before merging
6. **Recommendations**: Specific suggestions for improvement before approval

- ${depthInstructions}
- Be constructive in your feedback and focus on helping the author improve the PR.
- You must write your analysis in ${this.mainLanguage}.`;
  }
}
