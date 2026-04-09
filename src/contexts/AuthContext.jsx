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
      // If user.identities is empty or user.confirmed_at is null, OTP is needed
      const needsVerification =
        data.user &&
        (!data.user.confirmed_at || data.user.identities?.length === 0);

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
        redirectTo: `${window.location.origin}/login`,
      });
      return { data, error };
    } catch (err) {
      return { error: { message: err.message } };
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
    isAuthenticated: !!user,
    isSupabaseReady: isSupabaseConfigured(),
    loginWithGoogle,
    signUpWithEmail,
    verifyOtp,
    loginWithEmail,
    resetPassword,
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
