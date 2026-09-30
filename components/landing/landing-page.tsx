import Image from "next/image";
import Link from "next/link";
import {
  CustomerIcon,
  DriverIcon,
  ReminderIcon,
  ReportIcon,
  RouteIcon,
  TruckIcon,
} from "@/components/icons/transport";

const features = [
  {
    title: "Trip management",
    description:
      "Record date, truck, route, customer and rent in seconds — the same notebook entries, without the paper.",
    icon: RouteIcon,
  },
  {
    title: "Truck management",
    description:
      "Keep registration numbers, models and status in one place so you always know what is running.",
    icon: TruckIcon,
  },
  {
    title: "Driver management",
    description:
      "Maintain driver contacts and prepare for future assignments, attendance and salary tracking.",
    icon: DriverIcon,
  },
  {
    title: "Business reports",
    description:
      "See monthly trips and rent by truck and customer — clear numbers, not cluttered charts.",
    icon: ReportIcon,
  },
  {
    title: "Reminders",
    description:
      "Architecture ready for EMI, insurance, fitness and service reminders when you need them.",
    icon: ReminderIcon,
  },
];

const benefits = [
  "Replace notebooks with a single digital record",
  "Enter a trip in under a minute on phone or desktop",
  "See today’s fleet status at a glance",
  "Know monthly earnings without spreadsheet work",
];

export function LandingPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#2563eb] to-[#60a5fa] text-white">
              <TruckIcon className="size-4" />
            </span>
            <span className="font-display text-sm font-semibold tracking-tight md:text-base">
              MK Transport
            </span>
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center rounded-[14px] bg-gradient-to-br from-[#2563eb] to-[#60a5fa] px-4 text-sm font-medium text-white shadow-[0_8px_20px_rgba(37,99,235,0.28)]"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero — brand first, one headline, one sentence, one CTA, dominant illustration */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--accent)_0%,_transparent_55%)] opacity-70" />
        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-2 md:items-center md:px-6 md:py-16 lg:py-20">
          <div>
            <p className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-primary">
              MK Transport
            </p>
            <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">
              Manage Your Trucks. Trips. Drivers. Business.
            </h1>
            <p className="mt-4 max-w-md text-base text-muted-foreground md:text-lg">
              Replace notebooks and manual tracking with one simple digital
              platform built for a small transport fleet.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex h-12 items-center rounded-[14px] bg-gradient-to-br from-[#2563eb] to-[#60a5fa] px-6 text-base font-medium text-white shadow-[0_8px_20px_rgba(37,99,235,0.28)]"
              >
                Get Started
              </Link>
              <a
                href="#features"
                className="inline-flex h-12 items-center rounded-[14px] border border-border bg-card px-6 text-base font-medium shadow-[var(--shadow-soft)] hover:bg-muted"
              >
                See features
              </a>
            </div>
          </div>
          <div className="md:pl-4">
            <Image
              src="/mk-transport-logo.jpg"
              alt="MK Transport logo"
              width={1024}
              height={512}
              priority
              className="h-auto w-full rounded-[28px] shadow-[var(--shadow-floating)]"
            />
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
        <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
          Built for daily transport work
        </h2>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Focused tools for the operations you already run — not a generic
          analytics dashboard.
        </p>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="rounded-[20px] border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                <span className="mb-3 inline-flex size-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <Icon className="size-5" />
                </span>
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.description}
                </p>
              </div>
            );
          })}
          <div className="rounded-[20px] border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <span className="mb-3 inline-flex size-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <CustomerIcon className="size-5" />
            </span>
            <h3 className="font-display text-lg font-semibold">
              Customer records
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Keep party names, phones and locations ready for quick trip
              selection.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Why switch from the notebook
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {benefits.map((b) => (
              <li
                key={b}
                className="flex gap-3 text-sm leading-relaxed text-foreground"
              >
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 text-center md:px-6 md:py-20">
        <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
          Ready to digitize your fleet?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Open MK Transport, see today’s picture, and record the next trip in
          seconds.
        </p>
        <Link
          href="/login"
          className="mt-7 inline-flex h-12 items-center rounded-[14px] bg-gradient-to-br from-[#2563eb] to-[#60a5fa] px-8 text-base font-medium text-white shadow-[0_8px_20px_rgba(37,99,235,0.28)]"
        >
          Get Started
        </Link>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:px-6">
          <div className="flex items-center gap-2 text-foreground">
            <TruckIcon className="size-4 text-primary" />
            <span className="font-medium">MK Transport</span>
          </div>
          <p>Transport management for small fleets.</p>
          <Link href="/login" className="hover:text-foreground">
            Sign in
          </Link>
        </div>
      </footer>
    </div>
  );
}
