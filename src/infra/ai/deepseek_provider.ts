import { IAIProvider } from "../../domain/services/ai_provider";

interface DeepSeekResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

export class DeepSeekProvider implements IAIProvider {
  private apiUrl: string;
  private model: string;

  constructor(
    apiUrl: string,
    model: string
  ) {
    this.apiUrl = apiUrl;
    this.model = model;
  }

  async generateText(prompt: string, options: any = {}): Promise<string> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json() as DeepSeekResponse;
      console.log(data);
      return data.response || '';
    } catch (error) {
      console.error('Error calling DeepSeek API:', error);
      throw new Error(`Failed to generate text: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}