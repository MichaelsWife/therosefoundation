export type FeedbackSentiment = "positive" | "neutral" | "negative";

export interface FeedbackRecord {
  id: string;
  product: string;
  sentiment: FeedbackSentiment;
  message: string;
  createdAt: string;
}

export interface FeedbackSummary {
  totalFeedback: number;
  sentiments: Record<FeedbackSentiment, number>;
  products: Record<string, number>;
}

const STORAGE_KEY = "rose-foundation:feedback";

/**
 * A small browser-backed feedback data source. Records are stored in the
 * current browser's localStorage, so this is suitable for demos and local
 * prototypes—not shared or sensitive production data.
 */
export class FeedbackDataSource {
  private getStorage(): Storage {
    if (typeof window === "undefined") {
      throw new Error("FeedbackDataSource can only be used in a browser.");
    }

    return window.localStorage;
  }

  private readAll(): FeedbackRecord[] {
    const serialized = this.getStorage().getItem(STORAGE_KEY);
    if (!serialized) return [];

    try {
      const records: unknown = JSON.parse(serialized);
      if (!Array.isArray(records)) return [];

      return records.filter(
        (record): record is FeedbackRecord =>
          typeof record === "object" &&
          record !== null &&
          "id" in record &&
          typeof record.id === "string" &&
          "product" in record &&
          typeof record.product === "string" &&
          "sentiment" in record &&
          (record.sentiment === "positive" ||
            record.sentiment === "neutral" ||
            record.sentiment === "negative") &&
          "message" in record &&
          typeof record.message === "string" &&
          "createdAt" in record &&
          typeof record.createdAt === "string",
      );
    } catch {
      return [];
    }
  }

  addFeedback(
    product: string,
    sentiment: FeedbackSentiment,
    message: string,
  ): string {
    const cleanProduct = product.trim();
    const cleanMessage = message.trim();

    if (!cleanProduct || !cleanMessage) {
      throw new TypeError("Product and message must not be empty.");
    }

    const record: FeedbackRecord = {
      id: crypto.randomUUID(),
      product: cleanProduct,
      sentiment,
      message: cleanMessage,
      createdAt: new Date().toISOString(),
    };

    const records = this.readAll();
    records.push(record);
    this.getStorage().setItem(STORAGE_KEY, JSON.stringify(records));

    return record.id;
  }

  listFeedback(product?: string): FeedbackRecord[] {
    const records = this.readAll();
    const filtered = product
      ? records.filter((record) => record.product === product)
      : records;

    return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getSummary(): FeedbackSummary {
    const records = this.readAll();
    const sentiments: Record<FeedbackSentiment, number> = {
      positive: 0,
      neutral: 0,
      negative: 0,
    };
    const products: Record<string, number> = {};

    for (const record of records) {
      sentiments[record.sentiment] += 1;
      products[record.product] = (products[record.product] ?? 0) + 1;
    }

    return { totalFeedback: records.length, sentiments, products };
  }
}

export const feedbackDataSource = new FeedbackDataSource();
