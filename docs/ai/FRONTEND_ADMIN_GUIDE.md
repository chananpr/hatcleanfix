# Frontend And Admin Guide

## Storefront

Source of truth: `frontend/src/routes/AppRouter.jsx`

### Route Map

| Path | Page |
| --- | --- |
| `/` | `HomePage` |
| `/services` | `ServicesPage` |
| `/business` | `BusinessPage` |
| `/gallery` | `GalleryPage` |
| `/privacy-policy` | `PrivacyPolicyPage` |
| `*` | redirect to `/` |

### Layout

- ทุก route ถูกครอบด้วย `MainLayout`
- scroll reset ทำผ่าน `ScrollToTop`
- navigation หลักใน `frontend/src/data/navigation.js`

### Storefront Notes

- code ที่อ่านมาไม่พบ dynamic client-side data fetching layer ขนาดใหญ่ใน storefront
- หน้า public ดูเป็น content-driven pages มากกว่าระบบ transaction ฝั่งลูกค้า

## Admin

Source of truth: `admin/src/App.jsx`

### Route Map

| Path | Page | Access |
| --- | --- | --- |
| `/login` | `LoginPage` | public |
| `/dashboard` | `DashboardPage` | authenticated |
| `/leads` | `LeadsPage` | `superadmin`, `admin`, `staff` |
| `/orders` | `OrdersPage` | authenticated |
| `/orders/:id` | `OrderDetailPage` | authenticated |
| `/customers` | `CustomersPage` | authenticated |
| `/customers/:id` | `CustomerProfilePage` | authenticated |
| `/users` | `UsersPage` | `superadmin`, `admin` |
| `/pricing` | `PricingPage` | `superadmin`, `admin` |
| `/attribution` | `AttributionPage` | `superadmin`, `admin` |
| `/content` | `ContentPage` | `superadmin`, `admin` |
| `/automation` | `AutomationPage` | `superadmin` |
| `/ai-chat` | `AiChatPage` | `superadmin`, `admin` |
| `/messenger` | `MessengerPage` | `superadmin`, `admin` |
| `/products` | `ProductsPage` | `superadmin`, `admin` |
| `/ai-settings` | `AiSettingsPage` | `superadmin`, `admin` |
| `/linkedin` | `LinkedInPage` | `superadmin` |
| `/profile` | `ProfilePage` | authenticated |

`*` redirect ไป `/dashboard`

### Auth Flow

Source files:

- `admin/src/stores/auth.store.js`
- `admin/src/components/common/ProtectedRoute.jsx`

Behavior:

- login ยิง `POST /api/auth/login`
- token เก็บใน `localStorage` key `hatz_token`
- user object เก็บใน `localStorage` key `hatz_user`
- route protection เช็กทั้ง authenticated state และ role allowlist

## Admin API Layer

Source of truth: `admin/src/api/index.js`

API groups ที่มีอยู่:

- `auth`
- `leads`
- `orders`
- `customers`
- `users`
- `dashboard`
- `pricing`
- `content`
- `n8n`
- `aiChat`
- `linkedinPosts`
- `facebookPages`
- `conversations`
- `products`

### Important API Usage Notes

- customer profile ใช้ `GET /api/customers/:id`
- address search ใช้ `GET /api/address/search`
- order images ใช้ `POST /api/orders/:id/typed-images`
- conversations ใช้ `page_id`, `page`, `limit` เป็น query params
- pricing rules รองรับ `page_id`

## UI Risk Areas

AI ต้องระวังตอนแก้หน้าเหล่านี้:

- `admin/src/pages/MessengerPage.jsx`
- `admin/src/pages/AiChatPage.jsx`
- `admin/src/pages/AttributionPage.jsx`
- `admin/src/pages/CustomerProfilePage.jsx`
- `admin/src/pages/OrdersPage.jsx`
- `admin/src/pages/OrderDetailPage.jsx`

เหตุผล:

- หน้าเหล่านี้แตะ route และ data shape หลายส่วน
- บางหน้ามีผลกับ workflow จริงของลูกค้าและทีมงาน

