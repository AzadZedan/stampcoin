import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";

const AGENT_NAME = "STP Agent Expert";
const AGENT_VERSION = "1.0.0";
const AGENT_DESCRIPTION =
  "AI-powered agent for Stampcoin Platform project management and optimization";

const AGENT_CAPABILITIES = [
  "code-analysis",
  "bug-fixing",
  "project-organization",
  "performance-optimization",
  "security-audit",
  "documentation-generation",
  "test-creation",
] as const;

const DEFAULT_SETTINGS = {
  autoAnalysis: true,
  securityScanFrequency: "daily",
  performanceMonitoring: true,
  documentationAutoUpdate: false,
  testCoverageTarget: 80,
  codeQualityThreshold: 85,
};

const DEFAULT_PRIORITIES = {
  high: ["security", "critical-bugs"],
  medium: ["performance", "code-quality", "documentation"],
  low: ["refactoring", "optimization"],
};

const DEFAULT_INTEGRATIONS = {
  github: {
    enabled: true,
    webhooks: ["push", "pull_request"],
    autoReview: true,
  },
  slack: {
    enabled: false,
    notifications: ["critical", "high"],
  },
  email: {
    enabled: false,
    recipients: ["dev-team@example.com"],
  },
};

const MAX_SUMMARY_LENGTH = 120;

// In-memory agent state
let agentActive = false;
let agentSettings = structuredClone(DEFAULT_SETTINGS);
let agentPriorities = structuredClone(DEFAULT_PRIORITIES);
let agentIntegrations = structuredClone(DEFAULT_INTEGRATIONS);

async function runAgentTask(
  capability: (typeof AGENT_CAPABILITIES)[number],
  prompt: string
): Promise<{ summary: string; details: string }> {
  const systemPrompt = `You are the ${AGENT_NAME} (v${AGENT_VERSION}), an AI assistant specialized in software project management and optimization for the Stampcoin Platform — a full-stack digital stamp NFT marketplace built with React 19, Express, tRPC, MySQL/Drizzle ORM, and Stripe. Your capability in this task is: ${capability}.`;

  const result = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    maxTokens: 1024,
  });

  const content = result.choices[0]?.message?.content ?? "";
  const text = typeof content === "string" ? content : JSON.stringify(content);

  // Split into a brief summary (first sentence/line) and full details
  const lines = text.trim().split("\n");
  const summary = lines[0] ?? text.slice(0, MAX_SUMMARY_LENGTH);
  const details = text;

  return { summary, details };
}

