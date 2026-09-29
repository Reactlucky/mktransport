import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

export function TruckIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-5", className)}
      aria-hidden
      {...props}
    >
      <path d="M1 12h13v5H1z" />
      <path d="M14 14h4l3 3v2h-7v-5z" />
      <circle cx="5.5" cy="18.5" r="1.5" />
      <circle cx="17.5" cy="18.5" r="1.5" />
      <path d="M1 12V7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v5" />
    </svg>
  );
}

export function RouteIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-5", className)}
      aria-hidden
      {...props}
    >
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="5" r="2" />
      <path d="M12 19h4a2 2 0 0 0 2-2v-2" />
      <path d="M8 5H6a2 2 0 0 0-2 2v2" />
      <path d="M8 19a8 8 0 0 0 8-8V7" />
    </svg>
  );
}

export function LocationIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-5", className)}
      aria-hidden
      {...props}
    >
      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function DriverIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-5", className)}
      aria-hidden
      {...props}
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
      <path d="M9 8h6" />
    </svg>
  );
}

export function MaintenanceIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-5", className)}
      aria-hidden
      {...props}
    >
      <path d="M14.7 6.3a4 4 0 0 0-5.6 5.6L3 18v3h3l6.1-6.1a4 4 0 0 0 5.6-5.6l-2.1 2.1-1.9-.5-.5-1.9 2.1-2.1z" />
    </svg>
  );
}

export function ReportIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-5", className)}
      aria-hidden
      {...props}
    >
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 15v-4" />
      <path d="M12 15V8" />
      <path d="M16 15v-6" />
    </svg>
  );
}

export function ReminderIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-5", className)}
      aria-hidden
      {...props}
    >
      <circle cx="12" cy="13" r="7" />
      <path d="M12 10v3l2 1.5" />
      <path d="M9 4h6" />
      <path d="M12 2v2" />
    </svg>
  );
}

export function DashboardIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-5", className)}
      aria-hidden
      {...props}
    >
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" />
      <rect x="13" y="10" width="8" height="11" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

export function CustomerIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-5", className)}
      aria-hidden
      {...props}
    >
      <path d="M3 21h18" />
      <path d="M5 21V8l7-4 7 4v13" />
      <path d="M9 21v-6h6v6" />
      <path d="M9 10h.01" />
      <path d="M15 10h.01" />
    </svg>
  );
}

/** Hero illustration: truck on road */
export function TruckRoadIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full", className)}
      role="img"
      aria-label="Truck on a highway road"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d6e6f5" />
          <stop offset="100%" stopColor="#f0f4f8" />
        </linearGradient>
        <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a4658" />
          <stop offset="100%" stopColor="#2a3344" />
        </linearGradient>
      </defs>
      <rect width="640" height="360" fill="url(#sky)" rx="16" />
      <ellipse cx="520" cy="90" rx="70" ry="28" fill="#ffffff" opacity="0.7" />
      <ellipse cx="560" cy="95" rx="40" ry="18" fill="#ffffff" opacity="0.5" />
      <path d="M0 220 L260 150 L640 200 L640 360 L0 360 Z" fill="url(#road)" />
      <path
        d="M280 168 L640 215"
        stroke="#f5c84c"
        strokeWidth="4"
        strokeDasharray="18 14"
        opacity="0.9"
      />
      <path
        d="M40 250 L250 175"
        stroke="#f5c84c"
        strokeWidth="3"
        strokeDasharray="14 12"
        opacity="0.7"
      />
      {/* Truck body */}
      <g transform="translate(140,175)">
        <rect x="0" y="28" width="170" height="58" rx="6" fill="#1b4f8a" />
        <rect x="170" y="8" width="70" height="78" rx="6" fill="#163f6e" />
        <rect x="182" y="18" width="46" height="32" rx="3" fill="#9ec5ef" opacity="0.85" />
        <rect x="12" y="40" width="40" height="28" rx="2" fill="#0f2744" opacity="0.35" />
        <rect x="62" y="40" width="40" height="28" rx="2" fill="#0f2744" opacity="0.35" />
        <rect x="112" y="40" width="40" height="28" rx="2" fill="#0f2744" opacity="0.35" />
        <circle cx="40" cy="90" r="16" fill="#1a1d23" />
        <circle cx="40" cy="90" r="7" fill="#8fa3bc" />
        <circle cx="140" cy="90" r="16" fill="#1a1d23" />
        <circle cx="140" cy="90" r="7" fill="#8fa3bc" />
        <circle cx="210" cy="90" r="16" fill="#1a1d23" />
        <circle cx="210" cy="90" r="7" fill="#8fa3bc" />
        <rect x="236" y="48" width="8" height="14" rx="1" fill="#f5c84c" />
      </g>
      {/* Hills */}
      <path d="M0 220 L80 180 L160 210 L160 220 Z" fill="#8fa3bc" opacity="0.35" />
      <path d="M380 165 L460 120 L540 155 L540 185 L400 175 Z" fill="#8fa3bc" opacity="0.25" />
    </svg>
  );
}
