
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, Eye, Edit, Trash2, AlertTriangle, User, Contact, Mail, Phone, IndianRupee, Briefcase, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddEmployeeForm } from "@/components/employees/add-employee-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import * as React from "react";
import type { Employee, SalarySlip } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { deleteEmployeeAction } from "@/app/(main)/actions";
import { useRouter } from "next/navigation";
import { Separator } from "../ui/separator";


function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase() || 'E';
}

function getCurrentMonthStatus(slips: SalarySlip[]) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentSlip = slips.find(slip => slip.month === currentMonth && slip.year === currentYear);

    if (currentSlip) {
        return { status: currentSlip.status, variant: 'default' as const };
    }
    return { status: 'Pending Generation', variant: 'secondary' as const };
}


export function EmployeesClientPage({ initialEmployees, dealerId }: { initialEmployees: (Employee & { salarySlips: SalarySlip[] })[], dealerId: string }) {
  const router = useRouter();
  const [employeeToDelete, setEmployeeToDelete] = React.useState<Employee | null>(null);

  const handleDelete = async () => {
    if (!employeeToDelete) return;

    const result = await deleteEmployeeAction(employeeToDelete.id, dealerId);

    if (result.success) {
      toast({
        variant: "success",
        title: "Employee Deleted",
        description: `${employeeToDelete.name} has been removed.`,
      });
      router.refresh(); 
    } else {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: result.error || "Could not delete the employee.",
      });
    }
    setEmployeeToDelete(null);
  };
  
  return (
    <>
     <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Employee Management</CardTitle>
          <CardDescription>Manage your dealership's staff.</CardDescription>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>
                Fill out the form to add a new member to your team.
              </DialogDescription>
            </DialogHeader>
            <AddEmployeeForm dealerId={dealerId} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
          {/* Table Header for Desktop */}
          <div className="hidden md:grid md:grid-cols-5 gap-4 p-4 font-medium text-muted-foreground border-b">
              <div className="col-span-2">Employee</div>
              <div>Role</div>
              <div>Leads (This Month)</div>
              <div className="text-right">Actions</div>
          </div>
          {/* Employee List */}
          <div className="space-y-4 md:space-y-0">
               {initialEmployees.map(employee => {
                    const salaryStatus = getCurrentMonthStatus(employee.salarySlips);
                    return (
                        <div key={employee.id} className="block md:grid md:grid-cols-5 gap-4 items-center p-4 border-b md:border-none last:border-b-0 hover:bg-muted/50 rounded-lg">
                           {/* Employee Info */}
                           <div className="col-span-2 flex items-center gap-4 mb-4 md:mb-0">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={employee.avatarUrl} alt={employee.name} data-ai-hint="person face" />
                                    <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-semibold text-base">{employee.name}</div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                    <Phone className="h-3 w-3"/>
                                    <span>{employee.phone}</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Mail className="h-3 w-3"/>
                                        <span>{employee.email}</span>
                                    </div>
                                </div>
                           </div>

                           {/* Mobile only details */}
                           <div className="md:hidden space-y-3 pt-3 border-t">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground flex items-center gap-2"><Briefcase/> Role</span>
                                    <Badge variant="secondary">{employee.role}</Badge>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground flex items-center gap-2"><Contact/> Leads (This Month)</span>
                                    <span className="font-semibold">{employee.leadsThisMonth || 0}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground flex items-center gap-2"><FileText/> Salary Status</span>
                                     <Badge variant={salaryStatus.variant}>{salaryStatus.status}</Badge>
                                </div>
                           </div>

                           {/* Desktop only details */}
                           <div className="hidden md:block"><Badge variant="secondary">{employee.role}</Badge></div>
                           <div className="hidden md:flex items-center gap-2 text-base">
                                <Contact className="h-4 w-4 text-muted-foreground"/>
                                <span className="font-semibold">{employee.leadsThisMonth || 0}</span>
                            </div>

                           {/* Actions */}
                           <div className="text-right mt-4 md:mt-0">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button aria-haspopup="true" size="sm" variant="ghost">
                                    Actions
                                    <MoreHorizontal className="h-4 w-4 ml-2" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/employees/${dealerId}/${employee.id}`}><Eye className="mr-2 h-4 w-4"/> View Details</Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/employees/${dealerId}/${employee.id}/edit`}><Edit className="mr-2 h-4 w-4"/> Edit</Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-destructive focus:text-destructive focus:bg-destructive/10" 
                                    onClick={() => setEmployeeToDelete(employee)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4"/> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                           </div>
                        </div>
                    )
               })}
          </div>
      </CardContent>
    </Card>

    <AlertDialog open={!!employeeToDelete} onOpenChange={(isOpen) => !isOpen && setEmployeeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive"/>
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">{employeeToDelete?.name}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
