
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          Manage your account and dealership settings. This page is under construction.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-60 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
            <p>Settings page coming soon.</p>
        </div>
      </CardContent>
    </Card>
  );
}
