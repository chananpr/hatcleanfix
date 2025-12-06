"use client";

import type { InputHTMLAttributes } from "react";
import { useEffect, useState } from "react";
import type { Article, QueueEntry } from "@/lib/types";

const defaultQueue = {
  customer: "",
  quantity: "",
  deadline: "",
  status: "กำลังดำเนินการ",
  notes: "",
};

const defaultArticle = {
  title: "",
  summary: "",
  body: "",
  imageUrl: "",
  videoUrl: "",
};

type ContentState = {
  queues: QueueEntry[];
  articles: Article[];
};

export function AdminClient() {
  const [adminKey, setAdminKey] = useState("");
  const [queueForm, setQueueForm] = useState(defaultQueue);
  const [articleForm, setArticleForm] = useState(defaultArticle);
  const [content, setContent] = useState<ContentState>({ queues: [], articles: [] });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem("hatfix-admin-key");
    if (savedKey) setAdminKey(savedKey);
    fetchContent();
  }, []);

  async function fetchContent() {
    try {
      const res = await fetch("/api/content", { cache: "no-store" });
      if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
      const data = (await res.json()) as ContentState;
      setContent(data);
    } catch (err) {
      console.error(err);
      setError("ดึงข้อมูลไม่สำเร็จ");
    }
  }

  function persistKey(value: string) {
    setAdminKey(value);
    localStorage.setItem("hatfix-admin-key", value);
  }

  async function handleQueueSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/queues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminKey}`,
        },
        body: JSON.stringify({
          ...queueForm,
          quantity: Number(queueForm.quantity),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "บันทึกคิวไม่สำเร็จ");

      setStatus("เพิ่มคิวเรียบร้อย");
      setQueueForm(defaultQueue);
      fetchContent();
    } catch (err) {
      const message = err instanceof Error ? err.message : "บันทึกคิวไม่สำเร็จ";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleArticleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminKey}`,
        },
        body: JSON.stringify(articleForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "บันทึกบทความไม่สำเร็จ");

      setStatus("เพิ่มบทความสำเร็จ");
      setArticleForm(defaultArticle);
      fetchContent();
    } catch (err) {
      const message = err instanceof Error ? err.message : "บันทึกบทความไม่สำเร็จ";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Admin</p>
            <h1 className="text-3xl font-bold text-gray-900">หลังบ้านเพิ่มคิว & บทความ</h1>
            <p className="text-sm text-gray-500">หน้านี้ไม่ถูกทำดัชนี (noindex)</p>
          </div>
          <input
            type="password"
            value={adminKey}
            onChange={(e) => persistKey(e.target.value)}
            placeholder="ADMIN_KEY"
            className="w-full max-w-xs rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none"
          />
        </div>

        {status ? <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-green-700">✅ {status}</div> : null}
        {error ? <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-red-700">⚠️ {error}</div> : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <form onSubmit={handleQueueSubmit} className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">เพิ่มคิวงาน</h2>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Queue</span>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="ชื่อลูกค้า/โปรเจค"
                required
                value={queueForm.customer}
                onChange={(e) => setQueueForm({ ...queueForm, customer: e.target.value })}
              />
              <Input
                label="จำนวนใบ"
                type="number"
                required
                value={queueForm.quantity}
                onChange={(e) => setQueueForm({ ...queueForm, quantity: e.target.value })}
              />
              <Input
                label="กำหนดส่ง"
                type="date"
                value={queueForm.deadline}
                onChange={(e) => setQueueForm({ ...queueForm, deadline: e.target.value })}
              />
              <Input
                label="สถานะ"
                value={queueForm.status}
                onChange={(e) => setQueueForm({ ...queueForm, status: e.target.value })}
              />
            </div>
            <label className="mt-4 block text-sm font-medium text-gray-700">
              หมายเหตุ
              <textarea
                className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none"
                value={queueForm.notes}
                onChange={(e) => setQueueForm({ ...queueForm, notes: e.target.value })}
                rows={3}
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-lg bg-primary px-4 py-3 text-center text-white font-bold shadow-sm transition hover:bg-green-700 disabled:opacity-60"
            >
              {loading ? "กำลังบันทึก..." : "บันทึกคิว"}
            </button>
          </form>

          <form onSubmit={handleArticleSubmit} className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">เพิ่มบทความ</h2>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Article</span>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4">
              <Input
                label="หัวข้อ"
                required
                value={articleForm.title}
                onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
              />
              <Input
                label="สรุปสั้น ๆ"
                required
                value={articleForm.summary}
                onChange={(e) => setArticleForm({ ...articleForm, summary: e.target.value })}
              />
              <label className="block text-sm font-medium text-gray-700">
                เนื้อหา
                <textarea
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none"
                  value={articleForm.body}
                  onChange={(e) => setArticleForm({ ...articleForm, body: e.target.value })}
                  rows={4}
                  required
                />
              </label>
              <Input
                label="รูปภาพประกอบ (URL)"
                value={articleForm.imageUrl}
                onChange={(e) => setArticleForm({ ...articleForm, imageUrl: e.target.value })}
              />
              <Input
                label="วิดีโอ (YouTube embed URL)"
                value={articleForm.videoUrl}
                onChange={(e) => setArticleForm({ ...articleForm, videoUrl: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-lg bg-secondary px-4 py-3 text-center text-white font-bold shadow-sm transition hover:bg-gray-800 disabled:opacity-60"
            >
              {loading ? "กำลังบันทึก..." : "บันทึกบทความ"}
            </button>
          </form>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">คิวล่าสุด</h3>
              <button
                className="text-sm text-primary hover:underline"
                onClick={fetchContent}
                type="button"
              >
                รีเฟรช
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {content.queues.map((queue) => (
                <div key={queue.id} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-gray-800">{queue.customer}</span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                      {queue.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{queue.quantity} ใบ • {queue.deadline || "-"}</p>
                  {queue.notes ? <p className="text-xs text-gray-700">{queue.notes}</p> : null}
                </div>
              ))}
              {!content.queues.length ? <p className="text-sm text-gray-500">ยังไม่มีคิว</p> : null}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">บทความล่าสุด</h3>
              <button
                className="text-sm text-primary hover:underline"
                onClick={fetchContent}
                type="button"
              >
                รีเฟรช
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {content.articles.map((article) => (
                <div key={article.id} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                  <p className="text-sm font-semibold text-gray-800">{article.title}</p>
                  <p className="text-xs text-gray-600">{article.summary}</p>
                  <p className="text-[11px] text-gray-500">เผยแพร่ {new Date(article.publishedAt).toLocaleDateString("th-TH")}</p>
                </div>
              ))}
              {!content.articles.length ? <p className="text-sm text-gray-500">ยังไม่มีบทความ</p> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label: string };

function Input({ label, ...props }: InputProps) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      <input
        className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none"
        {...props}
      />
    </label>
  );
}
