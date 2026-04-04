export default function Badge({ difficulty }) {
  const badgeClass = {
    Easy: 'badge-easy',
    Medium: 'badge-medium',
    Hard: 'badge-hard',
  }[difficulty] || 'badge-easy';

  return (
    <span className={`${badgeClass} px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider`}>
      {difficulty}
    </span>
  );
}
