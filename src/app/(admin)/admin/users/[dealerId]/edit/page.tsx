
"use client";

import { fetchDealerById } from "@/app/(admin)/actions";
import { EditDealerForm } from "@/components/admin/edit-dealer-form";
import { Skeleton } from "@/components/ui/skeleton";
import type { Dealer } from "@/lib/types";
import { notFound, useParams } from "next/navigation";
import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function EditDealerLoader() {
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

export default function AdminEditDealerPage() {
  const params = useParams<{ dealerId: string }>();
  const dealerId = params.dealerId as string;
  const [dealer, setDealer] = React.useState<Dealer | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (dealerId) {
      fetchDealerById(dealerId)
        .then(data => {
            if (data) {
                setDealer(data);
            } else {
                notFound();
            }
        })
        .catch(() => notFound())
        .finally(() => setLoading(false));
    }
  }, [dealerId]);

  if (loading) {
    return <EditDealerLoader />;
  }

  if (!dealer) {
    return notFound();
  }

  return (
    <div className="space-y-4">
        <Button asChild variant="outline" size="sm">
            <Link href={`/admin/users/${dealerId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dealer Profile
            </Link>
        </Button>
        <Card>
            <CardHeader>
                <CardTitle>Edit Dealer</CardTitle>
                <CardDescription>Update the details for {dealer.dealershipName}.</CardDescription>
            </CardHeader>
            <CardContent>
                <EditDealerForm dealer={dealer} />
            </CardContent>
        </Card>
    </div>
  );
}
