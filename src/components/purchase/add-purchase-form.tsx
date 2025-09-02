
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "../ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { addVehicleAction, updateVehicleAction } from "@/app/(main)/actions";
import { useRouter } from "next/navigation";
import type { Vehicle } from "@/lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";


const sellerObjectSchema = z.object({
  sellerName: z.string().min(2, "Seller name is required"),
  sellerPhone: z.string().min(10, "A valid phone number is required"),
  aadharFront: z.string().optional(),
  aadharBack: z.string().optional(),
  panFront: z.string().optional(),
  buyingDate: z.date({ required_error: "Buying date is required" }),
  buyingPrice: z.coerce.number().min(0, "Buying price is required"),
  loanStatus: z.enum(['Hypo Terminated on RC', 'Open Loan', 'Closed Loan']),
  foreclosureAmount: z.coerce.number().optional(),
  amountPaidToSeller: z.coerce.number().optional(),
  sellerPaymentMethod: z.enum(['upi', 'bank', 'cheque', 'cash']),
  foreclosurePaymentProof: z.string().optional(),
  sellerPaymentProof: z.string().optional(),
});

const carDetailsSchema = z.object({
  cost: z.coerce.number().min(0, "Cost is required"),
  refurbishmentCost: z.coerce.number().min(0),
  price: z.coerce.number().min(0),
  make: z.string().min(2, "Make is required"),
  model: z.string().min(1, "Model is required"),
  variant: z.string().min(1, "Variant is required"),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  manufacturingYear: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  registrationNumber: z.string().min(1, "Registration number is required"),
  vin: z.string().optional(),
  rtoState: z.string().optional(),
  ownership: z.coerce.number().min(1).max(10),
  fuelType: z.enum(['Petrol', 'Diesel', 'Electric', 'CNG']),
  odometerReading: z.coerce.number().min(0),
  transmission: z.enum(['Manual', 'Automatic']),
});

const carImagesSchema = z.object({
  img_front: z.string().optional(),
  img_front_right: z.string().optional(),
  img_right: z.string().optional(),
  img_right_back: z.string().optional(),
  img_back: z.string().optional(),
  img_open_dickey: z.string().optional(),
  spareTyreAvailability: z.enum(['Available', 'Not Available']).optional(),
  img_spare_tyre: z.string().optional(),
  img_left_back: z.string().optional(),
  img_left: z.string().optional(),
  img_left_front: z.string().optional(),
  img_open_bonnet: z.string().optional(),
  img_upper_roof: z.string().optional(),
  img_lhs_a_pillar: z.string().optional(),
  img_lhs_b_pillar: z.string().optional(),
  img_lhs_c_pillar: z.string().optional(),
  img_rhs_a_pillar: z.string().optional(),
  img_rhs_b_pillar: z.string().optional(),
  img_rhs_c_pillar: z.string().optional(),
  img_lhs_front_tyre: z.string().optional(),
  img_lhs_back_tyre: z.string().optional(),
  img_rhs_front_tyre: z.string().optional(),
  img_rhs_back_tyre: z.string().optional(),
  img_odometer: z.string().optional(),
  img_front_right_door_open: z.string().optional(),
  img_back_right_door_open: z.string().optional(),
  img_dashboard_from_back: z.string().optional(),
});

const docsObjectSchema = z.object({
  rcImage: z.string().optional(),
  insuranceType: z.enum(['Third Party', 'Comprehensive', 'Zero Depth', 'Expired']),
  insuranceImage: z.string().optional(),
  insuranceValidUpto: z.date().optional(),
  ncbPercentage: z.coerce.number().min(0).max(100).optional(),
  bankLfcLetter: z.string().optional(),
  nocStatus: z.enum(['Available', 'Not Available']).optional(),
  bankNocLetter: z.string().optional(),
});

// Merge all object schemas first
const baseSchema = sellerObjectSchema
  .merge(carDetailsSchema)
  .merge(carImagesSchema)
  .merge(docsObjectSchema);

