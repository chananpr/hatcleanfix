import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ArticlePage from './pages/ArticlePage';
import AdminPage from './pages/AdminPage';
import CategoryListPage from './pages/CategoryListPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/portfolio" element={<CategoryListPage />} />
        <Route path="/reviews" element={<CategoryListPage />} />
        <Route path="/articles" element={<CategoryListPage />} />
        <Route path="/articles/:slug" element={<ArticlePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}
