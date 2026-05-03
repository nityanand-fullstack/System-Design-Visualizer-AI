import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import SystemDetail from "./pages/SystemDetail.jsx";
import AddSystem from "./pages/AddSystem.jsx";
import EditSystem from "./pages/EditSystem.jsx";
import Login from "./pages/Login.jsx";
import AISearchResult from "./pages/AISearchResult.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/system/:slug" element={<SystemDetail />} />
          <Route path="/ai-search" element={<AISearchResult />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin/new"
            element={
              <ProtectedRoute>
                <AddSystem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/edit/:slug"
            element={
              <ProtectedRoute>
                <EditSystem />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="footer">
        <p>System Design Visualizer · Built with MERN + Gemini AI</p>
        <p> all right reserve @Nityanand 2026</p>
      </footer>
    </div>
  );
}
