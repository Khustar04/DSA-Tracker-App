import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const {
    loginWithGoogle,
    loginWithEmail,
    resetPassword,
    isAuthenticated,
    loading: authLoading,
    isSupabaseReady,
  } = useAuth();

  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState(''); // email or username
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    const { error: loginError } = await loginWithEmail(identifier.trim(), password);

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
    } else {
      toast.success('Welcome back!');
      navigate('/', { replace: true });
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    const { error } = await loginWithGoogle();
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error('Enter your email address');
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(forgotEmail.trim());
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password reset link sent to your email!');
      setShowForgot(false);
    }
    setLoading(false);
  };

  const inputClass = `w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pl-11 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-neon-green/50 hover:border-white/20 transition-all duration-300`;

  // ═══ Forgot Password Modal ═══
  if (showForgot) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-neon-green/5 rounded-full blur-[150px]" />
        </div>

        <div className="relative w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-neon-green/10 border border-neon-green/20 mb-4">
              <Mail className="text-neon-green" size={24} />
            </div>
            <h1 className="text-2xl font-display font-bold text-white">Reset Password</h1>
            <p className="text-sm text-white/40 font-body mt-2">
              Enter your email and we'll send you a reset link.
            </p>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input
                  type="email"
                  placeholder="Email address"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className={inputClass}
                  id="forgot-email"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-neon-green text-bg-dark rounded-xl text-sm font-mono font-semibold hover:bg-neon-green/90 transition-all duration-300 shadow-[0_0_20px_rgba(0,255,136,0.2)] disabled:opacity-50"
                id="reset-submit-btn"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-bg-dark/30 border-t-bg-dark rounded-full animate-spin" />
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            <button
              onClick={() => setShowForgot(false)}
              className="w-full text-center text-xs text-white/30 font-mono mt-4 hover:text-white/50 transition-colors"
            >
              ← Back to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══ Main Login Screen ═══
  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4">
      {/* Background glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-neon-green/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-neon-green/10 border border-neon-green/20 mb-4 hover:shadow-[0_0_20px_rgba(0,255,136,0.2)] transition-all duration-300">
            <span className="text-neon-green font-bold text-xl font-mono">⟨/⟩</span>
          </Link>
          <h1 className="text-2xl font-display font-bold text-white">
            Welcome Back
          </h1>
          <p className="text-sm text-white/40 font-body mt-2">
            Sign in to your DSA Tracker account
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading || authLoading || !isSupabaseReady}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white text-gray-800 font-body font-medium text-sm hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            id="google-login-btn"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18Z" />
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17Z" />
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07Z" />
              <path fill="#EA4335" d="M8.98 3.58c1.16 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.9Z" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-white/10" />
            <span className="text-[10px] font-mono text-white/20 uppercase">or</span>
            <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-white/10" />
          </div>

          {/* Email/Username Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email or Username */}
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" size={16} />
              <input
                type="text"
                placeholder="Email or Username"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setError(null);
                }}
                className={inputClass}
                id="login-identifier"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                className={inputClass}
                id="login-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-[10px] font-mono text-white/30 hover:text-neon-green/70 transition-colors"
                id="forgot-password-link"
              >
                Forgot password?
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-xs font-mono text-red-400">{error}</p>
              </div>
            )}

            {/* Supabase not configured warning */}
            {!isSupabaseReady && (
              <div className="p-3 rounded-lg bg-medium/10 border border-medium/20">
                <p className="text-xs font-mono text-medium">
                  ⚠️ Supabase not configured. Add credentials to .env file.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isSupabaseReady}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-neon-green text-bg-dark rounded-xl text-sm font-mono font-semibold hover:bg-neon-green/90 transition-all duration-300 shadow-[0_0_20px_rgba(0,255,136,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
              id="login-submit-btn"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-bg-dark/30 border-t-bg-dark rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Signup link */}
        <p className="text-center text-xs text-white/30 font-body mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-neon-green/70 hover:text-neon-green transition-colors font-mono">
            Sign up
          </Link>
        </p>

        {/* Footer */}
        <p className="text-center text-[9px] font-mono text-white/15 mt-4">
          Built by Khustar · Target: October 2026 🎯
        </p>
      </div>
    </div>
  );
}
