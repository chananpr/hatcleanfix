import { useEffect, useState } from "react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 160);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-40 rounded-full bg-primary p-3 text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-green-700"
      aria-label="back to top"
    >
      ↑
    </button>
  );
}
