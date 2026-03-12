import { vi, describe, expect, it, beforeEach } from "vitest";

// Mock the LLM so tests don't make real API calls
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    id: "mock-id",
    created: Date.now(),
    model: "mock-model",
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: "Mock analysis result.\nDetailed mock content.",
        },
        finish_reason: "stop",
      },
    ],
  }),
}));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

function createUserCtx(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

function createAdminCtx(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

describe("agent API", () => {
  describe("agent.status", () => {
    it("should return agent status without authentication", async () => {
      const caller = appRouter.createCaller(createPublicCtx());
      const result = await caller.agent.status();

      expect(result.name).toBe("STP Agent Expert");
      expect(result.version).toBe("1.0.0");
      expect(typeof result.active).toBe("boolean");
      expect(Array.isArray(result.capabilities)).toBe(true);
      expect(result.capabilities).toContain("code-analysis");
      expect(result.capabilities).toContain("security-audit");
      expect(result.settings).toBeDefined();
      expect(result.priorities).toBeDefined();
      expect(result.integrations).toBeDefined();
    });
  });

  describe("agent.activate / agent.deactivate", () => {
    it("should require admin role to activate", async () => {
      const userCaller = appRouter.createCaller(createUserCtx());
      await expect(userCaller.agent.activate()).rejects.toThrow();
    });

    it("should require admin role to deactivate", async () => {
      const userCaller = appRouter.createCaller(createUserCtx());
      await expect(userCaller.agent.deactivate()).rejects.toThrow();
    });

    it("should allow admin to activate and deactivate the agent", async () => {
      const adminCaller = appRouter.createCaller(createAdminCtx());

      const activated = await adminCaller.agent.activate();
      expect(activated.success).toBe(true);
      expect(activated.active).toBe(true);

      const statusAfterActivate = await appRouter
        .createCaller(createPublicCtx())
        .agent.status();
      expect(statusAfterActivate.active).toBe(true);

      const deactivated = await adminCaller.agent.deactivate();
      expect(deactivated.success).toBe(true);
      expect(deactivated.active).toBe(false);

      const statusAfterDeactivate = await appRouter
        .createCaller(createPublicCtx())
        .agent.status();
      expect(statusAfterDeactivate.active).toBe(false);
    });
  });

  describe("agent.analyzeCode", () => {
    it("should require admin role", async () => {
      const userCaller = appRouter.createCaller(createUserCtx());
      await expect(userCaller.agent.analyzeCode({})).rejects.toThrow();
    });

    it("should return analysis result for admin", async () => {
      const adminCaller = appRouter.createCaller(createAdminCtx());
      const result = await adminCaller.agent.analyzeCode({
        target: "server/routers.ts",
      });

      expect(result.success).toBe(true);
      expect(result.capability).toBe("code-analysis");
      expect(result.target).toBe("server/routers.ts");
      expect(typeof result.summary).toBe("string");
      expect(typeof result.details).toBe("string");
    });

    it("should default target when not provided", async () => {
      const adminCaller = appRouter.createCaller(createAdminCtx());
      const result = await adminCaller.agent.analyzeCode({});

      expect(result.success).toBe(true);
      expect(result.target).toBe("the entire Stampcoin Platform codebase");
    });
  });

  describe("agent.fixIssues", () => {
    it("should require admin role", async () => {
      const userCaller = appRouter.createCaller(createUserCtx());
      await expect(
        userCaller.agent.fixIssues({ issues: ["Some bug"] })
      ).rejects.toThrow();
    });

    it("should require at least one issue", async () => {
      const adminCaller = appRouter.createCaller(createAdminCtx());
      await expect(
        adminCaller.agent.fixIssues({ issues: [] })
      ).rejects.toThrow();
    });

    it("should return fix suggestions for admin", async () => {
      const adminCaller = appRouter.createCaller(createAdminCtx());
      const result = await adminCaller.agent.fixIssues({
        issues: ["Null pointer in payment handler", "Missing error boundary"],
      });

      expect(result.success).toBe(true);
      expect(result.capability).toBe("bug-fixing");
      expect(result.issueCount).toBe(2);
      expect(typeof result.summary).toBe("string");
    });
  });

  describe("agent.organizeProject", () => {
    it("should require admin role", async () => {
      const userCaller = appRouter.createCaller(createUserCtx());
      await expect(userCaller.agent.organizeProject()).rejects.toThrow();
    });

    it("should return organization recommendations for admin", async () => {
      const adminCaller = appRouter.createCaller(createAdminCtx());
      const result = await adminCaller.agent.organizeProject();

      expect(result.success).toBe(true);
      expect(result.capability).toBe("project-organization");
      expect(typeof result.summary).toBe("string");
    });
  });

  describe("agent.optimizePerformance", () => {
    it("should require admin role", async () => {
      const userCaller = appRouter.createCaller(createUserCtx());
      await expect(userCaller.agent.optimizePerformance()).rejects.toThrow();
    });

    it("should return performance recommendations for admin", async () => {
      const adminCaller = appRouter.createCaller(createAdminCtx());
      const result = await adminCaller.agent.optimizePerformance();

      expect(result.success).toBe(true);
      expect(result.capability).toBe("performance-optimization");
      expect(typeof result.summary).toBe("string");
    });
  });

  describe("agent.auditSecurity", () => {
    it("should require admin role", async () => {
      const userCaller = appRouter.createCaller(createUserCtx());
      await expect(userCaller.agent.auditSecurity()).rejects.toThrow();
    });

    it("should return security audit for admin", async () => {
      const adminCaller = appRouter.createCaller(createAdminCtx());
      const result = await adminCaller.agent.auditSecurity();

      expect(result.success).toBe(true);
      expect(result.capability).toBe("security-audit");
      expect(typeof result.summary).toBe("string");
    });
  });

  describe("agent.generateDocs", () => {
    it("should require admin role", async () => {
      const userCaller = appRouter.createCaller(createUserCtx());
      await expect(userCaller.agent.generateDocs({})).rejects.toThrow();
    });

    it("should return generated docs for admin", async () => {
      const adminCaller = appRouter.createCaller(createAdminCtx());
      const result = await adminCaller.agent.generateDocs({
        target: "payments router",
      });

      expect(result.success).toBe(true);
      expect(result.capability).toBe("documentation-generation");
      expect(result.target).toBe("payments router");
      expect(typeof result.details).toBe("string");
    });
  });

  describe("agent.createTests", () => {
    it("should require admin role", async () => {
      const userCaller = appRouter.createCaller(createUserCtx());
      await expect(userCaller.agent.createTests({})).rejects.toThrow();
    });

    it("should return test scaffolding for admin", async () => {
      const adminCaller = appRouter.createCaller(createAdminCtx());
      const result = await adminCaller.agent.createTests({
        target: "partners router",
      });

      expect(result.success).toBe(true);
      expect(result.capability).toBe("test-creation");
      expect(result.target).toBe("partners router");
      expect(typeof result.summary).toBe("string");
    });
  });
});
