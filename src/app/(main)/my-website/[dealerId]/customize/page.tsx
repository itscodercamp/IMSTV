
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save, Upload, X, Palette, Image as ImageIcon, ShoppingCart, List } from "lucide-react";
import { upsertWebsiteContentAction, getWebsiteContentAction, fetchVehicles, updateVehicleAction } from "@/app/(main)/actions";
import { useParams, useRouter } from "next/navigation";
import Image from 'next/image';
import type { Vehicle } from "@/lib/types";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const websiteContentSchema = z.object({
  brandName: z.string().min(2, "Brand name is required."),
  logoUrl: z.string().optional(),
  tagline: z.string().optional(),
  aboutUs: z.string().min(10, "About us content is too short.").optional(),
  contactPhone: z.string().min(10, "A valid phone number is required.").optional(),
  contactEmail: z.string().email("Invalid email address.").optional(),
  address: z.string().optional(),
});

type WebsiteContentValues = z.infer<typeof websiteContentSchema>;

const ImageUploadField = ({ form, name, label, hint }: { form: any, name: "logoUrl", label: string, hint: string }) => {
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
            <FormLabel>{label}</FormLabel>
             <div className="relative mt-2 w-full max-w-[200px] aspect-video">
                {preview ? (
                     <>
                        <Image src={preview} alt="Logo preview" layout="fill" className="rounded-lg object-contain border bg-secondary/50" data-ai-hint={hint} />
                        <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full z-10" onClick={clearImage}>
                            <X className="h-4 w-4" />
                        </Button>
                     </>
                ) : (
                    <div className="flex items-center justify-center w-full h-full border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80" onClick={() => fileInputRef.current?.click()}>
                        <div className="flex flex-col items-center justify-center text-center">
                            <Upload className="w-8 h-8 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground mt-1">Click to upload</p>
                        </div>
                    </div>
                )}
             </div>
            <FormControl>
                <Input id="logo-upload" type="file" className="hidden" onChange={handleFileChange} ref={fileInputRef} accept="image/png, image/jpeg, image/svg+xml"/>
            </FormControl>
             <FormField name={name} render={() => <FormMessage />} />
        </FormItem>
    );
};


