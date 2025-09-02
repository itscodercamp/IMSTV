
'use server';

/**
 * @fileOverview A Genkit flow for translating website content into multiple languages.
 * - translateContent - A function that takes a JSON object of content and a target language, and returns the translated content.
 * - TranslateContentInput - The input type for the translateContent function.
 * - TranslateContentOutput - The return type for the translateContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PageContentSchema = z.object({
  header: z.object({
    home: z.string(),
    features: z.string(),
    yourWebsite: z.string(),
    marketplace: z.string(),
    login: z.string(),
    getStarted: z.string(),
    getStartedCta: z.string(),
  }),
  hero: z.object({
    title: z.string(),
    subtitle: z.string(),
    ctaPrimary: z.string(),
    ctaSecondary: z.string(),
  }),
  pillars: z.object({
    title: z.string(),
    subtitle: z.string(),
    pillar1Title: z.string(),
    pillar1Desc: z.string(),
    pillar2Title: z.string(),
    pillar2Desc: z.string(),
    pillar3Title: z.string(),
    pillar3Desc: z.string(),
  }),
  productivity: z.object({
    title: z.string(),
    subtitle: z.string(),
  }),
  dealerPortal: z.object({
    title: z.string(),
    subtitle: z.string(),
    feature1: z.string(),
    feature1Desc: z.string(),
    feature2: z.string(),
    feature2Desc: z.string(),
    feature3: z.string(),
    feature3Desc: z.string(),
    feature4: z.string(),
    feature4Desc: z.string(),
  }),
  employeePortal: z.object({
    title: z.string(),
    subtitle: z.string(),
    feature1: z.string(),
    feature1Desc: z.string(),
    feature2: z.string(),
    feature2Desc: z.string(),
    feature3: z.string(),
    feature3Desc: z.string(),
    feature4: z.string(),
    feature4Desc: z.string(),
  }),
  personalWebsite: z.object({
    badge: z.string(),
    title: z.string(),
    subtitle: z.string(),
    annualFee: z.string(),
    benefit1: z.string(),
    benefit1Desc: z.string(),
    benefit2: z.string(),
    benefit2Desc: z.string(),
    benefit3: z.string(),
    benefit3Desc: z.string(),
  }),
  marketplace: z.object({
    badge: z.string(),
    title: z.string(),
    subtitle: z.string(),
    listingFee: z.string(),
    benefit1: z.string(),
    benefit1Desc: z.string(),
    benefit2: z.string(),
    benefit2Desc: z.string(),
    hardEarnedSale: z.string(),
  }),
  security: z.object({
    title: z.string(),
    subtitle: z.string(),
  }),
  finalCta: z.object({
    title: z.string(),
    subtitle: z.string(),
    cta: z.string(),
  }),
  footer: z.object({
    copyright: z.string(),
    login: z.string(),
    register: z.string(),
  }),
});

const TranslateContentInputSchema = z.object({
  content: PageContentSchema,
  targetLanguage: z.string().describe("The target language for translation (e.g., 'Hindi', 'Marathi', 'Roman Hindi', 'Roman Marathi')."),
});
export type TranslateContentInput = z.infer<typeof TranslateContentInputSchema>;

const TranslateContentOutputSchema = PageContentSchema;
export type TranslateContentOutput = z.infer<typeof TranslateContentOutputSchema>;

export async function translateContent(
  input: TranslateContentInput
): Promise<TranslateContentOutput> {
  return translateContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translatePageContentPrompt',
  input: {schema: z.object({
    targetLanguage: TranslateContentInputSchema.shape.targetLanguage,
    contentString: z.string(),
  })},
  output: {schema: TranslateContentOutputSchema},
  prompt: `You are an expert translator specializing in marketing content for the Indian market.
Translate the following JSON content to {{targetLanguage}}.

IMPORTANT RULES:
1.  Do NOT translate the brand names "IMS by Trusted Vehicles", "Trusted Vehicles", "IMS".
2.  Translate the meaning and tone, not just the literal words. Keep it professional and appealing for a business audience.
3.  The JSON structure of the output MUST be identical to the input.
4.  Only translate the string values of the JSON object.
5.  If the target language is 'Roman Hindi' or 'Roman Marathi', you must provide the translation in the Latin (English) script, not Devanagari. For example, 'आप कैसे हैं?' should be written as 'Aap kaise hain?'.

JSON to translate:
\`\`\`json
{{{contentString}}}
\`\`\`
`,
});

const translateContentFlow = ai.defineFlow(
  {
    name: 'translateContentFlow',
    inputSchema: TranslateContentInputSchema,
    outputSchema: TranslateContentOutputSchema,
  },
  async input => {
    const contentString = JSON.stringify(input.content, null, 2);
    const {output} = await prompt({
      targetLanguage: input.targetLanguage,
      contentString: contentString,
    });
    return output!;
  }
);
