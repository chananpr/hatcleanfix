/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { BackToTop } from "../components/BackToTop";
import { Navbar } from "../components/Navbar";
import { fetchArticle } from "../lib/api";
import type { Article } from "../types";

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetchArticle(slug)
      .then(setArticle)
      .catch((err) => setError(err.message || "โหลดบทความไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-800">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="mx-auto max-w-3xl px-4">กำลังโหลดบทความ...</div>
        </main>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-800">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="mx-auto max-w-3xl px-4 text-red-700">
            {error || "ไม่พบบทความ"}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />
      <main className="pt-24 pb-16">
        <article className="mx-auto max-w-3xl px-4">
          <p className="text-sm font-semibold text-primary">บทความ</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">{article.title}</h1>
          <p className="mt-2 text-sm text-gray-500">
            เผยแพร่ {new Date(article.publishedAt).toLocaleDateString("th-TH")}
          </p>

          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="mt-6 w-full rounded-xl object-cover shadow-sm"
            />
          ) : null}

          <div className="prose prose-lg mt-6 whitespace-pre-line text-gray-800">
            {article.body}
          </div>

          {article.videoUrl ? (
            <div className="mt-6 overflow-hidden rounded-xl">
              <iframe
                src={article.videoUrl}
                title={article.title}
                className="h-64 w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : null}

          <Link
            to="/"
            className="mt-10 inline-flex items-center gap-2 text-primary hover:text-green-700"
          >
            ← กลับหน้าหลัก
          </Link>
        </article>
      </main>
      <BackToTop />
    </div>
  );
}
