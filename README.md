# Bug Tracker MCP Server

A modern Model Context Protocol (MCP) server for bug tracking integration with Linear and OpenAI, built with TypeScript, rslib, and ESLint.

## 🚀 Features

- ✅ **Create defects** with descriptions, story points, and acceptance criteria
- 👤 **Assign defects** to team members
- 📝 **Update defect** descriptions and details
- 🔄 **Change defect status** (Todo, In Progress, Done, etc.)
- 🤖 **AI-powered defect analysis** using OpenAI GPT-4
- 🔍 **Search and filter** defects
- 👥 **List team members** for assignment
- 🏗️ **Modern tooling** with rslib, TypeScript, and ESLint
- 📦 **Easy distribution** via NPM

## 📦 Installation

### Global Installation (Recommended)
```bash
npm install -g bug-tracker-mcp-server
```

### Local Installation
```bash
npm install bug-tracker-mcp-server
```

## 🔧 Configuration

### 1. Get API Keys

#### Linear API
1. Go to [Linear API Settings](https://linear.app/settings/api)
2. Create a new API key
3. Get your team ID from Linear team settings (URL: `/team/[TEAM_ID]/settings`)

#### OpenAI API
1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new API key

### 2. Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "bug-tracker": {
      "command": "node",
      "args": ["C:/Users/HP/AppData/Roaming/npm/node_modules/bug-tracker-mcp-server/dist/index.js"],
      "env": {
        "LINEAR_API_KEY": "lin_api_xxxxxxxxxx",
        "LINEAR_TEAM_ID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "OPENAI_API_KEY": "sk-xxxxxxxxxx"
      }
    }
  }
}
```

### Alternative: Environment Variables

Create a `.env` file or set system environment variables:

```bash
export LINEAR_API_KEY="lin_api_xxxxxxxxxx"
export LINEAR_TEAM_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
export OPENAI_API_KEY="sk-xxxxxxxxxx"
```

Then use in Claude Desktop config:
```json
{
  "mcpServers": {
    "bug-tracker": {
      "command": "node",
      "args": ["C:/Users/HP/AppData/Roaming/npm/node_modules/bug-tracker-mcp-server/dist/index.js"],
    }
  }
}
```

## 🎯 Usage Examples

Once configured with Claude Desktop, you can use natural language commands:

### Creating Defects
```
User: Create a defect about login page crashes on mobile devices with high priority and 5 story points

Claude: ✅ Defect created successfully!

ID: DEF-045
Title: Login page crashes on mobile devices
Priority: High
URL: https://linear.app/your-team/issue/DEF-045

The defect has been added to Linear with all specified details.
```

### Assigning Defects
```
User: Assign defect DEF-045 to Sarah Johnson

Claude: ✅ Defect DEF-045 assigned to Sarah Johnson (sarah@company.com)
```

### Status Updates
```
User: Change DEF-045 status to In Progress

Claude: ✅ Defect DEF-045 status changed to "In Progress"
```

### AI Analysis
```
User: Analyze defect DEF-045

Claude: 🤖 AI Analysis for Login page crashes on mobile devices

Summary: This appears to be a high-priority issue affecting user authentication flow on mobile browsers.

Potential Root Causes:
- Safari-specific JavaScript compatibility issues
- CSS rendering problems on mobile viewport
- Session handling conflicts with iOS security policies

Recommended Next Steps:
1. Test reproduction on multiple iOS versions
2. Check console errors in Safari developer tools
3. Review authentication token handling
4. Implement mobile-specific error handling

Estimated Complexity: 5 story points seems appropriate for this scope.
```

### Searching Defects
```
User: Show me all high priority defects assigned to Sarah

Claude: 🔍 Search Results:

DEF-045 - Login page crashes on mobile devices
Status: In Progress | Assignee: Sarah Johnson
Priority: High
URL: https://linear.app/your-team/issue/DEF-045
---
```

## 🛠️ Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
# Clone the repository
git clone https://github.com/your-username/bug-tracker-mcp-server.git
cd bug-tracker-mcp-server

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Build the project
npm run build

# Run in development mode
npm run dev

# Run linting
npm run lint

# Type check
npm run type-check
```

### Project Structure
```
src/
├── types/           # TypeScript type definitions
├── services/        # Linear and OpenAI service classes
├── utils/           # Utility functions (config, logger)
└── index.ts         # Main MCP server implementation

dist/                # Built output (generated)
```

### Build Process

The project uses **rslib** for modern bundling:

