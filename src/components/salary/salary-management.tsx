
"use client";

import * as React from "react";
import type { Dealer, Employee, SalarySlip } from "@/lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { generateSalarySlipAction } from "@/app/(main)/actions";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { SalarySlipView } from "./salary-slip-view";

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase() || 'E';
}

function getMonthsSinceJoining(joiningDate: string) {
  const join = new Date(joiningDate);
  const now = new Date();
  const months = [];
  let current = new Date(join.getFullYear(), join.getMonth(), 1);

  while (current <= now) {
    months.push({ month: current.getMonth(), year: current.getFullYear() });
    current.setMonth(current.getMonth() + 1);
  }
  return months.reverse();
}

function MonthRow({
  month,
  year,
  slip,
  employee,
  dealer,
}: {
  month: number,
  year: number,
  slip?: SalarySlip,
  employee: Employee,
  dealer: Dealer
}) {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [incentives, setIncentives] = React.useState(0);
  const [isGenerateOpen, setIsGenerateOpen] = React.useState(false);
  const router = useRouter();
  
  const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });

  const handleGenerate = async () => {
    setIsGenerating(true);
    const result = await generateSalarySlipAction({
        employeeId: employee.id,
        dealerId: dealer.id,
        month,
        year,
        baseSalary: employee.salary,
        incentives: incentives,
        status: 'Paid',
    });

    if (result.success) {
        toast({
            variant: "success",
            title: "Salary Slip Generated",
            description: `Successfully generated slip for ${monthName} ${year}.`
        });
        setIsGenerateOpen(false);
        router.refresh();
    } else {
         toast({
            variant: "destructive",
            title: "Generation Failed",
            description: result.error || "An unexpected error occurred."
        });
    }
    setIsGenerating(false);
  };
  
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
        <div>
            <p className="font-medium">{monthName} {year}</p>
            <p className="text-sm text-muted-foreground">Base: ₹{employee.salary.toLocaleString('en-IN')}</p>
             {slip && <p className="text-sm text-muted-foreground">Incentives: ₹{slip.incentives.toLocaleString('en-IN')}</p>}
        </div>
        <div>
            {slip ? (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            View Slip
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0">
                        <DialogHeader className="p-6 pb-0">
                            <DialogTitle>Salary Slip for {employee.name} - {monthName} {year}</DialogTitle>
                            <DialogDescription>
                                This is the generated salary slip. You can print this page for your records.
                            </DialogDescription>
                        </DialogHeader>
                        <SalarySlipView slip={slip} employee={employee} dealer={dealer} />
                    </DialogContent>
                </Dialog>
            ) : (
                <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
                    <DialogTrigger asChild>
                         <Button variant="outline" size="sm">Generate Slip</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Generate Salary Slip for {monthName} {year}</DialogTitle>
                            <DialogDescription>
                                Confirm base salary and add any incentives for {employee.name}.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="baseSalary" className="text-right">Base Salary</Label>
                                <Input id="baseSalary" value={`₹${employee.salary.toLocaleString('en-IN')}`} disabled className="col-span-3"/>
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="incentives" className="text-right">Incentives (₹)</Label>
                                <Input id="incentives" type="number" value={incentives} onChange={(e) => setIncentives(Number(e.target.value))} className="col-span-3"/>
                            </div>
                        </div>
                         <DialogFooter>
                            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                            <Button onClick={handleGenerate} disabled={isGenerating}>
                               {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                               Approve & Generate
                            </Button>
                         </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    </div>
  )
}

export function SalaryManagement({ employeesWithSlips, dealer }: { employeesWithSlips: (Employee & { salarySlips: SalarySlip[] })[], dealer: Dealer }) {

  if (!employeesWithSlips.length) {
    return (
        <div className="flex items-center justify-center h-40 rounded-lg border-2 border-dashed">
            <p className="text-muted-foreground">You have no employees yet.</p>
        </div>
    )
  }
  
  return (
    <Accordion type="single" collapsible className="w-full">
      {employeesWithSlips.map(employee => {
        const monthsToDisplay = getMonthsSinceJoining(employee.joiningDate);
        return (
          <AccordionItem value={employee.id} key={employee.id}>
            <AccordionTrigger className="hover:bg-muted/50 px-3 rounded-lg">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={employee.avatarUrl} alt={employee.name} data-ai-hint="person face" />
                        <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-base">{employee.name}</p>
                        <p className="text-sm text-muted-foreground font-normal">{employee.role}</p>
                    </div>
                </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 p-2">
                {monthsToDisplay.map(({ month, year }) => {
                    const slip = employee.salarySlips.find(s => s.month === month && s.year === year);
                    return <MonthRow key={`${month}-${year}`} month={month} year={year} slip={slip} employee={employee} dealer={dealer} />
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  );
}
