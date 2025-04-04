import type { IAIProvider } from '../../domain/services/ai_provider';

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface OpenAIErrorResponse {
  error?: {
    message: string;
    type?: string;
    code?: string;
  };
}

export class OpenAIProvider implements IAIProvider {
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor(apiKey: string, apiUrl: string, model: string) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }

    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
    this.model = model;
  }

  async generateText(prompt: string, options: any = {}): Promise<string> {
    try {
      const messages = options.messages || [
        {
          role: 'system',
          content: 'You are a helpful assistant specialized in code analysis.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ];

      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: options.temperature !== undefined ? options.temperature : 0.1,
          max_tokens: options.max_tokens || 1000,
          top_p: options.top_p || 1,
          frequency_penalty: options.frequency_penalty || 0,
          presence_penalty: options.presence_penalty || 0,
        }),
      });

      if (!response.ok) {
        let errorMessage = `Status ${response.status}`;
        try {
          const errorData = (await response.json()) as OpenAIErrorResponse;
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch {
          // If parsing JSON fails, try to get text instead
          try {
            errorMessage = await response.text();
          } catch {
            errorMessage = 'Unknown error';
          }
        }

        throw new Error(`OpenAI API error: ${response.status} - ${errorMessage}`);
      }

      const data = (await response.json()) as OpenAIResponse;
      // Extract the content from the first choice
      if (data.choices && data.choices.length > 0 && data.choices[0].message) {
        return data.choices[0].message.content.trim();
      }

      return '';
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw new Error(
        `Failed to generate text: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
