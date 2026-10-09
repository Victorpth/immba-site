type LogoMarkProps = {
  className?: string;
  tone?: "dark" | "light";
};

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <img
      src="/fjcu-immba-seal.png"
      alt=""
      className={className}
    />
  );
}
