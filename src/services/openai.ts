import OpenAI from 'openai';

import type { Config, LinearIssue } from '@/types';
import { logger } from '@/utils/logger';

export class OpenAIService {
  private readonly client: OpenAI;

  constructor(config: Config) {
    this.client = new OpenAI({
      apiKey: config.openaiApiKey,
    });
  }

  async analyzeDefect(issue: LinearIssue): Promise<string> {
    try {
      const prompt = `
        Analyze this software defect and provide insights:

        Title: ${issue.title}
        Description: ${issue.description ?? 'No description provided'}
        Priority: ${issue.priority}
        Status: ${issue.state?.name}
        Assignee: ${issue.assignee?.name ?? 'Unassigned'}

        Please provide:
        1. Summary of the issue
        2. Potential root causes
        3. Recommended next steps
        4. Estimated complexity
        5. Similar patterns or risks to watch for

        Keep the response concise and actionable.
      `;

      const completion = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content ?? 'Analysis could not be generated.';
    } catch (error) {
      logger.error('OpenAI analysis failed', error);
      return 'Failed to generate AI analysis. Please check your OpenAI configuration.';
    }
  }
}
