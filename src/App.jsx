import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './pages/Dashboard';
import TrackerPage from './pages/TrackerPage';
import NotesPage from './pages/NotesPage';
import FuturePlanPage from './pages/FuturePlanPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import LandingPage from './pages/LandingPage';
import StriverPage from './pages/StriverPage';
import CustomSheetsPage from './pages/CustomSheetsPage';
import SheetViewPage from './pages/SheetViewPage';
import LeaderboardPage from './pages/LeaderboardPage';
import BadgesPage from './pages/BadgesPage';
import ProblemDetailPage from './pages/ProblemDetailPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import ProfilePage from './pages/ProfilePage';
import PublicProfilePage from './pages/PublicProfilePage';
import { Toaster } from 'react-hot-toast';

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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tracker" element={<TrackerPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/future-plan" element={<FuturePlanPage />} />
            <Route path="/striver-a2z" element={<StriverPage />} />
            <Route path="/custom-sheets" element={<CustomSheetsPage />} />
            <Route path="/custom-sheets/:id" element={<SheetViewPage />} />
            <Route path="/problem/:id" element={<ProblemDetailPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/badges" element={<BadgesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/user/:userId" element={<PublicProfilePage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function ProtectedLayout() {
  const { user, profile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-dark text-white text-sm font-mono">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-neon-green/20 border-t-neon-green animate-spin" />
          <span className="text-white/40">Loading session...</span>
        </div>
      </div>
    );
  }
  
  // If user is not authenticated, redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // If user is logged in, but profile is missing/incomplete
  if (user && profile?._isNew) return <Navigate to="/setup-profile" replace />;
  
  return <AppLayout />;
}

function SetupProfileRoute() {
  const { user, profile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-dark text-white text-sm font-mono">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-neon-green/20 border-t-neon-green animate-spin" />
          <span className="text-white/40">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" replace />;
  if (profile && !profile._isNew) return <Navigate to="/dashboard" replace />;
  
  return <ProfileSetupPage />;
}

// Root route: Landing for unauthenticated, Dashboard for authenticated
function RootRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-dark text-white text-sm font-mono">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-neon-green/20 border-t-neon-green animate-spin" />
          <span className="text-white/40">Loading...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LandingPage />;
}

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes — no sidebar, full screen */}
            <Route path="/" element={<RootRoute />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Setup Profile Route — full screen */}
            <Route path="/setup-profile" element={<SetupProfileRoute />} />

            {/* All app pages — with sidebar and navbar */}
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}
