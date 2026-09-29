export const queryKeys = {
  trucks: {
    all: ["trucks"] as const,
    list: (search?: string) => ["trucks", "list", search ?? ""] as const,
    detail: (id: string) => ["trucks", "detail", id] as const,
    trips: (id: string) => ["trucks", "trips", id] as const,
    active: ["trucks", "active"] as const,
  },
  customers: {
    all: ["customers"] as const,
    list: (search?: string) => ["customers", "list", search ?? ""] as const,
    detail: (id: string) => ["customers", "detail", id] as const,
    active: ["customers", "active"] as const,
    trips: (id: string) => ["customers", "trips", id] as const,
  },
  drivers: {
    all: ["drivers"] as const,
    list: (search?: string) => ["drivers", "list", search ?? ""] as const,
    detail: (id: string) => ["drivers", "detail", id] as const,
  },
  trips: {
    all: ["trips"] as const,
    list: (filters: Record<string, unknown>) =>
      ["trips", "list", filters] as const,
    detail: (id: string) => ["trips", "detail", id] as const,
    today: ["trips", "today"] as const,
    recent: ["trips", "recent"] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    truckSummary: ["dashboard", "truckSummary"] as const,
    monthly: ["dashboard", "monthly"] as const,
  },
  reports: {
    monthly: (year: number, month: number) =>
      ["reports", "monthly", year, month] as const,
    truckWise: (year: number, month: number) =>
      ["reports", "truckWise", year, month] as const,
    customerWise: (year: number, month: number) =>
      ["reports", "customerWise", year, month] as const,
  },
};
