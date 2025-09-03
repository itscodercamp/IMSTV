
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Share2, IndianRupee, ImageIcon, Car } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils";
import type { Vehicle } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchVehicleById } from "@/app/(main)/actions";

const DetailRow = ({ label, value, className, icon: Icon }: { label: string, value: React.ReactNode, className?: string, icon?: React.ElementType }) => (
    <div className={cn("text-sm", className)}>
        <p className="text-muted-foreground flex items-center gap-1.5">{Icon && <Icon className="h-4 w-4" />} {label}</p>
        <p className="font-medium break-words text-foreground mt-1">{value || 'N/A'}</p>
    </div>
);

const ImageCard = ({ src, alt, hint, onClick }: { src?: string; alt: string; hint: string; onClick: () => void }) => {
  if (!src) return (
    <div className="w-full">
      <p className="text-xs text-muted-foreground mb-1 truncate">{alt}</p>
      <div className="rounded-lg border border-dashed border-border w-full aspect-[4/3] flex items-center justify-center bg-secondary">
        <p className="text-xs text-muted-foreground text-center">Not available</p>
      </div>
    </div>
  );
  
  return (
      <button className="text-left w-full group" onClick={onClick}>
          <p className="text-xs text-muted-foreground mb-1 truncate">{alt}</p>
          <div className="overflow-hidden rounded-lg">
            <Image
              src={src}
              alt={alt}
              width={200}
              height={150}
              className="rounded-lg object-cover w-full aspect-[4/3] bg-secondary transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={hint}
            />
          </div>
      </button>
  );
};

function VehicleDetailLoader() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-9 w-32" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/4 mt-2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-60 w-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-24" />
                </CardFooter>
            </Card>
        </div>
    )
}

