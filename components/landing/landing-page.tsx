import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { TruckArt } from "@/components/trucks/truck-art";

const records = [
  {
    title: "Trips",
    description:
      "Date, truck, route, customer, and rent — the same notebook line, without the paper.",
  },
  {
    title: "Trucks",
    description:
      "Registration, model, and whether the vehicle is running, waiting, or in the workshop.",
  },
  {
    title: "Drivers",
    description:
      "Contacts, assignments, attendance, and salary stay attached to the person who drove.",
  },
  {
    title: "Customers",
    description:
      "Party name, phone, and location, ready when you book the next load.",
  },
  {
    title: "Rent",
    description:
      "Monthly trips and rent by truck and customer, as a ledger rather than a chart wall.",
  },
  {
    title: "Papers",
    description:
      "EMI, insurance, and fitness dates sit with the truck so a due date is not a surprise.",
  },
];

const reasons = [
  {
    n: "01",
    text: "One record replaces the notebook, the spreadsheet, and the WhatsApp search.",
  },
  {
    n: "02",
    text: "A trip can be written on a phone at the yard or at a desk after the truck leaves.",
  },
  {
    n: "03",
    text: "The fleet status is a count: running, available, or in maintenance.",
  },
  {
    n: "04",
    text: "Month-end rent is a total you can read, not a sheet you have to rebuild.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-dvh bg-base-100 text-base-content">
      <header className="navbar sticky top-0 z-20 border-b border-base-300 bg-base-100 px-4 md:px-6">
        <div className="navbar-start">
          <Link href="/" className="flex items-center">
            <BrandMark className="h-12 w-auto sm:h-14" />
          </Link>
        </div>
        <div className="navbar-end">
          <Link href="/login" className="btn btn-primary">
            Sign in
          </Link>
        </div>
      </header>

      <section className="border-b border-base-300">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:px-6 md:py-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] lg:items-end">
          <div>
            <p className="text-sm text-base-content/60">Office book for a small fleet</p>
            <h1 className="mt-3 max-w-xl font-display text-4xl font-medium leading-[1.05] sm:text-5xl lg:text-6xl">
              Trucks, trips, and rent, written down once.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-base-content/70">
              MK Transport keeps the yard’s daily entries: who drove, where the
              load went, and what it earned.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href="/login" className="btn btn-primary btn-lg">
                Open the desk
              </Link>
              <a href="#records" className="link link-hover">
                What the book holds
              </a>
            </div>
          </div>
          <TruckArt plate="MK Transport" priority className="w-full" />
        </div>
      </section>

      <section id="records" className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
        <div className="grid gap-8 md:grid-cols-[220px_1fr] md:gap-16">
          <h2 className="font-display text-3xl font-medium leading-tight">
            What the book holds
          </h2>
          <dl className="divide-y divide-base-300 border-y border-base-300">
            {records.map((record) => (
              <div key={record.title} className="grid gap-1 py-5 sm:grid-cols-[140px_1fr] sm:gap-8">
                <dt className="font-medium">{record.title}</dt>
                <dd className="text-sm leading-relaxed text-base-content/70">
                  {record.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-y border-base-300 bg-base-200">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-[220px_1fr] md:gap-16 md:px-6 md:py-16">
          <h2 className="font-display text-3xl font-medium leading-tight">
            Why the notebook goes
          </h2>
          <ol className="divide-y divide-base-300 border-y border-base-300">
            {reasons.map((reason) => (
              <li key={reason.n} className="grid grid-cols-[3rem_1fr] gap-4 py-5">
                <span className="font-display text-lg text-base-content/50">{reason.n}</span>
                <span className="text-sm leading-relaxed">{reason.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-14 md:px-6 md:py-20">
        <h2 className="font-display text-3xl font-medium">The next trip can go in the book.</h2>
        <Link href="/login" className="btn btn-primary">
          Sign in
        </Link>
      </section>

      <footer className="footer sm:footer-horizontal border-t border-base-300 px-4 py-8 text-sm text-base-content/70 md:px-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-base-content">
          <BrandMark className="h-12 w-auto" />
          </div>
          <p>Transport records for a small fleet.</p>
          <Link href="/login" className="link link-hover">
            Sign in
          </Link>
        </div>
      </footer>
    </div>
  );
}
