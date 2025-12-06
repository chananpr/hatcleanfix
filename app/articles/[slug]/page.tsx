/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackToTop } from "@/components/BackToTop";
import { Navbar } from "@/components/Navbar";
import { readContent } from "@/lib/storage";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Props = { params: { slug: string } };

async function getArticle(slug: string) {
  const { articles } = await readContent();
  return articles.find((item) => item.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle(params.slug);
  if (!article) return {};

  const title = `${article.title} | Hat Fix & Clean`;
  const description = article.summary;
  const image =
    article.imageUrl ||
    "https://images.unsplash.com/photo-1533827432537-70133748f5c8?q=80&w=1200&auto=format&fit=crop";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [image],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const article = await getArticle(params.slug);
  if (!article) return notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    datePublished: article.publishedAt,
    image: article.imageUrl,
    author: {
      "@type": "Organization",
      name: "Hat Fix & Clean",
    },
  };

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
            href="/"
            className="mt-10 inline-flex items-center gap-2 text-primary hover:text-green-700"
          >
            ← กลับหน้าหลัก
          </Link>
        </article>
      </main>
      <BackToTop />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
