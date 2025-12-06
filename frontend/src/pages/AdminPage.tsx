import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Navbar from '../components/Navbar';
import BackToTop from '../components/BackToTop';
import { createArticle } from '../lib/api';

export default function AdminPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [loginSecret, setLoginSecret] = useState('');

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

  useEffect(() => {
    const saved = localStorage.getItem('hatfix_admin_secret');
    if (saved) {
      setLoginSecret(saved);
      setAdminSecret(saved);
      setIsAuthed(true);
    }
  }, []);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (!loginSecret.trim()) return;
    localStorage.setItem('hatfix_admin_secret', loginSecret.trim());
    setAdminSecret(loginSecret.trim());
    setIsAuthed(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('hatfix_admin_secret');
    setIsAuthed(false);
    setLoginSecret('');
    setAdminSecret('');
  };

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
        <div className="flex items-center justify-between gap-4 mb-2">
          <h1 className="text-3xl font-bold">Admin: เพิ่มบทความใหม่</h1>
          {isAuthed && (
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:text-red-600 underline"
              type="button"
            >
              ออกจากระบบ
            </button>
          )}
        </div>
        <p className="text-gray-600 mb-6">
          ตั้งค่า API base ได้ที่ env <code className="bg-gray-100 px-2 py-1 rounded">VITE_API_URL</code> (ปัจจุบันเชื่อม{' '}
          {import.meta.env.VITE_API_URL || 'http://localhost:5000/api'})
        </p>

        {!isAuthed && (
          <form
            onSubmit={handleLogin}
            className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 space-y-4 max-w-xl"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Secret</label>
              <input
                className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:border-primary"
                value={loginSecret}
                onChange={(e) => setLoginSecret(e.target.value)}
                placeholder="ใส่รหัส secret ที่ backend"
              />
              <p className="text-xs text-gray-500 mt-2">รหัสนี้ถูกเก็บใน browser (localStorage) เท่านั้น</p>
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-green-700 transition"
            >
              เข้าสู่ระบบ
            </button>
          </form>
        )}

        {isAuthed && (
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
                onChange={(e) => {
                  setAdminSecret(e.target.value);
                  localStorage.setItem('hatfix_admin_secret', e.target.value);
                }}
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
        )}
      </div>
      <BackToTop />
    </div>
  );
}
