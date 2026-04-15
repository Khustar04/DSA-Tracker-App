import { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

// ─── Layout components (always needed, keep in main bundle) ──────
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';

// ─── Lazy-loaded pages (code-split into separate chunks) ─────────
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const ProfileSetupPage = lazy(() => import('./pages/ProfileSetupPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TrackerPage = lazy(() => import('./pages/TrackerPage'));
const NotesPage = lazy(() => import('./pages/NotesPage'));
const FuturePlanPage = lazy(() => import('./pages/FuturePlanPage'));
const StriverPage = lazy(() => import('./pages/StriverPage'));
const CustomSheetsPage = lazy(() => import('./pages/CustomSheetsPage'));
const SheetViewPage = lazy(() => import('./pages/SheetViewPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const BadgesPage = lazy(() => import('./pages/BadgesPage'));
const ProblemDetailPage = lazy(() => import('./pages/ProblemDetailPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PublicProfilePage = lazy(() => import('./pages/PublicProfilePage'));

// ─── Shared loading spinner ──────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] bg-bg-dark text-white text-sm font-mono">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-neon-green/20 border-t-neon-green animate-spin" />
        <span className="text-white/40">Loading...</span>
      </div>
    </div>
  );
}

// ─── Full-screen loading spinner (for auth guards) ───────────────
function FullPageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-dark text-white text-sm font-mono">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-neon-green/20 border-t-neon-green animate-spin" />
        <span className="text-white/40">Loading session...</span>
      </div>
    </div>
  );
}

// ─── App Layout (sidebar + navbar shell) ─────────────────────────
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
          <Suspense fallback={<PageLoader />}>
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
          </Suspense>
        </div>
      </main>
    </div>
  );
}

// ─── Protected Layout (auth guard) ──────────────────────────────
function ProtectedLayout() {
  const { user, profile, loading } = useAuth();
  
  if (loading) return <FullPageLoader />;
  
  // If user is not authenticated, redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // If profile fetch is delayed, wait for it before rendering content.
  if (user && profile?._profilePending) return <FullPageLoader />;
  
  // Allow user to proceed with or without a completed profile.
  // Setup is now explicitly triggered only during the initial signup flow.
  return <AppLayout />;
}

// ─── Setup Profile Route ────────────────────────────────────────
function SetupProfileRoute() {
  const { user, profile, loading } = useAuth();
  
  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (profile && !profile._isNew) return <Navigate to="/dashboard" replace />;
  
  return (
    <Suspense fallback={<FullPageLoader />}>
      <ProfileSetupPage />
    </Suspense>
  );
}

// ─── Root route: Landing for guests, Dashboard for users ────────
function RootRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <FullPageLoader />;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Suspense fallback={<FullPageLoader />}>
      <LandingPage />
    </Suspense>
  );
}

// ─── App Entry ──────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<FullPageLoader />}>
            <Routes>
              {/* Public routes — no sidebar, full screen */}
              <Route path="/" element={<RootRoute />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              
              {/* Setup Profile Route — full screen */}
              <Route path="/setup-profile" element={<SetupProfileRoute />} />

              {/* All app pages — with sidebar and navbar */}
              <Route path="/*" element={<ProtectedLayout />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}
