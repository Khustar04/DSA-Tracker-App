import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './pages/Dashboard';
import TrackerPage from './pages/TrackerPage';
import NotesPage from './pages/NotesPage';
import FuturePlanPage from './pages/FuturePlanPage';
import LoginPage from './pages/LoginPage';

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-dark">
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="pt-16 lg:pl-56">
        <div className="p-4 lg:p-6 max-w-5xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tracker" element={<TrackerPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/future-plan" element={<FuturePlanPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Login page — full screen, no sidebar */}
          <Route path="/login" element={<LoginPage />} />

          {/* All other pages — with sidebar and navbar */}
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
