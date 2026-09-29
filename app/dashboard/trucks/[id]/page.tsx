import { TruckDetailPage } from "@/components/trucks/truck-detail";

export default async function TruckDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TruckDetailPage id={id} />;
}
