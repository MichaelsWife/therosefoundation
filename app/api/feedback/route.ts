import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { createFeedbackRecord, readFeedbackRecords } from "@/lib/feedback-store";

const sentiments = ["positive", "neutral", "negative"] as const;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const product = searchParams.get("product");
  const admin = isAdminRequest(request);
  let records = await readFeedbackRecords();

  if (!admin) {
    records = records.filter((record) => record.status === "approved");
  }

  if (product) {
    records = records.filter((record) => record.product === product);
  }

  return NextResponse.json(records.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export async function POST(request: Request) {
  let body: { product?: unknown; sentiment?: unknown; message?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (
    typeof body.product !== "string" ||
    body.product.trim().length === 0 ||
    body.product.trim().length > 80 ||
    typeof body.message !== "string" ||
    body.message.trim().length === 0 ||
    body.message.trim().length > 500 ||
    !sentiments.includes(body.sentiment as (typeof sentiments)[number])
  ) {
    return NextResponse.json(
      { error: "Provide a name (up to 80 characters), a note (up to 500 characters), and a valid sentiment." },
      { status: 400 },
    );
  }

  const record = await createFeedbackRecord({
    product: body.product,
    sentiment: body.sentiment as (typeof sentiments)[number],
    message: body.message,
  });

  return NextResponse.json(record, { status: 201 });
}
