export default function BadgeCard({ badge, isEarned, earnedAt }) {
  return (
    <div className={`p-5 rounded-xl border transition-all duration-500 relative overflow-hidden group ${
      isEarned 
        ? 'bg-neon-green/10 border-neon-green/30 hover:border-neon-green/60 hover:shadow-[0_0_20px_rgba(8,255,8,0.15)]' 
        : 'bg-black/40 border-white/5 grayscale opacity-60 hover:opacity-100 hover:grayscale-0'
    }`}>
      {/* Background glow for earned badges */}
      {isEarned && (
        <div className="absolute inset-0 bg-gradient-to-br from-neon-green/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
      
      <div className="flex items-start justify-between relative z-10 mb-4">
        <div className={`text-4xl filter ${isEarned ? 'drop-shadow-[0_0_10px_rgba(8,255,8,0.5)]' : ''}`}>
          {badge.icon}
        </div>
        {isEarned && (
          <span className="text-[9px] font-mono text-neon-green bg-neon-green/10 px-2 py-1 rounded-full whitespace-nowrap">
            {new Date(earnedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="relative z-10">
        <h3 className={`font-bold mb-1 ${isEarned ? 'text-white' : 'text-white/60'}`}>{badge.name}</h3>
        <p className="text-xs text-white/50 mb-3 line-clamp-2 leading-relaxed">{badge.description}</p>
        
        <div className="text-[10px] uppercase font-mono tracking-wider font-semibold text-white/30">
          Req: {badge.requirement}
        </div>
      </div>
    </div>
  );
}
