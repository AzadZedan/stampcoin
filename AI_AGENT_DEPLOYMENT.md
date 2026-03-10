# AI Agent Expert Deployment Guide

# نشر وكيل الخبير الاصطناعي

## Overview / نظرة عامة

This guide explains how to deploy and integrate the AI Agent Expert system with the Stampcoin Platform.

## Prerequisites / المتطلبات

- Node.js 18+
- pnpm or npm
- Stampcoin Platform repository

## Project Structure / هيكل المشروع

```
src/ai-agent-expert/
├── index.js      # Express server with agent API endpoints
├── utils.js      # Code analysis, security & performance utilities
├── config.json   # Agent configuration
└── README.md     # Arabic documentation
```

## Running the Agent / تشغيل الوكيل

```bash
# Start the AI agent server (runs on port 3001 by default)
node src/ai-agent-expert/index.js
```

## API Endpoints / نقاط النهاية

| Method | Path                          | Description                  |
| ------ | ----------------------------- | ---------------------------- |
| GET    | `/agent/status`               | Get agent status             |
| POST   | `/agent/activate`             | Activate the agent           |
| POST   | `/agent/deactivate`           | Deactivate the agent         |
| POST   | `/agent/analyze-code`         | Analyze code quality         |
| POST   | `/agent/fix-issues`           | Apply issue fixes            |
| POST   | `/agent/organize-project`     | Reorganize project structure |
| POST   | `/agent/optimize-performance` | Optimize performance         |
| POST   | `/agent/audit-security`       | Run security audit           |
| POST   | `/agent/generate-docs`        | Generate documentation       |
| POST   | `/agent/create-tests`         | Create test files            |
| GET    | `/agent/history`              | View completed task history  |

## Deployment on Render / النشر على Render

1. Login to [render.com](https://render.com)
2. Create a new **Web Service** from your GitHub repo
3. Set the start command to: `node src/ai-agent-expert/index.js`
4. Add environment variables:
   ```
   NODE_ENV=production
   PORT=3001
   ```

## Environment Variables / المتغيرات البيئية

| Variable   | Default       | Description       |
| ---------- | ------------- | ----------------- |
| `PORT`     | `3001`        | Agent server port |
| `NODE_ENV` | `development` | Environment mode  |

## Configuration / الإعداد

Edit `src/ai-agent-expert/config.json` to customize:

- `settings.testCoverageTarget` — target test coverage percentage
- `settings.codeQualityThreshold` — minimum code quality score
- `settings.securityScanFrequency` — how often to run security scans
- `integrations.github.autoReview` — enable automated PR reviews

## See Also / انظر أيضاً

- [README.md](README.md) — Main platform documentation
- [SECURITY.md](SECURITY.md) — Security policy
- [CONTRIBUTING.md](CONTRIBUTING.md) — Contribution guidelines
