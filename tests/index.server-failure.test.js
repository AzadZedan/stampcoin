/**
 * Tests for the index.js entry point — server failure case.
 * Verifies that when server.js fails to load, the error is caught,
 * logged to stderr, and process.exit(1) is called.
 */

import { describe, test, expect, vi } from "vitest";

vi.mock("../server.js", () => {
  throw new Error("Server startup failed");
});

describe("index entry point (server failure)", () => {
  test("calls process.exit(1) and logs error when server fails to start", async () => {
    vi.resetModules();
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await import("../index.js");

    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy).toHaveBeenCalledWith(
      "Failed to start server:",
      expect.any(String),
    );

    vi.restoreAllMocks();
  });
});
