import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BackToTop from '../components/BackToTop';
import { fetchArticles, createQueueJob } from '../lib/api';
import { Article } from '../types';

const heroBg =
  'https://images.unsplash.com/photo-1575909812264-69c058c42a22?q=80&w=2070&auto=format&fit=crop';

export default function LandingPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [articleError, setArticleError] = useState('');

  const [customer, setCustomer] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [queueStatus, setQueueStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [queueMessage, setQueueMessage] = useState('');

  useEffect(() => {
    fetchArticles()
      .then(setArticles)
      .catch(() => setArticleError('โหลดบทความไม่สำเร็จ'))
      .finally(() => setLoadingArticles(false));
  }, []);

  const handleQueueSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!customer || !quantity) {
      setQueueMessage('กรอกชื่อและจำนวนหมวกก่อนนะครับ');
      return;
    }
    try {
      setQueueStatus('sending');
      setQueueMessage('');
      await createQueueJob({
        customer,
        quantity: Number(quantity),
        deadline: deadline || undefined,
        notes: notes || undefined,
        status: 'pending'
      });
      setQueueStatus('done');
      setQueueMessage('ส่งคิวแล้ว! ทีมจะติดต่อกลับยืนยันคิว');
      setCustomer('');
      setQuantity('');
      setDeadline('');
      setNotes('');
    } catch (err) {
      console.error(err);
      setQueueStatus('error');
      setQueueMessage('ส่งคิวไม่สำเร็จ ลองใหม่หรือติดต่อทางไลน์');
    }
  };

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen">
      <Navbar />
      <header className="relative h-[650px] flex items-center justify-center text-white pt-16">
        <div className="absolute inset-0 z-0">
          <img src={heroBg} alt="กองหมวกมือสอง" className="w-full h-full object-cover" />
          <div className="absolute inset-0 hero-overlay" />
        </div>

        <div className="container mx-auto px-4 z-10 text-center md:text-left md:flex md:items-center md:justify-between">
          <div className="md:w-2/3 lg:w-1/2 space-y-6">
            <div className="inline-block bg-primary/90 px-4 py-1 rounded-full text-sm font-semibold mb-2 shadow-lg backdrop-blur-sm">
              ✨ เปลี่ยนหมวกเน่าจากกระสอบ ให้เป็นหมวกเทพหลักพัน
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-shadow">
              รับเหมาซัก-จัดทรง
              <br />
              <span className="text-green-400">หมวกมือสอง</span>
              <br />
              เริ่มต้นเพียง <span className="text-yellow-400 text-5xl md:text-7xl">14</span> บาท
            </h1>
            <p className="text-lg md:text-xl text-gray-200 font-light">
              บริการมืออาชีพสำหรับพ่อค้าแม่ค้า แก้ทรงหมวกยับจากกระสอบให้สวยกริบ ช่วยคุณประหยัดเวลาเตรียมของ
              ทำรอบขายได้ไวขึ้น รับงานเร่งด่วนพร้อมส่งทั่วประเทศ
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
              <a
                href="#pricing"
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg shadow-lg transition transform hover:scale-105"
              >
                ดูตารางราคาเหมา
              </a>
              <a
                href="https://lin.ee/84zbaJk"
                target="_blank"
                className="bg-transparent border-2 border-white hover:bg-white/10 text-white px-8 py-4 rounded-lg font-bold text-lg transition"
              >
                สอบถามคิวงาน
              </a>
            </div>
          </div>

          <div className="hidden lg:block md:w-1/3 text-center">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-2xl transform rotate-3 hover:rotate-0 transition duration-500">
              <i className="fa-solid fa-crown text-5xl text-yellow-400 mb-4" />
              <h3 className="text-2xl font-bold mb-2">งานดี มีประกัน</h3>
              <p className="text-sm">ลูกค้ากลับมาซ้ำกว่า 90%</p>
            </div>
          </div>
        </div>
      </header>

      <section id="services" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">ปัญหาเหล่านี้จะหมดไป...</h2>
            <p className="text-gray-500 mt-2">ให้เราเป็นหลังบ้าน จัดการสินค้าให้คุณมีหน้าที่ขายอย่างเดียว</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl border border-gray-100 hover:shadow-lg transition text-center group">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl group-hover:scale-110 transition">
                <i className="fa-regular fa-clock" />
              </div>
              <h3 className="text-xl font-bold mb-3">ไม่มีเวลาซัก ของดองเต็มบ้าน?</h3>
              <p className="text-gray-600">
                ไม่ต้องเหนื่อยนั่งขัดเอง เราจัดการให้ครบวงจร ประหยัดเวลาคุณไปได้มหาศาล เอาเวลาไปไลฟ์ขายของดีกว่า
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl border border-gray-100 hover:shadow-lg transition text-center group">
              <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl group-hover:scale-110 transition">
                <i className="fa-solid fa-shapes" />
              </div>
              <h3 className="text-xl font-bold mb-3">หมวกเสียทรง ขายไม่ได้ราคา?</h3>
              <p className="text-gray-600">
                จากหมวกยับๆ ในกระสอบ เราปั้นทรงให้ใหม่ แข็ง ตึง สวย เพิ่มมูลค่าสินค้าให้ดูแพงขึ้นทันตาเห็น
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl border border-gray-100 hover:shadow-lg transition text-center group">
              <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl group-hover:scale-110 transition">
                <i className="fa-solid fa-truck-fast" />
              </div>
              <h3 className="text-xl font-bold mb-3">ต้องรีบใช้ของไปไลฟ์?</h3>
              <p className="text-gray-600">
                เรารับงานด่วน! ทีมงานพร้อมลุย ทำรอบไวทันใจ ส่งงานตรงเวลา ทันรอบไลฟ์สดแน่นอน
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-bold uppercase tracking-wider">Our Process</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2">ใส่ใจทุกรายละเอียด แบบมืออาชีพ</h2>
          </div>

          <div className="space-y-12">
            <div className="flex flex-col md:flex-row items-center gap-8 bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="md:w-1/2 h-64 md:h-80">
                <img
                  src="https://images.unsplash.com/photo-1582735689369-c613c66e2859?q=80&w=2070&auto=format&fit=crop"
                  alt="Deep Cleaning ซักหมวก"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-8 md:p-12">
                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                    1
                  </span>
                  <h3 className="text-2xl font-bold text-gray-800">Deep Cleaning (ซักละเอียด)</h3>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">
                  เราไม่ได้แค่โยนลงเครื่อง แต่เราใช้เทคนิคการซักที่ถนอมเนื้อผ้า ขจัดคราบฝังแน่น คราบเหงื่อไคล ด้วยน้ำยาสูตรพิเศษ
                  และการแปรงเก็บรายละเอียดด้วยมือในจุดที่เครื่องจักรเข้าไม่ถึง เพื่อความสะอาดล้ำลึก
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row-reverse items-center gap-8 bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="md:w-1/2 h-64 md:h-80">
                <img
                  src="https://images.unsplash.com/photo-1576449174697-b353982dfb13?q=80&w=2070&auto=format&fit=crop"
                  alt="Reshaping จัดทรงหมวก"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-8 md:p-12">
                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                    2
                  </span>
                  <h3 className="text-2xl font-bold text-gray-800">Perfect Reshaping (จัดทรงคืนชีพ)</h3>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">
                  หัวใจสำคัญของการขายหมวกคือ &quot;ทรง&quot; เราใช้ไอน้ำความร้อนสูงร่วมกับบล็อกไม้มาตรฐาน เพื่อคืนชีพหมวกยับ
                  ย้วย ให้กลับมาทรงสวย หน้าหมวกแข็ง ตึง เป๊ะเหมือนใหม่ เพิ่มโอกาสขายได้ราคาดีขึ้น
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 bg-gradient-to-b from-white to-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
              ยิ่งส่งเยอะ ต้นทุนยิ่งถูก <span className="text-primary">กำไรยิ่งเพิ่ม!</span>
            </h2>
            <p className="text-gray-600 mt-4 text-lg">ราคาเหมาที่คุ้มที่สุดในตลาด เพื่อเพื่อนพ่อค้าแม่ค้าโดยเฉพาะ</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col hover:border-green-300 transition">
              <h3 className="text-xl font-bold text-gray-700">📦 ลองงาน</h3>
              <p className="text-sm text-gray-500 mb-4">สำหรับส่งมาลองดูคุณภาพ</p>
              <div className="my-4">
                <span className="text-4xl font-bold text-gray-800">65</span>
                <span className="text-gray-500">บาท / ใบ</span>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-6 bg-gray-100 py-1 px-2 rounded w-max">จำนวน 1 - 50 ใบ</p>
              <ul className="text-sm text-gray-600 space-y-2 mb-8 flex-grow">
                <li>
                  <i className="fa-solid fa-check text-green-500 mr-2" />
                  ซักสะอาดล้ำลึก
                </li>
                <li>
                  <i className="fa-solid fa-check text-green-500 mr-2" />
                  จัดทรงมาตรฐาน
                </li>
                <li>
                  <i className="fa-solid fa-check text-green-500 mr-2" />
                  แพ็คส่งคืนอย่างดี
                </li>
              </ul>
              <a
                href="https://lin.ee/84zbaJk"
                className="block text-center py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition font-medium"
              >
                ส่งลองงาน
              </a>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col hover:border-green-300 transition">
              <h3 className="text-xl font-bold text-gray-700">🏪 เริ่มขาย</h3>
              <p className="text-sm text-gray-500 mb-4">พ่อค้าแม่ค้ามือใหม่</p>
              <div className="my-4">
                <span className="text-4xl font-bold text-gray-800">30</span>
                <span className="text-gray-500">บาท / ใบ</span>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-6 bg-gray-100 py-1 px-2 rounded w-max">จำนวน 51 - 100 ใบ</p>
              <ul className="text-sm text-gray-600 space-y-2 mb-8 flex-grow">
                <li>
                  <i className="fa-solid fa-check text-green-500 mr-2" />
                  ประหยัดต้นทุนขึ้น 50%
                </li>
                <li>
                  <i className="fa-solid fa-check text-green-500 mr-2" />
                  งานเสร็จไว พร้อมขาย
                </li>
                <li>
                  <i className="fa-solid fa-check text-green-500 mr-2" />
                  ดันทรงแข็งตึง
                </li>
              </ul>
              <a
                href="https://lin.ee/84zbaJk"
                className="block text-center py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition font-medium"
              >
                จองคิว
              </a>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-primary relative flex flex-col transform md:-translate-y-4 z-10">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold uppercase py-1 px-3 rounded-full shadow-sm">
                ขายดี / ยอดนิยม
              </div>
              <h3 className="text-xl font-bold text-primary">🚀 ขายดี</h3>
              <p className="text-sm text-gray-500 mb-4">สำหรับร้านค้าประจำ</p>
              <div className="my-4">
                <span className="text-5xl font-bold text-gray-900">15</span>
                <span className="text-gray-500">บาท / ใบ</span>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-6 bg-green-100 text-green-800 py-1 px-2 rounded w-max">
                จำนวน 101 - 500 ใบ
              </p>
              <ul className="text-sm text-gray-600 space-y-2 mb-8 flex-grow">
                <li>
                  <i className="fa-solid fa-check text-green-500 mr-2" />
                  <strong>ราคายอดนิยม</strong>
                </li>
                <li>
                  <i className="fa-solid fa-check text-green-500 mr-2" />
                  คิวงานด่วนพิเศษ
                </li>
                <li>
                  <i className="fa-solid fa-check text-green-500 mr-2" />
                  ดูแลแก้ทรงละเอียด
                </li>
              </ul>
              <a
                href="https://lin.ee/84zbaJk"
                className="block text-center py-3 bg-primary text-white rounded-lg hover:bg-green-700 transition font-bold shadow-md"
              >
                แอดไลน์จองเลย
              </a>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl shadow-xl p-6 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <i className="fa-solid fa-crown text-6xl" />
              </div>
              <h3 className="text-xl font-bold text-yellow-400">
                <i className="fa-solid fa-crown mr-2" />
                เจ้าใหญ่
              </h3>
              <p className="text-sm text-gray-300 mb-4">เหมากระสอบ / โกดัง</p>
              <div className="my-4">
                <span className="text-4xl font-bold text-white">14</span>
                <span className="text-gray-400">บาท / ใบ</span>
              </div>
              <p className="text-sm font-medium text-gray-300 mb-6 bg-white/10 py-1 px-2 rounded w-max">จำนวน 500 ใบขึ้นไป</p>
              <ul className="text-sm text-gray-300 space-y-2 mb-8 flex-grow">
                <li>
                  <i className="fa-solid fa-check text-yellow-400 mr-2" />
                  <strong>คุ้มที่สุดในตลาด!</strong>
                </li>
                <li>
                  <i className="fa-solid fa-check text-yellow-400 mr-2" />
                  รองรับงานจำนวนมาก
                </li>
                <li>
                  <i className="fa-solid fa-check text-yellow-400 mr-2" />
                  บริการรับ-ส่ง (ตามเงื่อนไข)
                </li>
              </ul>
              <a
                href="https://lin.ee/84zbaJk"
                className="block text-center py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-400 transition font-bold"
              >
                คุยราคาส่ง
              </a>
            </div>
          </div>

          <div className="text-center mt-8 text-sm text-gray-500 bg-white inline-block px-4 py-2 rounded-lg mx-auto border mx-auto block max-w-2xl">
            <i className="fa-solid fa-circle-info mr-1" /> หมายเหตุ: ราคาอาจมีการเปลี่ยนแปลงตามสภาพงานจริง งานแก้ทรงหนักหรืองานแบรนด์เนมพิเศษ
            โปรดส่งรูปประเมินทางไลน์
          </div>
        </div>
      </section>

      <section className="py-16 relative bg-gray-900 text-white">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop"
            alt="Warehouse Stock"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">งานใหญ่แค่ไหนก็รับไหว สต็อกแน่นก็ส่งมา!</h2>
            <p className="text-gray-300 text-lg mb-6">
              เรามีพื้นที่โกดังและทีมงานมืออาชีพจำนวนมาก พร้อมรองรับงานระดับเหมากระสอบหรือตู้คอนเทนเนอร์ มั่นใจได้ว่าสินค้าของคุณจะถูกดูแลอย่างดี
              แพ็คกลับเป็นระเบียบ พร้อมส่งต่อให้ลูกค้าทันที
            </p>
            <div className="flex gap-4">
              <div className="text-center">
                <span className="block text-3xl font-bold text-green-400">10,000+</span>
                <span className="text-sm text-gray-400">ใบ/เดือน</span>
              </div>
              <div className="w-px bg-gray-700" />
              <div className="text-center">
                <span className="block text-3xl font-bold text-green-400">100%</span>
                <span className="text-sm text-gray-400">ส่งตรงเวลา</span>
              </div>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <a
              href="https://lin.ee/84zbaJk"
              className="bg-green-600 hover:bg-green-500 text-white text-xl font-bold py-4 px-8 rounded-full shadow-lg transition animate-pulse"
            >
              <i className="fa-brands fa-line mr-2" /> ทักแชทเช็คคิวงาน
            </a>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white" id="portfolio">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">พิสูจน์ด้วยตา ผลลัพธ์ที่ช่วยอัพราคาสินค้า</h2>
          <p className="text-gray-500 mb-10">ภาพจริงจากผลงานของเรา ความแตกต่างที่คุณสัมผัสได้</p>

          <div className="max-w-4xl mx-auto bg-gray-100 rounded-xl overflow-hidden shadow-lg border border-gray-200">
            <div className="grid grid-cols-2">
              <div className="relative group">
                <img
                  src="https://images.unsplash.com/photo-1521369909029-2afed882baee?q=80&w=1000&auto=format&fit=crop"
                  alt="หมวกก่อนทำ"
                  className="w-full h-64 md:h-96 object-cover grayscale brightness-75 transition duration-500"
                />
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded font-bold text-sm">BEFORE</div>
                <div className="absolute bottom-4 left-4 text-white text-left opacity-0 group-hover:opacity-100 transition">
                  <p className="font-bold">สภาพเดิมจากกระสอบ</p>
                  <p className="text-xs">ยับ เสียทรง คราบฝุ่น</p>
                </div>
              </div>
              <div className="relative group">
                <img
                  src="https://images.unsplash.com/photo-1533827432537-70133748f5c8?q=80&w=1000&auto=format&fit=crop"
                  alt="หมวกหลังทำ"
                  className="w-full h-64 md:h-96 object-cover"
                />
                <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded font-bold text-sm">AFTER</div>
                <div className="absolute bottom-4 left-4 text-white text-left opacity-0 group-hover:opacity-100 transition shadow-black">
                  <p className="font-bold text-shadow">ซัก-จัดทรง เรียบร้อย</p>
                  <p className="text-xs text-shadow">ทรงแข็ง สะอาด พร้อมขาย</p>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-6 text-gray-600 italic">"หมวกสวย ขายง่าย ลูกค้าไม่ต่อราคา"</p>
        </div>
      </section>

      <section className="py-16 bg-gray-50" id="articles">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">บทความ &amp; ทริคเพิ่มยอดขาย</h2>
              <p className="text-gray-600">แชร์ความรู้เรื่องดูแลหมวกมือสอง เพิ่ม SEO และความน่าเชื่อถือ</p>
            </div>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:text-green-700"
            >
              <i className="fa-solid fa-pen-to-square" /> เข้าส่วน Admin
            </Link>
          </div>

          {loadingArticles && <p className="text-gray-500">กำลังโหลดบทความ...</p>}
          {articleError && <p className="text-red-500">{articleError}</p>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {!loadingArticles &&
              !articleError &&
              articles.slice(0, 6).map((article) => (
                <Link
                  key={article.slug}
                  to={`/articles/${article.slug}`}
                  className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-lg transition flex flex-col"
                >
                  {article.imageUrl && (
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-44 object-cover rounded-lg mb-4"
                    />
                  )}
                  <span className="text-xs uppercase tracking-wide text-primary font-semibold mb-2">
                    {new Date(article.publishedAt).toLocaleDateString('th-TH')}
                  </span>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{article.title}</h3>
                  <p className="text-gray-600 flex-grow">{article.summary}</p>
                  <span className="mt-4 inline-flex items-center text-sm text-primary font-semibold">
                    อ่านต่อ <i className="fa-solid fa-arrow-right ml-2" />
                  </span>
                </Link>
              ))}
          </div>

          {!loadingArticles && !articleError && !articles.length && (
            <div className="p-6 bg-white rounded-xl border text-center text-gray-500 mt-4">
              ยังไม่มีบทความ ลองเพิ่มผ่านหน้า Admin
            </div>
          )}
        </div>
      </section>

      <section id="contact" className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between gap-12">
            <div className="md:w-1/2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-xl font-bold">H</div>
                <span className="text-2xl font-bold">Hat Fix &amp; Clean</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-green-400">พร้อมเปลี่ยนกองหมวกให้เป็นกำไรหรือยัง?</h3>
              <p className="text-gray-400 mb-8 max-w-md">
                อย่าปล่อยให้หมวกจมทุน ส่งมาให้เราดูแล แล้วคุณรอรับทรัพย์อย่างเดียว ทักมาคุยกันก่อนได้เลย!
              </p>
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h4 className="text-lg font-semibold mb-4">จองคิวด่วนผ่านเว็บ</h4>
                <form className="space-y-3" onSubmit={handleQueueSubmit}>
                  <input
                    className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white focus:outline-none focus:border-primary"
                    placeholder="ชื่อร้าน / ชื่อลูกค้า"
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                  />
                  <input
                    className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white focus:outline-none focus:border-primary"
                    placeholder="จำนวนหมวก (ใบ)"
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
                  />
                  <input
                    className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white focus:outline-none focus:border-primary"
                    placeholder="กำหนดส่ง (เช่น 2024-12-30)"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                  <textarea
                    className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white focus:outline-none focus:border-primary"
                    placeholder="โน้ตเพิ่มเติม เช่น เน้นจัดทรงสแน็ปแบ็ค"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-green-700 text-white font-bold py-3 rounded-lg transition"
                    disabled={queueStatus === 'sending'}
                  >
                    {queueStatus === 'sending' ? 'กำลังส่งคิว...' : 'ส่งคิวให้ทีมงาน'}
                  </button>
                  {queueMessage && (
                    <p
                      className={`text-sm ${
                        queueStatus === 'error' ? 'text-red-400' : 'text-green-400'
                      }`}
                    >
                      {queueMessage}
                    </p>
                  )}
                </form>
              </div>
            </div>

            <div className="md:w-1/2 flex flex-col md:flex-row gap-8 items-start md:items-center bg-gray-800 p-6 rounded-xl border border-gray-700">
              <div className="flex-grow space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white">
                    <i className="fa-solid fa-phone" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">โทรด่วน</p>
                    <a href="tel:0845540425" className="text-lg font-bold hover:text-green-400">
                      084-554-0425
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                    <i className="fa-brands fa-facebook-f" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Facebook Page</p>
                    <a
                      href="https://www.facebook.com/profile.php?id=61584389500744"
                      target="_blank"
                      className="text-lg font-bold hover:text-blue-400"
                    >
                      Hat Fix &amp; Clean
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <i className="fa-brands fa-line" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Line OA</p>
                    <a href="https://lin.ee/84zbaJk" target="_blank" className="text-lg font-bold hover:text-green-400">
                      @84zbaJk
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white p-2 rounded-lg flex-shrink-0 text-center">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://lin.ee/84zbaJk"
                  alt="Scan Line QR"
                  className="w-32 h-32 mb-1"
                />
                <span className="text-gray-900 text-xs font-bold block">สแกนเพื่อแอดไลน์</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; 2024 Hat Fix &amp; Clean. All rights reserved.</p>
          </div>
        </div>
      </section>

      <BackToTop />
    </div>
  );
}
