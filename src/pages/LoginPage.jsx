import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function LoginPage() {
  const { loginWithGoogle, isAuthenticated, loading, isSupabaseReady } = useAuth();
  const [error, setError] = useState(null);
  const [loggingIn, setLoggingIn] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleGoogleLogin = async () => {
    setError(null);
    setLoggingIn(true);

    const { error } = await loginWithGoogle();

    if (error) {
      setError(error.message);
      setLoggingIn(false);
    }
    // On success, Supabase redirects to Google OAuth,
    // so we don't need to handle success here
  };

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4">
      {/* Background glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-green/5 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-[128px]" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-neon-green/10 border border-neon-green/20 mb-4 neon-glow">
            <span className="text-neon-green font-bold text-2xl font-mono">⟨/⟩</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white neon-text-glow">
            DSA Tracker
          </h1>
          <p className="text-sm font-mono text-white/30 mt-2">
            Track your 6-month DSA journey
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8">
          <div className="text-center mb-6">
            <h2 className="text-lg font-display font-semibold text-white">
              Welcome Back
            </h2>
            <p className="text-xs font-body text-white/40 mt-1">
              Sign in to sync your progress across devices
            </p>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loggingIn || loading || !isSupabaseReady}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-white text-gray-800 font-body font-medium text-sm hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            id="google-login-btn"
          >
            {/* Google Icon */}
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18Z" />
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17Z" />
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07Z" />
              <path fill="#EA4335" d="M8.98 3.58c1.16 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.9Z" />
            </svg>
            {loggingIn ? 'Redirecting...' : 'Continue with Google'}
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 rounded bg-hard/10 border border-hard/20">
              <p className="text-xs font-mono text-hard">{error}</p>
            </div>
          )}

          {/* Supabase not configured warning */}
          {!isSupabaseReady && (
            <div className="mt-4 p-3 rounded bg-medium/10 border border-medium/20">
              <p className="text-xs font-mono text-medium">
                ⚠️ Supabase not configured. Add your credentials to the .env file.
              </p>
            </div>
          )}

          <div className="gradient-divider my-6" />

          {/* Continue Offline */}
          <div className="text-center">
            <p className="text-[10px] font-mono text-white/20 mb-3">or</p>
            <a
              href="/"
              className="text-xs font-mono text-neon-green/60 hover:text-neon-green transition-colors"
              id="continue-offline"
            >
              Continue offline (localStorage) →
            </a>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { icon: '☁️', label: 'Cloud Sync' },
            { icon: '📊', label: '143 Problems' },
            { icon: '🔥', label: 'Streak Track' },
          ].map(feature => (
            <div key={feature.label} className="glass-card-static p-3 text-center">
              <span className="text-lg block mb-1">{feature.icon}</span>
              <span className="text-[9px] font-mono text-white/30">{feature.label}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-[9px] font-mono text-white/15 mt-6">
          Built by Khustar · Target: October 2026 🎯
        </p>
      </div>
    </div>
  );
}
