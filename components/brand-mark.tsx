import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <Image
      src="/mk-emblem.png"
      alt="MK Transport, Aburoad"
      width={1024}
      height={344}
      className={cn("h-14 w-auto object-contain", className)}
    />
  );
}
