import { DriverDetailPage } from "@/components/drivers/driver-detail";

export default async function DriverDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DriverDetailPage id={id} />;
}
