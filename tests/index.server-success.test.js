/**
 * Tests for the index.js entry point — server success case.
 * Verifies that when server.js loads successfully, no error handling
 * is triggered (process.exit is not called).
 */

import { describe, test, expect, vi } from "vitest";

vi.mock("../server.js", () => ({}));

describe("index entry point (server success)", () => {
  test("does not call process.exit when server starts successfully", async () => {
    vi.resetModules();
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await import("../index.js");

    expect(exitSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();

    vi.restoreAllMocks();
  });
});
