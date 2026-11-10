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

export class FeedbackDataSource {
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
      const body = await response.json().catch(() => null);
      throw new Error(body?.error ?? `Request failed (${response.status}).`);
    }

    return (await response.json()) as T;
  }

  async listFeedback(product?: string): Promise<FeedbackRecord[]> {
    const query = product ? `?product=${encodeURIComponent(product)}` : "";
    return this.request<FeedbackRecord[]>(`/api/feedback${query}`);
  }

  async addFeedback(
    product: string,
    sentiment: FeedbackSentiment,
    message: string,
  ): Promise<FeedbackRecord> {
    return this.request<FeedbackRecord>("/api/feedback", {
      method: "POST",
      body: JSON.stringify({ product, sentiment, message }),
    });
  }

  async updateFeedback(
    id: string,
    updates: Partial<Pick<FeedbackRecord, "status" | "message" | "sentiment" | "product">>,
  ): Promise<FeedbackRecord> {
    return this.request<FeedbackRecord>(`/api/feedback/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  }

  async deleteFeedback(id: string): Promise<void> {
    await this.request(`/api/feedback/${encodeURIComponent(id)}`, { method: "DELETE" });
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
