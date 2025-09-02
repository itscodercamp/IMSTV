
"use client";

import * as React from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, IndianRupee, FileText, KeyRound, Upload, Loader2, Save } from "lucide-react";
import type { Employee } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "../ui/button";
import { toast } from "@/hooks/use-toast";
import { updateEmployeeAvatarAction } from "@/app/(employee)/actions";

const DetailRow = ({ label, value, icon: Icon }: { label: string, value: React.ReactNode, icon: React.ElementType }) => (
    <div className="flex items-start gap-4">
        <Icon className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
        <div className="text-sm w-full">
            <p className="text-muted-foreground">{label}</p>
            <p className="font-medium break-words text-foreground">{value || 'N/A'}</p>
        </div>
    </div>
);

export function MyProfileCard({ employee, onAvatarChange }: { employee: Employee, onAvatarChange: (newAvatarUrl: string) => void }) {
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);


  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase() || 'E';
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAvatar = async () => {
    if (!imagePreview) return;
    setIsUploading(true);
    const result = await updateEmployeeAvatarAction(employee.id, imagePreview);
    setIsUploading(false);

    if (result.success) {
      onAvatarChange(imagePreview);
      setImagePreview(null);
      toast({
        variant: "success",
        title: "Avatar Updated",
        description: "Your new profile picture has been saved.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: result.error || "Could not update your profile picture.",
      });
    }
  };


  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="relative group">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-primary/20">
                <AvatarImage src={imagePreview || employee.avatarUrl} alt={employee.name} data-ai-hint="person face" />
                <AvatarFallback className="text-2xl sm:text-3xl">{getInitials(employee.name)}</AvatarFallback>
            </Avatar>
            <Button size="icon" className="absolute bottom-0 right-0 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" />
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg" className="hidden" />
          </div>

          <div className="space-y-1">
            <CardTitle className="text-2xl sm:text-3xl font-bold">{employee.name}</CardTitle>
            <div className="text-muted-foreground">
              <Badge variant="secondary" className="text-sm">{employee.role}</Badge>
            </div>
             {imagePreview && (
              <div className="flex items-center gap-2 pt-2">
                <Button size="sm" onClick={handleSaveAvatar} disabled={isUploading}>
                  {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setImagePreview(null)}>Cancel</Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-4">
                  <h3 className="text-base font-semibold text-foreground">Contact Information</h3>
                  <DetailRow label="Email Address" value={employee.email} icon={Mail} />
                  <DetailRow label="Phone Number" value={employee.phone} icon={Phone} />
              </div>
              <div className="space-y-4">
                  <h3 className="text-base font-semibold text-foreground">Financials & Credentials</h3>
                  <DetailRow label="Monthly Salary" value={`₹${employee.salary.toLocaleString('en-IN')}`} icon={IndianRupee}/>
                  <Separator />
                  <DetailRow label="User ID" value={employee.phone} icon={KeyRound} />
              </div>
          </div>
          
          {employee.aadharImageUrl && (
            <div>
                <Separator className="my-4" />
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2 mb-3"><FileText className="h-4 w-4"/>Documents</h3>
                <div className="p-3 border border-dashed rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground mb-2">Aadhar Card Image</p>
                    <div className="relative h-48 w-full max-w-xs">
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
          )}
      </CardContent>
    </Card>
  )
}
