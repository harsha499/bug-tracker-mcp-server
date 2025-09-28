export interface DefectData {
  title?: string | undefined;
  description?: string | undefined;
  storyPoints?: number | undefined;
  acceptanceCriteria?: string | undefined;
  assigneeId?: string | undefined;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent' | undefined;
}

export interface UpdateDefectData {
  id?: string;
  title?: string;
  description?: string;
  storyPoints?: number;
  acceptanceCriteria?: string;
  status?: string;
  assigneeId?: string;
  stateId?: string;
}

export interface LinearIssue {
  id?: string;
  identifier?: string;
  title?: string;
  description?: string;
  url?: string;
  priority?: number;
  state?: {
    id?: string;
    name?: string;
  };
  assignee?: {
    id?: string;
    name?: string;
    email?: string;
  };
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  active: boolean;
}

export interface Config {
  linearApiKey: string;
  linearTeamId: string;
  openaiApiKey: string;
}
