import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function ResetPasswordPage() {
  const { updatePassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(password);

    if (error) {
      toast.error(error.message || 'Failed to update password');
    } else {
      setSuccess(true);
      toast.success('Password updated successfully!');
    }
    setLoading(false);
  };

  const inputClass = `w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pl-11 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-neon-green/50 hover:border-white/20 transition-all duration-300`;

  // ═══ Success Screen ═══
  if (success) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-neon-green/5 rounded-full blur-[150px]" />
        </div>

        <div className="relative w-full max-w-md animate-fade-in text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neon-green/10 border border-neon-green/20 mb-6">
            <ShieldCheck className="text-neon-green" size={28} />
          </div>
          <h1 className="text-2xl font-display font-bold text-white mb-2">Password Updated!</h1>
          <p className="text-sm text-white/40 font-body mb-8">
            Your password has been successfully changed. You can now sign in with your new password.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-neon-green text-bg-dark rounded-xl text-sm font-mono font-semibold hover:bg-neon-green/90 transition-all duration-300 shadow-[0_0_20px_rgba(0,255,136,0.2)]"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // ═══ Reset Form ═══
  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-neon-green/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-neon-green/10 border border-neon-green/20 mb-4">
            <Lock className="text-neon-green" size={24} />
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Set New Password</h1>
          <p className="text-sm text-white/40 font-body mt-2">
            Enter your new password below.
          </p>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="New password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                id="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${inputClass} ${
                  confirmPassword && password !== confirmPassword
                    ? '!border-red-500/50'
                    : confirmPassword && password === confirmPassword
                    ? '!border-neon-green/50'
                    : ''
                }`}
                id="confirm-password"
                required
              />
            </div>

            {/* Password mismatch hint */}
            {confirmPassword && password !== confirmPassword && (
              <p className="text-[10px] font-mono text-red-400 ml-1">Passwords do not match</p>
            )}

            {/* Password strength indicator */}
            {password && (
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                      password.length >= level * 3
                        ? level <= 1 ? 'bg-red-400' : level <= 2 ? 'bg-yellow-400' : level <= 3 ? 'bg-neon-green/60' : 'bg-neon-green'
                        : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password || !confirmPassword || password !== confirmPassword}
              className="w-full flex items-center justify-center gap-2 py-3 bg-neon-green text-bg-dark rounded-xl text-sm font-mono font-semibold hover:bg-neon-green/90 transition-all duration-300 shadow-[0_0_20px_rgba(0,255,136,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
              id="reset-password-btn"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-bg-dark/30 border-t-bg-dark rounded-full animate-spin" />
              ) : (
                'Update Password'
              )}
            </button>
          </form>

          <Link
            to="/login"
            className="w-full text-center text-xs text-white/30 font-mono mt-4 hover:text-white/50 transition-colors block"
          >
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
