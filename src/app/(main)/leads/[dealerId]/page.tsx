
import { fetchLeads } from "../../actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Car, User, Calendar, Tag } from "lucide-react";

function getStatusVariant(status: string) {
    switch (status) {
        case 'Converted': return 'default';
        case 'Completed': return 'default';
        case 'In Progress': return 'secondary';
        case 'Scheduled': return 'secondary';
        case 'Lost': return 'destructive';
        case 'No Show': return 'destructive';
        default: return 'outline';
    }
}

const LeadDetailRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
    <div className="flex items-center text-sm">
        <Icon className="h-4 w-4 mr-2 text-muted-foreground"/>
        <span className="text-muted-foreground mr-1">{label}:</span>
        <span className="font-medium text-foreground text-right flex-1 truncate">{value}</span>
    </div>
);

export default async function LeadsPage({ params }: { params: { dealerId: string } }) {
  const { dealerId } = params;
  const leads = await fetchLeads(dealerId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Leads</CardTitle>
        <CardDescription>
          A centralized list of all leads from your sales team.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Desktop Table View */}
        <div className="hidden md:block">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle of Interest</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {leads.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            No leads found.
                        </TableCell>
                    </TableRow>
                )}
                {leads.map((lead) => (
                <TableRow key={lead.id}>
                    <TableCell>
                    <div className="font-medium">{lead.name}</div>
                    <div className="text-sm text-muted-foreground">{lead.phone}</div>
                    </TableCell>
                    <TableCell>
                    {lead.vehicleMake && lead.vehicleModel
                        ? `${lead.vehicleMake} ${lead.vehicleModel}`
                        : lead.otherVehicleName ? `${lead.otherVehicleName} (${lead.otherVehicleReg})`
                        : "Any Vehicle"}
                    </TableCell>
                    <TableCell>{lead.employeeName || "Unassigned"}</TableCell>
                    <TableCell>{format(new Date(lead.dateAdded), "PP")}</TableCell>
                    <TableCell>
                    <div className="flex flex-col gap-1.5 items-start">
                        <Badge variant={getStatusVariant(lead.conversionStatus)}>{lead.conversionStatus}</Badge>
                        <Badge variant={getStatusVariant(lead.testDriveStatus)}>{lead.testDriveStatus}</Badge>
                    </div>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
        
        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
             {leads.length === 0 && (
                <div className="h-24 text-center flex items-center justify-center text-muted-foreground">
                    No leads found.
                </div>
            )}
            {leads.map((lead) => (
                <div key={lead.id} className="border bg-card rounded-lg p-4 space-y-3 shadow-sm">
                    <div className="font-bold text-base">{lead.name}</div>
                    <div className="text-sm text-muted-foreground">{lead.phone}</div>
                    <div className="border-t pt-3 mt-3 space-y-2">
                        <LeadDetailRow 
                            icon={Car} 
                            label="Vehicle" 
                            value={lead.vehicleMake && lead.vehicleModel
                                ? `${lead.vehicleMake} ${lead.vehicleModel}`
                                : lead.otherVehicleName ? `${lead.otherVehicleName} (${lead.otherVehicleReg})`
                                : "Any Vehicle"}
                        />
                         <LeadDetailRow 
                            icon={User} 
                            label="Assigned To" 
                            value={lead.employeeName || "Unassigned"}
                        />
                        <LeadDetailRow 
                            icon={Calendar} 
                            label="Date" 
                            value={format(new Date(lead.dateAdded), "PP")}
                        />
                    </div>
                    <div className="border-t pt-3 mt-3 flex flex-wrap gap-2">
                        <Badge variant={getStatusVariant(lead.conversionStatus)}>{lead.conversionStatus}</Badge>
                        <Badge variant={getStatusVariant(lead.testDriveStatus)}>{lead.testDriveStatus}</Badge>
                    </div>
                </div>
            ))}
        </div>

      </CardContent>
    </Card>
  );
}
