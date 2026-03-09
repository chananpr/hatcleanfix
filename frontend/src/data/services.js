import { imageAssets } from './images'

export const serviceItems = [
  {
    id: 'reshape',
    title: 'จัดทรง (Reshape)',
    subtitle: 'ดัดทรงคืนสภาพเดิมให้เป๊ะ',
    description: 'คืนรูปทรงเดิมให้เป๊ะ ด้วยเครื่องดัดทรงคุณภาพสูง',
    titleClassName: 'text-brand-red',
    image: imageAssets.reshape,
  },
  {
    id: 'spa',
    title: 'สปาหมวก',
    subtitle: 'ทำความสะอาดล้ำลึกถนอมผ้า',
    description: 'ดูแลทำความสะอาดถนอมเนื้อผ้า สวยเหมือนใหม่',
    titleClassName: 'text-brand-yellow',
    image: imageAssets.spa,
  },
  {
    id: 'sanitize',
    title: 'ฆ่าเชื้อโรค',
    subtitle: 'ขจัดกลิ่นอับและแบคทีเรีย',
    description: 'ขจัดกลิ่นอับและแบคทีเรีย มั่นใจทุกครั้งที่ใส่',
    titleClassName: 'text-brand-black',
    image: imageAssets.sanitize,
  },
  {
    id: 'wash',
    title: 'ซักทุกรูปแบบ',
    subtitle: 'ขจัดทุกคราบสกปรกฝังลึก',
    description: 'ให้หมวกที่สีซีด กลับมามีสีสันสดใสอีกครั้ง',
    titleClassName: 'text-gray-500',
    image: imageAssets.wash,
  },
]

export const priceItems = [
  {
    label: 'จัดทรงอย่างเดียว',
    price: 'เริ่ม 1xx.-',
    priceClassName: 'text-brand-yellow',
  },
  {
    label: 'ซักสปา + ฆ่าเชื้อ',
    price: 'เริ่ม 2xx.-',
    priceClassName: 'text-brand-yellow',
  },
  {
    label: 'Full Service (ซัก+จัดทรง+สปา)',
    price: 'เริ่ม 3xx.-',
    priceClassName: 'text-brand-red underline',
  },
]

export const priceNote = '*ราคาขึ้นอยู่กับสภาพหมวกและวัสดุ กรุณาส่งรูปประเมินอีกครั้ง'
