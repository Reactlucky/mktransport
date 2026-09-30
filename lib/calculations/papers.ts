import type { Truck } from "@/lib/types";

export type ReminderKind = "emi" | "fitness" | "insurance";

export interface DateReminder {
  truckId: string;
  registration: string;
  kind: ReminderKind;
  date: string;
  daysUntil: number;
}

const REMINDER_WINDOW_DAYS = 30;

function parseDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function daysFromToday(value: string, today = new Date()): number {
  const target = startOfDay(parseDate(value)).getTime();
  const current = startOfDay(today).getTime();
  return Math.round((target - current) / 86_400_000);
}

export function vehicleAge(registrationDate: string, today = new Date()): string {
  const start = parseDate(registrationDate);
  if (Number.isNaN(start.getTime())) return "—";

  let years = today.getFullYear() - start.getFullYear();
  let months = today.getMonth() - start.getMonth();
  if (today.getDate() < start.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 0) return "—";

  const yearLabel = years === 1 ? "1 year" : `${years} years`;
  const monthLabel = months === 1 ? "1 month" : `${months} months`;
  if (years === 0) return monthLabel;
  if (months === 0) return yearLabel;
  return `${yearLabel}, ${monthLabel}`;
}

export function reminderLabel(daysUntil: number): string {
  if (daysUntil < 0) {
    const days = Math.abs(daysUntil);
    return days === 1 ? "Expired yesterday" : `Expired ${days} days ago`;
  }
  if (daysUntil === 0) return "Due today";
  if (daysUntil === 1) return "Due tomorrow";
  return `Due in ${daysUntil} days`;
}

export function upcomingPaperReminders(
  trucks: Truck[],
  today = new Date()
): DateReminder[] {
  const fields: { kind: ReminderKind; key: keyof Truck }[] = [
    { kind: "emi", key: "emi_due_on" },
    { kind: "fitness", key: "fitness_valid_until" },
    { kind: "insurance", key: "insurance_valid_until" },
  ];

  const reminders: DateReminder[] = [];
  for (const truck of trucks) {
    for (const field of fields) {
      const date = truck[field.key];
      if (typeof date !== "string" || !date) continue;
      const daysUntil = daysFromToday(date, today);
      if (daysUntil > REMINDER_WINDOW_DAYS) continue;
      reminders.push({
        truckId: truck.id,
        registration: truck.registration_number,
        kind: field.kind,
        date,
        daysUntil,
      });
    }
  }

  return reminders.sort((a, b) => a.daysUntil - b.daysUntil || a.registration.localeCompare(b.registration));
}
