
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload, X, Calendar as CalendarIcon, Wallet, Landmark, CircleDot, IndianRupee } from "lucide-react";
import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "../ui/separator";
import { markVehicleAsSoldAction } from "@/app/(main)/actions";
import type { Vehicle } from "@/lib/types";

const soldSchema = z.object({
    sellingPrice: z.coerce.number().min(1, "Selling price is required"),
    sellingDate: z.date({ required_error: "Selling date is required" }),
    buyerName: z.string().min(2, "Buyer name is required"),
    buyerPhone: z.string().min(10, "A valid phone number is required"),
    buyerAadharFront: z.string().optional(),
    buyerAadharBack: z.string().optional(),
    buyerPanFront: z.string().optional(),
    buyerPaymentMethod: z.enum(['upi', 'bank', 'cheque', 'cash']),
    buyerPaymentProof: z.string().optional(),
}).refine(data => {
    if (['upi', 'bank', 'cheque'].includes(data.buyerPaymentMethod)) {
        return !!data.buyerPaymentProof;
    }
    return true;
}, {
    message: "Payment proof is required for this payment method.",
    path: ["buyerPaymentProof"],
});

type SoldFormValues = z.infer<typeof soldSchema>;

const ImageUploadField = ({ form, name, label }: { form: any, name: string, label: string }) => {
    const [preview, setPreview] = React.useState<string | null>(form.getValues(name));
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setPreview(result);
            form.setValue(name, result, { shouldValidate: true });
        };
        reader.readAsDataURL(file);
        }
    };

    const clearImage = () => {
        setPreview(null);
        form.setValue(name, '', { shouldValidate: true });
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    return (
        <FormItem>
            <FormLabel className="text-xs">{label}</FormLabel>
            {preview ? (
                 <div className="relative mt-1 w-full aspect-video">
                    <Image src={preview} alt={`${label} preview`} layout="fill" className="rounded-md object-contain border bg-secondary/50" />
                    <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-5 w-5 rounded-full z-10" onClick={clearImage}>
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            ) : (
                <FormControl>
                    <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                        <div className="flex flex-col items-center justify-center">
                            <Upload className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, application/pdf"/>
                    </label>
                </FormControl>
            )}
            <FormField name={name as any} render={() => <FormMessage />} />
        </FormItem>
    );
};


export function MarkAsSoldDialog({ vehicle, isOpen, onClose, onSold }: { vehicle: Vehicle, isOpen: boolean, onClose: () => void, onSold: () => void }) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const form = useForm<SoldFormValues>({
        resolver: zodResolver(soldSchema),
        defaultValues: {
            sellingPrice: vehicle.price || 0,
            sellingDate: new Date(),
            buyerName: "",
            buyerPhone: "",
            buyerAadharFront: "",
            buyerAadharBack: "",
            buyerPanFront: "",
            buyerPaymentMethod: "bank",
            buyerPaymentProof: "",
        },
    });

    const paymentMethod = form.watch("buyerPaymentMethod");

    async function onSubmit(values: SoldFormValues) {
        setIsSubmitting(true);
        const result = await markVehicleAsSoldAction(vehicle.id, values);
        if (result.success) {
            toast({
                variant: 'success',
                title: "Vehicle Marked as Sold",
                description: "The vehicle details have been updated."
            });
            onSold();
        } else {
            toast({
                variant: 'destructive',
                title: "Update Failed",
                description: result.error || "Could not mark the vehicle as sold."
            });
        }
        setIsSubmitting(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Mark as Sold: {vehicle.make} {vehicle.model}</DialogTitle>
                    <DialogDescription>
                        Enter the final sale details. This will update the vehicle status to "Sold".
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField name="sellingPrice" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Selling Price (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField name="sellingDate" control={form.control} render={({ field }) => (
                                <FormItem className="flex flex-col"><FormLabel>Selling Date</FormLabel>
                                <Popover><PopoverTrigger asChild><FormControl>
                                    <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl></PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/>
                                </PopoverContent></Popover><FormMessage /></FormItem>
                            )}/>
                             <FormField name="buyerName" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Buyer Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                             <FormField name="buyerPhone" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Buyer Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                        <Separator />
                        <div>
                            <FormLabel>Buyer KYC Documents</FormLabel>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                                <ImageUploadField form={form} name="buyerAadharFront" label="Aadhar Card (Front)" />
                                <ImageUploadField form={form} name="buyerAadharBack" label="Aadhar Card (Back)" />
                                <ImageUploadField form={form} name="buyerPanFront" label="PAN Card" />
                            </div>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                             <FormField
                                control={form.control}
                                name="buyerPaymentMethod"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                    <FormLabel>Payment Method</FormLabel>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-2">
                                            <FormItem><RadioGroupItem value="upi" id="upi_buyer" className="peer sr-only" /><Label htmlFor="upi_buyer" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"><CircleDot className="mb-2 h-5 w-5"/>UPI</Label></FormItem>
                                            <FormItem><RadioGroupItem value="bank" id="bank_buyer" className="peer sr-only" /><Label htmlFor="bank_buyer" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"><Landmark className="mb-2 h-5 w-5"/>Bank</Label></FormItem>
                                            <FormItem><RadioGroupItem value="cheque" id="cheque_buyer" className="peer sr-only" /><Label htmlFor="cheque_buyer" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"><Wallet className="mb-2 h-5 w-5"/>Cheque</Label></FormItem>
                                            <FormItem><RadioGroupItem value="cash" id="cash_buyer" className="peer sr-only" /><Label htmlFor="cash_buyer" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"><IndianRupee className="mb-2 h-5 w-5"/>Cash</Label></FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {paymentMethod !== 'cash' && (
                                <div><FormLabel>Payment Proof</FormLabel><div className="mt-2"><ImageUploadField form={form} name="buyerPaymentProof" label="Upload Proof"/></div></div>
                            )}
                        </div>
                        <DialogFooter className="pt-4">
                            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Saving...</> : "Confirm & Mark as Sold"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
