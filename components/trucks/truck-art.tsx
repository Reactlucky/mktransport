import Image from "next/image";
import { cn } from "@/lib/utils";

export function TruckArt({
  plate,
  className,
  priority = false,
}: {
  plate?: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("@container relative w-full", className)}>
      <Image
        src="/cargo-truck.png"
        alt={plate ? "" : "Cargo truck"}
        width={1024}
        height={507}
        priority={priority}
        className="h-auto w-full"
      />
      {plate && (
        <div
          className="pointer-events-none absolute flex items-center justify-center overflow-hidden"
          style={{ left: "7.3%", top: "43.4%", width: "58.6%", height: "14.4%" }}
        >
          <span className="max-w-full truncate text-center text-[length:3.1cqw] font-bold tracking-[0.16em] text-black">
            {plate}
          </span>
        </div>
      )}
    </div>
  );
}
