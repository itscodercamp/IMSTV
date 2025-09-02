
"use client";

import { fetchVehicleById } from "@/app/(main)/actions";
import { AddPurchaseForm } from "@/components/purchase/add-purchase-form";
import { Skeleton } from "@/components/ui/skeleton";
import type { Vehicle } from "@/lib/types";
import { notFound, useParams } from "next/navigation";
import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

function EditVehicleLoader() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                 </div>
                 <div className="flex justify-end">
                    <Skeleton className="h-10 w-24" />
                 </div>
            </CardContent>
        </Card>
    )
}

export default function EditVehiclePage() {
  const params = useParams<{ vehicleId: string; dealerId: string }>();
  const vehicleId = params.vehicleId as string;
  const dealerId = params.dealerId as string;
  const [vehicle, setVehicle] = React.useState<Vehicle | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (vehicleId) {
      fetchVehicleById(vehicleId)
        .then(data => {
            if (data) {
                setVehicle(data);
            } else {
                notFound();
            }
        })
        .catch(() => notFound())
        .finally(() => setLoading(false));
    }
  }, [vehicleId]);

  if (loading) {
    return <EditVehicleLoader />;
  }

  if (!vehicle) {
    return notFound();
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Edit Vehicle</CardTitle>
            <CardDescription>Update the details for {vehicle.make} {vehicle.model}.</CardDescription>
        </CardHeader>
        <CardContent>
             <AddPurchaseForm dealerId={dealerId} existingVehicle={vehicle} />
        </CardContent>
    </Card>
  );
}
