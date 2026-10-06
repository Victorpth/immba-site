type LogoMarkProps = {
  className?: string;
  tone?: "dark" | "light";
};

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <img
      src="/fu-jen-program-logo.png"
      alt=""
      className={className}
    />
  );
}
