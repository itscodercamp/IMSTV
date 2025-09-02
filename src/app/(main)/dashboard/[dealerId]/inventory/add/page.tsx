
"use client";
import { AddPurchaseForm } from "@/components/purchase/add-purchase-form";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";

export default function AddPurchasePage() {
  const params = useParams();
  const dealerId = params.dealerId as string;

  return (
    <Card>
        <CardHeader>
            <CardTitle>Add New Vehicle Purchase</CardTitle>
            <CardDescription>Follow the steps to add a new vehicle to your inventory.</CardDescription>
        </CardHeader>
        <CardContent>
            <AddPurchaseForm dealerId={dealerId} />
        </CardContent>
    </Card>
  );
}
