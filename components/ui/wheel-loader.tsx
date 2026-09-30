import { cn } from "@/lib/utils";

const tones = {
  brand: {
    tire: "#2563EB",
    spoke: "#2563EB",
    rim: "#F8FAFC",
    bolt: "#DBEAFE",
    face: "#EFF6FF",
    cap: "#60A5FA",
  },
  light: {
    tire: "#FFFFFF",
    spoke: "#2563EB",
    rim: "#BFDBFE",
    bolt: "#93C5FD",
    face: "#EFF6FF",
    cap: "#60A5FA",
  },
} as const;

export function WheelLoader({
  className,
  tone = "brand",
}: {
  className?: string;
  tone?: keyof typeof tones;
}) {
  const color = tones[tone];

  return (
    <svg
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("wheel-spin size-16", className)}
      aria-hidden
    >
      <circle cx="60" cy="60" r="48" fill={color.tire} />
      <g fill={color.tire}>
        {Array.from({ length: 24 }, (_, index) => (
          <rect
            key={index}
            x="56"
            y="4"
            width="8"
            height="13"
            rx="1"
            transform={`rotate(${index * 15} 60 60)`}
          />
        ))}
      </g>
      <circle cx="60" cy="60" r="45" fill={color.tire} />
      <circle cx="60" cy="60" r="34" fill="none" stroke={color.rim} strokeWidth="4" />
      <circle cx="60" cy="60" r="29" fill={color.tire} />
      <circle
        cx="60"
        cy="60"
        r="25"
        fill="none"
        stroke={color.bolt}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="1 6"
      />
      <circle cx="60" cy="60" r="18" fill={color.face} />
      <g fill={color.spoke}>
        {Array.from({ length: 8 }, (_, index) => (
          <rect
            key={index}
            x="56"
            y="38"
            width="8"
            height="23"
            rx="2"
            transform={`rotate(${index * 45} 60 60)`}
          />
        ))}
      </g>
      <circle cx="60" cy="60" r="11" fill={color.spoke} />
      <circle cx="60" cy="60" r="4" fill={color.cap} />
    </svg>
  );
}
