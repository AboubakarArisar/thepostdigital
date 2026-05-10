import Image from "next/image";

type SiteLogoProps = {
  className?: string;
  priority?: boolean;
  tone?: "light" | "dark";
};

export function SiteLogo({
  className = "",
  priority = false,
  tone = "dark",
}: SiteLogoProps) {
  return (
    <span
      aria-label="The Post Digital"
      className={`relative block overflow-hidden ${className}`}
      role="img"
    >
      <Image
        src={tone === "light" ? "/logo2.png" : "/logo1.png"}
        alt=""
        aria-hidden="true"
        data-tone={tone}
        width={1080}
        height={1080}
        priority={priority}
        className="site-logo-image absolute left-0 top-1/2 h-auto w-full max-w-none -translate-y-1/2"
      />
    </span>
  );
}
