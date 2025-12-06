import { FormEvent, useState } from 'react';
import Navbar from '../components/Navbar';
import BackToTop from '../components/BackToTop';
import { createArticle } from '../lib/api';

export default function AdminPage() {
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [publishedAt, setPublishedAt] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!slug || !title || !summary || !body) {
      setMessage('กรอก slug, title, summary, body ให้ครบก่อนครับ');
      setStatus('error');
      return;
    }
    try {
      setStatus('saving');
      setMessage('');
      await createArticle(
        {
          slug,
          title,
          summary,
          body,
          imageUrl: imageUrl || undefined,
          videoUrl: videoUrl || undefined,
          publishedAt: publishedAt || undefined
        },
        adminSecret
      );
      setStatus('done');
      setMessage('บันทึกบทความเรียบร้อย!');
      setSlug('');
      setTitle('');
      setSummary('');
      setBody('');
      setImageUrl('');
      setVideoUrl('');
      setPublishedAt('');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage('บันทึกไม่สำเร็จ ตรวจสอบ secret หรือ slug ซ้ำ');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900">
      <Navbar />
      <div className="pt-24 pb-12 container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Admin: เพิ่มบทความใหม่</h1>
        <p className="text-gray-600 mb-6">
          ตั้งค่า API base ได้ที่ env <code className="bg-gray-100 px-2 py-1 rounded">VITE_API_URL</code> (ปัจจุบันเชื่อม{' '}
          {import.meta.env.VITE_API_URL || 'http://localhost:5000/api'})
        </p>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
              <input
                className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:border-primary"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="เช่น how-to-clean-vintage-cap"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เผยแพร่</label>
              <input
                type="datetime-local"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:border-primary"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หัวข้อ *</label>
            <input
              className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:border-primary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ชื่อบทความ"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">สรุปสั้น ๆ *</label>
            <textarea
              className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:border-primary"
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="คำโปรย"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เนื้อหาเต็ม *</label>
            <textarea
              className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:border-primary"
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="เขียนเนื้อหา SEO-friendly (ใช้บรรทัดใหม่คั่นย่อหน้า)"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รูปปก (URL)</label>
              <input
                className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:border-primary"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ลิงก์วิดีโอ</label>
              <input
                className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:border-primary"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtu.be/..."
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Secret (จาก .env backend)</label>
              <input
                className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:border-primary"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                placeholder="x-admin-secret"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-green-700 transition"
              disabled={status === 'saving'}
            >
              {status === 'saving' ? 'กำลังบันทึก...' : 'เผยแพร่บทความ'}
            </button>
          </div>
          {message && (
            <p className={`text-sm ${status === 'error' ? 'text-red-500' : 'text-green-600'}`}>{message}</p>
          )}
        </form>
      </div>
      <BackToTop />
    </div>
  );
}
