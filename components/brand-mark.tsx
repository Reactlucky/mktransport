import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <Image
      src="/mk-icon.png"
      alt="MK Transport"
      width={256}
      height={256}
      className={cn("size-10 shrink-0 object-cover", className)}
    />
  );
}
