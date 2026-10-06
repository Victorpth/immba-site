type LogoMarkProps = {
  className?: string;
  /** Light sits on the cream branding bar. Dark sits on the ink footer. */
  tone?: "dark" | "light";
};

export function LogoMark({ className, tone = "dark" }: LogoMarkProps) {
  const onLight = tone === "light";
  const line = onLight ? "#f7f3ec" : "currentColor";
  const gold = "#e4c48a";

  return (
    <svg viewBox="0 0 80 80" className={className} role="img" aria-label="From Fu Jen, across partner campuses, into a global career">
      <title>From Fu Jen, across partner campuses, into a global career</title>
      <circle cx="40" cy="40" r="37" fill={onLight ? "#6e243c" : "none"} stroke={onLight ? "none" : line} strokeWidth="1.6" />
      <circle cx="36" cy="44" r="16.5" stroke={line} strokeWidth="1.5" />
      <path
        d="M36 27.6c4.6 4.2 7.2 9.2 7.2 16.4s-2.6 12.2-7.2 16.4c-4.6-4.2-7.2-9.2-7.2-16.4s2.6-12.2 7.2-16.4Z"
        stroke={line}
        strokeWidth="1.35"
      />
      <path d="M20.2 44h31.6" stroke={line} strokeWidth="1.35" strokeLinecap="round" />
      <path
        d="M24.5 57.5c8-8 14.5-14 22-20.5 6.2-5.4 12.2-11.2 18.8-18.2"
        stroke={gold}
        strokeWidth="2.3"
        strokeLinecap="round"
      />
      <circle cx="24.5" cy="57.5" r="2.5" fill={gold} />
      <circle cx="39" cy="45" r="1.7" fill={gold} />
      <circle cx="50.5" cy="35" r="1.7" fill={gold} />
      <circle cx="60" cy="25.5" r="1.7" fill={gold} />
      <path
        d="M58.2 16.2h8.6v8.6"
        stroke={gold}
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
