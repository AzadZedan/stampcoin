/**
 * Tests for the AI Agent Expert utilities module.
 */

import { describe, test, expect } from "vitest";
import { codeAnalysisUtils, securityUtils, performanceUtils } from "../src/ai-agent-expert/utils.js";

describe("codeAnalysisUtils", () => {
  describe("analyzeCodeQuality", () => {
    test("returns correct line counts for simple code", () => {
      const code = "const x = 1;\n\nconst y = 2;";
      const result = codeAnalysisUtils.analyzeCodeQuality(code);
      expect(result.totalLines).toBe(3);
      expect(result.blankLines).toBe(1);
    });

    test("counts comment lines correctly", () => {
      const code = "// This is a comment\nconst x = 1;\n// Another comment";
      const result = codeAnalysisUtils.analyzeCodeQuality(code);
      expect(result.commentLines).toBe(2);
    });

    test("includes complexityScore and maintainabilityIndex", () => {
      const code = "function foo() {\n  if (x) {\n    return 1;\n  }\n}";
      const result = codeAnalysisUtils.analyzeCodeQuality(code);
      expect(result.complexityScore).toBeGreaterThan(0);
      expect(result.maintainabilityIndex).toBeGreaterThanOrEqual(0);
      expect(result.maintainabilityIndex).toBeLessThanOrEqual(100);
    });
  });

  describe("calculateComplexity", () => {
    test("returns base complexity of 1 for simple code", () => {
      const code = "const x = 1;";
      expect(codeAnalysisUtils.calculateComplexity(code)).toBe(1);
    });

    test("increments complexity for control flow keywords", () => {
      const code = "if (x) {\n  for (let i = 0; i < 10; i++) {}\n}";
      const complexity = codeAnalysisUtils.calculateComplexity(code);
      expect(complexity).toBeGreaterThan(1);
    });

    test("does not count keywords in comment lines", () => {
      const baseCode = "const x = 1;";
      const codeWithComment = "// if this were real code\nconst x = 1;";
      expect(codeAnalysisUtils.calculateComplexity(codeWithComment)).toBe(
        codeAnalysisUtils.calculateComplexity(baseCode)
      );
    });
  });

  describe("calculateMaintainability", () => {
    test("returns a value between 0 and 100", () => {
      const code = "// comment\nconst x = 1;\n\nconst y = 2;";
      const score = codeAnalysisUtils.calculateMaintainability(code);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test("code with more comments has higher maintainability", () => {
      const uncommented = "const a = 1;\nconst b = 2;\nconst c = 3;";
      const commented =
        "// first var\nconst a = 1;\n// second var\nconst b = 2;\n// third var\nconst c = 3;";
      expect(codeAnalysisUtils.calculateMaintainability(commented)).toBeGreaterThan(
        codeAnalysisUtils.calculateMaintainability(uncommented)
      );
    });
  });
});

describe("securityUtils", () => {
  describe("checkSecurityVulnerabilities", () => {
    test("returns empty array for clean code", () => {
      const code = "const x = process.env.SECRET;";
      const result = securityUtils.checkSecurityVulnerabilities(code);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    test("detects hardcoded password", () => {
      const code = 'const password = "mysecret123";';
      const result = securityUtils.checkSecurityVulnerabilities(code);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].severity).toBe("high");
      expect(result[0].suggestion).toMatch(/environment variables/i);
    });

    test("detects XSS vulnerability", () => {
      const code = 'element.innerHTML = "<b>" + userInput;';
      const result = securityUtils.checkSecurityVulnerabilities(code);
      const xssIssue = result.find(v => v.message.toLowerCase().includes("xss"));
      expect(xssIssue).toBeDefined();
    });

    test("detects SQL injection risk", () => {
      const code = `const query = 'SELECT * FROM users WHERE id = ' + 'injected';`;
      const result = securityUtils.checkSecurityVulnerabilities(code);
      const sqlIssue = result.find(v => v.message.toLowerCase().includes("sql"));
      expect(sqlIssue).toBeDefined();
    });
  });
});

describe("performanceUtils", () => {
  describe("checkPerformanceIssues", () => {
    test("returns empty array for clean code", () => {
      const code = "const x = 1 + 2;";
      const result = performanceUtils.checkPerformanceIssues(code);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    test("detects setInterval without cleanup", () => {
      const code = "setInterval(() => doSomething(), 1000);";
      const result = performanceUtils.checkPerformanceIssues(code);
      const issue = result.find(i => i.message.toLowerCase().includes("setinterval"));
      expect(issue).toBeDefined();
      expect(issue.severity).toBe("medium");
    });

    test("detects inefficient DOM manipulation", () => {
      const code = 'document.getElementById("app").innerHTML = content;';
      const result = performanceUtils.checkPerformanceIssues(code);
      const issue = result.find(i => i.message.toLowerCase().includes("dom"));
      expect(issue).toBeDefined();
    });
  });
});
