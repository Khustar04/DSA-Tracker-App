export default function Button({ children, variant = 'primary', onClick, className = '', ...props }) {
  const variants = {
    primary: 'bg-gradient-to-r from-neon-green to-neon-green-dim text-bg-dark font-semibold hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] active:scale-95',
    secondary: 'bg-surface-highest text-white border border-neon-green/20 hover:border-neon-green/40 hover:bg-surface-bright',
    ghost: 'text-neon-green hover:bg-neon-green/10',
    danger: 'bg-hard/10 text-hard border border-hard/20 hover:bg-hard/20',
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded font-mono text-sm transition-all duration-300 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
