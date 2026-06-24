import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// vi.hoisted ensures mockCreate is initialized before the hoisted vi.mock factory runs
const mockCreate = vi.hoisted(() => vi.fn());

vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn(() => ({ messages: { create: mockCreate } })),
}));

// Import after mock registration so the route module picks up the mocked SDK
import { POST } from "./route";

function mockOk(text: string) {
  return { content: [{ type: "text", text }] };
}

function makeReq(body: unknown) {
  return new NextRequest("http://localhost/api/parse", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/parse", () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  it("returns 400 when text is missing", async () => {
    const res = await POST(makeReq({}));
    expect(res.status).toBe(400);
  });

  it("returns 400 when text is empty string", async () => {
    const res = await POST(makeReq({ text: "   " }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when text exceeds 500 chars", async () => {
    const res = await POST(makeReq({ text: "a".repeat(501) }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for unparseable JSON body", async () => {
    const res = await POST(
      new NextRequest("http://localhost/api/parse", {
        method: "POST",
        body: "not json",
        headers: { "content-type": "application/json" },
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns parsed draft for a simple task", async () => {
    mockCreate.mockResolvedValue(
      mockOk(JSON.stringify({ title: "Buy milk", priority: "low", tags: ["errands"] }))
    );
    const res = await POST(makeReq({ text: "buy milk low priority" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.title).toBe("Buy milk");
    expect(data.priority).toBe("low");
    expect(data.tags).toEqual(["errands"]);
    expect(data.dueDate).toBeUndefined();
  });

  it("includes dueDate when AI returns a valid YYYY-MM-DD date", async () => {
    mockCreate.mockResolvedValue(
      mockOk(JSON.stringify({ title: "Submit report", dueDate: "2026-06-27", priority: "high", tags: [] }))
    );
    const res = await POST(makeReq({ text: "submit report friday high priority" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.dueDate).toBe("2026-06-27");
    expect(data.priority).toBe("high");
  });

  it("drops dueDate when AI returns an invalid date format", async () => {
    mockCreate.mockResolvedValue(
      mockOk(JSON.stringify({ title: "Meeting", dueDate: "tomorrow 3pm", priority: "medium", tags: [] }))
    );
    const res = await POST(makeReq({ text: "meeting tomorrow 3pm" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.dueDate).toBeUndefined();
  });

  it("defaults priority to medium for unknown priority values", async () => {
    mockCreate.mockResolvedValue(
      mockOk(JSON.stringify({ title: "Task", priority: "urgent", tags: [] }))
    );
    const res = await POST(makeReq({ text: "urgent task" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.priority).toBe("medium");
  });

  it("returns 502 when AI returns invalid JSON text", async () => {
    mockCreate.mockResolvedValue(mockOk("not json at all"));
    const res = await POST(makeReq({ text: "some task" }));
    expect(res.status).toBe(502);
  });

  it("returns 502 when AI response is missing title", async () => {
    mockCreate.mockResolvedValue(
      mockOk(JSON.stringify({ priority: "medium", tags: [] }))
    );
    const res = await POST(makeReq({ text: "some task" }));
    expect(res.status).toBe(502);
  });

  it("returns 502 when AI call throws a network error", async () => {
    mockCreate.mockRejectedValue(new Error("network error"));
    const res = await POST(makeReq({ text: "some task" }));
    expect(res.status).toBe(502);
  });

  it("returns 401 when AI call throws a 401 error", async () => {
    mockCreate.mockRejectedValue(Object.assign(new Error("Unauthorized"), { status: 401 }));
    const res = await POST(makeReq({ text: "some task" }));
    expect(res.status).toBe(401);
  });

  it("returns 429 when AI call throws a 429 error", async () => {
    mockCreate.mockRejectedValue(Object.assign(new Error("Too Many Requests"), { status: 429 }));
    const res = await POST(makeReq({ text: "some task" }));
    expect(res.status).toBe(429);
  });
});
