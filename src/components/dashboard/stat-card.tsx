
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
}

export function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 pb-0">
        <CardTitle className="text-xs font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-2">
        <div className="text-lg font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground truncate">{description}</p>}
      </CardContent>
    </Card>
  );
}
