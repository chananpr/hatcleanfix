/* eslint-disable @next/next/no-img-element */
import { BackToTop } from "@/components/BackToTop";
import { Navbar } from "@/components/Navbar";
import { readContent } from "@/lib/storage";
import type { Article, QueueEntry } from "@/lib/types";

const LINE_URL = "https://lin.ee/84zbaJk";
const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61584389500744";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { articles, queues } = await readContent();

  const faqItems: { question: string; answer: string }[] = [
    {
      question: "รับงานด่วนได้ไหม ใช้เวลากี่วัน?",
      answer: "รับงานด่วนได้ แจ้งจำนวนใบและวันต้องการใช้งาน เราจัดคิวและส่งกลับให้ทันรอบไลฟ์ ส่วนใหญ่ 2-4 วันทำการขึ้นกับจำนวน",
    },
    {
      question: "คิดราคายังไง ถ้าเหมาเยอะลดได้ไหม?",
      answer: "คิดตามจำนวนใบ เหมายิ่งเยอะราคายิ่งถูก (เริ่ม 14 บาท/ใบ สำหรับ 500 ใบขึ้นไป) งานแก้ทรงหนักหรือแบรนด์พิเศษประเมินเพิ่มจากรูปได้",
    },
    {
      question: "ส่งหมวกมายังไง ต้องแยกสีไหม?",
      answer: "แยกโทนสีและทรงใส่ถุง เพื่อลดสีตก/กดทับทรง เขียนชื่อร้าน เบอร์โทร ที่อยู่ส่งกลับ และจำนวนด่วนไว้หน้ากล่อง",
    },
    {
      question: "แพ็คส่งกลับแบบไหน?",
      answer: "แพ็คถุงใส แยกล็อตเป็นระเบียบ ส่งขนส่งเอกชน/รถของร้าน (ตามเงื่อนไข)",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        name: "Hat Fix & Clean",
        description:
          "เพื่อนคู่คิดพ่อค้าหมวก รับเหมาซัก-จัดทรงหมวกมือสอง งานด่วน งานเหมา งานคุณภาพ",
        areaServed: "Thailand",
        url: LINE_URL,
        telephone: "084-554-0425",
      },
      {
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />
      <main className="pt-20">
        <HeroSection />
        <PainPointsSection />
        <ProcessSection />
        <PricingSection />
        <CapacitySection />
        <PortfolioSection />
        <ArticlesSection articles={articles} />
        <QueueSection queues={queues} />
        <FAQSection items={faqItems} />
      </main>
      <Footer />
      <BackToTop />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}

function HeroSection() {
  return (
    <header className="relative isolate flex h-[650px] items-center justify-center overflow-hidden bg-secondary text-white">
      <img
        src="https://images.unsplash.com/photo-1575909812264-69c058c42a22?q=80&w=2070&auto=format&fit=crop"
        alt="กองหมวกมือสอง"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/30" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 text-center md:flex-row md:items-center md:text-left">
        <div className="md:w-2/3">
          <div className="inline-block rounded-full bg-primary/90 px-4 py-1 text-sm font-semibold shadow-lg backdrop-blur-sm">
            ✨ เปลี่ยนหมวกเน่าจากกระสอบ ให้เป็นหมวกเทพหลักพัน
          </div>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl lg:text-6xl">
            รับเหมาซัก-จัดทรง <span className="text-green-300">หมวกมือสอง</span>
            <br />
            เริ่มต้นเพียง <span className="text-6xl text-yellow-400 md:text-7xl">14</span> บาท
          </h1>
          <p className="mt-4 text-lg text-gray-200 md:text-xl">
            บริการมืออาชีพสำหรับพ่อค้าแม่ค้า แก้ทรงหมวกยับจากกระสอบให้สวยกริบ ประหยัดเวลาเตรียมของ
            ทำรอบขายได้ไวขึ้น รับงานเร่งด่วนพร้อมส่งทั่วประเทศ
          </p>
          <div className="mt-6 flex flex-col items-center gap-4 md:flex-row md:items-start">
            <a
              href="#pricing"
              className="rounded-lg bg-yellow-500 px-8 py-4 text-lg font-bold text-gray-900 shadow-lg transition hover:scale-105 hover:bg-yellow-600"
            >
              ดูตารางราคาเหมา
            </a>
            <a
              href={LINE_URL}
              target="_blank"
              className="rounded-lg border-2 border-white px-8 py-4 text-lg font-bold text-white transition hover:bg-white/10"
            >
              สอบถามคิวงาน
            </a>
          </div>
        </div>

        <div className="hidden md:block md:w-1/3">
          <div className="rotate-3 rounded-2xl border border-white/20 bg-white/10 p-6 text-center shadow-2xl backdrop-blur-md transition duration-500 hover:rotate-0">
            <div className="text-5xl text-yellow-400">👑</div>
            <h3 className="mt-3 text-2xl font-bold">งานดี มีประกัน</h3>
            <p className="text-sm text-gray-200">ลูกค้ากลับมาซ้ำกว่า 90%</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function PainPointsSection() {
  const points = [
    {
      title: "ไม่มีเวลาซัก ของดองเต็มบ้าน?",
      desc: "ไม่ต้องเหนื่อยนั่งขัดเอง เราจัดการให้ครบวงจร เอาเวลาไปไลฟ์ขายของดีกว่า",
      icon: "⏱️",
      color: "bg-red-100 text-red-500",
    },
    {
      title: "หมวกเสียทรง ขายไม่ได้ราคา?",
      desc: "จากหมวกยับๆ ในกระสอบ เราปั้นทรงให้ใหม่ แข็ง ตึง สวย เพิ่มมูลค่าสินค้าให้ดูแพงขึ้น",
      icon: "🎯",
      color: "bg-orange-100 text-orange-500",
    },
    {
      title: "ต้องรีบใช้ของไปไลฟ์?",
      desc: "เรารับงานด่วน! ทีมงานพร้อมลุย ทำรอบไว ส่งงานตรงเวลา ทันรอบไลฟ์สดแน่นอน",
      icon: "🚚",
      color: "bg-blue-100 text-blue-500",
    },
  ];

  return (
    <section id="services" className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800">ปัญหาเหล่านี้จะหมดไป...</h2>
          <p className="mt-2 text-gray-500">
            ให้เราเป็นหลังบ้าน จัดการสินค้าให้คุณมีหน้าที่ขายอย่างเดียว
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {points.map((item) => (
            <div
              key={item.title}
              className="group rounded-xl border border-gray-100 bg-gray-50 p-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full text-2xl ${item.color} transition group-hover:scale-110`}
              >
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-800">{item.title}</h3>
              <p className="mt-3 text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  const steps = [
    {
      title: "Deep Cleaning (ซักละเอียด)",
      desc: "ใช้เทคนิคการซักที่ถนอมเนื้อผ้า ขจัดคราบฝังแน่นด้วยน้ำยาสูตรพิเศษ พร้อมการแปรงมือในจุดที่เครื่องเข้าไม่ถึง",
      image:
        "https://images.unsplash.com/photo-1582735689369-c613c66e2859?q=80&w=2070&auto=format&fit=crop",
    },
    {
      title: "Perfect Reshaping (จัดทรงคืนชีพ)",
      desc: "ไอน้ำความร้อนสูงร่วมกับบล็อกไม้มาตรฐาน คืนทรงหมวกให้แข็ง ตึง เป๊ะ เพิ่มโอกาสขายได้ราคาดี",
      image:
        "https://images.unsplash.com/photo-1576449174697-b353982dfb13?q=80&w=2070&auto=format&fit=crop",
    },
  ];

  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Our Process</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-800 md:text-4xl">
            ใส่ใจทุกรายละเอียด แบบมืออาชีพ
          </h2>
        </div>

        <div className="mt-12 space-y-10">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className={`flex flex-col items-center overflow-hidden rounded-2xl bg-white shadow-sm md:flex-row ${
                index % 2 === 1 ? "md:flex-row-reverse" : ""
              }`}
            >
              <div className="h-64 w-full md:h-80 md:w-1/2">
                <img
                  src={step.image}
                  alt={step.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-8 md:w-1/2 md:p-12">
                <div className="mb-4 flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                    {index + 1}
                  </span>
                  <h3 className="text-2xl font-bold text-gray-800">{step.title}</h3>
                </div>
                <p className="text-lg leading-relaxed text-gray-600">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const tiers = [
    {
      name: "📦 ลองงาน",
      subtitle: "สำหรับส่งมาลองดูคุณภาพ",
      price: 65,
      unit: "บาท / ใบ",
      range: "จำนวน 1 - 50 ใบ",
      rangeColor: "bg-gray-100 text-gray-700",
      features: ["ซักสะอาดล้ำลึก", "จัดทรงมาตรฐาน", "แพ็คส่งคืนอย่างดี"],
      cta: "ส่งลองงาน",
      buttonStyle: "border border-primary text-primary hover:bg-primary hover:text-white",
    },
    {
      name: "🏪 เริ่มขาย",
      subtitle: "พ่อค้าแม่ค้ามือใหม่",
      price: 30,
      unit: "บาท / ใบ",
      range: "จำนวน 51 - 100 ใบ",
      rangeColor: "bg-gray-100 text-gray-700",
      features: ["ประหยัดต้นทุนขึ้น 50%", "งานเสร็จไว พร้อมขาย", "ดันทรงแข็งตึง"],
      cta: "จองคิว",
      buttonStyle: "border border-primary text-primary hover:bg-primary hover:text-white",
    },
    {
      name: "🚀 ขายดี",
      subtitle: "สำหรับร้านค้าประจำ",
      price: 15,
      unit: "บาท / ใบ",
      range: "จำนวน 101 - 500 ใบ",
      rangeColor: "bg-green-100 text-green-800",
      features: ["ราคายอดนิยม", "คิวงานด่วนพิเศษ", "ดูแลแก้ทรงละเอียด"],
      highlight: true,
      cta: "แอดไลน์จองเลย",
      buttonStyle: "bg-primary text-white hover:bg-green-700",
    },
    {
      name: "👑 เจ้าใหญ่",
      subtitle: "เหมากระสอบ / โกดัง",
      price: 14,
      unit: "บาท / ใบ",
      range: "จำนวน 500 ใบขึ้นไป",
      rangeColor: "bg-white/10 text-gray-200",
      features: ["คุ้มที่สุดในตลาด!", "รองรับงานจำนวนมาก", "บริการรับ-ส่ง (ตามเงื่อนไข)"],
      dark: true,
      cta: "คุยราคาส่ง",
      buttonStyle: "bg-yellow-500 text-gray-900 hover:bg-yellow-400",
    },
  ];

  return (
    <section id="pricing" className="bg-gradient-to-b from-white to-green-50 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 md:text-5xl">
            ยิ่งส่งเยอะ ต้นทุนยิ่งถูก <span className="text-primary">กำไรยิ่งเพิ่ม!</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            ราคาเหมาที่คุ้มที่สุดในตลาด เพื่อเพื่อนพ่อค้าแม่ค้าโดยเฉพาะ
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`flex h-full flex-col rounded-xl p-6 transition ${
                tier.dark
                  ? "relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-xl"
                  : tier.highlight
                    ? "relative border-2 border-primary bg-white shadow-md"
                    : "border border-gray-100 bg-white shadow-sm"
              } ${tier.highlight ? "md:-translate-y-4" : ""}`}
            >
              {tier.highlight ? (
                <div className="absolute inset-x-4 -top-3 rounded-full bg-primary px-3 py-1 text-center text-xs font-bold uppercase text-white shadow">
                  ขายดี / ยอดนิยม
                </div>
              ) : null}
              {tier.dark ? (
                <div className="absolute right-3 top-3 text-5xl opacity-10">👑</div>
              ) : null}

              <h3 className={`text-xl font-bold ${tier.highlight ? "text-primary" : ""}`}>
                {tier.name}
              </h3>
              <p className={`text-sm ${tier.dark ? "text-gray-300" : "text-gray-500"}`}>
                {tier.subtitle}
              </p>

              <div className="my-4 flex items-baseline gap-2">
                <span className={`text-4xl font-bold ${tier.highlight ? "text-gray-900" : "text-gray-800"}`}>
                  {tier.price}
                </span>
                <span className={tier.dark ? "text-gray-300" : "text-gray-500"}>{tier.unit}</span>
              </div>

              <p className={`w-max rounded px-2 py-1 text-sm font-semibold ${tier.rangeColor}`}>
                {tier.range}
              </p>

              <ul className="mt-6 flex flex-1 flex-col gap-2 text-sm">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-gray-700">
                    <span className={tier.dark ? "text-yellow-400" : "text-green-600"}>•</span>
                    <span className={tier.dark ? "text-gray-200" : "text-gray-700"}>{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={LINE_URL}
                className={`mt-6 block rounded-lg px-4 py-3 text-center font-bold transition ${tier.buttonStyle}`}
                target="_blank"
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-3xl rounded-lg border bg-white px-4 py-3 text-center text-sm text-gray-500">
          ℹ️ หมายเหตุ: ราคาอาจมีการเปลี่ยนแปลงตามสภาพงานจริง งานแก้ทรงหนักหรืองานแบรนด์เนมพิเศษ โปรดส่งรูปประเมินทางไลน์
        </p>
      </div>
    </section>
  );
}

function CapacitySection() {
  return (
    <section className="relative overflow-hidden bg-gray-900 py-16 text-white">
      <img
        src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop"
        alt="Warehouse Stock"
        className="absolute inset-0 h-full w-full object-cover opacity-20"
      />
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-4 md:flex-row md:items-center">
        <div className="md:w-1/2">
          <h2 className="text-3xl font-bold md:text-4xl">งานใหญ่แค่ไหนก็รับไหว สต็อกแน่นก็ส่งมา!</h2>
          <p className="mt-4 text-lg text-gray-200">
            เรามีพื้นที่โกดังและทีมงานมืออาชีพจำนวนมาก รองรับงานเหมากระสอบหรือตู้คอนเทนเนอร์
            สินค้าของคุณจะถูกดูแลอย่างดี แพ็คกลับเป็นระเบียบ พร้อมขายทันที
          </p>
          <div className="mt-6 flex items-center gap-6">
            <div className="text-center">
              <span className="block text-3xl font-bold text-green-400">10,000+</span>
              <span className="text-sm text-gray-400">ใบ/เดือน</span>
            </div>
            <div className="h-12 w-px bg-gray-700" />
            <div className="text-center">
              <span className="block text-3xl font-bold text-green-400">100%</span>
              <span className="text-sm text-gray-400">ส่งตรงเวลา</span>
            </div>
          </div>
        </div>
        <div className="md:w-1/2 text-center">
          <a
            href={LINE_URL}
            target="_blank"
            className="inline-flex items-center justify-center rounded-full bg-green-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:scale-105 hover:bg-green-500"
          >
            💬 ทักแชทเช็คคิวงาน
          </a>
        </div>
      </div>
    </section>
  );
}

function PortfolioSection() {
  return (
    <section id="portfolio" className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-800">พิสูจน์ด้วยตา ผลลัพธ์ที่ช่วยอัพราคาสินค้า</h2>
        <p className="mt-2 text-gray-500">ภาพจริงจากผลงานของเรา ความแตกต่างที่สัมผัสได้</p>

        <div className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-lg">
          <div className="grid grid-cols-2">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1521369909029-2afed882baee?q=80&w=1000&auto=format&fit=crop"
                alt="ก่อนซัก"
                className="h-64 w-full object-cover grayscale brightness-75 md:h-96"
              />
              <div className="absolute left-4 top-4 rounded bg-red-600 px-3 py-1 text-sm font-bold text-white">
                BEFORE
              </div>
              <div className="absolute bottom-4 left-4 text-left text-white">
                <p className="font-bold">สภาพเดิมจากกระสอบ</p>
                <p className="text-xs">ยับ เสียทรง คราบฝุ่น</p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1533827432537-70133748f5c8?q=80&w=1000&auto=format&fit=crop"
                alt="หลังซัก"
                className="h-64 w-full object-cover md:h-96"
              />
              <div className="absolute right-4 top-4 rounded bg-green-600 px-3 py-1 text-sm font-bold text-white">
                AFTER
              </div>
              <div className="absolute bottom-4 left-4 text-left text-white drop-shadow">
                <p className="font-bold">ซัก-จัดทรง เรียบร้อย</p>
                <p className="text-xs">ทรงแข็ง สะอาด พร้อมขาย</p>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-gray-600 italic">หมวกสวย ขายง่าย ลูกค้าไม่ต่อราคา</p>
      </div>
    </section>
  );
}

function ArticlesSection({ articles }: { articles: Article[] }) {
  if (!articles.length) return null;

  return (
    <section id="articles" className="bg-gradient-to-b from-green-50 to-white py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary">บทความ & เคล็ดลับ</p>
            <h2 className="text-3xl font-bold text-gray-900">รวมเทคนิคจัดการหมวกมือสองที่ขายดีจริง</h2>
          </div>
          <a
            href={LINE_URL}
            target="_blank"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white shadow md:mt-0"
          >
            ส่งรูปประเมินทางไลน์
          </a>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {articles.map((article) => (
            <article
              key={article.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              {article.imageUrl ? (
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="h-52 w-full rounded-xl object-cover"
                />
              ) : null}
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <span>เผยแพร่</span>
                <span>{new Date(article.publishedAt).toLocaleDateString("th-TH")}</span>
              </div>
              <h3 className="mt-2 text-xl font-bold text-gray-900">{article.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{article.summary}</p>
              <a
                href={`/articles/${article.slug}`}
                className="mt-4 inline-block font-semibold text-primary hover:text-green-700"
              >
                อ่านต่อ →
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <section id="faq" className="bg-white py-16">
      <div className="mx-auto max-w-5xl px-4">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">FAQ</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">คำถามที่พบบ่อย</h2>
          <p className="mt-2 text-gray-600">เตรียมของ ส่งงาน จบไว ไม่งง</p>
        </div>

        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <details
              key={item.question}
              className="group rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm"
            >
              <summary className="cursor-pointer select-none text-lg font-semibold text-gray-900">
                {item.question}
              </summary>
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function QueueSection({ queues }: { queues: QueueEntry[] }) {
  if (!queues.length) return null;

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Queue Board</p>
            <h2 className="text-3xl font-bold text-gray-900">อัปเดตรอบคิวล่าสุด</h2>
          </div>
          <span className="text-sm text-gray-500">ข้อมูลจากระบบแอดมินแบบเรียลไทม์</span>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {queues.map((queue) => (
            <div
              key={queue.id}
              className="rounded-xl border border-gray-100 bg-gray-50 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">{queue.customer}</h3>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {queue.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">จำนวน {queue.quantity.toLocaleString()} ใบ</p>
              {queue.deadline ? (
                <p className="text-sm text-gray-500">กำหนดส่ง: {queue.deadline}</p>
              ) : null}
              {queue.notes ? (
                <p className="mt-2 text-sm text-gray-700">{queue.notes}</p>
              ) : null}
              <p className="mt-3 text-xs text-gray-400">
                อัปเดต {new Date(queue.createdAt).toLocaleString("th-TH")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="contact" className="bg-gray-900 pt-16 pb-8 text-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="md:w-1/2">
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-xl font-bold text-white">
                H
              </div>
              <span className="text-2xl font-bold">Hat Fix &amp; Clean</span>
            </div>
            <h3 className="text-2xl font-bold text-green-400">พร้อมเปลี่ยนกองหมวกให้เป็นกำไรหรือยัง?</h3>
            <p className="mt-3 max-w-xl text-gray-400">
              อย่าปล่อยให้หมวกจมทุน ส่งมาให้เราดูแล แล้วคุณรอรับทรัพย์อย่างเดียว ทักมาคุยกันก่อนได้เลย!
            </p>
          </div>

          <div className="flex flex-col gap-6 rounded-xl bg-gray-800 p-6 shadow-md md:w-1/2 md:flex-row md:items-center">
            <div className="flex-1 space-y-4">
              <ContactItem title="โทรด่วน" value="084-554-0425" href="tel:0845540425" badge="📞" />
              <ContactItem
                title="Facebook Page"
                value="Hat Fix & Clean"
                href={FACEBOOK_URL}
                badge="📘"
              />
              <ContactItem title="Line OA" value="@84zbaJk" href={LINE_URL} badge="💚" />
            </div>
            <div className="flex flex-col items-center rounded-lg bg-white p-2 text-center">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://lin.ee/84zbaJk"
                alt="Line QR"
                className="h-36 w-36"
              />
              <span className="mt-1 text-xs font-bold text-gray-800">สแกนเพื่อแอดไลน์</span>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          <p>© 2024 Hat Fix &amp; Clean. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function ContactItem({
  title,
  value,
  href,
  badge,
}: {
  title: string;
  value: string;
  href: string;
  badge: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-lg">{badge}</div>
      <div>
        <p className="text-xs text-gray-400">{title}</p>
        <a
          href={href}
          target="_blank"
          className="text-lg font-bold text-white transition hover:text-green-400"
        >
          {value}
        </a>
      </div>
    </div>
  );
}