export default function CustomizeWebsitePage() {
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
    const params = useParams();
    const router = useRouter();
    const dealerId = params.dealerId as string;

    const form = useForm<WebsiteContentValues>({
        resolver: zodResolver(websiteContentSchema),
        defaultValues: {
            brandName: "",
            logoUrl: "",
            tagline: "",
            aboutUs: "",
            contactPhone: "",
            contactEmail: "",
            address: "",
        },
    });

    const loadData = React.useCallback(async () => {
        if (dealerId) {
            setIsLoading(true);
            const [content, fetchedVehicles] = await Promise.all([
                getWebsiteContentAction(dealerId),
                fetchVehicles(dealerId)
            ]);

            if (content) {
                form.reset({
                    brandName: content.brandName || "",
                    logoUrl: content.logoUrl || "",
                    tagline: content.tagline || "",
                    aboutUs: content.aboutUs || "",
                    contactPhone: content.contactPhone || "",
                    contactEmail: content.contactEmail || "",
                    address: content.address || "",
                });
            }
            setVehicles(fetchedVehicles.filter(v => v.status === 'For Sale' || v.status === 'Draft'));
            setIsLoading(false);
        }
    }, [dealerId, form]);

    React.useEffect(() => {
        loadData();
    }, [loadData]);


    async function onSubmit(values: WebsiteContentValues) {
        setIsSubmitting(true);
        const result = await upsertWebsiteContentAction(dealerId, values);

        if (result.success) {
            toast({
                variant: 'success',
                title: "Website Content Saved!",
                description: "Your website details have been updated successfully.",
            });
            router.refresh();
        } else {
            toast({
                variant: 'destructive',
                title: "Failed to Save",
                description: result.error || "An unexpected error occurred.",
            });
        }
        setIsSubmitting(false);
    }

    const handleToggleLiveStatus = async (vehicleId: string, currentStatus: Vehicle['status']) => {
        const newStatus = currentStatus === 'For Sale' ? 'Draft' : 'For Sale';
        const result = await updateVehicleAction(vehicleId, { status: newStatus });

        if (result.success) {
            toast({
                variant: 'success',
                title: `Vehicle status set to ${newStatus}`,
            });
            await loadData(); // Reload all data to ensure consistency
        } else {
            toast({
                variant: 'destructive',
                title: "Update Failed",
                description: result.error,
            });
        }
    }
    
    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Customize Your Website</CardTitle>
                    <CardDescription>Update your brand information, contact details, and theme. These details will be reflected on your public website and APIs.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2"><ImageIcon className="h-5 w-5 text-primary" /> Brand Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg">
                            <div className="space-y-6">
                                <FormField control={form.control} name="brandName" render={({ field }) => (
                                    <FormItem><FormLabel>Brand Name / Dealership Name</FormLabel><FormControl><Input placeholder="e.g., Sharma Motors" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="tagline" render={({ field }) => (
                                    <FormItem><FormLabel>Tagline (Optional)</FormLabel><FormControl><Input placeholder="e.g., Your Trusted Partner in Pre-Owned Cars" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                             <ImageUploadField form={form} name="logoUrl" label="Your Logo" hint="dealership logo" />
                        </div>
                    </div>

                    <div className="space-y-4">
                         <h3 className="text-lg font-medium">About & Contact Details</h3>
                         <div className="p-4 border rounded-lg space-y-6">
                            <FormField control={form.control} name="aboutUs" render={({ field }) => (
                                <FormItem><FormLabel>About Us</FormLabel><FormControl><Textarea placeholder="Tell your customers about your dealership..." className="min-h-[120px]" {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem>
                            )}/>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="contactPhone" render={({ field }) => (
                                    <FormItem><FormLabel>Public Phone Number</FormLabel><FormControl><Input placeholder="Phone number to show on website" {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="contactEmail" render={({ field }) => (
                                    <FormItem><FormLabel>Public Email Address</FormLabel><FormControl><Input type="email" placeholder="Email for customers" {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                             <FormField control={form.control} name="address" render={({ field }) => (
                                <FormItem><FormLabel>Full Address</FormLabel><FormControl><Textarea placeholder="Your dealership's full address" {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem>
                            )}/>
                         </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                     <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving Brand Info...</> : <><Save className="mr-2 h-4 w-4"/> Save Brand Info</>}
                    </Button>
                </CardFooter>
            </Card>
        </form>

        <Card>
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2"><List className="h-5 w-5 text-primary" /> Manage Website Inventory</CardTitle>
                <CardDescription>Choose which vehicles from your inventory appear on your public website. Only vehicles with status "For Sale" or "Draft" are shown here.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Vehicle</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead className="text-center">Website Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {vehicles.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-24">
                                    No available vehicles found in inventory.
                                </TableCell>
                            </TableRow>
                        ) : (
                            vehicles.map(vehicle => (
                                <TableRow key={vehicle.id}>
                                    <TableCell>
                                        <div className="font-medium">{vehicle.make} {vehicle.model}</div>
                                        <div className="text-xs text-muted-foreground">{vehicle.registrationNumber}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">₹{vehicle.price.toLocaleString('en-IN')}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <Switch
                                                checked={vehicle.status === 'For Sale'}
                                                onCheckedChange={() => handleToggleLiveStatus(vehicle.id, vehicle.status)}
                                                id={`switch-${vehicle.id}`}
                                            />
                                            <Label htmlFor={`switch-${vehicle.id}`} className="text-xs text-muted-foreground">
                                                {vehicle.status === 'For Sale' ? 'Live' : 'Paused'}
                                            </Label>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </Form>
  );
}
