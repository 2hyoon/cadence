import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import type { Priority } from "@/types/todo";

const PRIORITIES = new Set<string>(["low", "medium", "high"]);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

interface ParsedDraft {
  title: string;
  dueDate?: string;
  priority: Priority;
  tags: string[];
}

function today(): string {
  return new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
}

function coerceDraft(raw: unknown): ParsedDraft | null {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;

  const title = typeof obj.title === "string" ? obj.title.trim() : "";
  if (!title) return null;

  const priority: Priority = PRIORITIES.has(obj.priority as string)
    ? (obj.priority as Priority)
    : "medium";

  const dueDate =
    typeof obj.dueDate === "string" && DATE_RE.test(obj.dueDate)
      ? obj.dueDate
      : undefined;

  const tags = Array.isArray(obj.tags)
    ? (obj.tags as unknown[]).filter((t): t is string => typeof t === "string")
    : [];

  return { title, dueDate, priority, tags };
}

const client = new Anthropic();

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || typeof (body as Record<string, unknown>).text !== "string") {
    return NextResponse.json({ error: "Missing text field" }, { status: 400 });
  }

  const text = ((body as Record<string, unknown>).text as string).trim();

  if (!text) {
    return NextResponse.json({ error: "text is empty" }, { status: 400 });
  }

  if (text.length > 500) {
    return NextResponse.json({ error: "text exceeds 500 characters" }, { status: 400 });
  }

  const prompt = `Today's date is ${today()}. Parse the following natural-language task description into a structured JSON object with exactly these fields:
- "title": string (required, concise task title)
- "dueDate": string in YYYY-MM-DD format (optional, omit if not mentioned or unclear, no time component)
- "priority": one of "low", "medium", "high" (default "medium")
- "tags": array of strings (optional, can be empty array)

Respond with ONLY valid JSON, no explanation or markdown. Example: {"title":"Buy groceries","dueDate":"2025-01-15","priority":"medium","tags":["errands"]}

Task: ${text}`;

  let message;
  try {
    message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 256,
      messages: [{ role: "user", content: prompt }],
    });
  } catch (err: unknown) {
    const status = (err as { status?: number }).status;
    if (status === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (status === 429) {
      return NextResponse.json({ error: "Rate limited" }, { status: 429 });
    }
    return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
  }

  const content = message.content[0];
  if (!content || content.type !== "text") {
    return NextResponse.json({ error: "Unexpected AI response" }, { status: 502 });
  }

  let parsed: unknown;
  try {
    const raw = content.text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "AI returned invalid JSON" }, { status: 502 });
  }

  const draft = coerceDraft(parsed);
  if (!draft) {
    return NextResponse.json({ error: "AI response missing required fields" }, { status: 502 });
  }

  return NextResponse.json(draft);
}
