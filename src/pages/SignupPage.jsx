import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Mail, Lock, User, AtSign, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';

export default function SignupPage() {
  const { signUpWithEmail, loginWithGoogle, verifyOtp, resendOtp, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    if (!formData.username.trim() || formData.username.length < 3)
      errs.username = 'Username must be at least 3 characters';
    if (!/^[a-z0-9_]+$/.test(formData.username))
      errs.username = 'Only lowercase letters, numbers, underscores';
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Invalid email format';
    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 6) errs.password = 'At least 6 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const { error, needsVerification } = await signUpWithEmail(
        formData.email,
        formData.password,
        formData.fullName,
        formData.username
      );

      if (error) {
        toast.error(error.message || 'Signup failed');
        setLoading(false);
        return;
      }

      if (needsVerification) {
        setStep('otp');
        toast.success('Verification code sent to your email!');
      } else {
        toast.success('Account created!');
        navigate('/setup-profile', { replace: true });
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value) => {
    // Only allow digits
    const cleaned = value.replace(/\D/g, '');
    setOtpCode(cleaned);
  };

  const handleVerifyOtp = async () => {
    const code = otpCode.trim();
    if (code.length < 6) {
      toast.error('Please enter the verification code from your email');
      return;
    }

    setLoading(true);
    try {
      const { error } = await verifyOtp(formData.email, code);
      if (error) {
        toast.error(error.message || 'Invalid OTP');
      } else {
        toast.success('Email verified! Setting up your profile...');
        navigate('/setup-profile', { replace: true });
      }
    } catch (err) {
      toast.error('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    const { error } = await loginWithGoogle();
    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full bg-black/40 border rounded-xl px-4 py-3 pl-11 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all duration-300 ${
      errors[field]
        ? 'border-red-500/50 focus:border-red-500'
        : 'border-white/10 focus:border-neon-green/50 hover:border-white/20'
    }`;

  // ═══ OTP Verification Screen ═══
  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-neon-green/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[150px]" />
        </div>

        <div className="relative w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neon-green/10 border border-neon-green/20 mb-4">
              <Mail className="text-neon-green" size={28} />
            </div>
            <h1 className="text-2xl font-display font-bold text-white">Verify Your Email</h1>
            <p className="text-sm text-white/40 font-body mt-2 leading-relaxed">
              We sent a verification code to <span className="text-neon-green/70 font-mono">{formData.email}</span>
            </p>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
            {/* OTP Input */}
            <div className="mb-6">
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                value={otpCode}
                onChange={(e) => handleOtpChange(e.target.value)}
                placeholder="Enter verification code"
                className={`w-full text-center text-2xl font-mono font-bold tracking-[0.4em] rounded-xl border py-4 px-4 transition-all duration-300 focus:outline-none ${
                  otpCode.length >= 6
                    ? 'border-neon-green/50 bg-neon-green/5 text-neon-green'
                    : 'border-white/10 bg-black/40 text-white placeholder:text-white/15'
                } focus:border-neon-green`}
                id="otp-input"
              />
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={loading || otpCode.length < 6}
              className="w-full flex items-center justify-center gap-2 py-3 bg-neon-green text-bg-dark rounded-xl text-sm font-mono font-semibold hover:bg-neon-green/90 transition-all duration-300 shadow-[0_0_20px_rgba(0,255,136,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
              id="verify-otp-btn"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-bg-dark/30 border-t-bg-dark rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle size={16} />
                  Verify & Continue
                </>
              )}
            </button>

            <p className="text-center text-xs text-white/30 font-mono mt-4">
              Didn't receive the code?{' '}
              <button
                onClick={async () => {
                  if (resendCooldown > 0) return;
                  const { error } = await resendOtp(formData.email);
                  if (error) {
                    toast.error(error.message || 'Failed to resend code');
                  } else {
                    toast.success('New code sent!');
                    setResendCooldown(60);
                    const timer = setInterval(() => {
                      setResendCooldown((prev) => {
                        if (prev <= 1) {
                          clearInterval(timer);
                          return 0;
                        }
                        return prev - 1;
                      });
                    }, 1000);
                  }
                }}
                disabled={resendCooldown > 0}
                className={`transition-colors ${
                  resendCooldown > 0
                    ? 'text-white/20 cursor-not-allowed'
                    : 'text-neon-green/70 hover:text-neon-green'
                }`}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend'}
              </button>
            </p>
          </div>

          <p className="text-center text-xs text-white/20 font-mono mt-6">
            <button onClick={() => setStep('form')} className="hover:text-white/40 transition-colors">
              ← Back to signup
            </button>
          </p>
        </div>
      </div>
    );
  }

  // ═══ Signup Form Screen ═══
  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-neon-green/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-neon-green/10 border border-neon-green/20 mb-4 hover:shadow-[0_0_20px_rgba(0,255,136,0.2)] transition-all duration-300">
            <span className="text-neon-green font-bold text-xl font-mono">⟨/⟩</span>
          </Link>
          <h1 className="text-2xl font-display font-bold text-white">Create Your Account</h1>
          <p className="text-sm text-white/40 font-body mt-2">
            Start your DSA journey today
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
          {/* Google Login */}
          <button
            onClick={handleGoogleSignup}
            disabled={loading || authLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white text-gray-800 font-body font-medium text-sm hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 mb-6"
            id="google-signup-btn"
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
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-white/10" />
            <span className="text-[10px] font-mono text-white/20 uppercase">or sign up with email</span>
            <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData(p => ({ ...p, fullName: e.target.value }))}
                  className={inputClass('fullName')}
                  id="signup-fullname"
                />
              </div>
              {errors.fullName && <p className="text-[10px] text-red-400 mt-1 ml-1 font-mono">{errors.fullName}</p>}
            </div>

            {/* Username */}
            <div>
              <div className="relative">
                <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input
                  type="text"
                  placeholder="Username (e.g. dsawarrior)"
                  value={formData.username}
                  onChange={(e) => {
                    const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                    setFormData(p => ({ ...p, username: val }));
                    if (errors.username) setErrors(p => ({ ...p, username: null }));
                  }}
                  className={inputClass('username')}
                  id="signup-username"
                />
              </div>
              {errors.username && <p className="text-[10px] text-red-400 mt-1 ml-1 font-mono">{errors.username}</p>}
            </div>

            {/* Email */}
            <div>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData(p => ({ ...p, email: e.target.value }));
                    if (errors.email) setErrors(p => ({ ...p, email: null }));
                  }}
                  className={inputClass('email')}
                  id="signup-email"
                />
              </div>
              {errors.email && <p className="text-[10px] text-red-400 mt-1 ml-1 font-mono">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password (min 6 characters)"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData(p => ({ ...p, password: e.target.value }));
                    if (errors.password) setErrors(p => ({ ...p, password: null }));
                  }}
                  className={inputClass('password')}
                  id="signup-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-red-400 mt-1 ml-1 font-mono">{errors.password}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-neon-green text-bg-dark rounded-xl text-sm font-mono font-semibold hover:bg-neon-green/90 transition-all duration-300 shadow-[0_0_20px_rgba(0,255,136,0.25)] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              id="signup-submit-btn"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-bg-dark/30 border-t-bg-dark rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Login link */}
        <p className="text-center text-xs text-white/30 font-body mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-neon-green/70 hover:text-neon-green transition-colors font-mono">
            Log in
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
