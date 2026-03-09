import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import Navbar from './Navbar'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-white text-brand-black">
      <Navbar />
      <main className="min-h-screen pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
