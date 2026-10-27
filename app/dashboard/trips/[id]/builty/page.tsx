"use client";

import dynamic from "next/dynamic";
import { use, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { BuiltyForm } from "@/components/trips/builty-form";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorState, InlineLoading, PageHeader } from "@/components/ui/states";
import { useToast } from "@/components/providers/toast-provider";
import { getBuiltyByTrip, saveBuilty } from "@/lib/services/bilties";
import { getTrip } from "@/lib/services/trips";
import { queryKeys } from "@/lib/query-keys";
import type { Builty } from "@/lib/types";

const BuiltyPreview = dynamic(
  () => import("@/components/trips/builty-preview").then((mod) => mod.BuiltyPreview),
  { ssr: false }
);

export default function BuiltyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [generated, setGenerated] = useState<Builty | null>(null);

  const tripQuery = useQuery({
    queryKey: queryKeys.trips.detail(id),
    queryFn: () => getTrip(id),
  });

  const builtyQuery = useQuery({
    queryKey: queryKeys.bilties.byTrip(id),
    queryFn: () => getBuiltyByTrip(id),
  });

  if (tripQuery.isLoading || builtyQuery.isLoading) {
    return <InlineLoading label="Loading builty..." />;
  }

  if (tripQuery.isError || !tripQuery.data) {
    return (
      <ErrorState message="Unable to load trip." onRetry={() => tripQuery.refetch()} />
    );
  }

  if (builtyQuery.isError) {
    return (
      <ErrorState
        message="Unable to load the builty."
        onRetry={() => builtyQuery.refetch()}
      />
    );
  }

  const existing = generated ?? builtyQuery.data ?? null;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/dashboard/trips"
        className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="size-4" />
        Trips
      </Link>
      <PageHeader
        title="Generate Builty"
        description="Check the details, then make the builty for this trip."
      />
      <Card>
        <CardContent>
          <BuiltyForm
            trip={tripQuery.data}
            existing={existing}
            onSubmit={async (data) => {
              const alreadySaved = Boolean(existing);
              const saved = await saveBuilty(id, data);
              setGenerated(saved);
              queryClient.setQueryData(queryKeys.bilties.byTrip(id), saved);
              toast(alreadySaved ? "Builty updated" : "Builty ready", "success");
            }}
          />
        </CardContent>
      </Card>
      {existing && <BuiltyPreview builty={existing} />}
    </div>
  );
}
