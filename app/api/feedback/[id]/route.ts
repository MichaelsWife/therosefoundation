import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { deleteFeedbackRecord, readFeedbackRecords, updateFeedbackRecord } from "@/lib/feedback-store";

const statuses = ["pending", "approved", "archived"] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const updates: {
    product?: string;
    sentiment?: "positive" | "neutral" | "negative";
    message?: string;
    status?: "pending" | "approved" | "archived";
  } = {};

  if ("status" in body) {
    if (!statuses.includes(body.status as (typeof statuses)[number])) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    updates.status = body.status as (typeof statuses)[number];
  }

  if ("product" in body) {
    if (typeof body.product !== "string" || !body.product.trim() || body.product.length > 80) {
      return NextResponse.json({ error: "Invalid name." }, { status: 400 });
    }
    updates.product = body.product.trim();
  }

  if ("message" in body) {
    if (typeof body.message !== "string" || !body.message.trim() || body.message.length > 500) {
      return NextResponse.json({ error: "Invalid note." }, { status: 400 });
    }
    updates.message = body.message.trim();
  }

  if ("sentiment" in body) {
    if (body.sentiment !== "positive" && body.sentiment !== "neutral" && body.sentiment !== "negative") {
      return NextResponse.json({ error: "Invalid sentiment." }, { status: 400 });
    }
    updates.sentiment = body.sentiment;
  }

  const { id } = await params;
  const existing = (await readFeedbackRecords()).find((record) => record.id === id);
  if (!existing) {
    return NextResponse.json({ error: "Record not found." }, { status: 404 });
  }

  const updated = await updateFeedbackRecord(id, updates);
  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  }

  const { id } = await params;
  const exists = (await readFeedbackRecords()).some((record) => record.id === id);
  if (!exists) {
    return NextResponse.json({ error: "Record not found." }, { status: 404 });
  }

  await deleteFeedbackRecord(id);
  return NextResponse.json({ success: true });
}
