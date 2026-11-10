import { NextResponse } from "next/server";
import { deleteFeedbackRecord, readFeedbackRecords, updateFeedbackRecord } from "@/lib/feedback-store";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json()) as Partial<{
    product: string;
    sentiment: "positive" | "neutral" | "negative";
    message: string;
    status: "pending" | "approved" | "archived";
  }>;

  const current = await readFeedbackRecords();
  const found = current.find((record) => record.id === id);
  if (!found) {
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }

  const record = await updateFeedbackRecord(id, body);
  return NextResponse.json(record);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await deleteFeedbackRecord(id);
  return NextResponse.json({ success: true });
}
