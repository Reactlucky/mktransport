"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { TripForm } from "@/components/trips/trip-form";
import { createTrip } from "@/lib/services/trips";
import { queryKeys } from "@/lib/query-keys";
import { PageHeader } from "@/components/ui/states";
import { useToast } from "@/components/providers/toast-provider";
import { Card, CardContent } from "@/components/ui/card";

export default function NewTripPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title="Add Trip"
        description="Record today's trip in a few fields."
      />
      <Card>
        <CardContent className="pt-5">
          <TripForm
            submitLabel="Save Trip"
            onSubmit={async (data) => {
              await createTrip(data);
              await Promise.all([
                queryClient.invalidateQueries({
                  queryKey: queryKeys.trips.all,
                }),
                queryClient.invalidateQueries({
                  queryKey: queryKeys.dashboard.all,
                }),
              ]);
              toast("Trip added successfully", "success");
              router.push("/dashboard/trips");
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
