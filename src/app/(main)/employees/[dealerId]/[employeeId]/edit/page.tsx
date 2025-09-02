
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

export default function EditEmployeePage() {
  const params = useParams<{ employeeId: string }>();
  const employeeId = params.employeeId as string;
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
    <Card>
        <CardHeader>
            <CardTitle>Edit Employee</CardTitle>
            <CardDescription>Update the details for {employee.name}.</CardDescription>
        </CardHeader>
        <CardContent>
            <EditEmployeeForm employee={employee} />
        </CardContent>
    </Card>
  );
}
