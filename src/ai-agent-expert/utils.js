import { promises as fs } from "fs";
import path from "path";

/**
 * AI Agent Expert Utilities
 * Helper functions for the AI agent system
 */

// File system utilities
const fileUtils = {
  /**
   * Read a JSON file and parse its content
   * @param {string} filePath - Path to the JSON file
   * @returns {Promise<Object>} Parsed JSON content
   */
  async readJsonFile(filePath) {
    try {
      const raw = await fs.readFile(filePath, "utf8");
      return JSON.parse(raw);
    } catch (error) {
      console.error(`Error reading JSON file ${filePath}:`, error.message);
      return null;
    }
  },

  /**
   * Write an object to a JSON file
   * @param {string} filePath - Path to the JSON file
   * @param {Object} data - Data to write
   * @returns {Promise<boolean>} Success status
   */
  async writeJsonFile(filePath, data) {
    try {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
      return true;
    } catch (error) {
      console.error(`Error writing JSON file ${filePath}:`, error.message);
      return false;
    }
  },

  /**
   * List all files in a directory recursively
   * @param {string} dirPath - Directory path
   * @param {Array} fileExtensions - Optional file extensions to filter
   * @returns {Promise<Array>} List of file paths
   */
  async listFilesRecursive(dirPath, fileExtensions = []) {
    const files = [];

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          const subFiles = await this.listFilesRecursive(
            fullPath,
            fileExtensions
          );
          files.push(...subFiles);
        } else if (entry.isFile()) {
          if (
            fileExtensions.length === 0 ||
            fileExtensions.includes(path.extname(entry.name))
          ) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dirPath}:`, error.message);
    }

    return files;
  },
};

// Code analysis utilities
const codeAnalysisUtils = {
  /**
   * Analyze code quality metrics
   * @param {string} code - Code to analyze
   * @returns {Object} Analysis results
   */
  analyzeCodeQuality(code) {
    const lines = code.split("\n");
    const metrics = {
      totalLines: lines.length,
      commentLines: lines.filter(line => line.trim().startsWith("//")).length,
      blankLines: lines.filter(line => line.trim() === "").length,
      complexityScore: this.calculateComplexity(code),
      maintainabilityIndex: this.calculateMaintainability(code),
    };

    return metrics;
  },

  /**
   * Calculate cyclomatic complexity (simplified)
   * @param {string} code - Code to analyze
   * @returns {number} Complexity score
   */
  calculateComplexity(code) {
    const complexityKeywords = [
      "if",
      "else",
      "for",
      "while",
      "switch",
      "case",
      "try",
      "catch",
      "finally",
    ];
    const lines = code.split("\n");
    let complexity = 1; // Base complexity

    for (const line of lines) {
      // Skip comment lines to avoid false positives
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("*")) continue;
      for (const keyword of complexityKeywords) {
        // Use word boundaries to match only language keywords
        const re = new RegExp(`\\b${keyword}\\b`);
        if (re.test(trimmed)) {
          complexity++;
        }
      }
    }

    return complexity;
  },

  /**
   * Calculate maintainability index (simplified)
   * @param {string} code - Code to analyze
   * @returns {number} Maintainability score (0-100)
   */
  calculateMaintainability(code) {
    const lines = code.split("\n");
    const totalLines = lines.length;
    const commentLines = lines.filter(line =>
      line.trim().startsWith("//")
    ).length;
    const blankLines = lines.filter(line => line.trim() === "").length;

    const commentRatio = commentLines / totalLines;
    const blankRatio = blankLines / totalLines;

    return Math.min(100, Math.round(50 + commentRatio * 30 + blankRatio * 20));
  },
};

// Security utilities
const securityUtils = {
  /**
   * Check for common security vulnerabilities in code
   * @param {string} code - Code to analyze
   * @returns {Array} List of security issues
   */
  checkSecurityVulnerabilities(code) {
    const vulnerabilities = [];

    // Check for hardcoded secrets
    const secretPattern = /password\s*=\s*["'][^"']+["']/gi;
    if (secretPattern.test(code)) {
      vulnerabilities.push({
        type: "security",
        severity: "high",
        message: "Potential hardcoded password detected",
        suggestion: "Use environment variables for sensitive data",
      });
    }

    // Check for SQL injection vulnerabilities (string concatenation into SQL keywords)
    const sqlPattern = /\b(SELECT|INSERT|UPDATE|DELETE)\b.*\+\s*['"]/gi;
    if (sqlPattern.test(code)) {
      vulnerabilities.push({
        type: "security",
        severity: "high",
        message: "Potential SQL injection vulnerability",
        suggestion: "Use parameterized queries",
      });
    }

    // Check for XSS vulnerabilities
    const xssPattern = /innerHTML\s*=\s*.*\+/gi;
    if (xssPattern.test(code)) {
      vulnerabilities.push({
        type: "security",
        severity: "high",
        message: "Potential XSS vulnerability",
        suggestion: "Use textContent or proper escaping",
      });
    }

    return vulnerabilities;
  },
};

// Performance utilities
const performanceUtils = {
  /**
   * Check for performance issues in code
   * @param {string} code - Code to analyze
   * @returns {Array} List of performance issues
   */
  checkPerformanceIssues(code) {
    const issues = [];

    // Check for memory leaks (simplified)
    const memoryLeakPattern = /(setInterval|setTimeout)\(.*\)/g;
    const matches = code.match(memoryLeakPattern);
    if (matches) {
      issues.push({
        type: "performance",
        severity: "medium",
        message:
          "Potential memory leak: setInterval/setTimeout without cleanup",
        suggestion: "Clear intervals/timeouts when they're no longer needed",
      });
    }

    // Check for inefficient DOM manipulation
    const domPattern = /document\.getElementById.*\.innerHTML\s*=/g;
    if (domPattern.test(code)) {
      issues.push({
        type: "performance",
        severity: "medium",
        message: "Inefficient DOM manipulation detected",
        suggestion: "Use document fragments or batch DOM updates",
      });
    }

    // Check for blocking operations
    const blockingPattern = /while\(true\)|for\(.*;.*;.*\)\s*{/g;
    if (blockingPattern.test(code)) {
      issues.push({
        type: "performance",
        severity: "high",
        message: "Potential blocking operation detected",
        suggestion: "Use asynchronous operations for long-running tasks",
      });
    }

    return issues;
  },
};

export { fileUtils, codeAnalysisUtils, securityUtils, performanceUtils };
