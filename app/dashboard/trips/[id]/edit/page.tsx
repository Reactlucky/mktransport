"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TripForm } from "@/components/trips/trip-form";
import { getTrip, updateTrip } from "@/lib/services/trips";
import { queryKeys } from "@/lib/query-keys";
import { PageHeader, ErrorState, InlineLoading } from "@/components/ui/states";
import { useToast } from "@/components/providers/toast-provider";
import { Card, CardContent } from "@/components/ui/card";

export default function EditTripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const tripQuery = useQuery({
    queryKey: queryKeys.trips.detail(id),
    queryFn: () => getTrip(id),
  });

  if (tripQuery.isLoading) {
    return <InlineLoading label="Loading trip..." />;
  }

  if (tripQuery.isError || !tripQuery.data) {
    return (
      <ErrorState
        message="Unable to load trip."
        onRetry={() => tripQuery.refetch()}
      />
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Edit Trip" description="Update trip details." />
      <Card>
        <CardContent className="pt-5">
          <TripForm
            initial={tripQuery.data}
            submitLabel="Update Trip"
            onSubmit={async (data) => {
              await updateTrip(id, data);
              await Promise.all([
                queryClient.invalidateQueries({
                  queryKey: queryKeys.trips.all,
                }),
                queryClient.invalidateQueries({
                  queryKey: queryKeys.dashboard.all,
                }),
              ]);
              toast("Trip updated successfully", "success");
              router.push("/dashboard/trips");
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
