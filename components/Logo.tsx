import Image from "next/image";

type LogoProps = {
  size?: "sm" | "lg";
};

export default function Logo({ size = "sm" }: LogoProps) {
  return (
    <Image
      src="/brand/wordmark.png"
      alt="True Culture Marketing"
      width={760}
      height={295}
      priority={size === "sm"}
      className={size === "lg" ? "h-20 w-auto" : "h-10 w-auto sm:h-11"}
    />
  );
}
