import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Navbar from '../components/Navbar';
import BackToTop from '../components/BackToTop';
import { createArticle, deleteArticle, fetchArticles, login, updateArticle, uploadMedia } from '../lib/api';
import type { Article } from '../types';

const makeSlug = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9ก-๙\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export default function AdminPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [activeTab, setActiveTab] = useState<'article' | 'portfolio' | 'review'>('article');
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<'article' | 'portfolio' | 'review'>('article');
  const [imageUrl, setImageUrl] = useState(''); // fallback manual URL ifต้องการ
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [galleryUrls, setGalleryUrls] = useState<string[]>(['']);
  const [videoUrl, setVideoUrl] = useState('');
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [publishedAt, setPublishedAt] = useState('');
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [loginMessage, setLoginMessage] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<'all' | 'article' | 'portfolio' | 'review'>('all');

  useEffect(() => {
    const savedToken = localStorage.getItem('hatfix_admin_token');
    const savedEmail = localStorage.getItem('hatfix_admin_email');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthed(true);
      fetchArticles()
        .then(setArticles)
        .catch(() => {});
    }
    if (savedEmail) setLoginEmail(savedEmail);
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginMessage('กรอกอีเมลหรือชื่อผู้ใช้และรหัสผ่าน');
      return;
    }
    try {
      const { token: tkn, email } = await login(loginEmail, loginPassword);
      localStorage.setItem('hatfix_admin_token', tkn);
      localStorage.setItem('hatfix_admin_email', email);
      setToken(tkn);
      setIsAuthed(true);
      setLoginMessage('');
      setLoginPassword('');
      fetchArticles()
        .then(setArticles)
        .catch(() => {});
    } catch (err) {
      console.error(err);
      setLoginMessage('เข้าสู่ระบบไม่สำเร็จ ตรวจสอบอีเมล/รหัสผ่าน');
    }
  };

  const resetForm = () => {
    setSlug('');
    setTitle('');
    setSummary('');
    setBody('');
    setCategory(activeTab);
    setImageUrl('');
    setMainImageUrl('');
    setGalleryUrls(['']);
    setVideoUrl('');
    setMainFile(null);
    setGalleryFiles([]);
    setVideoFile(null);
    setPublishedAt('');
    setEditingId(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('hatfix_admin_token');
    localStorage.removeItem('hatfix_admin_email');
    setIsAuthed(false);
    setLoginEmail('');
    setLoginPassword('');
    setToken('');
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

      let uploadedMain = mainImageUrl;
      let uploadedGallery: string[] = galleryUrls.filter((u) => u.trim());
      let uploadedVideo = videoUrl;

      const hasFiles = mainFile || galleryFiles.length || videoFile;
      if (hasFiles) {
        const uploadRes = await uploadMedia(
          { main: mainFile || undefined, gallery: galleryFiles, video: videoFile || undefined },
          token
        );
        if (uploadRes.main) uploadedMain = uploadRes.main.url;
        if (uploadRes.gallery?.length) uploadedGallery = uploadRes.gallery.map((g) => g.url);
        if (uploadRes.video) uploadedVideo = uploadRes.video.url;
      }

      const payload = {
        slug,
        title,
        summary,
        body,
        category,
        mainImageUrl: uploadedMain || imageUrl || uploadedGallery.find(Boolean) || undefined,
        galleryUrls: uploadedGallery,
        imageUrl: uploadedMain || imageUrl || undefined,
        videoUrl: uploadedVideo || undefined,
        publishedAt: publishedAt || undefined
      };

      if (editingId) {
        const updated = await updateArticle(editingId, payload, token);
        setArticles((prev) => prev.map((a) => (a.id === editingId ? updated : a)));
        setMessage('อัปเดตบทความเรียบร้อย!');
      } else {
        const created = await createArticle(payload as any, token);
        setArticles((prev) => [created, ...prev]);
        setMessage('บันทึกบทความเรียบร้อย!');
      }
      setStatus('done');
      resetForm();
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
              <label className="block text-sm font-medium text-gray-700 mb-1">อีเมลหรือชื่อผู้ใช้</label>
              <input
                className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:border-primary"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
              <input
                type="password"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:border-primary"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="********"
              />
            </div>
            {loginMessage && <p className="text-sm text-red-500">{loginMessage}</p>}
            <button
              type="submit"
              className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-green-700 transition"
            >
              เข้าสู่ระบบ
            </button>
          </form>
        )}

        {isAuthed && (
        <div className="space-y-6">
          <div className="flex gap-2">
            {(['article', 'portfolio', 'review'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                className={`px-4 py-2 rounded-full border ${
                  activeTab === tab ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-700'
                }`}
                onClick={() => {
                  setActiveTab(tab);
                  setCategory(tab);
                  setFilterCategory(tab);
                  setEditingId(null);
                  resetForm();
                }}
              >
                {tab === 'article' ? 'บทความ' : tab === 'portfolio' ? 'ผลงานของเรา' : 'รีวิวจากลูกค้า'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
              <input
                className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:border-primary"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="เช่น how-to-clean-vintage-cap"
              />
              <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                <span>ใช้ a-z, ตัวเลข, ขีดกลาง</span>
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => {
                    if (title) setSlug(makeSlug(title));
                  }}
                >
                  เติมจากหัวข้อ
                </button>
              </div>
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
            <p className="text-xs text-gray-500 mt-1">แนะนำให้มีคีย์เวิร์ดหลักสำหรับ SEO</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หมวด *</label>
            <select
              className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:border-primary bg-white"
              value={category}
              onChange={(e) => {
                const val = e.target.value as 'article' | 'portfolio' | 'review';
                setCategory(val);
                setActiveTab(val);
              }}
            >
              <option value="article">บทความ</option>
              <option value="portfolio">ผลงานของเรา</option>
              <option value="review">รีวิวจากลูกค้า</option>
            </select>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">รูปหลัก (อัปโหลดไฟล์)</label>
              <input type="file" accept="image/*" onChange={(e) => setMainFile(e.target.files?.[0] || null)} />
              <p className="text-xs text-gray-500 mt-1">หรือใส่ลิงก์ภาพหลัก</p>
              <input
                className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:border-primary"
                value={mainImageUrl}
                onChange={(e) => setMainImageUrl(e.target.value)}
                placeholder="https://... (ภาพหลัก)"
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
              <p className="text-xs text-gray-500 mt-1">หรืออัปโหลดไฟล์วิดีโอ</p>
              <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">แกลเลอรี่รูป (เลือก main ได้จากรายการนี้หรือช่องด้านบน)</label>
              <button
                type="button"
                onClick={() => setGalleryUrls([...galleryUrls, ''])}
                className="text-sm text-primary hover:underline"
              >
                + เพิ่มรูป
              </button>
            </div>
            <div className="mb-2">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setGalleryFiles(Array.from(e.target.files || []))}
              />
              <p className="text-xs text-gray-500">อัปโหลดหลายไฟล์ได้ หรือกรอกลิงก์ด้านล่างเพิ่มเติม</p>
            </div>
            <div className="space-y-2">
              {galleryUrls.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    className="flex-1 rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:border-primary"
                    value={url}
                    onChange={(e) => {
                      const next = [...galleryUrls];
                      next[idx] = e.target.value;
                      setGalleryUrls(next);
                    }}
                    placeholder={`รูปที่ ${idx + 1} (https://...)`}
                  />
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="radio"
                      name="mainImage"
                      checked={(mainImageUrl || '') === url}
                      onChange={() => setMainImageUrl(url)}
                    />
                    main
                  </label>
                  <button
                    type="button"
                    onClick={() => setGalleryUrls(galleryUrls.filter((_, i) => i !== idx))}
                    className="text-xs text-red-500 hover:underline"
                  >
                    ลบ
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <p className="text-sm text-gray-600">เข้าสู่ระบบแล้ว</p>
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-green-700 transition"
              disabled={status === 'saving'}
            >
              {status === 'saving' ? 'กำลังบันทึก...' : editingId ? 'อัปเดตบทความ' : 'เผยแพร่บทความ'}
            </button>
          </div>
          {message && (
            <p className={`text-sm ${status === 'error' ? 'text-red-500' : 'text-green-600'}`}>{message}</p>
          )}
          </form>
        </div>
        )}

        {isAuthed && (
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">รายการบทความ/ผลงาน/รีวิว</h2>
              <div className="flex gap-2 text-sm">
                {['all', 'article', 'portfolio', 'review'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFilterCategory(c as any)}
                    className={`px-3 py-1 rounded-full border ${
                      filterCategory === c ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    {c === 'all' ? 'ทั้งหมด' : c === 'article' ? 'บทความ' : c === 'portfolio' ? 'ผลงาน' : 'รีวิว'}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3 max-h-[420px] overflow-auto">
              {articles
                .filter((a) => filterCategory === 'all' || (a.category || 'article') === filterCategory)
                .map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-xl px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">
                        {new Date(item.publishedAt).toLocaleDateString('th-TH')} • {item.category || 'article'}
                      </p>
                      <p className="font-semibold text-gray-800 truncate">{item.title}</p>
                      <p className="text-sm text-gray-600 line-clamp-1">{item.summary}</p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <button
                        type="button"
                        className="text-sm text-primary hover:underline"
                        onClick={() => {
                          setEditingId(item.id);
                          setSlug(item.slug);
                          setTitle(item.title);
                          setSummary(item.summary);
                          setBody(item.body);
                          setCategory((item.category as any) || 'article');
                          setMainImageUrl(item.mainImageUrl || '');
                          setGalleryUrls(item.galleryUrls || ['']);
                          setVideoUrl(item.videoUrl || '');
                          setPublishedAt(item.publishedAt ? item.publishedAt.slice(0, 16) : '');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        แก้ไข
                      </button>
                      <button
                        type="button"
                        className="text-sm text-red-500 hover:underline"
                        onClick={async () => {
                          if (!token) return;
                          if (!confirm('ลบบทความนี้?')) return;
                          await deleteArticle(item.id, token);
                          setArticles((prev) => prev.filter((a) => a.id !== item.id));
                          if (editingId === item.id) setEditingId(null);
                        }}
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
      <BackToTop />
    </div>
  );
}
