import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AdminPage } from "./pages/AdminPage";
import { ArticlePage } from "./pages/ArticlePage";
import { LandingPage } from "./pages/LandingPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/articles/:slug" element={<ArticlePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
