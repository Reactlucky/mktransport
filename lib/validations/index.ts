import { z } from "zod";

export const truckSchema = z.object({
  registration_number: z
    .string()
    .trim()
    .min(1, "Registration number is required")
    .max(20, "Registration number is too long"),
  model: z.string().trim().max(100).optional().or(z.literal("")),
  status: z.enum(["available", "running", "maintenance"]),
  is_active: z.boolean(),
  registration_date: z.string().optional().or(z.literal("")),
  fitness_valid_until: z.string().optional().or(z.literal("")),
  tax_valid_until: z.string().optional().or(z.literal("")),
  tax_is_lifetime: z.boolean(),
  insurance_valid_until: z.string().optional().or(z.literal("")),
  pucc_valid_until: z.string().optional().or(z.literal("")),
  emi_due_on: z.string().optional().or(z.literal("")),
});

export const customerSchema = z.object({
  name: z.string().trim().min(1, "Customer name is required").max(120),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  is_active: z.boolean(),
});

export const driverSchema = z.object({
  name: z.string().trim().min(1, "Driver name is required").max(120),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  address: z.string().trim().max(240).optional().or(z.literal("")),
  joining_date: z.string().optional().or(z.literal("")),
  salary: z.coerce.number().min(0, "Salary cannot be negative"),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  is_active: z.boolean(),
});

export const tripSchema = z.object({
  trip_date: z.string().min(1, "Date is required"),
  truck_id: z.string().uuid("Select a truck"),
  from_location: z.string().trim().min(1, "From location is required").max(120),
  to_location: z.string().trim().min(1, "To location is required").max(120),
  customer_id: z.string().uuid("Select a customer"),
  rent: z.coerce.number().min(0, "Rent must be 0 or greater"),
});

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username is required")
    .max(50, "Username is too long"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type TruckInput = z.infer<typeof truckSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type DriverInput = z.infer<typeof driverSchema>;
export type TripInput = z.infer<typeof tripSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
