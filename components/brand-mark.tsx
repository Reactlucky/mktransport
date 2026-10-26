import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-gradient-to-br from-[#dbeafe] via-white to-[#eff6ff] p-1 shadow-[0_8px_18px_rgba(37,99,235,0.18)] ring-1 ring-[#bfdbfe]",
        className
      )}
    >
      <Image
        src="/mk-icon.png"
        alt="MK Transport"
        width={256}
        height={256}
        className="h-full w-full object-contain"
      />
    </span>
  );
}
