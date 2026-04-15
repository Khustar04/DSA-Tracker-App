// ═══════════════════════════════════════════════
// AUTH CONTEXT — Session, Login, Logout, Signup, OTP
// ═══════════════════════════════════════════════
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import supabaseService from '../services/supabaseService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailNotVerified, setEmailNotVerified] = useState(false);

  // Helper to load profile
  const fetchAndSetProfile = async (authSession) => {
    try {
      if (!authSession?.user) {
        setProfile(null);
        return;
      }
      const prof = await supabaseService.getProfile(authSession.user.id);
      setProfile(prof || { _isNew: true });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile({ _isNew: true });
    }
  };

  useEffect(() => {
    // Bulletproof fallback: Never get stuck on loading
    const fallbackTimer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    if (!isSupabaseConfigured()) {
      clearTimeout(fallbackTimer);
      setLoading(false);
      return;
    }

    try {
      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        // Block unverified email users from accessing the app
        if (session?.user && session.user.app_metadata?.provider === 'email' && !session.user.email_confirmed_at) {
          // Sign them out — they haven't verified yet
          supabase.auth.signOut();
          setEmailNotVerified(true);
          setLoading(false);
          return;
        }
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchAndSetProfile(session).finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      }).catch((err) => {
        console.error("Auth Session Error:", err);
        setLoading(false);
      });
    } catch (err) {
      console.error("Auth Init Error:", err);
      setLoading(false);
    }

    // Listen for auth changes
    let subscription = null;
    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          // Block unverified email users
          if (session?.user && session.user.app_metadata?.provider === 'email' && !session.user.email_confirmed_at) {
            supabase.auth.signOut();
            setEmailNotVerified(true);
            setSession(null);
            setUser(null);
            setProfile(null);
            setLoading(false);
            return;
          }
          setEmailNotVerified(false);
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchAndSetProfile(session);
          } else {
            setProfile(null);
          }
          setLoading(false);
        }
      );
      subscription = data.subscription;
    } catch (err) {
      console.error("Auth Listener Error:", err);
      setLoading(false);
    }

    return () => {
      clearTimeout(fallbackTimer);
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const completeProfile = (newProfile) => {
    setProfile(newProfile);
  };

  // ─── Google OAuth login ────────────────────────────────────
  const loginWithGoogle = async () => {
    if (!isSupabaseConfigured()) {
      return { error: { message: 'Supabase not configured. Add credentials to .env file.' } };
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    return { data, error };
  };

  // ─── Email + Password Signup ───────────────────────────────
  const signUpWithEmail = async (email, password, fullName, username) => {
    if (!isSupabaseConfigured()) {
      return { error: { message: 'Supabase not configured.' } };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: username,
          },
        },
      });

      if (error) return { error };

      // Check if email confirmation is required
      // If user.identities is empty, it means the user ALREADY existed but is unconfirmed.
      // If confirmed_at is null, they are fresh or unconfirmed.
      const needsVerification =
        data.user &&
        (!data.user.confirmed_at || data.user.identities?.length === 0);

      // CRITICAL FIX: Supabase's default signUp() DOES NOT send an email if the user already exists!
      // So if identities is 0 (duplicate signup), we must explicitly trigger a resend so they get the code.
      if (needsVerification && data.user.identities?.length === 0) {
        const { error: resendError } = await supabase.auth.resend({ type: 'signup', email });
        // We ignore resend rate-limit errors because they might have just requested it, 
        // but if it works, they'll get the email.
        if (resendError && !resendError.message.includes('rate limit')) {
          console.error("Resend error on duplicate signup:", resendError);
        }
      }

      return { data, error: null, needsVerification };
    } catch (err) {
      return { error: { message: err.message || 'Signup failed' } };
    }
  };

  // ─── Verify OTP ────────────────────────────────────────────
  const verifyOtp = async (email, token) => {
    if (!isSupabaseConfigured()) {
      return { error: { message: 'Supabase not configured.' } };
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup',
      });

      return { data, error };
    } catch (err) {
      return { error: { message: err.message || 'Verification failed' } };
    }
  };

  // ─── Resend OTP ────────────────────────────────────────────
  const resendOtp = async (email) => {
    if (!isSupabaseConfigured()) {
      return { error: { message: 'Supabase not configured.' } };
    }

    try {
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      return { data, error };
    } catch (err) {
      return { error: { message: err.message || 'Failed to resend code' } };
    }
  };

  // ─── Email/Password Login ─────────────────────────────────
  const loginWithEmail = async (emailOrUsername, password) => {
    if (!isSupabaseConfigured()) {
      return { error: { message: 'Supabase not configured.' } };
    }

    try {
      let email = emailOrUsername;

      // If it doesn't look like an email, treat it as a username
      if (!emailOrUsername.includes('@')) {
        const resolvedEmail = await supabaseService.getEmailByUsername(emailOrUsername);
        if (!resolvedEmail) {
          return { error: { message: 'No account found with that username.' } };
        }
        email = resolvedEmail;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { data, error };

      // Enforce email verification for email/password signups
      if (data.user && !data.user.email_confirmed_at) {
        // Sign them out immediately — don't let unverified users in
        await supabase.auth.signOut();
        return {
          data: null,
          error: { message: 'Please verify your email address before logging in. Check your inbox for the verification code.' },
          needsVerification: true,
          email,
        };
      }

      return { data, error };
    } catch (err) {
      return { error: { message: err.message || 'Login failed' } };
    }
  };

  // ─── Forgot Password ──────────────────────────────────────
  const resetPassword = async (email) => {
    if (!isSupabaseConfigured()) {
      return { error: { message: 'Supabase not configured.' } };
    }

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { data, error };
    } catch (err) {
      return { error: { message: err.message } };
    }
  };

  // ─── Update Password (after reset link) ────────────────────
  const updatePassword = async (newPassword) => {
    if (!isSupabaseConfigured()) {
      return { error: { message: 'Supabase not configured.' } };
    }

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      return { data, error };
    } catch (err) {
      return { error: { message: err.message || 'Password update failed' } };
    }
  };

  // ─── Logout ────────────────────────────────────────────────
  const logout = async () => {
    if (!isSupabaseConfigured()) return;

    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setProfile(null);
      setSession(null);
    }
    return { error };
  };

  const value = {
    user,
    profile,
    session,
    loading,
    emailNotVerified,
    isAuthenticated: !!user,
    isSupabaseReady: isSupabaseConfigured(),
    loginWithGoogle,
    signUpWithEmail,
    verifyOtp,
    resendOtp,
    loginWithEmail,
    resetPassword,
    updatePassword,
    logout,
    completeProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
