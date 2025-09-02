
"use client";

import * as React from "react";
import { useForm, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  optimizeVehiclePrice,
  type OptimizeVehiclePriceOutput,
} from "@/ai/flows/optimize-vehicle-price";
import { Loader2, Wand2, Lightbulb } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const priceOptimizerSchema = z.object({
  vehicleCost: z.coerce.number().min(1, "Vehicle cost is required."),
  refurbishmentCost: z.coerce.number().min(0),
  desiredProfitMargin: z.coerce.number().min(0).max(1),
});

type PriceOptimizerFormValues = z.infer<typeof priceOptimizerSchema>;

export function PriceOptimizer() {
  const [result, setResult] = React.useState<OptimizeVehiclePriceOutput | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<PriceOptimizerFormValues>({
    resolver: zodResolver(priceOptimizerSchema),
    defaultValues: {
      vehicleCost: 0,
      refurbishmentCost: 0,
      desiredProfitMargin: 0.2,
    },
  });

  const { isSubmitting } = useFormState({ control: form.control });

  async function onSubmit(values: PriceOptimizerFormValues) {
    try {
      setError(null);
      setResult(null);
      const output = await optimizeVehiclePrice(values);
      setResult(output);
    } catch (e) {
      setError("An error occurred while optimizing the price. Please try again.");
      console.error(e);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary text-primary-foreground rounded-lg">
                <Wand2 className="h-6 w-6" />
            </div>
            <div>
                <CardTitle>AI Price Optimizer</CardTitle>
                <CardDescription>
                    Get AI-powered price suggestions for your vehicles.
                </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="vehicleCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Cost (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 2000000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="refurbishmentCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Refurbishment Cost (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 150000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="desiredProfitMargin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desired Profit Margin (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 0.20 for 20%"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter as a decimal (e.g., 20% is 0.20).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Optimize Price
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="space-y-6">
        <Card className="flex-grow">
          <CardHeader>
            <CardTitle>AI Suggestions</CardTitle>
            <CardDescription>
              Recommendations based on your inputs and market data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitting && (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mb-4" />
                    <p>Generating suggestions...</p>
                </div>
            )}
            {error && (
                <div className="text-destructive">{error}</div>
            )}
            {!isSubmitting && !result && !error && (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-muted-foreground text-center">
                    <Lightbulb className="h-8 w-8 mb-4" />
                    <p className="font-medium">Your results will appear here.</p>
                    <p className="text-sm">Fill the form and click "Optimize Price".</p>
                </div>
            )}
            {result && (
              <div className="space-y-4">
                 <Alert>
                  <Wand2 className="h-4 w-4" />
                  <AlertTitle>Optimal Strategy</AlertTitle>
                  <AlertDescription>
                    Based on market conditions and your inputs, here is the suggested pricing strategy.
                  </AlertDescription>
                </Alert>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-medium text-muted-foreground">Suggested Selling Price</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-primary">₹{result.suggestedSellingPrice?.toLocaleString('en-IN')}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-medium text-muted-foreground">Profit Margin</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-green-500">{((result.profitMargin || 0) * 100).toFixed(1)}%</p>
                        </CardContent>
                    </Card>
                </div>
                {result.suggestedRefurbishmentCost && (
                     <Card>
                        <CardHeader className="text-center">
                            <CardTitle className="text-base font-medium text-muted-foreground">Suggested Refurb. Cost</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-3xl font-bold">₹{result.suggestedRefurbishmentCost.toLocaleString('en-IN')}</p>
                        </CardContent>
                    </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
