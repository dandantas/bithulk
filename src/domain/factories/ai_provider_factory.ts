import { DeepSeekProvider } from "../../infra/ai/deepseek_provider";
import { OpenAIProvider } from "../../infra/ai/openai_provider";
import { IAIProvider } from "../services/ai_provider";
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

export function createAIProvider(type: 'openai' | 'deepseek'): IAIProvider {
  switch (type) {
    case 'openai':
      // Read OpenAI configuration from environment variables
      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        throw new Error('OPENAI_API_KEY environment variable is required for OpenAI provider');
      }
      
      const openaiApiUrl = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
      const openaiModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';
      
      return new OpenAIProvider(openaiApiKey, openaiApiUrl, openaiModel);
      
    case 'deepseek':
      // Read DeepSeek configuration from environment variables or use defaults
      const deepseekApiUrl = process.env.DEEPSEEK_API_URL || 'http://ollama:11434/api/generate';
      const deepseekModel = process.env.DEEPSEEK_MODEL || 'deepseek-r1:14b';
      
      return new DeepSeekProvider(deepseekApiUrl, deepseekModel);
    
    // TODO: Add local provider implementation
    
    default:
      throw new Error(`Unknown AI provider type: ${type}`);
  }
}