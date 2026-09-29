export type TruckStatus = "available" | "running" | "maintenance";

export interface Truck {
  id: string;
  registration_number: string;
  model: string | null;
  status: TruckStatus;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  location: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: string;
  trip_date: string;
  truck_id: string;
  customer_id: string;
  from_location: string;
  to_location: string;
  rent: number;
  created_at: string;
  updated_at: string;
  trucks?: Pick<Truck, "id" | "registration_number"> | null;
  customers?: Pick<Customer, "id" | "name"> | null;
}

export interface TruckStatusSummary {
  total: number;
  running: number;
  available: number;
  maintenance: number;
}

export interface MonthlyTripSummary {
  trip_count: number;
  total_rent: number;
}

export interface TruckWiseReport {
  truck_id: string;
  registration_number: string;
  trip_count: number;
  total_rent: number;
}

export interface CustomerWiseReport {
  customer_id: string;
  name: string;
  trip_count: number;
  total_rent: number;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
}

export interface TripFilters {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  truckId?: string;
  customerId?: string;
  page?: number;
  pageSize?: number;
}
