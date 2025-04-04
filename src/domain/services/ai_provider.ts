export interface IAIProvider {
  generateText(prompt: string, options: any): Promise<string>;
}
