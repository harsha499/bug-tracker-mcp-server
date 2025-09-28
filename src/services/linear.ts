/* eslint-disable no-console */
import axios, { AxiosResponse } from 'axios';

import type { Config, LinearIssue, TeamMember, UpdateDefectData } from '../types';

import { logger } from '@/utils/logger';

export class LinearService {
  private readonly apiKey: string;
  private readonly teamId: string;
  private readonly baseURL = 'https://api.linear.app/graphql';

  constructor(config: Config) {
    this.apiKey = config.linearApiKey;
    this.teamId = config.linearTeamId;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async graphQLRequest(query: string, variables?: Record<string, unknown>): Promise<any> {
    try {
      const response: AxiosResponse = await axios.post(
        this.baseURL,
        {
          query,
          variables,
        },
        {
          headers: {
            Authorization: this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.errors) {
        throw new Error(`Linear API Error: ${JSON.stringify(response.data.errors)}`);
      }
      return response.data.data;
      // eslint-disable-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`Linear GraphQL request failed: ${JSON.stringify(error.response.data)}`);
      throw error;
    }
  }

  async createIssue(issueData: {
    title?: string | undefined;
    description?: string | undefined;
    priority?: number | undefined;
    assigneeId?: string | undefined;
  }): Promise<LinearIssue> {
    const mutation = `
      mutation CreateIssue($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          success
          issue {
            id
            identifier
            title
            description
            url
            priority
            state {
              id
              name
            }
            assignee {
              id
              name
              email
            }
          }
        }
      }
    `;

    const variables = {
      input: {
        teamId: this.teamId,
        title: issueData.title,
        description: issueData.description,
        priority: issueData.priority ?? 3,
        ...(issueData.assigneeId && { assigneeId: issueData.assigneeId }),
      },
    };

    const data = await this.graphQLRequest(mutation, variables);
    return data.issueCreate.issue as LinearIssue;
  }

  async updateIssue(
    issueId: string | undefined,
    updateData: UpdateDefectData
  ): Promise<LinearIssue> {
    const mutation = `
      mutation IssueUpdate($id: String!, $input: IssueUpdateInput!) {
  issueUpdate(id: $id, input: $input) {
    success
    issue {
      id
      identifier
      title
      description
      url
      priority
      state {
        id
        name
      }
      assignee {
        id
        name
        email
      }
    }
  }
}
    `;

    const variables = {
      id: issueId,
      input: {
        ...updateData,
      },
    };

    const data = await this.graphQLRequest(mutation, variables);
    return data.issueUpdate.issue as LinearIssue;
  }

  async getIssue(issueId: string): Promise<LinearIssue> {
    const query = `
      query GetIssue($id: String!) {
        issue(id: $id) {
          id
          identifier
          title
          description
          url
          priority
          state {
            id
            name
          }
          assignee {
            id
            name
            email
          }
          comments {
            nodes {
              body
              createdAt
            }
          }
        }
      }
    `;

    const data = await this.graphQLRequest(query, { id: issueId });
    return data.issue as LinearIssue;
  }

  async getTeamMembers(): Promise<TeamMember[]> {
    const query = `
      query GetTeamMembers($teamId: String!) {
        team(id: $teamId) {
          members {
            nodes {
              id
              name
              email
              active
            }
          }
        }
      }
    `;

    const data = await this.graphQLRequest(query, { teamId: this.teamId });
    return data.team.members.nodes.filter((member: TeamMember) => member.active);
  }

  async searchIssues(filter: {
    query?: string | undefined;
    status?: string | undefined;
    assignee?: string | undefined;
  }): Promise<LinearIssue[]> {
    const searchQuery = `
      query SearchIssues($filter: IssueFilter) {
        issues(filter: $filter, first: 10) {
          nodes {
            id
            identifier
            title
            description
            url
            priority
            state {
              id
              name
            }
            assignee {
              id
              name
              email
            }
          }
        }
      }
    `;

    const filterObj: Record<string, unknown> = { team: { id: { eq: this.teamId } } };

    if (filter.query) {
      filterObj.title = { containsIgnoreCase: filter.query };
    }
    if (filter.status) {
      filterObj.state = { name: { containsIgnoreCase: filter.status } };
    }
    if (filter.assignee) {
      filterObj.assignee = { name: { containsIgnoreCase: filter.assignee } };
    }

    const data = await this.graphQLRequest(searchQuery, { filter: filterObj });
    return data.issues.nodes as LinearIssue[];
  }

  mapPriority(priority: string): number {
    const mapping: Record<string, number> = {
      Low: 4,
      Medium: 3,
      High: 2,
      Urgent: 1,
    };
    return mapping[priority] ?? 3;
  }

  async getWorkflowStates(): Promise<{ id: string; name: string }[]> {
    const query = `
      query {
  workflowStates {
    nodes {
      id
      name
    }
  }
}
    `;

    const data = await this.graphQLRequest(query, { teamId: this.teamId });
    return data.workflowStates.nodes as { id: string; name: string }[];
  }
}
