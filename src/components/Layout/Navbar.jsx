import { Link, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '◈' },
  { path: '/tracker', label: 'Tracker', icon: '▤' },
  { path: '/notes', label: 'Notes', icon: '✎' },
  { path: '/future-plan', label: 'Future Plan', icon: '◎' },
];

export default function Navbar({ onToggleSidebar, sidebarOpen }) {
  const location = useLocation();
  const { user, isAuthenticated, logout, isSupabaseReady } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
  };

  // Get user display name and avatar
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userAvatar = user?.user_metadata?.avatar_url;
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-bg-dark/80 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left: Logo & Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-white/60 hover:text-neon-green transition-colors"
            id="sidebar-toggle"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded bg-neon-green/10 flex items-center justify-center border border-neon-green/20 group-hover:neon-glow-sm transition-all duration-300">
              <span className="text-neon-green font-bold text-sm font-mono">⟨/⟩</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-display font-bold text-white group-hover:text-neon-green transition-colors">
                DSA Tracker
              </span>
              <span className="text-[10px] font-mono text-white/30 hidden sm:block">6-month journey</span>
            </div>
          </Link>
        </div>

        {/* Center: Nav Links (desktop) */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-all duration-300 ${
                  isActive
                    ? 'text-neon-green bg-neon-green/10 border border-neon-green/20'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="mr-1.5">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right: User Section */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Cloud sync indicator */}
              <span className="text-[9px] font-mono text-neon-green/40 hidden sm:flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                Synced
              </span>

              {/* User Avatar & Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 group"
                  id="user-menu-btn"
                >
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt={userName}
                      className="w-7 h-7 rounded-full border border-neon-green/20 group-hover:border-neon-green/50 transition-all"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-neon-green/10 flex items-center justify-center border border-neon-green/20 group-hover:border-neon-green/50 transition-all">
                      <span className="text-neon-green text-xs font-bold font-mono">{userInitial}</span>
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 top-10 w-56 glass-card border border-white/10 p-2 animate-slide-up z-50">
                    <div className="px-3 py-2 border-b border-white/5 mb-1">
                      <p className="text-xs font-mono text-white truncate">{userName}</p>
                      <p className="text-[9px] font-mono text-white/30 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-xs font-mono text-hard/70 hover:text-hard hover:bg-hard/5 rounded transition-colors"
                      id="logout-btn"
                    >
                      ⏻ Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <span className="text-[10px] font-mono text-white/20 hidden sm:block">
                Built by Khustar
              </span>
              {isSupabaseReady ? (
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-mono text-neon-green border border-neon-green/20 rounded hover:bg-neon-green/10 transition-all"
                  id="login-btn"
                >
                  Sign In
                </Link>
              ) : (
                <div className="w-7 h-7 rounded bg-neon-green/10 flex items-center justify-center border border-neon-green/20">
                  <span className="text-neon-green text-xs font-bold font-mono">K</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
