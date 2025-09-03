
"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Trash2, Eye, AlertTriangle, PlusCircle, Search, CircleOff, Share2 } from "lucide-react";
import type { Vehicle } from "@/lib/types";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { updateVehicleAction, deleteVehicleAction } from "@/app/(main)/actions";
import { toast } from "@/hooks/use-toast";
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
import { MarkAsSoldDialog } from "./mark-as-sold-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "../ui/input";
import { useRouter } from "next/navigation";

const placeholderImage = 'https://placehold.co/600x400.png';

export function InventoryTable({ initialVehicles, dealerId }: { initialVehicles: Vehicle[], dealerId: string }) {
  const [vehicles, setVehicles] = React.useState<Vehicle[]>(initialVehicles);
  const [vehicleToDelete, setVehicleToDelete] = React.useState<Vehicle | null>(null);
  const [vehicleToSell, setVehicleToSell] = React.useState<Vehicle | null>(null);
  const [activeTab, setActiveTab] = React.useState("available");
  const [searchTerm, setSearchTerm] = React.useState("");
  const router = useRouter();

  React.useEffect(() => {
    setVehicles(initialVehicles);
  }, [initialVehicles]);
  
  const handleShare = (vehicle: Vehicle) => {
    let message = `*Check out this vehicle:*\n\n`;
    message += `*Vehicle:* ${vehicle.make} ${vehicle.model} ${vehicle.variant} (${vehicle.year})\n`;
    message += `*Price:* ₹${vehicle.price.toLocaleString('en-IN')}\n`;
    message += `*Kms Driven:* ${vehicle.odometerReading?.toLocaleString()} km\n`;
    
    const dealerInfoRaw = localStorage.getItem('dealer_info');
    if(dealerInfoRaw) {
        const dealerInfo = JSON.parse(dealerInfoRaw);
        message += `*From:* ${dealerInfo.dealershipName}`;
    }

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleStatusChange = async (vehicleId: string, currentStatus: Vehicle['status']) => {
    let newStatus: Vehicle['status'] = currentStatus;
    if (currentStatus === 'For Sale') newStatus = 'Draft';
    else if (currentStatus === 'Draft') newStatus = 'For Sale';
    else if (currentStatus === 'Sold') newStatus = 'For Sale'; // Re-list
    else return; // Do nothing for 'In Refurbishment' from here

    const result = await updateVehicleAction(vehicleId, { status: newStatus });

    if (result.success) {
      router.refresh();
      toast({
        variant: "success",
        title: "Status Updated",
        description: `Vehicle status changed to ${newStatus}.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: result.error || "Could not update vehicle status.",
      });
    }
  };

  const handleDelete = async () => {
    if (!vehicleToDelete) return;
    const result = await deleteVehicleAction(vehicleToDelete.id, dealerId);
    if(result.success) {
      router.refresh();
      toast({
        variant: "success",
        title: "Vehicle Deleted",
        description: "The vehicle has been removed from your inventory.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: result.error || "Could not delete the vehicle.",
      });
    }
    setVehicleToDelete(null);
  };

  const getStatusVariant = (status: Vehicle['status']) => {
    switch (status) {
      case 'Sold':
        return 'destructive';
      case 'In Refurbishment':
        return 'secondary';
      case 'For Sale':
        return 'default';
      case 'Draft':
        return 'outline';
      default:
        return 'default';
    }
  };
  
  const vehicleCounts = React.useMemo(() => {
    const available = vehicles.filter(v => v.status === 'For Sale' || v.status === 'Draft').length;
    const processing = vehicles.filter(v => v.status === 'In Refurbishment').length;
    const sold = vehicles.filter(v => v.status === 'Sold').length;
    return { available, processing, sold };
  }, [vehicles]);


  const filteredVehicles = React.useMemo(() => {
    let list = vehicles;
    if (activeTab === 'available') {
      list = vehicles.filter(v => v.status === 'For Sale' || v.status === 'Draft');
    } else if (activeTab === 'processing') {
      list = vehicles.filter(v => v.status === 'In Refurbishment');
    } else if (activeTab === 'sold') {
      list = vehicles.filter(v => v.status === 'Sold');
    }

    if (searchTerm) {
      return list.filter(v => 
        v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.vin?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return list;
  }, [vehicles, activeTab, searchTerm]);

  const NoVehiclesMessage = () => (
    <div className="text-center py-10">
      <CircleOff className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">No vehicles found</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        No vehicles match the current filter.
      </p>
    </div>
  );

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle>Vehicle Inventory</CardTitle>
            <CardDescription>Manage your dealership's stock.</CardDescription>
          </div>
          <Button asChild size="sm" className="gap-1 w-full md:w-auto">
              <Link href={`/dashboard/${dealerId}/inventory/add`}>
                <PlusCircle className="h-3.5 w-3.5" />
                Add Vehicle
              </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <TabsList>
                <TabsTrigger value="available">Available for Sale ({vehicleCounts.available})</TabsTrigger>
                <TabsTrigger value="processing">Processing ({vehicleCounts.processing})</TabsTrigger>
                <TabsTrigger value="sold">Sold ({vehicleCounts.sold})</TabsTrigger>
              </TabsList>
              <div className="relative w-full md:w-auto md:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Make, Model, VIN..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4">
              {filteredVehicles.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Price</TableHead>
                      <TableHead className="hidden lg:table-cell">Website Live</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <Image
                              src={vehicle.images?.exterior?.front || placeholderImage}
                              alt={`${vehicle.make} ${vehicle.model}`}
                              width={64}
                              height={48}
                              className="rounded-md object-cover hidden sm:block aspect-[4/3]"
                              data-ai-hint="vehicle car"
                            />
                            <div>
                              <div className="font-semibold">{vehicle.make} {vehicle.model} ({vehicle.year})</div>
                              <div className="text-sm text-muted-foreground">{vehicle.registrationNumber}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(vehicle.status)}>{vehicle.status}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">₹{(vehicle.status === 'Sold' ? vehicle.sellingPrice : vehicle.price)?.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                           <div className="flex items-center space-x-2">
                              <Switch
                                  id={`status-switch-${vehicle.id}`}
                                  checked={vehicle.status === 'For Sale'}
                                  onCheckedChange={() => handleStatusChange(vehicle.id, vehicle.status)}
                                  disabled={vehicle.status !== 'For Sale' && vehicle.status !== 'Draft'}
                              />
                              <Label htmlFor={`status-switch-${vehicle.id}`}>{vehicle.status === 'For Sale' ? 'Live' : 'Paused'}</Label>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/${dealerId}/inventory/${vehicle.id}`}><Eye className="mr-2 h-4 w-4"/> View Details</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/${dealerId}/inventory/edit/${vehicle.id}`}><Edit className="mr-2 h-4 w-4"/> Edit Details</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShare(vehicle)}>
                                <Share2 className="mr-2 h-4 w-4"/> Share on WhatsApp
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {vehicle.status !== 'Sold' && (
                                <DropdownMenuItem onClick={() => setVehicleToSell(vehicle)}>
                                  Mark as Sold
                                </DropdownMenuItem>
                              )}
                              {vehicle.status === 'Sold' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(vehicle.id, vehicle.status)}>
                                  Re-list Vehicle
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onClick={() => setVehicleToDelete(vehicle)}>
                                <Trash2 className="mr-2 h-4 w-4"/> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <NoVehiclesMessage />
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      <AlertDialog open={!!vehicleToDelete} onOpenChange={(isOpen) => !isOpen && setVehicleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive" /> Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the vehicle <span className="font-semibold text-foreground">{vehicleToDelete?.make} {vehicleToDelete?.model}</span>? This action cannot be undone.
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

      {vehicleToSell && (
        <MarkAsSoldDialog
          vehicle={vehicleToSell}
          isOpen={!!vehicleToSell}
          onClose={() => setVehicleToSell(null)}
          onSold={() => {
            router.refresh();
            setVehicleToSell(null);
          }}
        />
      )}
    </>
  );
}
