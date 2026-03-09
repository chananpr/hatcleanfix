export default function Footer() {
  return (
    <footer className="mt-10 bg-brand-black px-6 py-20 text-white">
      <div className="container-shell grid gap-20 border-b border-white/10 pb-16 md:grid-cols-3">
        <div>
          <div className="mb-8 text-5xl font-extrabold italic tracking-tighter">
            <span className="text-brand-red">HATZ</span>
          </div>
          <p className="mb-8 font-light italic leading-relaxed text-gray-400">
            "กู้ชีพหมวกใบโปรดในราคามิตรภาพ เพื่อคนรักหมวกและผู้ประกอบการ"
          </p>
          <div className="text-lg font-black uppercase italic leading-none tracking-widest text-brand-yellow">084 554 0425</div>
        </div>

        <div className="space-y-8">
          <h5 className="border-l-4 border-brand-red pl-4 text-xs font-bold uppercase tracking-widest">Contact Support</h5>
          <div className="space-y-4">
            <a href="tel:+66845540425" className="block text-3xl font-black italic transition hover:text-brand-yellow md:text-4xl">
              +66 84 554 0425
            </a>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Open Daily: 09:00 - 20:00</p>
          </div>
        </div>

        <div className="space-y-8">
          <h5 className="border-l-4 border-brand-red pl-4 text-xs font-bold uppercase tracking-widest">Shop Info</h5>
          <div className="space-y-3 text-sm font-light text-gray-400">
            <p>Line ID: @HATZOFFICIAL</p>
            <p>FB: HATZ Hat Fix &amp; Clean</p>
            <p className="font-bold uppercase italic text-white">#รีวิวจัดทรงหมวก</p>
          </div>
        </div>
      </div>
      <div className="container-shell mt-12 text-center text-[10px] uppercase tracking-[0.5em] text-gray-600">
        &copy; 2024 HATZ HAT FIX &amp; CLEAN | PROFESSIONAL HAT RESTORATION STUDIO
      </div>
    </footer>
  )
}
