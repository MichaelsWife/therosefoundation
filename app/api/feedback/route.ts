import { NextResponse } from "next/server";
import { createFeedbackRecord, readFeedbackRecords, updateFeedbackRecord, deleteFeedbackRecord } from "@/lib/feedback-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const product = searchParams.get("product");
  const records = await readFeedbackRecords();
  const filtered = product
    ? records.filter((record) => record.product === product)
    : records;

  return NextResponse.json(filtered);
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    product?: string;
    sentiment?: "positive" | "neutral" | "negative";
    message?: string;
  };

  if (!body.product || !body.message || !body.sentiment) {
    return NextResponse.json(
      { error: "product, sentiment, and message are required" },
      { status: 400 },
    );
  }

  const record = await createFeedbackRecord({
    product: body.product,
    sentiment: body.sentiment,
    message: body.message,
  });

  return NextResponse.json(record, { status: 201 });
}
