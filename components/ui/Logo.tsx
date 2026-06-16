import Image from "next/image";

interface LogoProps {
  className?: string; // Class name for the container (e.g., h-11 w-36)
  imageClassName?: string; // Class name for the image itself (e.g., brightness-0 invert)
  priority?: boolean;
}

export default function Logo({ className = "h-11 w-36", imageClassName = "", priority = false }: LogoProps) {
  return (
    <div className={`relative overflow-hidden flex items-center justify-center ${className}`}>
      <Image
        src="/logo.webp"
        alt="PRISM Logo"
        fill
        sizes="(max-width: 768px) 150px, 200px"
        className={`object-cover ${imageClassName}`}
        priority={priority}
      />
    </div>
  );
}
