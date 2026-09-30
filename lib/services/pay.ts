import { createClient } from "@/lib/supabase/client";
import {
  exceedsRemaining,
  sumAmounts,
} from "@/lib/calculations/payroll";
import type {
  Driver,
  DriverPayEntry,
  DriverSalaryMonth,
  PayEntryKind,
} from "@/lib/types";
import { getUserFacingError } from "@/lib/utils";
import { listDrivers } from "@/lib/services/drivers";

const MONTH_COLS =
  "id, driver_id, year, month, gross_salary, created_at, updated_at";
const ENTRY_COLS =
  "id, driver_id, salary_month_id, kind, amount, entry_date, notes, created_at, updated_at";

function normalizeMonth(row: DriverSalaryMonth): DriverSalaryMonth {
  return { ...row, gross_salary: Number(row.gross_salary), year: Number(row.year), month: Number(row.month) };
}

function normalizeEntry(row: DriverPayEntry): DriverPayEntry {
  return { ...row, amount: Number(row.amount) };
}

export async function getSalaryMonth(
  driverId: string,
  year: number,
  month: number
): Promise<DriverSalaryMonth | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("driver_salary_months")
    .select(MONTH_COLS)
    .eq("driver_id", driverId)
    .eq("year", year)
    .eq("month", month)
    .maybeSingle();

  if (error) {
    throw new Error(
      getUserFacingError(error, "Unable to load salary. Please try again.")
    );
  }
  return data ? normalizeMonth(data as DriverSalaryMonth) : null;
}

export async function openSalaryMonth(
  driverId: string,
  year: number,
  month: number
): Promise<DriverSalaryMonth> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("open_salary_month", {
    p_driver_id: driverId,
    p_year: year,
    p_month: month,
  });

  if (error || !data) {
    throw new Error(
      getUserFacingError(error, "Unable to start this salary month.")
    );
  }
  const row = (Array.isArray(data) ? data[0] : data) as DriverSalaryMonth;
  return normalizeMonth(row);
}

export async function listPayEntries(
  salaryMonthId: string
): Promise<DriverPayEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("driver_pay_entries")
    .select(ENTRY_COLS)
    .eq("salary_month_id", salaryMonthId)
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(
      getUserFacingError(error, "Unable to load salary entries. Please try again.")
    );
  }
  return ((data ?? []) as DriverPayEntry[]).map(normalizeEntry);
}

export async function listPayEntriesForMonths(
  salaryMonthIds: string[]
): Promise<DriverPayEntry[]> {
  if (salaryMonthIds.length === 0) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("driver_pay_entries")
    .select(ENTRY_COLS)
    .in("salary_month_id", salaryMonthIds);

  if (error) {
    throw new Error(
      getUserFacingError(error, "Unable to load salary entries. Please try again.")
    );
  }
  return ((data ?? []) as DriverPayEntry[]).map(normalizeEntry);
}

export async function listSalaryMonths(
  year: number,
  month: number
): Promise<DriverSalaryMonth[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("driver_salary_months")
    .select(MONTH_COLS)
    .eq("year", year)
    .eq("month", month);

  if (error) {
    throw new Error(
      getUserFacingError(error, "Unable to load salaries. Please try again.")
    );
  }
  return ((data ?? []) as DriverSalaryMonth[]).map(normalizeMonth);
}

export async function recordPayEntry(input: {
  driverId: string;
  salaryMonthId: string;
  kind: PayEntryKind;
  amount: number;
  entryDate: string;
  notes?: string;
}): Promise<DriverPayEntry> {
  const supabase = createClient();
  const [monthResult, entries] = await Promise.all([
    supabase
      .from("driver_salary_months")
      .select(MONTH_COLS)
      .eq("id", input.salaryMonthId)
      .single(),
    listPayEntries(input.salaryMonthId),
  ]);

  if (monthResult.error || !monthResult.data) {
    throw new Error("Unable to load this salary month.");
  }

  const month = normalizeMonth(monthResult.data as DriverSalaryMonth);
  const advances = sumAmounts(
    entries.filter((entry) => entry.kind === "advance").map((entry) => entry.amount)
  );
  const payments = sumAmounts(
    entries
      .filter((entry) => entry.kind === "salary_payment")
      .map((entry) => entry.amount)
  );

  if (exceedsRemaining(month.gross_salary, advances, payments, input.amount)) {
    throw new Error("This amount is more than the remaining salary.");
  }

  const { data, error } = await supabase
    .from("driver_pay_entries")
    .insert({
      driver_id: input.driverId,
      salary_month_id: input.salaryMonthId,
      kind: input.kind,
      amount: input.amount,
      entry_date: input.entryDate,
      notes: input.notes || null,
    })
    .select(ENTRY_COLS)
    .single();

  if (error) {
    throw new Error(
      getUserFacingError(error, "Unable to save this payment. Please try again.")
    );
  }
  return normalizeEntry(data as DriverPayEntry);
}

export interface SalaryBoardRow {
  driver: Driver;
  month: DriverSalaryMonth | null;
  advances: number;
  payments: number;
}

export async function getSalaryBoard(
  year: number,
  month: number
): Promise<SalaryBoardRow[]> {
  const [drivers, months] = await Promise.all([
    listDrivers(),
    listSalaryMonths(year, month),
  ]);
  const entries = await listPayEntriesForMonths(months.map((row) => row.id));
  const monthByDriver = new Map(months.map((row) => [row.driver_id, row]));

  return drivers.map((driver) => {
    const salaryMonth = monthByDriver.get(driver.id) ?? null;
    const monthEntries = salaryMonth
      ? entries.filter((entry) => entry.salary_month_id === salaryMonth.id)
      : [];
    return {
      driver,
      month: salaryMonth,
      advances: sumAmounts(
        monthEntries.filter((entry) => entry.kind === "advance").map((entry) => entry.amount)
      ),
      payments: sumAmounts(
        monthEntries
          .filter((entry) => entry.kind === "salary_payment")
          .map((entry) => entry.amount)
      ),
    };
  });
}
