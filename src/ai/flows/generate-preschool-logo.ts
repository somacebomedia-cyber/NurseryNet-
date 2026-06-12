// src/ai/flows/generate-preschool-logo.ts
'use server';
/**
 * @fileOverview An AI agent that generates preschool logos based on a name.
 *
 * - generatePreschoolLogo - A function that handles the logo generation process.
 * - GeneratePreschoolLogoInput - The input type for the generatePreschoolLogo function.
 * - GeneratePreschoolLogoOutput - The return type for the generatePreschoolLogo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const GeneratePreschoolLogoInputSchema = z.object({
  businessName: z.string().describe('The name of the preschool.'),
});
export type GeneratePreschoolLogoInput = z.infer<typeof GeneratePreschoolLogoInputSchema>;

const GeneratePreschoolLogoOutputSchema = z.object({
  logoDataUri: z
    .string()
    .describe(
      'The generated logo as a data URI (PNG format with Base64 encoding).'
    ),
  description: z.string().describe('A description of the generated logo.'),
});
export type GeneratePreschoolLogoOutput = z.infer<typeof GeneratePreschoolLogoOutputSchema>;

export async function generatePreschoolLogo(input: GeneratePreschoolLogoInput): Promise<GeneratePreschoolLogoOutput> {
  return generatePreschoolLogoFlow(input);
}

const generatePreschoolLogoFlow = ai.defineFlow(
  {
    name: 'generatePreschoolLogoFlow',
    inputSchema: GeneratePreschoolLogoInputSchema,
    outputSchema: GeneratePreschoolLogoOutputSchema,
  },
  async input => {
    // Step 1: Generate the image using an image model
    const logoGenerationPrompt = `Generate a modern, playful, and friendly logo for a preschool named "${input.businessName}". The logo should be visually appealing, simple enough for a brand, and representative of a nurturing and educational environment. The output must be a square PNG with a transparent background.`;

    const { media } = await ai.generate({
      model: googleAI.model('imagen-4.0-fast-generate-001'),
      prompt: logoGenerationPrompt,
    });

    if (!media?.url) {
        throw new Error("AI failed to generate an image.");
    }

    // Step 2: Generate the description using a text model
    const descriptionGenerationPrompt = `You are a creative branding assistant. Write a short, one-sentence description for a logo you just created for a preschool named "${input.businessName}".`;

    const { text } = await ai.generate({
        model: googleAI.model('gemini-pro'),
        prompt: descriptionGenerationPrompt,
    });
    
    if (!text) {
        throw new Error("AI failed to generate a description.");
    }

    return {
      logoDataUri: media.url,
      description: text,
    };
  }
);