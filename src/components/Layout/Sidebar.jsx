import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '◈', description: 'Overview & stats' },
  { path: '/tracker', label: 'Tracker', icon: '▤', description: 'Problem list' },
  { path: '/striver-a2z', label: 'Striver A2Z', icon: '👑', description: 'Curated 455 list' },
  { path: '/custom-sheets', label: 'Custom Sheets', icon: '📑', description: 'Your own lists' },
  { path: '/leaderboard', label: 'Leaderboard', icon: '🏆', description: 'Friends sync' },
  { path: '/badges', label: 'Achievements', icon: '⭐', description: 'Global tracker' },
  { path: '/notes', label: 'Notes', icon: '✎', description: 'Your notes' },
  { path: '/future-plan', label: 'Future Plan', icon: '◎', description: 'Roadmap' },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { user, isAuthenticated, isSupabaseReady } = useAuth();

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userAvatar = user?.user_metadata?.avatar_url;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 z-40 w-56 sidebar-gradient border-r border-white/5 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto custom-scrollbar p-4">
          {/* User Info (when authenticated) */}
          {isAuthenticated && (
            <Link to="/profile" onClick={onClose} className="mb-4 px-3 py-3 rounded bg-neon-green/[0.03] border border-neon-green/10 hover:bg-neon-green/[0.08] transition-colors block cursor-pointer group">
              <div className="flex items-center gap-2.5">
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="w-8 h-8 rounded-full border border-neon-green/20" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-neon-green/10 flex items-center justify-center border border-neon-green/20">
                    <span className="text-neon-green text-xs font-bold">{userName.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-mono text-white/80 group-hover:text-white truncate transition-colors">{userName}</p>
                  <p className="text-[9px] font-mono text-neon-green/50 flex items-center gap-1 mt-0.5">
                    <span className="w-1 h-1 rounded-full bg-neon-green" />
                    Edit Profile
                  </p>
                </div>
              </div>
            </Link>
          )}

          {/* Nav Items */}
          <div className="space-y-1 mt-2">
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-300 group ${
                    isActive
                      ? 'nav-active'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className={`text-base ${isActive ? 'text-neon-green' : 'text-white/30 group-hover:text-white/60'}`}>
                    {item.icon}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs font-mono font-medium">{item.label}</span>
                    <span className="text-[9px] font-body text-white/20">{item.description}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Bottom Section */}
          <div className="mt-auto space-y-3">
            <div className="gradient-divider" />

            {/* Login prompt for unauthenticated users */}
            {!isAuthenticated && isSupabaseReady && (
              <Link
                to="/login"
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-2 rounded bg-neon-green/5 border border-neon-green/10 hover:bg-neon-green/10 transition-colors group"
              >
                <span className="text-xs">☁️</span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-neon-green/70 group-hover:text-neon-green">Sign in to sync</span>
                  <span className="text-[8px] font-mono text-white/20">Access from any device</span>
                </div>
              </Link>
            )}

            <div className="px-3 py-2">
              <p className="text-[10px] font-mono text-white/20 leading-relaxed">
                Target: October 2026 🎯
              </p>
              <p className="text-[9px] font-mono text-white/15 mt-1">
                143 problems · 6 months · 22 weeks
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
