
"use client";
import * as React from "react";
import type { Dealer, Employee, SalarySlip } from "@/lib/types";
import { format } from "date-fns";
import { Separator } from "../ui/separator";
import { Download, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "../ui/button";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface SalarySlipViewProps {
    slip: SalarySlip;
    employee: Employee;
    dealer: Dealer;
}

const DetailRow = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex justify-between items-center py-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
    </div>
);

export function SalarySlipView({ slip, employee, dealer }: SalarySlipViewProps) {
    const slipRef = React.useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    
    const monthName = format(new Date(slip.year, slip.month), "MMMM");
    const netSalary = slip.baseSalary + slip.incentives;

    const handleDownloadPdf = () => {
        const input = slipRef.current;
        if (!input) return;

        setIsLoading(true);

        html2canvas(input, { 
            scale: 2, 
            useCORS: true,
            backgroundColor: '#ffffff' // Ensure background is white
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            const today = new Date().toISOString().slice(0, 10);
            pdf.save(`salary_slip_${today}.pdf`);
            setIsLoading(false);
        }).catch(err => {
            console.error("Could not generate PDF", err);
            setIsLoading(false);
        });
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-grow overflow-y-auto p-6">
                <div ref={slipRef} className="p-4 sm:p-6 bg-white text-black rounded-lg w-full font-sans">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h1 className="text-xl sm:text-2xl font-bold text-primary">{dealer.dealershipName}</h1>
                        <p className="text-base sm:text-lg text-gray-500">Salary Slip for {monthName} {slip.year}</p>
                    </div>

                    {/* Employee Details */}
                    <div className="mb-6 p-4 rounded-lg bg-gray-50 border">
                        <h2 className="text-lg font-semibold mb-3 text-gray-800">Employee Details</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                            <DetailRow label="Employee Name" value={employee.name} />
                            <DetailRow label="Designation" value={employee.role} />
                            <DetailRow label="Joining Date" value={format(new Date(employee.joiningDate), "PP")} />
                            <DetailRow label="Employee ID" value={employee.id.substring(0, 8).toUpperCase()} />
                        </div>
                    </div>

                    {/* Salary Breakdown */}
                    <div className="mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Earnings */}
                            <div className="p-4 rounded-lg bg-gray-50 border">
                                <h3 className="text-lg font-semibold mb-2 text-gray-800">Earnings</h3>
                                <Separator className="mb-2 bg-gray-200" />
                                <DetailRow label="Basic Salary" value={`₹ ${slip.baseSalary.toLocaleString('en-IN')}`} />
                                <DetailRow label="Incentives & Bonuses" value={`₹ ${slip.incentives.toLocaleString('en-IN')}`} />
                                <Separator className="my-2 bg-gray-200" />
                                <div className="flex justify-between items-center py-2">
                                    <p className="text-sm font-bold text-gray-800">Total Earnings</p>
                                    <p className="text-sm font-bold text-green-600">₹ {(slip.baseSalary + slip.incentives).toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                            {/* Deductions - Placeholder for future */}
                            <div className="p-4 rounded-lg bg-gray-50 border">
                                <h3 className="text-lg font-semibold mb-2 text-gray-800">Deductions</h3>
                                <Separator className="mb-2 bg-gray-200"/>
                                <div className="text-center text-sm text-gray-500 py-10">
                                    <p>No deductions applied.</p>
                                </div>
                                <Separator className="my-2 bg-gray-200"/>
                                <div className="flex justify-between items-center py-2">
                                    <p className="text-sm font-bold text-gray-800">Total Deductions</p>
                                    <p className="text-sm font-bold text-red-600">₹ 0</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Net Salary */}
                    <div className="mt-6 p-4 rounded-lg bg-blue-50 border-2 border-blue-200">
                        <div className="flex flex-col sm:flex-row justify-between items-center">
                            <p className="text-lg font-bold text-blue-800">Net Salary Paid</p>
                            <p className="text-2xl font-extrabold text-primary">₹ {netSalary.toLocaleString('en-IN')}</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-8 text-xs text-gray-400">
                        <p>This is a computer-generated salary slip.</p>
                        <div className="inline-flex items-center gap-1">
                            <p>Powered by IMS from</p>
                            <ShieldCheck className="h-3 w-3 text-primary"/> 
                            <span className="font-semibold text-primary">Trusted Vehicles</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-4 border-t flex justify-end bg-background flex-shrink-0">
                <Button onClick={handleDownloadPdf} disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                            Downloading...
                        </>
                    ) : (
                        <>
                            <Download className="mr-2 h-4 w-4"/>
                            Download as PDF
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
