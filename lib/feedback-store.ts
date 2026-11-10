import { promises as fs } from "fs";
import path from "path";

export type FeedbackSentiment = "positive" | "neutral" | "negative";
export type FeedbackStatus = "pending" | "approved" | "archived";

export interface FeedbackRecord {
  id: string;
  product: string;
  sentiment: FeedbackSentiment;
  message: string;
  status: FeedbackStatus;
  createdAt: string;
}

const dataDir = path.join(process.cwd(), "data");
const feedbackFile = path.join(dataDir, "feedback.json");

const starterRecords: FeedbackRecord[] = [
  {
    id: "seed-1",
    product: "Meal train",
    sentiment: "positive",
    message: "A family received fresh groceries and a warm welcome this week.",
    status: "approved",
    createdAt: "2026-11-01T09:30:00.000Z",
  },
  {
    id: "seed-2",
    product: "Volunteer support",
    sentiment: "neutral",
    message: "We could use a few extra helpers for afternoon community calls.",
    status: "pending",
    createdAt: "2026-11-02T11:15:00.000Z",
  },
  {
    id: "seed-3",
    product: "Ride assistance",
    sentiment: "negative",
    message: "Access to appointments is still difficult for some neighbors.",
    status: "approved",
    createdAt: "2026-11-03T13:45:00.000Z",
  },
];

export async function ensureFeedbackStore() {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(feedbackFile);
  } catch {
    await fs.writeFile(feedbackFile, JSON.stringify(starterRecords, null, 2), "utf-8");
  }
}

export async function readFeedbackRecords(): Promise<FeedbackRecord[]> {
  await ensureFeedbackStore();
  const raw = await fs.readFile(feedbackFile, "utf-8");

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is FeedbackRecord => {
      if (!item || typeof item !== "object") return false;
      const record = item as Record<string, unknown>;
      return (
        typeof record.id === "string" &&
        typeof record.product === "string" &&
        (record.sentiment === "positive" ||
          record.sentiment === "neutral" ||
          record.sentiment === "negative") &&
        typeof record.message === "string" &&
        (record.status === "pending" ||
          record.status === "approved" ||
          record.status === "archived") &&
        typeof record.createdAt === "string"
      );
    });
  } catch {
    return [];
  }
}

export async function writeFeedbackRecords(records: FeedbackRecord[]) {
  await ensureFeedbackStore();
  await fs.writeFile(feedbackFile, JSON.stringify(records, null, 2), "utf-8");
}

export async function createFeedbackRecord(input: {
  product: string;
  sentiment: FeedbackSentiment;
  message: string;
}) {
  const records = await readFeedbackRecords();
  const record: FeedbackRecord = {
    id: crypto.randomUUID(),
    product: input.product.trim(),
    sentiment: input.sentiment,
    message: input.message.trim(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const next = [record, ...records];
  await writeFeedbackRecords(next);
  return record;
}

export async function updateFeedbackRecord(
  id: string,
  updates: Partial<Pick<FeedbackRecord, "status" | "message" | "sentiment" | "product">>,
) {
  const records = await readFeedbackRecords();
  const updated = records.map((record) =>
    record.id === id ? { ...record, ...updates } : record,
  );
  await writeFeedbackRecords(updated);
  return updated.find((record) => record.id === id) ?? null;
}

export async function deleteFeedbackRecord(id: string) {
  const records = await readFeedbackRecords();
  const next = records.filter((record) => record.id !== id);
  await writeFeedbackRecords(next);
}
