import { useEffect, useState } from "react";
import { createArticle, createQueue, fetchContent } from "../lib/api";
import type { Article, QueueEntry } from "../types";

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

export function AdminPage() {
  const [queueForm, setQueueForm] = useState(defaultQueue);
  const [articleForm, setArticleForm] = useState(defaultArticle);
  const [content, setContent] = useState<ContentState>({ queues: [], articles: [] });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchContent().then(setContent).catch(() => setError("ดึงข้อมูลไม่สำเร็จ"));
  }, []);

  async function handleQueueSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setError(null);
    setLoading(true);
    try {
      const queue = await createQueue({
        customer: queueForm.customer,
        quantity: Number(queueForm.quantity),
        deadline: queueForm.deadline || undefined,
        status: queueForm.status,
        notes: queueForm.notes,
      });
      setStatus("เพิ่มคิวเรียบร้อย");
      setQueueForm(defaultQueue);
      setContent((prev) => ({ ...prev, queues: [queue, ...prev.queues] }));
    } catch (err: any) {
      setError(err?.message || "บันทึกคิวไม่สำเร็จ");
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
      const article = await createArticle({
        title: articleForm.title,
        summary: articleForm.summary,
        body: articleForm.body,
        imageUrl: articleForm.imageUrl,
        videoUrl: articleForm.videoUrl,
      });
      setStatus("เพิ่มบทความสำเร็จ");
      setArticleForm(defaultArticle);
      setContent((prev) => ({ ...prev, articles: [article, ...prev.articles] }));
    } catch (err: any) {
      setError(err?.message || "บันทึกบทความไม่สำเร็จ");
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
            <p className="text-sm text-gray-500">กรอกฟอร์มแล้วกดบันทึก (ต้องตั้งค่า VITE_ADMIN_KEY ใน frontend และ backend ADMIN_KEY ให้ตรงกัน)</p>
          </div>
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
                onClick={() => fetchContent().then(setContent).catch(() => setError("ดึงข้อมูลไม่สำเร็จ"))}
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
                onClick={() => fetchContent().then(setContent).catch(() => setError("ดึงข้อมูลไม่สำเร็จ"))}
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

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
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
