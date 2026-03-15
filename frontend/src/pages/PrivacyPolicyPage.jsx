export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">นโยบายความเป็นส่วนตัว</h1>
      <p className="text-sm text-gray-500 mb-8">อัปเดตล่าสุด: 15 มีนาคม 2026</p>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
        <section>
          <h2 className="text-xl font-semibold text-gray-800">1. ข้อมูลทั่วไป</h2>
          <p>Hat Fix & Clean ("เรา", "ร้าน") ให้บริการซัก จัดทรง สปา และฆ่าเชื้อหมวก ผ่านเว็บไซต์ hatfixclean.com และช่องทาง Facebook Messenger เราให้ความสำคัญกับความเป็นส่วนตัวของลูกค้าทุกท่าน</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">2. ข้อมูลที่เราเก็บรวบรวม</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>ชื่อและข้อมูลโปรไฟล์ Facebook ที่เปิดเผยสาธารณะ</li>
            <li>ข้อความสนทนาผ่าน Facebook Messenger</li>
            <li>ข้อมูลการติดต่อ (ชื่อ, เบอร์โทรศัพท์, ที่อยู่จัดส่ง)</li>
            <li>รูปภาพหมวกที่ลูกค้าส่งมาเพื่อประเมินบริการ</li>
            <li>ข้อมูลการสั่งซื้อและการชำระเงิน</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">3. วัตถุประสงค์ในการใช้ข้อมูล</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>ให้บริการและตอบกลับข้อความของลูกค้า</li>
            <li>ประมวลผลคำสั่งซื้อและจัดส่งสินค้า</li>
            <li>ปรับปรุงบริการของเรา</li>
            <li>ติดต่อลูกค้าเกี่ยวกับสถานะการสั่งซื้อ</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">4. การใช้ระบบตอบกลับอัตโนมัติ</h2>
          <p>เราใช้ระบบ AI (ปัญญาประดิษฐ์) เพื่อตอบกลับข้อความของลูกค้าผ่าน Facebook Messenger โดยอัตโนมัติ เพื่อให้บริการที่รวดเร็วและมีประสิทธิภาพ ข้อความของลูกค้าจะถูกประมวลผลผ่านระบบ AI เพื่อให้คำตอบที่เหมาะสมเกี่ยวกับบริการของเรา</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">5. การแบ่งปันข้อมูล</h2>
          <p>เราไม่ขายหรือแบ่งปันข้อมูลส่วนบุคคลของลูกค้าให้บุคคลที่สาม ยกเว้น:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>บริษัทขนส่งพัสดุ (เพื่อจัดส่งสินค้า)</li>
            <li>ผู้ให้บริการชำระเงิน (เพื่อประมวลผลการชำระเงิน)</li>
            <li>เมื่อกฎหมายกำหนด</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">6. การรักษาความปลอดภัยของข้อมูล</h2>
          <p>เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อปกป้องข้อมูลส่วนบุคคลของลูกค้า รวมถึงการเข้ารหัสข้อมูลและการจำกัดการเข้าถึง</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">7. สิทธิ์ของลูกค้า</h2>
          <p>ลูกค้ามีสิทธิ์:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>ขอดูข้อมูลส่วนบุคคลที่เราเก็บ</li>
            <li>ขอแก้ไขข้อมูลที่ไม่ถูกต้อง</li>
            <li>ขอลบข้อมูลส่วนบุคคล</li>
            <li>ปฏิเสธการรับข้อความโปรโมชัน</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">8. ติดต่อเรา</h2>
          <p>หากมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัว สามารถติดต่อได้ที่:</p>
          <ul className="list-none space-y-1">
            <li>Facebook: Hat Fix & Clean</li>
            <li>โทร: 084-554-0425</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
