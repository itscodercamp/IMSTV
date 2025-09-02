
"use client";
import React from "react";
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
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import type { Vehicle } from "@/lib/types";

type AgingVehicle = Vehicle & { daysInStock: number };

export function AgingInventoryTable({ agingInventory, dealerId }: { agingInventory: AgingVehicle[], dealerId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aging Inventory</CardTitle>
        <CardDescription>
          Top 5 oldest vehicles currently in your stock.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead className="text-center">Days in Stock</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agingInventory.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell>
                  <div className="font-medium">{vehicle.make} {vehicle.model}</div>
                  <div className="text-sm text-muted-foreground">{vehicle.vin}</div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={vehicle.daysInStock > 90 ? 'destructive' : 'secondary'}>
                    {vehicle.daysInStock} days
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                   <Button asChild variant="outline" size="sm">
                      <Link href={`/inventory/${dealerId}/${vehicle.id}`}>View Details</Link>
                   </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
