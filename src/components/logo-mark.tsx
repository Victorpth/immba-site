type LogoMarkProps = {
  className?: string;
  /** Header and footer share one seal. */
  tone?: "dark" | "light";
};

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg viewBox="0 0 80 80" className={className} role="img" aria-label="imMBA">
      <title>imMBA</title>
      <circle cx="40" cy="40" r="36" fill="#6e243c" />
      <circle cx="40" cy="40" r="32.25" fill="none" stroke="#c6a15a" strokeWidth="0.85" />
      <path
        fill="#f7f3ec"
        d="M21 31h8v2.3h-2.6v17.4H29V53h-8v-2.3h2.6V33.3H21V31zM33 53V31l12.2 16.2L57.4 31V53h-3.5V37.2L45.2 49.6 36.5 37.2V53H33z"
      />
      <path d="M26 57.2h28" stroke="#c6a15a" strokeWidth="0.75" strokeLinecap="round" />
    </svg>
  );
}