// Apply all refinements to the merged schema
const fullVehicleSchema = baseSchema.refine(data => {
    if (data.loanStatus === 'Open Loan') return data.foreclosureAmount !== undefined && data.foreclosureAmount >= 0;
    return true;
}, { message: "Foreclosure amount is required for an open loan.", path: ["foreclosureAmount"]
}).refine(data => {
    if (data.sellerPaymentMethod && ['upi', 'bank', 'cheque'].includes(data.sellerPaymentMethod)) return !!data.sellerPaymentProof;
    return true;
}, { message: "Payment proof is required for this payment method.", path: ["sellerPaymentProof"]
}).refine(data => {
    if (data.insuranceType !== 'Expired') return !!data.insuranceImage;
    return true;
}, { message: "Insurance image is required unless the policy is expired.", path: ["insuranceImage"]
}).refine(data => {
    if (data.insuranceType !== 'Expired') return !!data.insuranceValidUpto;
    return true;
}, { message: "Insurance validity date is required.", path: ["insuranceValidUpto"] });


type PurchaseFormValues = z.infer<typeof fullVehicleSchema>;


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
                    <Image src={preview} alt={`${label} preview`} layout="fill" className="rounded-md object-contain border bg-secondary/50" data-ai-hint="document"/>
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

const getOrdinal = (n: number) => {
    if (!n) return '';
    if (n > 3 && n < 21) return n + 'th'; 
    switch (n % 10) {
      case 1:  return n + "st";
      case 2:  return n + "nd";
      case 3:  return n + "rd";
      default: return n + "th";
    }
};

const parseOwnershipToNumber = (ownership: string | undefined): number => {
    if (!ownership) return 1;
    const num = parseInt(ownership, 10);
    return isNaN(num) ? 1 : num;
};

const getSanitizedDefaultValues = (vehicle?: Vehicle): Partial<PurchaseFormValues> => {
    const images = vehicle?.images || {};
    images.exterior = images.exterior || {};
    images.interior = images.interior || {};
    images.tyres = images.tyres || {};
    
    return {
        sellerName: vehicle?.sellerName || '',
        sellerPhone: vehicle?.sellerPhone || '',
        aadharFront: vehicle?.aadharFront || '',
        aadharBack: vehicle?.aadharBack || '',
        panFront: vehicle?.panFront || '',
        buyingDate: vehicle?.buyingDate ? new Date(vehicle.buyingDate) : new Date(),
        buyingPrice: vehicle?.buyingPrice || 0,
        loanStatus: vehicle?.loanStatus || 'Hypo Terminated on RC',
        foreclosureAmount: vehicle?.foreclosureAmount || 0,
        amountPaidToSeller: vehicle?.amountPaidToSeller || 0,
        sellerPaymentMethod: vehicle?.sellerPaymentMethod || 'upi',
        foreclosurePaymentProof: vehicle?.foreclosurePaymentProof || '',
        sellerPaymentProof: vehicle?.sellerPaymentProof || '',
        cost: vehicle?.cost || 0,
        refurbishmentCost: vehicle?.refurbishmentCost || 0,
        price: vehicle?.price || 0,
        make: vehicle?.make || '',
        model: vehicle?.model || '',
        variant: vehicle?.variant || '',
        year: vehicle?.year || new Date().getFullYear(),
        manufacturingYear: vehicle?.manufacturingYear || new Date().getFullYear(),
        registrationNumber: vehicle?.registrationNumber || '',
        vin: vehicle?.vin || '',
        rtoState: vehicle?.rtoState || '',
        ownership: parseOwnershipToNumber(vehicle?.ownershipType),
        fuelType: vehicle?.fuelType || 'Petrol',
        odometerReading: vehicle?.odometerReading || 0,
        transmission: vehicle?.transmission || 'Manual',
        img_front: images.exterior?.front || '',
        img_front_right: images.exterior?.front_right || '',
        img_right: images.exterior?.right || '',
        img_right_back: images.exterior?.right_back || '',
        img_back: images.exterior?.back || '',
        img_open_dickey: images.exterior?.open_dickey || '',
        spareTyreAvailability: vehicle?.spareTyreAvailability || 'Not Available',
        img_spare_tyre: images.exterior?.spare_tyre || '',
        img_left_back: images.exterior?.left_back || '',
        img_left: images.exterior?.left || '',
        img_left_front: images.exterior?.left_front || '',
        img_open_bonnet: images.exterior?.open_bonnet || '',
        img_upper_roof: images.exterior?.upper_roof || '',
        img_lhs_a_pillar: images.exterior?.lhs_a_pillar || '',
        img_lhs_b_pillar: images.exterior?.lhs_b_pillar || '',
        img_lhs_c_pillar: images.exterior?.lhs_c_pillar || '',
        img_rhs_a_pillar: images.exterior?.rhs_a_pillar || '',
        img_rhs_b_pillar: images.exterior?.rhs_b_pillar || '',
        img_rhs_c_pillar: images.exterior?.rhs_c_pillar || '',
        img_lhs_front_tyre: images.tyres?.lhs_front_tyre || '',
        img_lhs_back_tyre: images.tyres?.lhs_back_tyre || '',
        img_rhs_front_tyre: images.tyres?.rhs_front_tyre || '',
        img_rhs_back_tyre: images.tyres?.rhs_back_tyre || '',
        img_odometer: images.interior?.odometer || '',
        img_front_right_door_open: images.interior?.frontRightDoorOpen || '',
        img_back_right_door_open: images.interior?.backRightDoorOpen || '',
        img_dashboard_from_back: images.interior?.dashboardFromBack || '',
        rcImage: vehicle?.rcImage || '',
        insuranceType: vehicle?.insuranceType || 'Third Party',
        insuranceImage: vehicle?.insuranceImage || '',
        insuranceValidUpto: vehicle?.insuranceValidUpto ? new Date(vehicle.insuranceValidUpto) : undefined,
        ncbPercentage: vehicle?.ncbPercentage || 0,
        bankLfcLetter: vehicle?.bankLfcLetter || '',
        nocStatus: vehicle?.nocStatus || 'Not Available',
        bankNocLetter: vehicle?.bankNocLetter || '',
    };
};


