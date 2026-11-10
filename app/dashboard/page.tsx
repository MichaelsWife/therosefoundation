"use client";

import { useEffect, useMemo, useState } from "react";
import { feedbackDataSource, type FeedbackRecord, type FeedbackStatus } from "@/lib/feedback-data-source";

const statusStyles: Record<FeedbackStatus, string> = {
  pending: "status-pending",
  approved: "status-approved",
  archived: "status-archived",
};

export default function DashboardPage() {
  const [records, setRecords] = useState<FeedbackRecord[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const next = await feedbackDataSource.listFeedback();
    setRecords(next);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const summary = useMemo(() => {
    const total = records.length;
    const positive = records.filter((record) => record.sentiment === "positive").length;
    const pending = records.filter((record) => record.status === "pending").length;
    const approved = records.filter((record) => record.status === "approved").length;
    return { total, positive, pending, approved };
  }, [records]);

  async function toggleStatus(id: string) {
    const record = records.find((item) => item.id === id);
    if (!record) return;

    const nextStatus: FeedbackStatus =
      record.status === "pending" ? "approved" : record.status === "approved" ? "archived" : "pending";

    await feedbackDataSource.updateFeedback(id, { status: nextStatus });
    await loadData();
  }

  async function removeItem(id: string) {
    await feedbackDataSource.deleteFeedback(id);
    await loadData();
  }

  return (
    <main className="min-h-screen bg-[#f6f3eb] px-6 py-10 text-[#24352d] sm:px-10 lg:px-14">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 border-b border-[#e2ddd2] pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow eyebrow-small"><span className="eyebrow-dot"/> Community dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Rose Foundation overview</h1>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="rounded-full border border-[#d7d3c8] px-4 py-2 text-sm font-medium text-[#294338]">Back to home</a>
            <a href="/admin" className="rounded-full bg-[#294338] px-4 py-2 text-sm font-medium text-white">Admin</a>
          </div>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="metric-card"><span>Total notes</span><strong>{summary.total}</strong><small>All submitted kindness records</small></div>
          <div className="metric-card"><span>Positive</span><strong>{summary.positive}</strong><small>Encouraging moments</small></div>
          <div className="metric-card"><span>Pending</span><strong>{summary.pending}</strong><small>Awaiting review</small></div>
          <div className="metric-card"><span>Approved</span><strong>{summary.approved}</strong><small>Shared with the community</small></div>
        </section>

        <section className="mt-10 overflow-hidden rounded-[28px] border border-[#e5e0d8] bg-white shadow-[0_25px_80px_rgba(36,53,45,0.06)]">
          <div className="flex items-center justify-between border-b border-[#ece7df] px-5 py-4 sm:px-6">
            <h2 className="text-lg font-semibold tracking-[-0.04em]">Recent community notes</h2>
            <span className="rounded-full bg-[#edf4ef] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#294338]">Live</span>
          </div>

          {loading ? (
            <div className="p-6 text-sm text-[#69776e]">Loading notes…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[#fbfaf7] text-[#69776e]">
                  <tr>
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Note</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Mood</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id} className="border-t border-[#f0ece4] align-top">
                      <td className="px-5 py-4 font-medium text-[#24352d]">{record.product}</td>
                      <td className="max-w-md px-5 py-4 text-[#53615a]">{record.message}</td>
                      <td className="px-5 py-4"><span className={`status-pill ${statusStyles[record.status]}`}>{record.status}</span></td>
                      <td className="px-5 py-4 capitalize text-[#53615a]">{record.sentiment}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-[#53615a]">{new Date(record.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button className="rounded-full border border-[#d8d0c2] px-3 py-1.5 text-xs font-medium text-[#294338]" type="button" onClick={() => toggleStatus(record.id)}>Cycle</button>
                          <button className="rounded-full bg-[#b65757] px-3 py-1.5 text-xs font-medium text-white" type="button" onClick={() => removeItem(record.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
