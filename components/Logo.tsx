import fs from "node:fs";
import path from "node:path";
import Image from "next/image";

const LOGO_PATH = path.join(process.cwd(), "public", "brand", "logo-horizontal.png");
const LOGO_SVG_PATH = path.join(process.cwd(), "public", "brand", "logo-horizontal.svg");

function hasRealLogo() {
  return fs.existsSync(LOGO_SVG_PATH) || fs.existsSync(LOGO_PATH);
}

function logoSrc() {
  if (fs.existsSync(LOGO_SVG_PATH)) return "/brand/logo-horizontal.svg";
  return "/brand/logo-horizontal.png";
}

type LogoProps = {
  className?: string;
};

export default function Logo({ className = "" }: LogoProps) {
  if (hasRealLogo()) {
    return (
      <Image
        src={logoSrc()}
        alt="True Culture Marketing"
        width={220}
        height={48}
        priority
        className={`h-9 w-auto ${className}`}
      />
    );
  }

  return (
    <span className={`inline-flex flex-col leading-none font-display ${className}`}>
      <span className="text-lg tracking-wide text-accent">TRUE</span>
      <span className="text-lg tracking-wide text-paper -mt-1">CULTURE</span>
    </span>
  );
}
