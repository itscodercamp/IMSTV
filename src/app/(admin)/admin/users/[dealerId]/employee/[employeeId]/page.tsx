
"use client";

import { fetchEmployeeById } from "@/app/(main)/actions";
import { EditEmployeeForm } from "@/components/employees/edit-employee-form";
import { Skeleton } from "@/components/ui/skeleton";
import type { Employee } from "@/lib/types";
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

function EditEmployeeLoader() {
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

export default function AdminEditEmployeePage() {
  const params = useParams<{ employeeId: string; dealerId: string }>();
  const { employeeId, dealerId } = params;
  const [employee, setEmployee] = React.useState<Employee | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (employeeId) {
      fetchEmployeeById(employeeId)
        .then(data => {
            if (data) {
                setEmployee(data);
            } else {
                notFound();
            }
        })
        .catch(() => notFound())
        .finally(() => setLoading(false));
    }
  }, [employeeId]);

  if (loading) {
    return <EditEmployeeLoader />;
  }

  if (!employee) {
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
                <CardTitle>Manage Employee</CardTitle>
                <CardDescription>Update the details for {employee.name}.</CardDescription>
            </CardHeader>
            <CardContent>
                <EditEmployeeForm employee={employee} />
            </CardContent>
        </Card>
    </div>
  );
}
