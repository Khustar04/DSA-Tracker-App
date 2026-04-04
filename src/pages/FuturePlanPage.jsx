const futureFeatures = [
  {
    icon: '🔐',
    name: 'User Authentication',
    description: 'Login/Signup so progress syncs across devices. OAuth support for Google & GitHub.',
    status: 'Planned',
    tech: 'Supabase Auth / Firebase Auth',
    color: '#00ff88',
  },
  {
    icon: '☁️',
    name: 'Cloud Sync',
    description: 'Save progress to the cloud and access from any device. Real-time sync across tabs.',
    status: 'Planned',
    tech: 'Supabase DB / Firestore',
    color: '#6366f1',
  },
  {
    icon: '🔥',
    name: 'Streak Tracking',
    description: 'Daily streak with a calendar heatmap like GitHub contributions. Visual motivation.',
    status: 'Coming Soon',
    tech: 'Supabase',
    color: '#f59e0b',
  },
  {
    icon: '📊',
    name: 'Analytics Dashboard',
    description: 'Charts showing problems solved per day/week. Track your velocity and patterns.',
    status: 'Planned',
    tech: 'Recharts + Supabase',
    color: '#06b6d4',
  },
  {
    icon: '👥',
    name: 'Leaderboard',
    description: 'Compare progress with friends. Compete and stay motivated together.',
    status: 'Planned',
    tech: 'Supabase Realtime',
    color: '#a855f7',
  },
  {
    icon: '🤖',
    name: 'AI Hint System',
    description: 'Get intelligent hints for problems using AI. No spoilers, just the right push.',
    status: 'Planned',
    tech: 'Anthropic Claude API',
    color: '#ec4899',
  },
  {
    icon: '📱',
    name: 'Mobile App',
    description: 'React Native version of the tracker. Track your progress on the go.',
    status: 'Planned',
    tech: 'React Native + Firebase',
    color: '#14b8a6',
  },
  {
    icon: '🔔',
    name: 'Daily Reminder',
    description: 'Push notification to solve problems daily. Customizable reminder schedule.',
    status: 'Planned',
    tech: 'Firebase Cloud Messaging',
    color: '#f97316',
  },
  {
    icon: '🏆',
    name: 'Badges & Achievements',
    description: 'Earn badges for milestones. 50 solved, first Hard problem, 7-day streak, and more.',
    status: 'Planned',
    tech: 'Supabase',
    color: '#eab308',
  },
  {
    icon: '📤',
    name: 'Export Progress',
    description: 'Export your progress as PDF or CSV. Share your journey with potential employers.',
    status: 'Planned',
    tech: 'jsPDF / PapaParse',
    color: '#8b5cf6',
  },
];

const statusStyles = {
  'Planned': 'text-white/40 bg-white/5 border-white/10',
  'In Progress': 'text-medium bg-medium/10 border-medium/20',
  'Coming Soon': 'text-neon-green bg-neon-green/10 border-neon-green/20',
};

export default function FuturePlanPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-[10px] font-mono text-neon-green/60 uppercase tracking-[0.3em]">
          Product Roadmap
        </span>
        <h1 className="text-3xl font-display font-bold text-white mt-2">
          The Future of DSA Tracker
        </h1>
        <p className="text-sm font-body text-white/40 mt-2 leading-relaxed">
          Here's what's coming next. These features are planned to transform your DSA journey
          into a comprehensive, intelligent learning platform.
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-neon-green/20 via-neon-green/10 to-transparent" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {futureFeatures.map((feature, idx) => (
            <div
              key={feature.name}
              className={`glass-card p-5 ambient-glow stagger-item ${
                idx % 2 === 0 ? 'lg:pr-8' : 'lg:pl-8'
              }`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Timeline dot */}
              <div
                className="hidden lg:block absolute w-3 h-3 rounded-full border-2"
                style={{
                  borderColor: feature.color,
                  background: `${feature.color}30`,
                  left: idx % 2 === 0 ? 'calc(100% + 18px)' : '-24px',
                  top: '24px',
                  boxShadow: `0 0 8px ${feature.color}40`,
                }}
              />

              {/* Card Content */}
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                  style={{
                    background: `${feature.color}10`,
                    border: `1px solid ${feature.color}20`,
                  }}
                >
                  {feature.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-mono font-semibold text-white">
                      {feature.name}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono border ${statusStyles[feature.status]}`}>
                      {feature.status}
                    </span>
                  </div>

                  <p className="text-xs font-body text-white/40 mt-1.5 leading-relaxed">
                    {feature.description}
                  </p>

                  <div className="flex items-center gap-2 mt-2.5">
                    <span className="text-[9px] font-mono text-white/20 uppercase tracking-wider">Tech:</span>
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded"
                      style={{ color: feature.color, background: `${feature.color}10` }}
                    >
                      {feature.tech}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="glass-card-static p-8 text-center">
        <div className="gradient-divider mb-6" />
        <span className="text-3xl mb-3 block">🚀</span>
        <h3 className="text-lg font-display font-bold text-white">
          Building in Public
        </h3>
        <p className="text-xs font-body text-white/40 mt-2 max-w-md mx-auto leading-relaxed">
          This tracker is part of my 6-month DSA journey. Follow along as new features
          get shipped. Built with ❤️ by Khustar.
        </p>
        <p className="text-[10px] font-mono text-neon-green/40 mt-3">
          Target: October 2026 🎯
        </p>
        <div className="gradient-divider mt-6" />
      </div>
    </div>
  );
}
