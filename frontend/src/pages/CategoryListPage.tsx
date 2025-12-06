import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BackToTop from '../components/BackToTop';
import { fetchArticles } from '../lib/api';
import type { Article } from '../types';

const titles: Record<string, string> = {
  portfolio: 'ผลงานของเรา',
  review: 'รีวิวจากลูกค้า',
  article: 'บทความ'
};

export default function CategoryListPage() {
  const { category } = useParams();
  const location = useLocation();
  const pathCat =
    location.pathname.includes('portfolio') ? 'portfolio' : location.pathname.includes('reviews') ? 'review' : 'article';
  const cat = (category as 'portfolio' | 'review' | 'article') || (pathCat as 'portfolio' | 'review' | 'article');
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchArticles()
      .then((data) => setItems(data.filter((a) => (a.category || 'article') === cat)))
      .catch(() => setError('โหลดรายการไม่สำเร็จ'))
      .finally(() => setLoading(false));
  }, [cat]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="pt-24 pb-12 container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{titles[cat] || 'รายการ'}</h1>
          <Link to="/" className="text-primary text-sm font-semibold hover:text-green-700">
            กลับหน้าแรก
          </Link>
        </div>
        {loading && <p className="text-gray-500">กำลังโหลด...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {!loading &&
            !error &&
            items.map((item) => (
              <Link
                key={item.slug}
                to={`/articles/${item.slug}`}
                className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-lg transition flex flex-col"
              >
                {(item.mainImageUrl || item.imageUrl) && (
                  <img
                    src={item.mainImageUrl || item.imageUrl || ''}
                    alt={item.title}
                    className="w-full h-44 object-cover rounded-lg mb-4"
                  />
                )}
                <span className="text-xs uppercase tracking-wide text-primary font-semibold mb-2">
                  {new Date(item.publishedAt).toLocaleDateString('th-TH')}
                </span>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600 flex-grow line-clamp-3">{item.summary}</p>
                <span className="mt-4 inline-flex items-center text-sm text-primary font-semibold">
                  อ่านต่อ <i className="fa-solid fa-arrow-right ml-2" />
                </span>
              </Link>
            ))}
        </div>
      </div>
      <BackToTop />
    </div>
  );
}
