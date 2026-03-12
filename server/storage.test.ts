import { vi, describe, expect, it, beforeEach, afterEach } from "vitest";

// ---- Mock ENV so tests don't need real credentials ----
vi.mock("./_core/env", () => ({
  ENV: {
    forgeApiUrl: "https://storage.example.com",
    forgeApiKey: "test-api-key",
  },
}));

import { storagePut, storageGet } from "./storage";

// ---- Helpers ----

function makeFetchMock(
  responseBody: unknown,
  status = 200
): ReturnType<typeof vi.fn> {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: () => Promise.resolve(responseBody),
    text: () => Promise.resolve(JSON.stringify(responseBody)),
  });
}

// ---- Tests ----

describe("storagePut", () => {
  let originalFetch: typeof fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("uploads data and returns key and url", async () => {
    const mockUrl = "https://cdn.example.com/stamps/test-image.png";
    globalThis.fetch = makeFetchMock({ url: mockUrl }) as unknown as typeof fetch;

    const result = await storagePut(
      "stamps/test-image.png",
      Buffer.from("fake-image-data"),
      "image/png"
    );

    expect(result.key).toBe("stamps/test-image.png");
    expect(result.url).toBe(mockUrl);
  });

  it("strips leading slashes from the key", async () => {
    const mockUrl = "https://cdn.example.com/stamps/img.jpg";
    const fetchMock = makeFetchMock({ url: mockUrl }) as unknown as typeof fetch;
    globalThis.fetch = fetchMock;

    const result = await storagePut("///stamps/img.jpg", Buffer.from("data"), "image/jpeg");

    expect(result.key).toBe("stamps/img.jpg");
  });

  it("builds the upload URL with the correct path query param", async () => {
    const fetchMock = makeFetchMock({ url: "https://cdn.example.com/foo.png" });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await storagePut("foo.png", Buffer.from("x"), "image/png");

    const calledUrl = String((fetchMock.mock.calls[0] as [URL | string, ...unknown[]])[0]);
    expect(calledUrl).toContain("/v1/storage/upload");
    expect(calledUrl).toContain("path=foo.png");
  });

  it("sends Authorization header with Bearer token", async () => {
    const fetchMock = makeFetchMock({ url: "https://cdn.example.com/x.png" });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await storagePut("x.png", Buffer.from("x"), "image/png");

    const options = (fetchMock.mock.calls[0] as [string, RequestInit])[1];
    const headers = options.headers as Record<string, string>;
    expect(headers["Authorization"]).toBe("Bearer test-api-key");
  });

  it("accepts a string payload", async () => {
    const fetchMock = makeFetchMock({ url: "https://cdn.example.com/doc.txt" });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const result = await storagePut("doc.txt", "hello world", "text/plain");

    expect(result.key).toBe("doc.txt");
  });

  it("throws when the upload request fails", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      text: () => Promise.resolve("disk full"),
    }) as unknown as typeof fetch;

    await expect(
      storagePut("bad.png", Buffer.from("x"), "image/png")
    ).rejects.toThrow("Storage upload failed (500 Internal Server Error): disk full");
  });
});

describe("storageGet", () => {
  let originalFetch: typeof fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns key and presigned download url", async () => {
    const mockUrl = "https://cdn.example.com/signed/stamps/photo.jpg?token=abc";
    globalThis.fetch = makeFetchMock({ url: mockUrl }) as unknown as typeof fetch;

    const result = await storageGet("stamps/photo.jpg");

    expect(result.key).toBe("stamps/photo.jpg");
    expect(result.url).toBe(mockUrl);
  });

  it("strips leading slashes from the key", async () => {
    const mockUrl = "https://cdn.example.com/signed/stamps/x.jpg";
    globalThis.fetch = makeFetchMock({ url: mockUrl }) as unknown as typeof fetch;

    const result = await storageGet("///stamps/x.jpg");

    expect(result.key).toBe("stamps/x.jpg");
  });

  it("calls downloadUrl endpoint with path query param", async () => {
    const fetchMock = makeFetchMock({ url: "https://cdn.example.com/y.png" });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await storageGet("y.png");

    const calledUrl = String((fetchMock.mock.calls[0] as [URL | string, ...unknown[]])[0]);
    expect(calledUrl).toContain("/v1/storage/downloadUrl");
    expect(calledUrl).toContain("path=y.png");
  });
});
