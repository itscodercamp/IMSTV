
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
  CardDescription
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save, Upload, X, Palette, Image as ImageIcon } from "lucide-react";
import { upsertWebsiteContentAction, getWebsiteContentAction } from "@/app/(main)/actions";
import { useParams, useRouter } from "next/navigation";
import Image from 'next/image';

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

    React.useEffect(() => {
        if (dealerId) {
            getWebsiteContentAction(dealerId)
                .then(content => {
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
                })
                .finally(() => setIsLoading(false));
        }
    }, [dealerId, form]);

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
    
    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

  return (
    <Card>
        <CardHeader>
            <CardTitle className="text-2xl">Customize Your Website</CardTitle>
            <CardDescription>Update your brand information, contact details, and theme. These details will be reflected on your public website and APIs.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2"><ImageIcon className="h-5 w-5 text-primary" /> Brand Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg">
                        <div className="space-y-6">
                            <FormField control={form.control} name="brandName" render={({ field }) => (
                                <FormItem><FormLabel>Brand Name / Dealership Name</FormLabel><FormControl><Input placeholder="e.g., Sharma Motors" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="tagline" render={({ field }) => (
                                <FormItem><FormLabel>Tagline (Optional)</FormLabel><FormControl><Input placeholder="e.g., Your Trusted Partner in Pre-Owned Cars" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                         <ImageUploadField form={form} name="logoUrl" label="Your Logo" hint="dealership logo" />
                    </div>
                </div>

                <div className="space-y-4">
                     <h3 className="text-lg font-medium">About & Contact Details</h3>
                     <div className="p-4 border rounded-lg space-y-6">
                        <FormField control={form.control} name="aboutUs" render={({ field }) => (
                            <FormItem><FormLabel>About Us</FormLabel><FormControl><Textarea placeholder="Tell your customers about your dealership..." className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="contactPhone" render={({ field }) => (
                                <FormItem><FormLabel>Public Phone Number</FormLabel><FormControl><Input placeholder="Phone number to show on website" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="contactEmail" render={({ field }) => (
                                <FormItem><FormLabel>Public Email Address</FormLabel><FormControl><Input type="email" placeholder="Email for customers" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                         <FormField control={form.control} name="address" render={({ field }) => (
                            <FormItem><FormLabel>Full Address</FormLabel><FormControl><Textarea placeholder="Your dealership's full address" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                     </div>
                </div>
                
                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : <><Save className="mr-2 h-4 w-4"/> Save Changes</>}
                    </Button>
                </div>
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}
