import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BackToTop from '../components/BackToTop';
import { fetchArticle } from '../lib/api';
import { Article } from '../types';

export default function ArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetchArticle(slug)
      .then(setArticle)
      .catch(() => setError('ไม่พบบทความนี้'))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900">
      <Navbar />
      <div className="pt-24 pb-12 container mx-auto px-4 max-w-4xl">
        <div className="mb-6 text-sm text-gray-500 flex items-center gap-2">
          <Link to="/" className="hover:text-primary">
            หน้าแรก
          </Link>
          <span>/</span>
          <span>บทความ</span>
        </div>

        {loading && <p className="text-gray-500">กำลังโหลด...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {article && (
          <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
            <p className="text-sm text-primary font-semibold mb-2">
              {new Date(article.publishedAt).toLocaleDateString('th-TH')}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{article.title}</h1>
            <p className="text-lg text-gray-700 mb-6">{article.summary}</p>

            {article.imageUrl && (
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full rounded-xl mb-6 object-cover"
              />
            )}

            <div className="space-y-4 text-gray-700 leading-relaxed">
              {article.body.split('\n').map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>

            {article.videoUrl && (
              <div className="mt-8">
                <a
                  href={article.videoUrl}
                  target="_blank"
                  className="inline-flex items-center gap-2 text-primary font-semibold"
                >
                  <i className="fa-solid fa-video" />
                  ดูวิดีโอประกอบ
                </a>
              </div>
            )}

            <div className="mt-10 p-5 bg-green-50 rounded-xl border border-green-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="font-bold text-gray-900">อยากให้เราดูแลหมวกล็อตต่อไป?</p>
                <p className="text-gray-700">จองคิวหรือส่งรายละเอียดงานผ่านไลน์ได้ทันที</p>
              </div>
              <a
                href="https://lin.ee/84zbaJk"
                target="_blank"
                className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition inline-flex items-center gap-2"
              >
                <i className="fa-brands fa-line" />
                แอดไลน์จองคิว
              </a>
            </div>
          </article>
        )}
      </div>
      <BackToTop />
    </div>
  );
}