export function AddPurchaseForm({ dealerId, existingVehicle }: { dealerId: string, existingVehicle?: Vehicle }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  
  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(fullVehicleSchema),
    defaultValues: getSanitizedDefaultValues(existingVehicle),
  });
  
  const { watch, setValue, control } = form;
  const loanStatus = watch('loanStatus');
  const nocStatus = watch('nocStatus');
  const buyingPrice = watch('buyingPrice') || 0;
  const foreclosureAmount = watch('foreclosureAmount') || 0;
  const sellerPaymentMethod = watch('sellerPaymentMethod');
  const spareTyreAvailability = watch('spareTyreAvailability');
  const insuranceType = watch('insuranceType');

  React.useEffect(() => {
    if (loanStatus === 'Open Loan') {
      const remainingAmount = buyingPrice - foreclosureAmount;
      setValue('amountPaidToSeller', remainingAmount >= 0 ? remainingAmount : 0, { shouldValidate: true });
    } else {
      setValue('amountPaidToSeller', buyingPrice, { shouldValidate: true });
    }
  }, [buyingPrice, foreclosureAmount, loanStatus, setValue]);

  const amountPaidToSeller = watch('amountPaidToSeller') || 0;

  const onSubmit = async (data: PurchaseFormValues) => {
    setIsSubmitting(true);
    
    const ownershipType = getOrdinal(data.ownership as number);

    const vehicleData: Partial<Vehicle> = {
      ...data,
      ownershipType: ownershipType,
      cost: data.cost,
      buyingDate: data.buyingDate?.toISOString(),
      insuranceValidUpto: data.insuranceValidUpto?.toISOString(),
      status: existingVehicle?.status && existingVehicle.status !== 'Draft' ? existingVehicle.status : 'For Sale',
    };
    
    const imagePayload = {
      exterior: { front: data.img_front, front_right: data.img_front_right, right: data.img_right, right_back: data.img_right_back, back: data.img_back, open_dickey: data.img_open_dickey, spare_tyre: data.img_spare_tyre, left_back: data.img_left_back, left: data.img_left, left_front: data.img_left_front, open_bonnet: data.img_open_bonnet, upper_roof: data.img_upper_roof, lhs_a_pillar: data.img_lhs_a_pillar, lhs_b_pillar: data.img_lhs_b_pillar, lhs_c_pillar: data.img_lhs_c_pillar, rhs_a_pillar: data.img_rhs_a_pillar, rhs_b_pillar: data.img_rhs_b_pillar, rhs_c_pillar: data.img_rhs_c_pillar, },
      tyres: { lhs_front_tyre: data.img_lhs_front_tyre, lhs_back_tyre: data.img_lhs_back_tyre, rhs_front_tyre: data.img_rhs_front_tyre, rhs_back_tyre: data.img_rhs_back_tyre, },
      interior: { odometer: data.img_odometer, frontRightDoorOpen: data.img_front_right_door_open, backRightDoorOpen: data.img_back_right_door_open, dashboardFromBack: data.img_dashboard_from_back, }
    };

    // Explicitly stringify the images object and remove individual image fields from the main payload
    (vehicleData as any).images = JSON.stringify(imagePayload);
    Object.keys(carImagesSchema.shape).forEach(key => delete (vehicleData as any)[key]);


    let result;
    if (existingVehicle?.id) { 
      result = await updateVehicleAction(existingVehicle.id, vehicleData);
    } else { 
      result = await addVehicleAction(vehicleData, dealerId);
    }

    setIsSubmitting(false);

    if (result.success) {
      toast({ title: existingVehicle ? "Vehicle Updated" : "Vehicle Purchase Logged", description: "The vehicle has been saved to your inventory.", variant: "success"});
      router.push(`/dashboard/${dealerId}/inventory`);
      router.refresh();
    } else {
      toast({ title: "Save Failed", description: result.error || "An unexpected error occurred.", variant: "destructive" });
    }
  }

  const defaultAccordionValues = ["item-1", "item-2", "item-3", "item-4"];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Accordion type="multiple" defaultValue={defaultAccordionValues} className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>
                    <div className="flex flex-col items-start">
                        <span className="font-semibold">Step 1: Buying Details</span>
                        <span className="text-xs text-muted-foreground font-normal">Seller information and transaction details.</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="p-4 border-t space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><FormField control={control} name="sellerName" render={({ field }) => (<FormItem><FormLabel>Seller Name</FormLabel><FormControl><Input placeholder="Enter seller's full name" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={control} name="sellerPhone" render={({ field }) => (<FormItem><FormLabel>Seller Phone Number</FormLabel><FormControl><Input placeholder="Enter seller's phone number" {...field} /></FormControl><FormMessage /></FormItem>)}/></div>
                        <div><FormLabel>KYC Documents</FormLabel><div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2"><ImageUploadField form={form} name="aadharFront" label="Aadhar Card (Front)" /><ImageUploadField form={form} name="aadharBack" label="Aadhar Card (Back)" /><ImageUploadField form={form} name="panFront" label="PAN Card" /></div></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><FormField control={control} name="buyingDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Buying Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>{field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)}/>
                        <FormField control={control} name="buyingPrice" render={({ field }) => (<FormItem><FormLabel>Buying Price (₹)</FormLabel><FormControl><Input type="number" placeholder="Total buying price" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={control} name="loanStatus" render={({ field }) => (<FormItem><FormLabel>Vehicle Loan Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select loan status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Hypo Terminated on RC">Hypo Terminated on RC</SelectItem><SelectItem value="Open Loan">Open Loan</SelectItem><SelectItem value="Closed Loan">Closed Loan</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/></div>
                        <Separator />
                        <div className="space-y-6">{loanStatus === 'Open Loan' ? (<div className="p-4 border rounded-md bg-muted/50 space-y-6"><div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"><FormField control={control} name="foreclosureAmount" render={({ field }) => (<FormItem><FormLabel>Foreclosure Amount Paid to Bank (₹)</FormLabel><FormControl><Input type="number" placeholder="Amount paid to bank" {...field} /></FormControl><FormMessage /></FormItem>)}/> <ImageUploadField form={form} name="foreclosurePaymentProof" label="Foreclosure Payment Proof"/></div><div className="p-4 rounded-md bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800"><Label>Remaining Amount Paid to Seller</Label><div className="text-2xl font-bold text-green-700 dark:text-green-400 mt-1">₹{amountPaidToSeller.toLocaleString('en-IN')}</div><FormField control={control} name="amountPaidToSeller" render={({ field }) => (<FormItem className="hidden"><FormControl><Input type="hidden" {...field} /></FormControl><FormMessage /></FormItem>)}/></div><div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"><FormField control={control} name="sellerPaymentMethod" render={({ field }) => (<FormItem className="space-y-3"><FormLabel>Payment Method (to Seller)</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-4"><FormItem><RadioGroupItem value="upi" id="upi_rem" className="peer sr-only" /><Label htmlFor="upi_rem" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"><CircleDot className="mb-3 h-6 w-6"/>UPI</Label></FormItem><FormItem><RadioGroupItem value="bank" id="bank_rem" className="peer sr-only" /><Label htmlFor="bank_rem" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"><Landmark className="mb-3 h-6 w-6"/>Bank</Label></FormItem><FormItem><RadioGroupItem value="cheque" id="cheque_rem" className="peer sr-only" /><Label htmlFor="cheque_rem" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"><Wallet className="mb-3 h-6 w-6"/>Cheque</Label></FormItem><FormItem><RadioGroupItem value="cash" id="cash_rem" className="peer sr-only" /><Label htmlFor="cash_rem" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"><IndianRupee className="mb-3 h-6 w-6"/>Cash</Label></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)}/>{['upi', 'bank', 'cheque'].includes(sellerPaymentMethod) && (<div><FormLabel>Payment Proof (to Seller)</FormLabel><div className="mt-2"><ImageUploadField form={form} name="sellerPaymentProof" label="Upload Proof"/></div></div>)}</div></div>) : (<div className="p-4 border rounded-md bg-muted/50 space-y-6"><FormField control={control} name="amountPaidToSeller" render={({ field }) => (<FormItem><FormLabel>Amount Paid to Seller (₹)</FormLabel><FormControl><Input type="number" placeholder="Amount paid directly" {...field} /></FormControl><FormMessage /></FormItem>)}/> <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"><FormField control={control} name="sellerPaymentMethod" render={({ field }) => (<FormItem className="space-y-3"><FormLabel>Payment Method</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-4"><FormItem><RadioGroupItem value="upi" id="upi_direct" className="peer sr-only" /><Label htmlFor="upi_direct" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"><CircleDot className="mb-3 h-6 w-6"/>UPI</Label></FormItem><FormItem><RadioGroupItem value="bank" id="bank_direct" className="peer sr-only" /><Label htmlFor="bank_direct" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"><Landmark className="mb-3 h-6 w-6"/>Bank</Label></FormItem><FormItem><RadioGroupItem value="cheque" id="cheque_direct" className="peer sr-only" /><Label htmlFor="cheque_direct" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"><Wallet className="mb-3 h-6 w-6"/>Cheque</Label></FormItem><FormItem><RadioGroupItem value="cash" id="cash_direct" className="peer sr-only" /><Label htmlFor="cash_direct" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"><IndianRupee className="mb-3 h-6 w-6"/>Cash</Label></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)}/>{['upi', 'bank', 'cheque'].includes(sellerPaymentMethod) && (<div><FormLabel>Payment Proof</FormLabel><div className="mt-2"><ImageUploadField form={form} name="sellerPaymentProof" label="Upload Proof"/></div></div>)}</div></div>)}</div>
                    </div>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
                <AccordionTrigger>
                     <div className="flex flex-col items-start">
                        <span className="font-semibold">Step 2: Car Details</span>
                        <span className="text-xs text-muted-foreground font-normal">Vehicle specifications and financial details.</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                     <div className="p-4 border-t space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField control={control} name="cost" render={({ field }) => (<FormItem><FormLabel>Dealer Cost Price (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                            <FormField control={control} name="refurbishmentCost" render={({ field }) => (<FormItem><FormLabel>Refurbishment Cost (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                            <FormField control={control} name="price" render={({ field }) => (<FormItem><FormLabel>Selling Price (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField control={control} name="make" render={({ field }) => (<FormItem><FormLabel>Make</FormLabel><FormControl><Input placeholder="e.g., Maruti Suzuki" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                            <FormField control={control} name="model" render={({ field }) => (<FormItem><FormLabel>Model</FormLabel><FormControl><Input placeholder="e.g., Swift" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                            <FormField control={control} name="variant" render={({ field }) => (<FormItem><FormLabel>Variant</FormLabel><FormControl><Input placeholder="e.g., VXI" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField control={control} name="year" render={({ field }) => (<FormItem><FormLabel>Registration Year</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                            <FormField control={control} name="manufacturingYear" render={({ field }) => (<FormItem><FormLabel>Manufacturing Year</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                            <FormField control={control} name="registrationNumber" render={({ field }) => (<FormItem><FormLabel>Registration Number</FormLabel><FormControl><Input placeholder="e.g., MH12AB1234" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField control={control} name="vin" render={({ field }) => (<FormItem><FormLabel>VIN</FormLabel><FormControl><Input placeholder="Enter 17-digit VIN" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                            <FormField control={control} name="rtoState" render={({ field }) => (<FormItem><FormLabel>RTO State</FormLabel><FormControl><Input placeholder="e.g., MH" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                            <FormField control={control} name="ownership" render={({ field }) => (<FormItem><FormLabel>Ownership</FormLabel><Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select ownership" /></SelectTrigger></FormControl><SelectContent>{Array.from({ length: 10 }, (_, i) => i + 1).map(num => <SelectItem key={num} value={String(num)}>{getOrdinal(num)}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)}/>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField control={control} name="fuelType" render={({ field }) => (<FormItem><FormLabel>Fuel Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select fuel type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Petrol">Petrol</SelectItem><SelectItem value="Diesel">Diesel</SelectItem><SelectItem value="Electric">Electric</SelectItem><SelectItem value="CNG">CNG</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/>
                            <FormField control={control} name="odometerReading" render={({ field }) => (<FormItem><FormLabel>Odometer Reading (km)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                            <FormField control={control} name="transmission" render={({ field }) => (<FormItem><FormLabel>Transmission</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select transmission" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Manual">Manual</SelectItem><SelectItem value="Automatic">Automatic</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>

             <AccordionItem value="item-3">
                <AccordionTrigger>
                     <div className="flex flex-col items-start">
                        <span className="font-semibold">Step 3: Car Images</span>
                        <span className="text-xs text-muted-foreground font-normal">Clear images of the vehicle from all angles.</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                     <div className="p-4 border-t space-y-6">
                        <div>
                            <h3 className="font-medium text-foreground mb-4">Exterior Images</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 items-start">
                                <ImageUploadField form={form} name="img_front" label="Front"/><ImageUploadField form={form} name="img_front_right" label="Front Right"/><ImageUploadField form={form} name="img_right" label="Right"/><ImageUploadField form={form} name="img_right_back" label="Right Back"/><ImageUploadField form={form} name="img_back" label="Back"/><ImageUploadField form={form} name="img_left_back" label="Left Back"/><ImageUploadField form={form} name="img_left" label="Left"/><ImageUploadField form={form} name="img_left_front" label="Left Front"/><ImageUploadField form={form} name="img_open_dickey" label="Open Dickey"/><ImageUploadField form={form} name="img_open_bonnet" label="Open Bonnet"/><ImageUploadField form={form} name="img_upper_roof" label="Upper Roof"/>
                                <FormField control={control} name="spareTyreAvailability" render={({ field }) => (<FormItem><FormLabel className="text-xs">Spare Tyre</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-2 pt-2"><FormItem><RadioGroupItem value="Available" id="tyre-yes" className="peer sr-only" /><Label htmlFor="tyre-yes" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover px-3 py-2 text-xs font-medium hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground [&:has([data-state=checked])]:border-primary">Yes</Label></FormItem><FormItem><RadioGroupItem value="Not Available" id="tyre-no" className="peer sr-only" /><Label htmlFor="tyre-no" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover px-3 py-2 text-xs font-medium hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground [&:has([data-state=checked])]:border-primary">No</Label></FormItem></RadioGroup></FormControl>{spareTyreAvailability === 'Available' && (<div className="pt-2"><ImageUploadField form={form} name="img_spare_tyre" label="" /></div>)}</FormItem>)}/>
                            </div>
                        </div>
                        <div><h3 className="font-medium text-foreground mb-4">Pillar Images</h3><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"><ImageUploadField form={form} name="img_lhs_a_pillar" label="LHS A Pillar"/><ImageUploadField form={form} name="img_lhs_b_pillar" label="LHS B Pillar"/><ImageUploadField form={form} name="img_lhs_c_pillar" label="LHS C Pillar"/><ImageUploadField form={form} name="img_rhs_a_pillar" label="RHS A Pillar"/><ImageUploadField form={form} name="img_rhs_b_pillar" label="RHS B Pillar"/><ImageUploadField form={form} name="img_rhs_c_pillar" label="RHS C Pillar"/></div></div>
                        <div><h3 className="font-medium text-foreground mb-4">Tyre Images</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-4"><ImageUploadField form={form} name="img_lhs_front_tyre" label="LHS Front Tyre"/><ImageUploadField form={form} name="img_lhs_back_tyre" label="LHS Back Tyre"/><ImageUploadField form={form} name="img_rhs_front_tyre" label="RHS Front Tyre"/><ImageUploadField form={form} name="img_rhs_back_tyre" label="RHS Back Tyre"/></div></div>
                        <div><h3 className="font-medium text-foreground mb-4">Interior Images</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-4"><ImageUploadField form={form} name="img_odometer" label="Odometer"/><ImageUploadField form={form} name="img_front_right_door_open" label="Front Right (Door Open)"/><ImageUploadField form={form} name="img_back_right_door_open" label="Back Right (Door Open)"/><ImageUploadField form={form} name="img_dashboard_from_back" label="Dashboard (From Back)"/></div></div>
                    </div>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
                <AccordionTrigger>
                     <div className="flex flex-col items-start">
                        <span className="font-semibold">Step 4: Documentation</span>
                        <span className="text-xs text-muted-foreground font-normal">All necessary vehicle documents.</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                     <div className="p-4 border-t space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            <div className="space-y-4"><h3 className="font-medium text-foreground">Insurance Details</h3>
                                <div className="space-y-6">
                                    <FormField control={control} name="insuranceType" render={({ field }) => (<FormItem><FormLabel>Insurance Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select insurance type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Third Party">Third Party</SelectItem><SelectItem value="Comprehensive">Comprehensive</SelectItem><SelectItem value="Zero Depth">Zero Depth</SelectItem><SelectItem value="Expired">Expired</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/>
                                    {insuranceType !== 'Expired' && (<>
                                        <FormField control={control} name="insuranceValidUpto" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Insurance Valid Upto</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus/></PopoverContent></Popover><FormMessage /></FormItem>)}/>
                                        {(insuranceType === 'Comprehensive' || insuranceType === 'Zero Depth') && (<FormField control={control} name="ncbPercentage" render={({ field }) => (<FormItem><FormLabel>No Claim Bonus (NCB) %</FormLabel><FormControl><Input type="number" placeholder="e.g., 25" {...field} /></FormControl><FormMessage /></FormItem>)}/>)}
                                        <ImageUploadField form={form} name="insuranceImage" label="Insurance Policy Image"/>
                                    </>)}
                                </div>
                            </div>
                            <div className="space-y-4"><h3 className="font-medium text-foreground">RC Image</h3><ImageUploadField form={form} name="rcImage" label="Registration Certificate"/></div>
                            <div className="md:col-span-2 space-y-4"><h3 className="font-medium text-foreground">Loan Documents</h3>
                                {loanStatus === 'Open Loan' && (<div className="pt-2"><ImageUploadField form={form} name="bankLfcLetter" label="Bank LFC Letter"/></div>)}
                                {loanStatus === 'Closed Loan' && (<div className="pt-2 space-y-4">
                                    <FormField control={control} name="nocStatus" render={({ field }) => (<FormItem><FormLabel>NOC Status</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-2 pt-2"><FormItem><RadioGroupItem value="Available" id="noc-yes" className="peer sr-only" /><Label htmlFor="noc-yes" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground [&:has([data-state=checked])]:border-primary">Available</Label></FormItem><FormItem><RadioGroupItem value="Not Available" id="noc-no" className="peer sr-only" /><Label htmlFor="noc-no" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground [&:has([data-state=checked])]:border-primary">Not Available</Label></FormItem></RadioGroup></FormControl></FormItem>)}/>
                                    {nocStatus === 'Available' && (<ImageUploadField form={form} name="bankNocLetter" label="Bank NOC Letter"/>)}
                                </div>)}
                                {loanStatus === 'Hypo Terminated on RC' && (<p className="text-sm text-muted-foreground p-4 bg-secondary rounded-md">No loan documents required as Hypothecation is terminated on RC.</p>)}
                            </div>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>

        <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                    </>
                ) : (
                    existingVehicle ? "Update Vehicle Details" : "Save Vehicle"
                )}
            </Button>
        </div>
      </form>
    </Form>
  );
}

    