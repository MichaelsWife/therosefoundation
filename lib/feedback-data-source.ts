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

export interface FeedbackSummary {
  totalFeedback: number;
  sentiments: Record<FeedbackSentiment, number>;
  products: Record<string, number>;
  statusBreakdown: Record<FeedbackStatus, number>;
}

const STORAGE_KEY = "rose-foundation:feedback";

export class FeedbackDataSource {
  private readLocalStorage(): FeedbackRecord[] {
    if (typeof window === "undefined") return [];

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

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

  private writeLocalStorage(records: FeedbackRecord[]) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }

  private async request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
    const response = await fetch(input, {
      ...init,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  }

  async listFeedback(product?: string): Promise<FeedbackRecord[]> {
    try {
      const url = product
        ? `/api/feedback?product=${encodeURIComponent(product)}`
        : "/api/feedback";
      const records = await this.request<FeedbackRecord[]>(url);
      return records;
    } catch {
      const records = this.readLocalStorage();
      return product
        ? records.filter((record) => record.product === product)
        : records;
    }
  }

  async addFeedback(
    product: string,
    sentiment: FeedbackSentiment,
    message: string,
  ): Promise<FeedbackRecord> {
    const trimmedProduct = product.trim();
    const trimmedMessage = message.trim();

    if (!trimmedProduct || !trimmedMessage) {
      throw new TypeError("Product and message must be provided.");
    }

    try {
      const record = await this.request<FeedbackRecord>("/api/feedback", {
        method: "POST",
        body: JSON.stringify({ product: trimmedProduct, sentiment, message: trimmedMessage }),
      });
      return record;
    } catch {
      const records = this.readLocalStorage();
      const created: FeedbackRecord = {
        id: crypto.randomUUID(),
        product: trimmedProduct,
        sentiment,
        message: trimmedMessage,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      this.writeLocalStorage([...records, created]);
      return created;
    }
  }

  async updateFeedback(
    id: string,
    updates: Partial<Pick<FeedbackRecord, "status" | "message" | "sentiment" | "product">>,
  ): Promise<FeedbackRecord> {
    try {
      const record = await this.request<FeedbackRecord>(`/api/feedback/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
      return record;
    } catch {
      const records = this.readLocalStorage();
      const updated = records.map((record) =>
        record.id === id ? { ...record, ...updates } : record,
      );
      this.writeLocalStorage(updated);
      const match = updated.find((record) => record.id === id);
      if (!match) throw new Error("Feedback record not found.");
      return match;
    }
  }

  async deleteFeedback(id: string): Promise<void> {
    try {
      await this.request(`/api/feedback/${id}`, { method: "DELETE" });
      return;
    } catch {
      const records = this.readLocalStorage().filter((record) => record.id !== id);
      this.writeLocalStorage(records);
    }
  }

  async getSummary(): Promise<FeedbackSummary> {
    const records = await this.listFeedback();
    const sentiments: Record<FeedbackSentiment, number> = {
      positive: 0,
      neutral: 0,
      negative: 0,
    };
    const products: Record<string, number> = {};
    const statusBreakdown: Record<FeedbackStatus, number> = {
      pending: 0,
      approved: 0,
      archived: 0,
    };

    records.forEach((record) => {
      sentiments[record.sentiment] += 1;
      products[record.product] = (products[record.product] ?? 0) + 1;
      statusBreakdown[record.status] += 1;
    });

    return {
      totalFeedback: records.length,
      sentiments,
      products,
      statusBreakdown,
    };
  }
}

export const feedbackDataSource = new FeedbackDataSource();
