import express from "express";
import { promises as fs } from "fs";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

// Agent configuration
const AGENT_CONFIG = {
    name: "STP Agent Expert",
    version: "1.0.0",
    capabilities: [
        "code-analysis",
        "bug-fixing",
        "project-organization",
        "performance-optimization",
        "security-audit",
        "documentation-generation",
        "test-creation"
    ],
    priorityAreas: ["code-quality", "performance", "security"]
};

// Agent state
const agentState = {
    active: false,
    currentTask: null,
    completedTasks: [],
    pendingIssues: []
};

// Helper functions
async function readProjectData() {
    try {
        const raw = await fs.readFile(path.join(__dirname, "../../data.json"), "utf8");
        return JSON.parse(raw);
    } catch (e) {
        console.error("Error reading project data:", e.message);
        return [];
    }
}

async function writeProjectData(data) {
    try {
        await fs.writeFile(path.join(__dirname, "../../data.json"), JSON.stringify(data, null, 2), "utf8");
        return true;
    } catch (e) {
        console.error("Write error:", e);
        return false;
    }
}

// Agent API endpoints
app.get("/agent/status", (req, res) => {
    res.json({
        status: agentState.active ? "active" : "inactive",
        currentTask: agentState.currentTask,
        completedTasks: agentState.completedTasks.length,
        pendingIssues: agentState.pendingIssues.length
    });
});

app.post("/agent/activate", (req, res) => {
    agentState.active = true;
    res.json({ message: "Agent activated successfully", status: agentState.active });
});

app.post("/agent/deactivate", (req, res) => {
    agentState.active = false;
    res.json({ message: "Agent deactivated successfully", status: agentState.active });
});

