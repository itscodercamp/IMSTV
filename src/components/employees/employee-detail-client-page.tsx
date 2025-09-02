
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Mail, Phone, IndianRupee, FileText, AlertTriangle, KeyRound, Copy, Calendar } from "lucide-react";
import type { Employee } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { format } from "date-fns";


const DetailRow = ({ label, value, icon: Icon, onCopy }: { label: string, value: React.ReactNode, icon: React.ElementType, onCopy?: () => void }) => (
    <div className="flex items-start gap-4">
        <Icon className="h-5 w-5 text-muted-foreground mt-1" />
        <div className="text-sm flex-1">
            <p className="text-muted-foreground">{label}</p>
            <div className="flex items-center gap-2">
                <div className="font-medium break-words text-foreground flex-1">{value || 'N/A'}</div>
                {onCopy && (
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onCopy}>
                     <Copy className="h-4 w-4" />
                  </Button>
                )}
            </div>
        </div>
    </div>
);


export function EmployeeDetailClientPage({ employee, dealerId }: { employee: Employee, dealerId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleCopy = (text: string | undefined | null, type: 'id' | 'password') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({
        title: `${type === 'id' ? 'User ID' : 'Password'} Copied`,
        description: `The employee's ${type} has been copied to your clipboard.`,
        variant: 'success'
    })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase() || 'E';
  }

  const handleDelete = async () => {
    const result = await deleteEmployeeAction(employee.id, employee.dealerId);
    if (result.success) {
      toast({
        variant: "success",
        title: "Employee Deleted",
        description: `${employee.name} has been removed from your records.`,
      });
      router.push(`/employees/${employee.dealerId}`);
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: result.error || "Could not delete the employee.",
      });
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href={`/employees/${dealerId}`}>
                  <ArrowLeft className="h-4 w-4" />
                  Back to Employees
              </Link>
          </Button>
        </div>
        <Card>
        <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src={employee.avatarUrl} alt={employee.name} data-ai-hint="person face" />
                <AvatarFallback className="text-3xl">{getInitials(employee.name)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
                <CardTitle className="text-3xl font-bold">{employee.name}</CardTitle>
                <div className="text-lg text-muted-foreground">
                    <Badge variant="secondary" className="text-base">{employee.role}</Badge>
                </div>
            </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-foreground">Contact & Personal Details</h3>
                    <DetailRow label="Email Address" value={employee.email} icon={Mail} />
                    <DetailRow label="Phone Number" value={employee.phone} icon={Phone} />
                    <DetailRow label="Joining Date" value={format(new Date(employee.joiningDate), "PPP")} icon={Calendar} />
                </div>
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-foreground">Financials & Credentials</h3>
                    <DetailRow label="Monthly Salary" value={`₹${employee.salary.toLocaleString('en-IN')}`} icon={IndianRupee}/>
                    <Separator />
                    <DetailRow 
                        label="User ID (Phone)" 
                        value={employee.phone} 
                        icon={KeyRound}
                        onCopy={() => handleCopy(employee.phone, 'id')}
                    />
                    <DetailRow 
                        label="Password" 
                        value={employee.password || 'Not Set'}
                        icon={KeyRound} 
                        onCopy={() => handleCopy(employee.password, 'password')}
                    />
                </div>
            </div>

            <Separator />
            
            {employee.aadharImageUrl ? (
                <div>
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4"><FileText className="h-5 w-5"/>Documents</h3>
                    <div className="p-4 border border-dashed rounded-lg bg-secondary/50">
                        <p className="text-sm text-muted-foreground mb-2">Aadhar Card Image</p>
                        <div className="relative aspect-video max-w-sm">
                            <Image
                            src={employee.aadharImageUrl}
                            alt="Aadhar Card"
                            fill
                            className="rounded-md object-contain bg-background"
                            data-ai-hint="document id card"
                            />
                        </div>
                    </div>
                </div>
            ): (
                <div>
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4"><FileText className="h-5 w-5"/>Documents</h3>
                    <p className="text-sm text-muted-foreground">No documents uploaded for this employee.</p>
                </div>
            )}

        </CardContent>
        <CardFooter className="flex-col sm:flex-row justify-end gap-2 p-4 mt-4 border-t">
            <Button asChild variant="outline"><Link href={`/employees/${dealerId}/${employee.id}/edit`}><Edit />Edit Details</Link></Button>
            <Button type="button" variant="destructive" onClick={() => setIsDeleting(true)}><Trash2 />Delete Employee</Button>
        </CardFooter>
        </Card>
      </div>

      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive"/>
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">{employee.name}</span>? This action cannot be undone.
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
