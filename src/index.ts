import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

import { LinearService } from '@/services/linear';
import { OpenAIService } from '@/services/openai';
import type { DefectData, LinearIssue, UpdateDefectData } from '@/types';
import { getConfig } from '@/utils/config';
import { logger } from '@/utils/logger';

class BugTrackerMCPServer {
  private readonly server: Server;
  private readonly linearService: LinearService;
  private readonly openaiService: OpenAIService;

  constructor() {
    const config = getConfig();

    this.server = new Server({
      name: 'bug-tracker-mcp-server',
      version: '1.0.0',
      capabilities: {
        tools: {},
      },
    });

    this.linearService = new LinearService(config);
    this.openaiService = new OpenAIService(config);

    this.setupToolHandlers();
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'create_defect',
            description: 'Create a new defect/bug in the tracker',
            inputSchema: {
              type: 'object',
              properties: {
                title: { type: 'string', description: 'Defect title' },
                description: { type: 'string', description: 'Detailed description' },
                storyPoints: { type: 'number', description: 'Estimation in story points' },
                acceptanceCriteria: { type: 'string', description: 'Acceptance criteria' },
                assigneeId: { type: 'string', description: 'User ID to assign the defect' },
                priority: {
                  type: 'string',
                  enum: ['Low', 'Medium', 'High', 'Urgent'],
                  description: 'Priority level',
                },
              },
              required: ['title', 'description'],
            },
          },
          {
            name: 'assign_defect',
            description: 'Assign defect to a user',
            inputSchema: {
              type: 'object',
              properties: {
                defectId: { type: 'string', description: 'Defect ID' },
                assigneeId: { type: 'string', description: 'User ID to assign' },
              },
              required: ['defectId', 'assigneeId'],
            },
          },
          {
            name: 'update_defect',
            description: 'Update defect description or other fields',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Defect ID' },
                title: { type: 'string', description: 'New title' },
                description: { type: 'string', description: 'New description' },
                storyPoints: { type: 'number', description: 'Updated story points' },
                acceptanceCriteria: { type: 'string', description: 'Updated acceptance criteria' },
              },
              required: ['id'],
            },
          },
          {
            name: 'change_defect_status',
            description: 'Change the status of a defect',
            inputSchema: {
              type: 'object',
              properties: {
                defectId: { type: 'string', description: 'Defect ID' },
                status: {
                  type: 'string',
                  description: 'New status (Todo, In Progress, Done, etc.)',
                },
              },
              required: ['defectId', 'status'],
            },
          },
          {
            name: 'explain_defect_summary',
            description: 'Get AI explanation and analysis of a defect',
            inputSchema: {
              type: 'object',
              properties: {
                defectId: { type: 'string', description: 'Defect ID to analyze' },
              },
              required: ['defectId'],
            },
          },
          {
            name: 'list_team_members',
            description: 'Get list of team members for assignment',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'search_defects',
            description: 'Search and filter defects',
            inputSchema: {
              type: 'object',
              properties: {
                query: { type: 'string', description: 'Search query' },
                status: { type: 'string', description: 'Filter by status' },
                assignee: { type: 'string', description: 'Filter by assignee' },
              },
            },
          },
        ] as Tool[],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async request => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'create_defect':
            return await this.createDefect(args as unknown as DefectData);
          case 'assign_defect':
            return await this.assignDefect(args!.defectId as string, args!.assigneeId as string);
          case 'update_defect':
            return await this.updateDefect(args! as unknown as UpdateDefectData);
          case 'change_defect_status':
            return await this.changeDefectStatus(args!.defectId as string, args!.status as string);
          case 'explain_defect_summary':
            return await this.explainDefectSummary(args!.defectId as string);
          case 'list_team_members':
            return await this.listTeamMembers();
          case 'search_defects':
            return await this.searchDefects(
              args!.query as string,
              args!.status as string,
              args!.assignee as string
            );
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        logger.error(`Tool execution failed: ${name}`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    });
  }

  private async createDefect(defectData: DefectData): Promise<CallToolResult> {
    const description = this.formatDefectDescription(defectData);

    const issue = await this.linearService.createIssue({
      title: defectData.title,
      description,
      priority: defectData.priority ? this.linearService.mapPriority(defectData.priority) : 3,
      assigneeId: defectData.assigneeId,
    });

    return {
      content: [
        {
          type: 'text',
          text: `✅ Defect created successfully!

**ID:** ${issue.identifier}
**Title:** ${issue.title}
**URL:** ${issue.url}

The defect has been added to Linear with all specified details.`,
        },
      ],
      isError: false,
    };
  }

  private async assignDefect(defectId: string, assigneeId: string): Promise<CallToolResult> {
    const issue = await this.linearService.updateIssue(defectId, { assignee: { id: assigneeId } });

    return {
      content: [
        {
          type: 'text',
          text: `✅ Defect ${issue.identifier} assigned to ${issue.assignee?.name ?? 'Unknown'} (${issue.assignee?.email ?? 'No email'})`,
        },
      ],
      isError: false,
    };
  }

  private async updateDefect(updateData: UpdateDefectData): Promise<CallToolResult> {
    const updateFields: LinearIssue = {};

    if (updateData.title) {
      updateFields.title = updateData.title;
    }

    if (updateData!.description ?? updateData!.storyPoints ?? updateData!.acceptanceCriteria) {
      updateFields.description = this.formatDefectDescription({
        title: updateData.title ?? '',
        description: updateData.description ?? '',
        storyPoints: updateData.storyPoints,
        acceptanceCriteria: updateData.acceptanceCriteria,
      });
    }

    if (updateData.assigneeId) {
      updateFields.assignee = {};
      updateFields.assignee!.id = updateData.assigneeId;
    }

    const issue = await this.linearService.updateIssue(updateData.id, updateFields);

    return {
      content: [
        {
          type: 'text',
          text: `✅ Defect ${issue.identifier} updated successfully!`,
        },
      ],
      isError: false,
    };
  }

  private async changeDefectStatus(defectId: string, status: string): Promise<CallToolResult> {
    // For simplicity, we'll assume status mapping is handled by Linear
    // In a real implementation, you'd need to fetch available states and map them
    const issue = await this.linearService.updateIssue(defectId, {
      // This would need proper state ID mapping in a real implementation
      state: { name: status },
    });

    return {
      content: [
        {
          type: 'text',
          text: `✅ Defect ${issue.identifier} status changed to "${status}"`,
        },
      ],
      isError: false,
    };
  }

  private async explainDefectSummary(defectId: string): Promise<CallToolResult> {
    const issue = await this.linearService.getIssue(defectId);
    const analysis = await this.openaiService.analyzeDefect(issue);

    return {
      content: [
        {
          type: 'text',
          text: `🤖 **AI Analysis for Defect: ${issue.title}**

${analysis}

---
*Analysis generated using OpenAI GPT-4*`,
        },
      ],
      isError: false,
    };
  }
  private async listTeamMembers(): Promise<CallToolResult> {
    const members = await this.linearService.getTeamMembers();

    return {
      content: [
        {
          type: 'text',
          text: `👥 **Team Members Available for Assignment:**

${members.map(m => `• **${m.name}** (${m.email}) - ID: ${m.id}`).join('\n')}

Use the member ID when assigning defects.`,
        },
      ],
      isError: false,
    };
  }

  private async searchDefects(
    query?: string,
    status?: string,
    assignee?: string
  ): Promise<CallToolResult> {
    const issues = await this.linearService.searchIssues({ query, status, assignee });

    return {
      content: [
        {
          type: 'text',
          text: `🔍 **Search Results:**

${issues
  .map(
    issue => `
**${issue.identifier}** - ${issue.title}
Status: ${issue.state?.name} | Assignee: ${issue.assignee?.name ?? 'Unassigned'}
Priority: ${issue.priority}
URL: ${issue.url}
---`
  )
  .join('\n')}`,
        },
      ],
      isError: false,
    };
  }

  private formatDefectDescription(defectData: DefectData): string {
    let description = defectData.description ?? '';

    if (defectData.storyPoints ?? defectData.acceptanceCriteria) {
      description += '\n\n';

      if (defectData.storyPoints) {
        description += `**Story Points:** ${defectData.storyPoints}\n\n`;
      }

      if (defectData.acceptanceCriteria) {
        description += `**Acceptance Criteria:**\n${defectData.acceptanceCriteria}`;
      }
    }

    return description;
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.info('Bug Tracker MCP Server started successfully');
  }
}

// Start the server
const server = new BugTrackerMCPServer();
server.start().catch(error => {
  logger.error('Failed to start MCP server', error);
  process.exit(1);
});
