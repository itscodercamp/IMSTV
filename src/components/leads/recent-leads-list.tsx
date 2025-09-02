
"use client";

import type { Lead } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

export function RecentLeadsList({ leads }: { leads: Lead[] }) {
  if (!leads || leads.length === 0) {
    return (
        <div className="h-40 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
            <p>You have no recent leads.</p>
        </div>
    )
  }

  const getStatusVariant = (status: string) => {
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

  return (
    <div className="space-y-4">
        {leads.map((lead) => (
          <div key={lead.id} className="p-4 border rounded-lg hover:bg-muted/50">
            <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{lead.name}</p>
                  <p className="text-sm text-muted-foreground">{lead.phone}</p>
                </div>
                <p className="text-xs text-muted-foreground">{format(new Date(lead.dateAdded), 'PP')}</p>
            </div>
            <div className="mt-3 pt-3 border-t">
                 <p className="text-sm text-foreground mb-2">
                    {lead.vehicleId && lead.vehicleMake ? 
                        `${lead.vehicleMake} ${lead.vehicleModel}`
                        : lead.otherVehicleName ? `${lead.otherVehicleName} (${lead.otherVehicleReg})`
                        : 'N/A'
                    }
                </p>
                <div className="flex flex-wrap gap-2 items-start">
                    <Badge variant={getStatusVariant(lead.conversionStatus)}>{lead.conversionStatus}</Badge>
                    <Badge variant={getStatusVariant(lead.testDriveStatus)}>{lead.testDriveStatus}</Badge>
                </div>
            </div>
          </div>
        ))}
    </div>
  );
}
