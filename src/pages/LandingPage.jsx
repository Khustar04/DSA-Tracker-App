import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

const FEATURES = [
  {
    icon: '📊',
    title: 'Smart Tracking',
    description: 'Track 143+ curated DSA problems across a structured 6-month learning plan.',
    gradient: 'from-emerald-500/20 to-cyan-500/20',
  },
  {
    icon: '👑',
    title: 'Striver A2Z Sheet',
    description: 'Built-in Striver A2Z sheet with 455 problems. Mark progress and stay organized.',
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  {
    icon: '📑',
    title: 'Custom Sheets',
    description: 'Create your own problem sheets. Add custom problems with notes and hints.',
    gradient: 'from-orange-500/20 to-amber-500/20',
  },
  {
    icon: '🏆',
    title: 'Friends Leaderboard',
    description: 'Compete with friends in real-time. See who solves the most problems.',
    gradient: 'from-sky-500/20 to-indigo-500/20',
  },
  {
    icon: '⭐',
    title: 'Badges & Achievements',
    description: 'Earn badges for milestones like streaks, centuries, and completing entire sheets.',
    gradient: 'from-yellow-500/20 to-orange-500/20',
  },
  {
    icon: '☁️',
    title: 'Cloud Sync',
    description: 'Your progress syncs across all devices automatically via Supabase.',
    gradient: 'from-teal-500/20 to-emerald-500/20',
  },
];

const STATS = [
  { value: '600+', label: 'Problems' },
  { value: '18', label: 'Steps' },
  { value: '10+', label: 'Badges' },
  { value: '∞', label: 'Custom Sheets' },
];

// Floating particle component
function Particle({ delay, x, size }) {
  return (
    <div
      className="absolute rounded-full bg-neon-green/20 blur-sm pointer-events-none"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        left: `${x}%`,
        bottom: '-10px',
        animation: `particle-float ${8 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

export default function LandingPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePos({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-bg-dark overflow-hidden">
      {/* ═══ Navigation Bar ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-bg-dark/60 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-full px-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-neon-green/10 flex items-center justify-center border border-neon-green/20 group-hover:shadow-[0_0_15px_rgba(0,255,136,0.3)] transition-all duration-500">
              <span className="text-neon-green font-bold text-base font-mono">⟨/⟩</span>
            </div>
            <span className="text-lg font-display font-bold text-white group-hover:text-neon-green transition-colors duration-300">
              DSA Tracker
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-mono text-white/70 hover:text-white transition-colors duration-300"
              id="landing-login-btn"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2.5 text-sm font-mono text-bg-dark bg-neon-green rounded-lg hover:bg-neon-green/90 transition-all duration-300 shadow-[0_0_20px_rgba(0,255,136,0.25)] hover:shadow-[0_0_30px_rgba(0,255,136,0.4)] font-semibold"
              id="landing-signup-btn"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ Hero Section ═══ */}
      <section
        ref={heroRef}
        className="relative pt-32 pb-20 px-6 min-h-[90vh] flex items-center"
      >
        {/* Animated background gradient that follows mouse */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none transition-all duration-[2000ms]"
          style={{
            background: `radial-gradient(ellipse 600px 400px at ${mousePos.x}% ${mousePos.y}%, rgba(0,255,136,0.12), transparent 70%)`,
          }}
        />

        {/* Background grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <Particle key={i} delay={i * 1.2} x={10 + i * 12} size={4 + (i % 3) * 3} />
        ))}

        {/* Big ambient glow blobs */}
        <div className="absolute top-20 -left-32 w-[500px] h-[500px] bg-neon-green/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-20 -right-32 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/3 rounded-full blur-[180px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto text-center w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon-green/5 border border-neon-green/15 mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green" />
            </span>
            <span className="text-xs font-mono text-neon-green/80">Open Source · Free Forever</span>
          </div>

          {/* Main headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-white leading-[1.1] mb-6 animate-fade-in">
            Master DSA.{' '}
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green via-emerald-400 to-cyan-400">
                Track Everything.
              </span>
              <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-neon-green/0 via-neon-green/50 to-neon-green/0" />
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-white/40 max-w-2xl mx-auto mb-10 font-body leading-relaxed animate-fade-in" style={{ animationDelay: '0.15s' }}>
            A structured 6-month DSA roadmap with 600+ problems, Striver A2Z sheet,
            custom problem lists, streaks, badges, and a friends leaderboard —
            all synced to the cloud.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link
              to="/signup"
              className="group relative px-8 py-3.5 text-sm font-mono font-semibold text-bg-dark bg-neon-green rounded-xl hover:bg-neon-green/90 transition-all duration-300 shadow-[0_0_30px_rgba(0,255,136,0.3)] hover:shadow-[0_0_50px_rgba(0,255,136,0.5)] overflow-hidden"
              id="hero-signup-btn"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Tracking — It's Free
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="group-hover:translate-x-1 transition-transform">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 text-sm font-mono text-white/70 border border-white/10 rounded-xl hover:text-white hover:border-white/25 hover:bg-white/5 transition-all duration-300"
              id="hero-login-btn"
            >
              I already have an account
            </Link>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-center gap-8 sm:gap-16 animate-fade-in" style={{ animationDelay: '0.45s' }}>
            {STATS.map((stat, i) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-display font-bold text-white">{stat.value}</div>
                <div className="text-[10px] sm:text-xs font-mono text-white/30 mt-1 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Features Grid ═══ */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-3">
              Everything You Need
            </h2>
            <p className="text-sm text-white/40 font-body max-w-lg mx-auto">
              Built with the tools and features that serious DSA grinders actually need.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:border-neon-green/15 hover:bg-white/[0.04] transition-all duration-500"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                {/* Hover glow */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                <div className="relative z-10">
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h3 className="text-base font-display font-semibold text-white mb-2 group-hover:text-neon-green transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-white/40 font-body leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ How It Works ═══ */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-3">
              Get Started in 3 Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up with email or Google. Set your username and profile.' },
              { step: '02', title: 'Pick Your Sheet', desc: 'Use the built-in tracker, Striver A2Z, or create your own custom sheet.' },
              { step: '03', title: 'Track & Compete', desc: 'Mark problems solved, build streaks, earn badges, and compete with friends.' },
            ].map((item, i) => (
              <div key={item.step} className="relative text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-neon-green/5 border border-neon-green/15 mb-4">
                  <span className="text-neon-green font-display font-bold text-lg">{item.step}</span>
                </div>
                <h3 className="text-sm font-display font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-white/40 font-body leading-relaxed">{item.desc}</p>
                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-7 -right-3 w-6 h-[1px] bg-gradient-to-r from-neon-green/20 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Final CTA ═══ */}
      <section className="relative py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative bg-gradient-to-br from-neon-green/5 to-transparent border border-neon-green/10 rounded-3xl p-10 sm:p-14">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-60 h-20 bg-neon-green/10 blur-[80px] pointer-events-none" />
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4 relative z-10">
              Ready to grind?
            </h2>
            <p className="text-sm text-white/40 font-body mb-8 relative z-10">
              Join hundreds of developers tracking their DSA progress. It's completely free.
            </p>
            <Link
              to="/signup"
              className="relative z-10 inline-flex items-center gap-2 px-8 py-3.5 text-sm font-mono font-semibold text-bg-dark bg-neon-green rounded-xl hover:bg-neon-green/90 transition-all duration-300 shadow-[0_0_30px_rgba(0,255,136,0.3)]"
              id="final-cta-btn"
            >
              Create Free Account
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-neon-green/10 flex items-center justify-center border border-neon-green/20">
              <span className="text-neon-green font-bold text-[9px] font-mono">⟨/⟩</span>
            </div>
            <span className="text-xs font-mono text-white/30">DSA Tracker · Built by Khustar</span>
          </div>
          <span className="text-[10px] font-mono text-white/20">
            Target: October 2026 🎯
          </span>
        </div>
      </footer>

      {/* Inline keyframes for particle animation */}
      <style>{`
        @keyframes particle-float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
