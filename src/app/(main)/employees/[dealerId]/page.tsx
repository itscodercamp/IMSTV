
import { fetchEmployees } from "../../actions";
import { EmployeesClientPage } from "@/components/employees/employees-client-page";

export default async function EmployeesPage({ params }: { params: { dealerId: string } }) {
  const { dealerId } = params;
  const employees = await fetchEmployees(dealerId);

  return <EmployeesClientPage initialEmployees={employees} dealerId={dealerId} />;
}
