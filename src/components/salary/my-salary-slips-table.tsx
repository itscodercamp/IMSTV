
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SalarySlip, Employee, Dealer } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { Button } from "../ui/button";
import { Eye, IndianRupee, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { SalarySlipView } from "./salary-slip-view";

const SlipDetailRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="flex justify-between items-center text-sm py-1.5">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}</span>
    </div>
);


export function MySalarySlipsTable({ salarySlips, employee, dealer }: { salarySlips: SalarySlip[], employee: Employee, dealer: Dealer }) {
  if (!salarySlips || salarySlips.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>My Salary Slips</CardTitle>
                <CardDescription>A record of your monthly salary payments.</CardDescription>
            </CardHeader>
            <CardContent className="h-40 flex items-center justify-center text-muted-foreground">
                <p>No salary slips have been generated for you yet.</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Salary Slips</CardTitle>
        <CardDescription>A record of your monthly salary payments.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Desktop Header */}
        <div className="hidden md:grid grid-cols-6 gap-4 p-4 font-medium text-muted-foreground border-b">
          <div className="col-span-2">Month</div>
          <div>Base Salary</div>
          <div>Incentives</div>
          <div>Total Paid</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Slips List */}
        <div className="space-y-4 md:space-y-0">
            {salarySlips.map((slip) => {
               const monthName = new Date(slip.year, slip.month).toLocaleString('default', { month: 'long' });
               const totalPaid = slip.baseSalary + slip.incentives;
               return (
                <div key={slip.id} className="p-4 border rounded-lg md:border-0 md:rounded-none md:p-0 md:border-b last:border-b-0 hover:bg-muted/50">
                    <div className="md:grid md:grid-cols-6 md:gap-4 md:items-center md:p-4">
                        {/* Month - Prominent on mobile */}
                        <div className="md:col-span-2 flex justify-between items-center md:items-start mb-3 md:mb-0">
                          <div>
                            <p className="font-semibold text-base md:font-medium md:text-sm">{monthName} {slip.year}</p>
                            <Badge variant={slip.status === 'Paid' ? 'default' : 'secondary'} className="md:hidden mt-1">{slip.status}</Badge>
                          </div>
                          <div className="md:hidden">
                            <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                      <Eye className="mr-2 h-4 w-4" /> View
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0">
                                    <DialogHeader className="p-6 pb-0">
                                        <DialogTitle>Salary Slip - {monthName} {slip.year}</DialogTitle>
                                        <DialogDescription>
                                            Your salary slip details are below. You can print this page for your records.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <SalarySlipView slip={slip} employee={employee} dealer={dealer} />
                                </DialogContent>
                            </Dialog>
                          </div>
                        </div>

                        {/* Mobile Details */}
                        <div className="space-y-2 md:hidden border-t pt-3">
                           <SlipDetailRow label="Base Salary" value={`₹ ${slip.baseSalary.toLocaleString('en-IN')}`} />
                           <SlipDetailRow label="Incentives" value={`₹ ${slip.incentives.toLocaleString('en-IN')}`} />
                           <SlipDetailRow label="Total Paid" value={<span className="font-bold">₹ {totalPaid.toLocaleString('en-IN')}</span>} />
                        </div>

                        {/* Desktop Details */}
                        <div className="hidden md:block">₹{slip.baseSalary.toLocaleString('en-IN')}</div>
                        <div className="hidden md:block">₹{slip.incentives.toLocaleString('en-IN')}</div>
                        <div className="hidden md:block font-semibold">₹{totalPaid.toLocaleString('en-IN')}</div>
                        
                        {/* Desktop Action */}
                        <div className="hidden md:block text-right">
                            <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                      <Eye className="mr-2 h-4 w-4" /> View Slip
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0">
                                    <DialogHeader className="p-6 pb-0">
                                        <DialogTitle>Salary Slip - {monthName} {slip.year}</DialogTitle>
                                        <DialogDescription>
                                            Your salary slip details are below. You can print this page for your records.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <SalarySlipView slip={slip} employee={employee} dealer={dealer} />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
               )
            })}
        </div>
      </CardContent>
    </Card>
  );
}
