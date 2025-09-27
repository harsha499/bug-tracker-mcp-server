import dotenv from 'dotenv';

import { Config } from '../types';

dotenv.config();

export const getConfig = (): Config => {
  const linearApiKey = process.env.LINEAR_API_KEY;
  const linearTeamId = process.env.LINEAR_TEAM_ID;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!linearApiKey || !linearTeamId || !openaiApiKey) {
    throw new Error(
      'Missing required environment variables. Please set LINEAR_API_KEY, LINEAR_TEAM_ID, and OPENAI_API_KEY'
    );
  }

  return {
    linearApiKey,
    linearTeamId,
    openaiApiKey,
  };
};