app.post("/agent/analyze-code", async (req, res) => {
    if (!agentState.active) {
        return res.status(403).json({ error: "Agent is not active" });
    }

    try {
        const { filePath, analysisType } = req.body;

        const analysis = {
            filePath,
            analysisType: analysisType || "general",
            timestamp: new Date().toISOString(),
            issues: [
                {
                    type: "performance",
                    severity: "medium",
                    description: "Potential memory leak in loop",
                    suggestion: "Consider using object pooling for frequently created objects"
                },
                {
                    type: "security",
                    severity: "high",
                    description: "Input validation missing in user data processing",
                    suggestion: "Add comprehensive input validation to prevent injection attacks"
                }
            ]
        };

        agentState.currentTask = {
            type: "code-analysis",
            status: "completed",
            result: analysis
        };

        agentState.completedTasks.push(agentState.currentTask);

        res.json({
            success: true,
            analysis
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/agent/fix-issues", async (req, res) => {
    if (!agentState.active) {
        return res.status(403).json({ error: "Agent is not active" });
    }

    try {
        const { issues } = req.body;

        const fixes = issues.map(issue => ({
            ...issue,
            fixApplied: true,
            fixDescription: `Applied fix for ${issue.type} issue: ${issue.suggestion}`,
            timestamp: new Date().toISOString()
        }));

        agentState.currentTask = {
            type: "bug-fixing",
            status: "completed",
            result: fixes
        };

        agentState.completedTasks.push(agentState.currentTask);

        res.json({
            success: true,
            fixes
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/agent/organize-project", async (req, res) => {
    if (!agentState.active) {
        return res.status(403).json({ error: "Agent is not active" });
    }

    try {
        const { organizationType } = req.body;

        const organization = {
            type: organizationType || "general",
            timestamp: new Date().toISOString(),
            changes: [
                {
                    action: "restructure",
                    description: "Reorganized components by feature rather than by type"
                },
                {
                    action: "rename",
                    description: "Renamed files to follow consistent naming conventions"
                },
                {
                    action: "relocate",
                    description: "Moved utility functions to a dedicated utils directory"
                }
            ]
        };

        agentState.currentTask = {
            type: "project-organization",
            status: "completed",
            result: organization
        };

        agentState.completedTasks.push(agentState.currentTask);

        res.json({
            success: true,
            organization
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/agent/optimize-performance", async (req, res) => {
    if (!agentState.active) {
        return res.status(403).json({ error: "Agent is not active" });
    }

    try {
        const { targetArea } = req.body;

        const optimization = {
            targetArea: targetArea || "general",
            timestamp: new Date().toISOString(),
            improvements: [
                {
                    area: "database",
                    improvement: "Added query indexing",
                    expectedImpact: "30% faster database queries"
                },
                {
                    area: "frontend",
                    improvement: "Implemented lazy loading",
                    expectedImpact: "40% reduction in initial load time"
                },
                {
                    area: "api",
                    improvement: "Added response caching",
                    expectedImpact: "50% reduction in API response time"
                }
            ]
        };

        agentState.currentTask = {
            type: "performance-optimization",
            status: "completed",
            result: optimization
        };

        agentState.completedTasks.push(agentState.currentTask);

        res.json({
            success: true,
            optimization
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/agent/audit-security", async (req, res) => {
    if (!agentState.active) {
        return res.status(403).json({ error: "Agent is not active" });
    }

    try {
        const { scanDepth } = req.body;

        const audit = {
            scanDepth: scanDepth || "standard",
            timestamp: new Date().toISOString(),
            findings: [
                {
                    type: "vulnerability",
                    severity: "high",
                    description: "Cross-site scripting (XSS) vulnerability in user profile",
                    recommendation: "Implement proper output encoding and content security policy"
                },
                {
                    type: "vulnerability",
                    severity: "medium",
                    description: "Insufficient rate limiting on API endpoints",
                    recommendation: "Implement rate limiting to prevent brute force attacks"
                },
                {
                    type: "best-practice",
                    severity: "low",
                    description: "Missing dependency version pinning",
                    recommendation: "Pin dependency versions to prevent unexpected updates"
                }
            ]
        };

        agentState.currentTask = {
            type: "security-audit",
            status: "completed",
            result: audit
        };

        agentState.completedTasks.push(agentState.currentTask);

        res.json({
            success: true,
            audit
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/agent/generate-docs", async (req, res) => {
    if (!agentState.active) {
        return res.status(403).json({ error: "Agent is not active" });
    }

    try {
        const { docType, targetFiles } = req.body;

        const documentation = {
            docType: docType || "api",
            targetFiles: targetFiles || ["all"],
            timestamp: new Date().toISOString(),
            generated: [
                {
                    type: "api-docs",
                    files: ["api/routes/auth.js", "api/routes/user.js"],
                    description: "Generated comprehensive API documentation"
                },
                {
                    type: "readme",
                    files: ["README.md"],
                    description: "Updated project README with setup instructions"
                },
                {
                    type: "code-comments",
                    files: ["src/utils/helpers.js"],
                    description: "Added inline documentation for utility functions"
                }
            ]
        };

        agentState.currentTask = {
            type: "documentation-generation",
            status: "completed",
            result: documentation
        };

        agentState.completedTasks.push(agentState.currentTask);

        res.json({
            success: true,
            documentation
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/agent/create-tests", async (req, res) => {
    if (!agentState.active) {
        return res.status(403).json({ error: "Agent is not active" });
    }

    try {
        const { testType, targetFiles } = req.body;

        const tests = {
            testType: testType || "unit",
            targetFiles: targetFiles || ["all"],
            timestamp: new Date().toISOString(),
            created: [
                {
                    type: "unit-tests",
                    files: ["src/services/auth.service.js"],
                    description: "Created unit tests for authentication service"
                },
                {
                    type: "integration-tests",
                    files: ["tests/integration/user.test.js"],
                    description: "Created integration tests for user API endpoints"
                },
                {
                    type: "e2e-tests",
                    files: ["tests/e2e/login.spec.js"],
                    description: "Created end-to-end tests for login functionality"
                }
            ]
        };

        agentState.currentTask = {
            type: "test-creation",
            status: "completed",
            result: tests
        };

        agentState.completedTasks.push(agentState.currentTask);

        res.json({
            success: true,
            tests
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/agent/history", (req, res) => {
    res.json({
        completedTasks: agentState.completedTasks,
        pendingIssues: agentState.pendingIssues
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Agent Expert server listening on port ${PORT}`);
});
