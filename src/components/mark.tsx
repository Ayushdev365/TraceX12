export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="mark-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgb(255,255,255)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="rgb(255,255,255)" stopOpacity="0.06" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#mark-fill)" />
      <rect x="0.6" y="0.6" width="30.8" height="30.8" rx="8.4" fill="none" stroke="rgb(255,255,255)" strokeOpacity="0.28" />
      <circle cx="10" cy="16" r="3.1" fill="none" stroke="#8fd0c8" strokeWidth="1.6" />
      <rect x="18.6" y="11.2" width="6.8" height="9.6" rx="1.4" fill="none" stroke="#f3f5f8" strokeWidth="1.5" />
      <path d="M13.4 16h5" stroke="#9aa3b0" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
