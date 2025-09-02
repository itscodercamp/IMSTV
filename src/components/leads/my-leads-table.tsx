
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Lead } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { Calendar, Car, Tag, User, Users } from "lucide-react";

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

const LeadDetailRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
    <div className="flex items-center text-sm">
        <Icon className="h-4 w-4 mr-2 text-muted-foreground"/>
        <span className="text-muted-foreground mr-1">{label}:</span>
        <span className="font-medium text-foreground text-right flex-1">{value}</span>
    </div>
);

export function MyLeadsTable({ leads }: { leads: Lead[] }) {
  if (!leads || leads.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>My Leads</CardTitle>
                <CardDescription>A list of all customer leads assigned to you.</CardDescription>
            </CardHeader>
            <CardContent className="h-40 flex items-center justify-center text-muted-foreground">
                <p>You have not created or been assigned any leads yet.</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Leads</CardTitle>
        <CardDescription>A list of all customer leads assigned to you.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Desktop Header */}
        <div className="hidden md:grid grid-cols-4 gap-4 p-4 font-medium text-muted-foreground border-b">
          <div className="col-span-1">Customer</div>
          <div className="col-span-1">Vehicle of Interest</div>
          <div className="col-span-1">Date Added</div>
          <div className="col-span-1">Status</div>
        </div>

        {/* Leads List (Cards on mobile, table-row on desktop) */}
        <div className="space-y-4 md:space-y-0">
            {leads.map((lead) => (
              <div key={lead.id} className="block md:grid md:grid-cols-4 gap-4 items-center p-4 border-b last:border-b-0 hover:bg-muted/50 rounded-lg md:rounded-none md:p-4">
                {/* Customer */}
                <div className="col-span-1 mb-4 md:mb-0">
                  <div className="font-medium text-base md:text-sm">{lead.name}</div>
                  <div className="text-sm text-muted-foreground">{lead.phone}</div>
                </div>
                
                {/* Vehicle */}
                <div className="col-span-1 mb-4 md:mb-0 text-sm">
                  {lead.vehicleMake && lead.vehicleModel ? 
                      `${lead.vehicleMake} ${lead.vehicleModel}`
                      : 'Any Vehicle'
                  }
                </div>

                {/* Date Added */}
                <div className="col-span-1 mb-4 md:mb-0 text-sm">{format(new Date(lead.dateAdded), 'PP')}</div>

                {/* Status */}
                 <div className="col-span-1 flex flex-col gap-1.5 items-start">
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
