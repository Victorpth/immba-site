type LogoMarkProps = {
  className?: string;
  /** Gold reads lighter on the ink header and deeper on cream. */
  tone?: "dark" | "light";
};

export function LogoMark({ className, tone = "dark" }: LogoMarkProps) {
  const gold = tone === "dark" ? "#e4c48a" : "#9a7840";

  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className={className}>
      <circle cx="26" cy="36" r="15" stroke="currentColor" strokeWidth="2.1" />
      <path
        d="M26 21.2c4.8 4.1 7.6 8.8 7.6 14.8S30.8 46.7 26 50.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M26 21.2c-4.8 4.1-7.6 8.8-7.6 14.8s3.2 10.7 7.6 14.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M12.4 36h27.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M26 35.2c7.2-6.2 13.4-11.4 23.2-18.4"
        stroke={gold}
        strokeWidth="2.35"
        strokeLinecap="round"
      />
      <path
        d="M40.6 15.6H50.4V25.4"
        stroke={gold}
        strokeWidth="2.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
