
import { fetchVehicles } from "@/app/(main)/actions";
import { InventoryTable } from "@/components/inventory/inventory-table";

export default async function InventoryPage({ params }: { params: { dealerId: string } }) {
  const { dealerId } = params;
  const vehicles = await fetchVehicles(dealerId);

  return (
    <InventoryTable initialVehicles={vehicles} dealerId={dealerId} />
  );
}
