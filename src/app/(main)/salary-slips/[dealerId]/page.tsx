
import { fetchEmployees } from "../../actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SalaryManagement } from "@/components/salary/salary-management";
import { getDealerById } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function SalarySlipsPage({ params }: { params: { dealerId: string } }) {
  const { dealerId } = params;
  const [employeesWithSlips, dealer] = await Promise.all([
    fetchEmployees(dealerId),
    getDealerById(dealerId),
  ]);

  if (!dealer) {
    notFound();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Salary Slip Management</CardTitle>
        <CardDescription>
          Generate and manage monthly salary slips for your employees.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SalaryManagement employeesWithSlips={employeesWithSlips} dealer={dealer} />
      </CardContent>
    </Card>
  );
}