function VehicleDetailClientPage({ vehicle }: { vehicle: Vehicle }) {
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [previewStartIndex, setPreviewStartIndex] = React.useState(0);
  const [imageList, setImageList] = React.useState<{ src?: string, alt: string, hint: string }[]>([]);

  const handleShare = () => {
    let message = `*Check out this vehicle:*\n\n`;
    message += `*Vehicle:* ${vehicle.make} ${vehicle.model} ${vehicle.variant} (${vehicle.year})\n`;
    message += `*Price:* ₹${vehicle.price.toLocaleString('en-IN')}\n`;
    message += `*Kms Driven:* ${vehicle.odometerReading?.toLocaleString()} km\n`;
    message += `*Fuel Type:* ${vehicle.fuelType}\n`;
    message += `*Transmission:* ${vehicle.transmission}\n`;
    message += `*Ownership:* ${vehicle.ownershipType}\n`;
    message += `*Registration:* ${vehicle.registrationNumber}\n\n`;
    
    const employeeInfoRaw = localStorage.getItem('employee_info');
    if(employeeInfoRaw) {
        const employeeInfo = JSON.parse(employeeInfoRaw);
        message += `*Contact:* ${employeeInfo.dealershipName}`;
    }

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }

  const getStatusVariant = (status: typeof vehicle.status) => {
    switch (status) {
      case 'Sold':
        return 'destructive';
      case 'In Refurbishment':
        return 'secondary';
      case 'For Sale':
      default:
        return 'default';
    }
  }
  
  const exteriorImages = [
    { src: vehicle.images?.exterior?.front, alt: 'Front Main', hint: 'vehicle front' },
    { src: vehicle.images?.exterior?.front_right, alt: 'Front Right', hint: 'vehicle front right' },
    { src: vehicle.images?.exterior?.right, alt: 'Right Side', hint: 'vehicle right side' },
    { src: vehicle.images?.exterior?.right_back, alt: 'Right Back', hint: 'vehicle right back' },
    { src: vehicle.images?.exterior?.back, alt: 'Back', hint: 'vehicle back' },
    { src: vehicle.images?.exterior?.left_back, alt: 'Left Back', hint: 'vehicle left back' },
    { src: vehicle.images?.exterior?.left, alt: 'Left Side', hint: 'vehicle left side' },
    { src: vehicle.images?.exterior?.left_front, alt: 'Left Front', hint: 'vehicle left front' },
    { src: vehicle.images?.exterior?.open_dickey, alt: 'Open Dickey', hint: 'vehicle trunk open' },
    { src: vehicle.images?.exterior?.open_bonnet, alt: 'Open Bonnet', hint: 'vehicle bonnet open' },
    { src: vehicle.images?.exterior?.upper_roof, alt: 'Roof', hint: 'vehicle roof' },
    { src: vehicle.images?.exterior?.lhs_a_pillar, alt: 'LHS A-Pillar', hint: 'vehicle pillar' },
    { src: vehicle.images?.exterior?.lhs_b_pillar, alt: 'LHS B-Pillar', hint: 'vehicle pillar' },
    { src: vehicle.images?.exterior?.lhs_c_pillar, alt: 'LHS C-Pillar', hint: 'vehicle pillar' },
    { src: vehicle.images?.exterior?.rhs_a_pillar, alt: 'RHS A-Pillar', hint: 'vehicle pillar' },
    { src: vehicle.images?.exterior?.rhs_b_pillar, alt: 'RHS B-Pillar', hint: 'vehicle pillar' },
    { src: vehicle.images?.exterior?.rhs_c_pillar, alt: 'RHS C-Pillar', hint: 'vehicle pillar' },
    { src: vehicle.images?.exterior?.spare_tyre, alt: 'Spare Tyre', hint: 'vehicle spare tyre' },
  ].filter(img => img.src);

  const interiorImages = [
    { src: vehicle.images?.interior?.odometer, alt: 'Odometer', hint: 'vehicle odometer' },
    { src: vehicle.images?.interior?.frontRightDoorOpen, alt: 'Front Right Door Open', hint: 'vehicle interior' },
    { src: vehicle.images?.interior?.backRightDoorOpen, alt: 'Back Right Door Open', hint: 'vehicle interior' },
    { src: vehicle.images?.interior?.dashboardFromBack, alt: 'Dashboard from Back', hint: 'vehicle dashboard' },
  ].filter(img => img.src);
  
  const tyreImages = [
    { src: vehicle.images?.tyres?.lhs_front_tyre, alt: 'LHS Front Tyre', hint: 'vehicle tyre' },
    { src: vehicle.images?.tyres?.lhs_back_tyre, alt: 'LHS Back Tyre', hint: 'vehicle tyre' },
    { src: vehicle.images?.tyres?.rhs_front_tyre, alt: 'RHS Front Tyre', hint: 'vehicle tyre' },
    { src: vehicle.images?.tyres?.rhs_back_tyre, alt: 'RHS Back Tyre', hint: 'vehicle tyre' },
  ].filter(img => img.src);
  
  const allImages = [...exteriorImages, ...interiorImages, ...tyreImages];

  const openPreview = (list: typeof allImages, index: number) => {
    setImageList(list);
    setPreviewStartIndex(index);
    setIsPreviewOpen(true);
  }

  return (
    <div className="space-y-6">
       <div>
        <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/employee-dashboard">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
            </Link>
        </Button>
       </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">{vehicle.make} {vehicle.model} {vehicle.variant}</CardTitle>
              <CardDescription>VIN: {vehicle.vin}</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <Badge variant={getStatusVariant(vehicle.status)} className="text-sm">{vehicle.status}</Badge>
                <h2 className="text-2xl font-bold text-primary">₹{vehicle.price.toLocaleString('en-IN')}</h2>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <Accordion type="multiple" defaultValue={['item-1', 'item-3', 'item-4']} className="w-full">
              
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg font-semibold">
                  <div className="flex items-center gap-2"><Car className="h-5 w-5"/>Vehicle & Ownership Details</div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        <DetailRow label="Make" value={vehicle.make} />
                        <DetailRow label="Model" value={vehicle.model} />
                        <DetailRow label="Variant" value={vehicle.variant} />
                        <DetailRow label="Registration Year" value={vehicle.year} />
                        <DetailRow label="Manufacturing Year" value={vehicle.manufacturingYear} />
                        <DetailRow label="Registration Number" value={vehicle.registrationNumber} />
                        <DetailRow label="Odometer" value={`${vehicle.odometerReading?.toLocaleString()} km`} />
                        <DetailRow label="Fuel Type" value={vehicle.fuelType} />
                        <DetailRow label="Transmission" value={vehicle.transmission} />
                        <DetailRow label="RTO State" value={vehicle.rtoState} />
                        <DetailRow label="Ownership" value={vehicle.ownershipType} />
                    </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-lg font-semibold">
                  <div className="flex items-center gap-2"><ImageIcon className="h-5 w-5"/>Exterior Images</div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {exteriorImages.map((image, index) => (
                        <ImageCard 
                          key={`ext-${index}`}
                          src={image.src} 
                          alt={image.alt} 
                          hint={image.hint} 
                          onClick={() => openPreview(exteriorImages, index)}
                        />
                      ))}
                    </div>
                </AccordionContent>
              </AccordionItem>

               <AccordionItem value="item-4">
                <AccordionTrigger className="text-lg font-semibold">
                  <div className="flex items-center gap-2"><ImageIcon className="h-5 w-5"/>Interior & Tyre Images</div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                    <div>
                        <h4 className="font-medium text-foreground mb-2 text-md">Interior</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {interiorImages.map((image, index) => (
                                <ImageCard key={`int-${index}`} src={image.src} alt={image.alt} hint={image.hint} onClick={() => openPreview(interiorImages, index)} />
                            ))}
                        </div>
                    </div>
                     <div>
                        <h4 className="font-medium text-foreground mb-2 text-md">Tyres</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {tyreImages.map((image, index) => (
                                <ImageCard key={`tyre-${index}`} src={image.src} alt={image.alt} hint={image.hint} onClick={() => openPreview(tyreImages, index)} />
                            ))}
                        </div>
                    </div>
                </AccordionContent>
              </AccordionItem>

            </Accordion>
        </CardContent>
        <CardFooter className="flex-col sm:flex-row justify-end gap-2 p-4 mt-4 border-t">
            <Button variant="outline" onClick={handleShare}><Share2 className="mr-2 h-4 w-4"/>Share on WhatsApp</Button>
        </CardFooter>
      </Card>

       <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl w-full p-2 bg-transparent border-none shadow-none">
           <DialogTitle className="sr-only">Image Preview</DialogTitle>
          <Carousel className="w-full" opts={{startIndex: previewStartIndex, loop: true}}>
            <CarouselContent>
              {imageList.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative aspect-video w-full">
                    <Image
                      src={image.src || 'https://placehold.co/800x600.png'}
                      alt={image.alt}
                      fill
                      className="rounded-md object-contain"
                      data-ai-hint={image.hint}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10"/>
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10"/>
          </Carousel>
        </DialogContent>
      </Dialog>
    </div>
  );
}


export default function VehicleDetailPage() {
  const params = useParams<{ dealerId: string; vehicleId: string }>();
  const { vehicleId } = params;
  const [vehicle, setVehicle] = React.useState<Vehicle | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (vehicleId) {
      // Employee view does not need to be scoped by dealerId, they can see all.
      fetchVehicleById(vehicleId as string)
        .then(data => {
            if (data) {
                setVehicle(data);
            } else {
                notFound();
            }
        })
        .catch(() => notFound())
        .finally(() => setLoading(false));
    }
  }, [vehicleId]);

  if (loading) {
      return <VehicleDetailLoader />;
  }

  if (!vehicle) {
      return notFound();
  }

  return <VehicleDetailClientPage vehicle={vehicle} />;
}