- **TypeScript compilation** with strict type checking
- **ESM output** for Node.js 18+
- **Declaration files** generation
- **Source maps** for debugging
- **Executable shim** for CLI usage

## 📋 Available Tools

| Tool | Description | Required Parameters |
|------|-------------|-------------------|
| `create_defect` | Create a new defect | `title`, `description` |
| `assign_defect` | Assign defect to user | `defectId`, `assigneeId` |
| `update_defect` | Update defect details | `id` |
| `change_defect_status` | Change defect status | `defectId`, `status` |
| `explain_defect_summary` | AI analysis of defect | `defectId` |
| `list_team_members` | List available team members | None |
| `search_defects` | Search and filter defects | None (all optional) |

## 🔄 CI/CD

### GitHub Actions Workflow

`.github/workflows/ci.yml`
```yaml
name: CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - run: npm ci
    - run: npm run lint:check
    - run: npm run type-check
    - run: npm run build
    - run: npm test

  publish:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js 18
      uses: actions/setup-node@v4
      with:
        node-version: 18
        registry-url: 'https://registry.npmjs.org'
    
    - run: npm ci
    - run: npm run build
    
    - name: Publish to NPM
      run: npm publish
      env:
        NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Release Workflow

`.github/workflows/release.yml`
```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js 18
      uses: actions/setup-node@v4
      with:
        node-version: 18
        registry-url: 'https://registry.npmjs.org'
    
    - run: npm ci
    - run: npm run build
    
    - name: Publish to NPM
      run: npm publish
      env:
        NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
    
    - name: Create GitHub Release
      uses: actions/create-release@v1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        tag_name: ${{ github.ref }}
        release_name: Release ${{ github.ref }}
        draft: false
        prerelease: false
```

## 📚 API Integration

### Linear GraphQL API
- **Issues/Defects:** Create, update, search, assign
- **Team Management:** List members, get team info
- **Status Workflow:** Update issue states

### OpenAI API
- **GPT-4 Integration:** Intelligent defect analysis
- **Prompt Engineering:** Structured analysis output
- **Error Handling:** Graceful fallbacks

## 🚀 Deployment Steps

### 1. Prepare Repository
```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit"

# Create GitHub repository and push
git remote add origin https://github.com/your-username/bug-tracker-mcp-server.git
git push -u origin main
```

### 2. Setup NPM Publishing
```bash
# Login to NPM
npm login

# Set up package scope (optional)
npm init --scope=@your-username

# Test publish (dry run)
npm publish --dry-run

# Publish to NPM
npm publish
```

### 3. Configure GitHub Secrets
In your GitHub repository settings, add these secrets:
- `NPM_TOKEN`: Your NPM automation token
- Any other required secrets for CI/CD

### 4. Tag and Release
```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0

# Or use npm version
npm version patch  # or minor, major
git push --follow-tags
```

## 🔧 Troubleshooting

### Common Issues

1. **Environment Variables Not Found**
   - Ensure all required environment variables are set
   - Check Claude Desktop config syntax

2. **Linear API Errors**
   - Verify API key permissions
   - Confirm team ID is correct
   - Check Linear workspace access

3. **OpenAI API Errors**
   - Verify API key is valid
   - Check account billing/usage limits
   - Ensure GPT-4 access if required

4. **NPM Package Issues**
   - Check Node.js version compatibility (18+)
   - Clear npm cache: `npm cache clean --force`
   - Try global reinstall: `npm uninstall -g @your-username/bug-tracker-mcp-server && npm install -g @your-username/bug-tracker-mcp-server`

### Debug Mode
Set `NODE_ENV=development` for detailed logging:
```json
{
  "mcpServers": {
    "bug-tracker": {
      "command": "npx",
      "args": ["@your-username/bug-tracker-mcp-server"],
      "env": {
        "NODE_ENV": "development",
        "LINEAR_API_KEY": "your_key",
        "LINEAR_TEAM_ID": "your_team_id",
        "OPENAI_API_KEY": "your_openai_key"
      }
    }
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests and linting: `npm run lint && npm run type-check`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Model Context Protocol](https://github.com/modelcontextprotocol) - MCP SDK
- [Linear](https://linear.app) - Issue tracking platform
- [OpenAI](https://openai.com) - AI analysis capabilities
- [rslib](https://github.com/web-infra-dev/rslib) - Modern build tool

## 📞 Support

For support and questions:
- 📧 Email: harha49@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/bug-tracker-mcp-server/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-username/bug-tracker-mcp-server/discussions)