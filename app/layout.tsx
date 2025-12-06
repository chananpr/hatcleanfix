import type { Metadata } from "next";
import Script from "next/script";
import { Kanit } from "next/font/google";
import "./globals.css";

const kanit = Kanit({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-kanit",
  display: "swap",
});

const siteTitle = "Hat Fix & Clean - รับเหมาซักจัดทรงหมวกมือสอง";
const siteDescription =
  "เพื่อนคู่คิดพ่อค้าหมวก รับเหมาซัก-จัดทรงหมวกมือสอง เริ่มต้น 14 บาท/ใบ งานด่วน งานเหมา งานคุณภาพ รองรับงานกระสอบและโกดัง";

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  keywords: [
    "ซักหมวก",
    "จัดทรงหมวก",
    "หมวกมือสอง",
    "ซักหมวกมือสอง",
    "โรงงานซักหมวก",
    "Hat Fix & Clean",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1533827432537-70133748f5c8?q=80&w=1200&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "Hat Fix & Clean - รับเหมาซักจัดทรงหมวกมือสอง",
      },
    ],
    siteName: "Hat Fix & Clean",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [
      "https://images.unsplash.com/photo-1533827432537-70133748f5c8?q=80&w=1200&auto=format&fit=crop",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  return (
    <html lang="th" className="scroll-smooth">
      <body className={`${kanit.className} bg-gray-50 text-gray-800`}>
        {children}

        {pixelId ? (
          <>
            <Script id="facebook-pixel" strategy="afterInteractive">
              {`!function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');`}
            </Script>
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="facebook-pixel"
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
              />
            </noscript>
          </>
        ) : null}
      </body>
    </html>
  );
}
