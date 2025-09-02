'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting an optimal selling price for a vehicle.
 *
 * - optimizeVehiclePrice - A function that takes vehicle cost, refurbishment cost, and desired profit margin as input and returns the suggested selling price.
 * - OptimizeVehiclePriceInput - The input type for the optimizeVehiclePrice function.
 * - OptimizeVehiclePriceOutput - The return type for the optimizeVehiclePrice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeVehiclePriceInputSchema = z.object({
  vehicleCost: z.number().describe('The original cost of the vehicle.'),
  refurbishmentCost: z.number().describe('The cost to refurbish the vehicle.'),
  desiredProfitMargin: z
    .number()
    .describe('The desired profit margin as a percentage (e.g., 0.20 for 20%).'),
});
export type OptimizeVehiclePriceInput = z.infer<typeof OptimizeVehiclePriceInputSchema>;

const OptimizeVehiclePriceOutputSchema = z.object({
  suggestedSellingPrice: z
    .number()
    .describe('The suggested selling price for the vehicle.'),
  suggestedRefurbishmentCost: z
    .number()
    .optional()
    .describe('The suggested refurbishment cost for the vehicle, if applicable.'),
  profitMargin: z
    .number()
    .describe('The profit margin as a percentage.'),
});
export type OptimizeVehiclePriceOutput = z.infer<typeof OptimizeVehiclePriceOutputSchema>;

export async function optimizeVehiclePrice(
  input: OptimizeVehiclePriceInput
): Promise<OptimizeVehiclePriceOutput> {
  return optimizeVehiclePriceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeVehiclePricePrompt',
  input: {schema: OptimizeVehiclePriceInputSchema},
  output: {schema: OptimizeVehiclePriceOutputSchema},
  prompt: `You are an expert in vehicle sales and pricing strategy. Based on the
following information, suggest an optimal selling price for the vehicle to maximize profit, incorporating the refurbishment costs and desired profit margin.

Vehicle Cost: {{vehicleCost}}
Refurbishment Cost: {{refurbishmentCost}}
Desired Profit Margin: {{desiredProfitMargin}}

Calculate the suggested selling price, suggested refurbishment cost and resulting profit margin.
Consider market conditions when determining an optimal refurbishment costs and selling price.

Return the suggested selling price, suggested refurbishment cost and profit margin in JSON format.
`,
});

const optimizeVehiclePriceFlow = ai.defineFlow(
  {
    name: 'optimizeVehiclePriceFlow',
    inputSchema: OptimizeVehiclePriceInputSchema,
    outputSchema: OptimizeVehiclePriceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
