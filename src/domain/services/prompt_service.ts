import { ParsedDiff } from '../../types/bitbucket_api';

/**
 * Interface for prompt creation services
 */
export interface IPromptService {
    createCodePushAnalysisPrompt(
        diffs: ParsedDiff[],
        author: string,
        repository: string,
        commitMessage: string
    ): string;

    createPullRequestAnalysisPrompt(
        diffs: ParsedDiff[],
        author: string,
        repository: string,
        prTitle: string,
        prDescription: string
    ): string;
}

/**
 * Service responsible for creating prompts for different AI analysis scenarios
 */
export class PromptService implements IPromptService {
    /**
     * Creates a prompt for analyzing code push events
     */
    createCodePushAnalysisPrompt(
        diffs: ParsedDiff[],
        author: string,
        repository: string,
        commitMessage: string
    ): string {
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

    /**
     * Creates a prompt for analyzing pull request events
     */
    createPullRequestAnalysisPrompt(
        diffs: ParsedDiff[],
        author: string,
        repository: string,
        prTitle: string,
        prDescription: string
    ): string {
        const fileChanges = diffs.map(diff => {
            return `File: ${diff.filePath}
Type: ${diff.fileType}
Stats: +${diff.stats.additions}, -${diff.stats.deletions}
Changes:
${diff.rawContent}
`;
        }).join('\n---\n');

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
1. **Summary**: Brief overview of what this PR accomplishes
2. **Implementation**: Analysis of how well the implementation addresses the stated goal
3. **Code quality**: Assessment of code readability, structure, and adherence to best practices
4. **Potential issues**: Highlight any bugs, edge cases, or design problems
5. **Testing considerations**: What should be tested before merging
6. **Recommendations**: Specific suggestions for improvement before approval

Be constructive in your feedback and focus on helping the author improve the PR.`;
    }
} 