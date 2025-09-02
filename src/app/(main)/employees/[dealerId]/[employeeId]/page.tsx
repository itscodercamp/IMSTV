
import { notFound } from "next/navigation";
import { EmployeeDetailClientPage } from "@/components/employees/employee-detail-client-page";
import { fetchEmployeeById } from "../../../actions";
import type { Employee } from "@/lib/types";

export default async function EmployeeDetailPage({ params }: { params: { employeeId: string, dealerId: string } }) {
  const { employeeId, dealerId } = params;
  
  const employee = await fetchEmployeeById(employeeId);

  if (!employee) {
    notFound();
  }

  return <EmployeeDetailClientPage employee={employee} dealerId={dealerId} />;
}