export const agentRouter = router({
  /**
   * GET /agent/status
   * Returns the current status and configuration of the STP Agent.
   */
  status: publicProcedure.query(() => ({
    name: AGENT_NAME,
    version: AGENT_VERSION,
    description: AGENT_DESCRIPTION,
    active: agentActive,
    capabilities: AGENT_CAPABILITIES,
    settings: agentSettings,
    priorities: agentPriorities,
    integrations: agentIntegrations,
  })),

  /**
   * POST /agent/activate
   * Activates the STP Agent (admin only).
   */
  activate: adminProcedure.mutation(() => {
    agentActive = true;
    return { success: true, active: agentActive } as const;
  }),

  /**
   * POST /agent/deactivate
   * Deactivates the STP Agent (admin only).
   */
  deactivate: adminProcedure.mutation(() => {
    agentActive = false;
    return { success: true, active: agentActive } as const;
  }),

  /**
   * POST /agent/analyze-code
   * Performs an AI-powered code analysis on the given target (admin only).
   */
  analyzeCode: adminProcedure
    .input(
      z.object({
        target: z
          .string()
          .optional()
          .describe(
            "File path, module name, or area to analyze. Defaults to the full project."
          ),
      })
    )
    .mutation(async ({ input }) => {
      const target = input.target ?? "the entire Stampcoin Platform codebase";
      const { summary, details } = await runAgentTask(
        "code-analysis",
        `Analyze ${target} for code quality issues, anti-patterns, and improvement opportunities. Provide a concise summary followed by a detailed breakdown grouped by severity (high, medium, low).`
      );
      return {
        success: true,
        capability: "code-analysis",
        target,
        summary,
        details,
      };
    }),

  /**
   * POST /agent/fix-issues
   * Generates AI-powered fix suggestions for provided issues (admin only).
   */
  fixIssues: adminProcedure
    .input(
      z.object({
        issues: z
          .array(z.string().min(1))
          .min(1, "Provide at least one issue to fix"),
      })
    )
    .mutation(async ({ input }) => {
      const issueList = input.issues.map((s, i) => `${i + 1}. ${s}`).join("\n");
      const { summary, details } = await runAgentTask(
        "bug-fixing",
        `For each of the following issues in the Stampcoin Platform, suggest a concrete fix with code examples where applicable:\n${issueList}`
      );
      return {
        success: true,
        capability: "bug-fixing",
        issueCount: input.issues.length,
        summary,
        details,
      };
    }),

  /**
   * POST /agent/organize-project
   * Provides AI-powered project organization recommendations (admin only).
   */
  organizeProject: adminProcedure.mutation(async () => {
    const { summary, details } = await runAgentTask(
      "project-organization",
      "Review the Stampcoin Platform project structure (React 19 frontend, Express/tRPC backend, MySQL/Drizzle ORM, Stripe payments). Suggest improvements to file organization, module boundaries, naming conventions, and overall architecture for better maintainability."
    );
    return {
      success: true,
      capability: "project-organization",
      summary,
      details,
    };
  }),

  /**
   * POST /agent/optimize-performance
   * Provides AI-powered performance optimization recommendations (admin only).
   */
  optimizePerformance: adminProcedure.mutation(async () => {
    const { summary, details } = await runAgentTask(
      "performance-optimization",
      "Analyze the Stampcoin Platform for performance bottlenecks across frontend (React 19 + Vite), API layer (tRPC), database (MySQL/Drizzle ORM), and infrastructure. Provide prioritized recommendations with expected impact."
    );
    return {
      success: true,
      capability: "performance-optimization",
      summary,
      details,
    };
  }),

  /**
   * POST /agent/audit-security
   * Performs an AI-powered security audit (admin only).
   */
  auditSecurity: adminProcedure.mutation(async () => {
    const { summary, details } = await runAgentTask(
      "security-audit",
      "Perform a security audit of the Stampcoin Platform covering authentication (OAuth/JWT), authorization (tRPC procedures), payment handling (Stripe), input validation (Zod), SQL injection risks (Drizzle ORM), CORS, dependency vulnerabilities, and secrets management. Classify findings by severity (critical, high, medium, low)."
    );
    return {
      success: true,
      capability: "security-audit",
      summary,
      details,
    };
  }),

  /**
   * POST /agent/generate-docs
   * Generates AI-powered documentation for the given target (admin only).
   */
  generateDocs: adminProcedure
    .input(
      z.object({
        target: z
          .string()
          .optional()
          .describe(
            "Module, file, or API area to document. Defaults to the full API."
          ),
      })
    )
    .mutation(async ({ input }) => {
      const target = input.target ?? "the full Stampcoin Platform API";
      const { summary, details } = await runAgentTask(
        "documentation-generation",
        `Generate comprehensive developer documentation for ${target}. Include: purpose, inputs/outputs, authentication requirements, example usage, and error handling.`
      );
      return {
        success: true,
        capability: "documentation-generation",
        target,
        summary,
        details,
      };
    }),

  /**
   * POST /agent/create-tests
   * Generates AI-powered test scaffolding for the given target (admin only).
   */
  createTests: adminProcedure
    .input(
      z.object({
        target: z
          .string()
          .optional()
          .describe(
            "Module or procedure to generate tests for. Defaults to all untested procedures."
          ),
      })
    )
    .mutation(async ({ input }) => {
      const target =
        input.target ?? "all untested Stampcoin Platform tRPC procedures";
      const { summary, details } = await runAgentTask(
        "test-creation",
        `Generate Vitest test scaffolding for ${target} in the Stampcoin Platform. Tests should use \`appRouter.createCaller(ctx)\` pattern, cover happy paths and error cases, and follow the style in server/stamps.test.ts.`
      );
      return {
        success: true,
        capability: "test-creation",
        target,
        summary,
        details,
      };
    }),
});
