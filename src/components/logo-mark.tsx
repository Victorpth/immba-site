type LogoMarkProps = {
  className?: string;
  tone?: "dark" | "light";
};

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <img
      src="/fjcu-immba-logo.png"
      alt=""
      className={className}
    />
  );
}
