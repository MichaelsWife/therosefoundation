"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { feedbackDataSource, type FeedbackRecord, type FeedbackStatus } from "@/lib/feedback-data-source";

const statusStyles: Record<FeedbackStatus, string> = {
  pending: "status-pending",
  approved: "status-approved",
  archived: "status-archived",
};

export default function DashboardPage() {
  const router = useRouter();
  const [records, setRecords] = useState<FeedbackRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/session", { cache: "no-store" });
      const auth = (await response.json()) as { authenticated?: boolean };

      if (!auth.authenticated) {
        router.replace("/admin");
        return;
      }

      const next = await feedbackDataSource.listFeedback();
      setRecords(next);
      setError("");
    } catch {
      setError("Could not load notes. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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
      record.status === "pending"
        ? "approved"
        : record.status === "approved"
          ? "archived"
          : "pending";

    try {
      await feedbackDataSource.updateFeedback(id, { status: nextStatus });
      await loadData();
    } catch {
      setError("Could not update this note.");
    }
  }

  async function removeItem(id: string) {
    if (!window.confirm("Delete this community note? This cannot be undone.")) return;

    try {
      await feedbackDataSource.deleteFeedback(id);
      await loadData();
    } catch {
      setError("Could not delete this note.");
    }
  }

  async function signOut() {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.replace("/admin");
  }

  return (
    <main className="min-h-screen bg-[#f6f3eb] px-6 py-10 text-[#24352d] sm:px-10 lg:px-14">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 border-b border-[#e2ddd2] pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow eyebrow-small"><span className="eyebrow-dot" /> Community dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Rose Foundation overview</h1>
          </div>

          <div className="flex items-center gap-3">
            <a href="/" className="rounded-full border border-[#d7d3c8] px-4 py-2 text-sm font-medium text-[#294338]">
              Back to home
            </a>
            <button onClick={() => void signOut()} className="rounded-full bg-[#294338] px-4 py-2 text-sm font-medium text-white">
              Sign out
            </button>
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
            <button
              onClick={() => void loadData()}
              className="rounded-full bg-[#edf4ef] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#294338]"
            >
              Refresh
            </button>
          </div>

          {error ? <p role="alert" className="px-6 pt-4 text-sm text-[#b65757]">{error}</p> : null}

          {loading ? (
            <div className="p-6 text-sm text-[#69776e]">Loading notes…</div>
          ) : records.length === 0 ? (
            <div className="p-8 text-sm text-[#69776e]">No notes yet. Submissions will appear here for review.</div>
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
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id} className="border-t border-[#f0ece4] align-top">
                      <td className="px-5 py-4 font-medium text-[#24352d]">{record.product}</td>
                      <td className="max-w-md px-5 py-4 text-[#53615a]">{record.message}</td>
                      <td className="px-5 py-4"><span className={`status-pill ${statusStyles[record.status]}`}>{record.status}</span></td>
                      <td className="px-5 py-4 capitalize text-[#53615a]">{record.sentiment}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-[#53615a]">{new Date(record.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            className="rounded-full border border-[#d8d0c2] px-3 py-1.5 text-xs font-medium text-[#294338]"
                            type="button"
                            onClick={() => void toggleStatus(record.id)}
                          >
                            {record.status === "pending" ? "Approve" : record.status === "approved" ? "Archive" : "Reopen"}
                          </button>
                          <button
                            className="rounded-full bg-[#b65757] px-3 py-1.5 text-xs font-medium text-white"
                            type="button"
                            onClick={() => void removeItem(record.id)}
                          >
                            Delete
                          </button>
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
