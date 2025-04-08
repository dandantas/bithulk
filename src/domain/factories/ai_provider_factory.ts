import dotenv from 'dotenv';
import { DeepSeekProvider } from '../../infra/ai/deepseek_provider';
import { OpenAIProvider } from '../../infra/ai/openai_provider';
import type { DeepSeekConfig, OpenAIConfig } from '../../types/config';
import type { IAIProvider } from '../services/ai_provider';

// Ensure environment variables are loaded
dotenv.config();

interface AIProviderOptions {
  openAIConfig?: OpenAIConfig;
  deepSeekConfig?: DeepSeekConfig;
}

export function createAIProvider(
  type: 'openai' | 'deepseek',
  options?: AIProviderOptions
): IAIProvider {
  switch (type) {
    case 'openai': {
      // Use provided config or fall back to environment variables
      const config = options?.openAIConfig || {};
      
      // Read OpenAI configuration from environment variables
      const openaiApiKey = config.apiKey || process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        throw new Error('OPENAI_API_KEY environment variable is required for OpenAI provider');
      }

      const openaiApiUrl = config.apiUrl || 
        process.env.OPENAI_API_URL || 
        'https://api.openai.com/v1/chat/completions';
        
      const openaiModel = config.model || 
        process.env.OPENAI_MODEL || 
        'gpt-4o-mini';

      return new OpenAIProvider(openaiApiKey, openaiApiUrl, openaiModel);
    }

    case 'deepseek': {
      // Use provided config or fall back to environment variables
      const config = options?.deepSeekConfig || {};
      
      // Read DeepSeek configuration from environment variables or use defaults
      const deepseekApiUrl = config.apiUrl || 
        process.env.DEEPSEEK_API_URL || 
        'http://ollama:11434/api/generate';
        
      const deepseekModel = config.model || 
        process.env.DEEPSEEK_MODEL || 
        'deepseek-r1:14b';

      return new DeepSeekProvider(deepseekApiUrl, deepseekModel);
    }

    // TODO: Add local provider implementation

    default:
      throw new Error(`Unknown AI provider type: ${type}`);
  }
}
