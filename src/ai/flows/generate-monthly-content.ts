// src/ai/flows/generate-monthly-content.ts
'use server';
/**
 * @fileOverview An AI agent that generates a targeted social media ad for a preschool
 * based on a user-provided image and marketing goal.
 *
 * - generateMonthlyContent - A function that creates a social media post.
 * - GenerateMonthlyContentInput - The input type for the function.
 * - GenerateMonthlyContentOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import { GenerateMonthlyContentInputSchema, GenerateMonthlyContentOutputSchema, type GenerateMonthlyContentInput, type GenerateMonthlyContentOutput } from '@/ai/schemas/content-generation-schemas';
import { googleAI } from '@genkit-ai/googleai';

export type { GenerateMonthlyContentInput, GenerateMonthlyContentOutput };

const contentGenerationPrompt = ai.definePrompt({
    name: 'generateTargetedAdPrompt',
    input: { schema: GenerateMonthlyContentInputSchema },
    output: { schema: GenerateMonthlyContentOutputSchema },
    model: googleAI.model('gemini-pro-vision'), // Using a stable, multimodal model for vision tasks
    system: `You are a savvy and creative social media marketer specializing in the early childhood education sector. Your task is to create a single, powerful social media post that functions as an ad for a preschool.

You will be given:
1.  The preschool's name: {{{preschoolName}}}
2.  A user-uploaded photo: {{media url=imageDataUri}}
3.  A specific marketing goal: {{{postGoal}}}
4.  Optional custom instructions: {{#if customInstructions}}{{{customInstructions}}}{{else}}None{{/if}}

Your task:
1.  **Analyze the Image:** Carefully examine the user's photo. Identify the subjects (children, teachers, environment), the activity, and the overall mood.
2.  **Craft Ad Copy:** Write compelling and concise text for the post. The tone should be warm, trustworthy, and professional. The copy MUST be tailored to the specified 'postGoal':
    *   If the goal is **'Awareness'**, focus on introducing the school, its values, and what makes it special. Tell a story about the photo.
    *   If the goal is **'Engagement'**, ask a question related to the photo to encourage comments and interaction from parents (e.g., "What's your child's favorite book? Let us know below!").
    *   If the goal is **'Enrollment'**, the copy must include a clear and compelling Call to Action (CTA) like "Limited spots available for 2024! Click the link in our bio to book a tour today." or "Join our family! Visit our website to learn more about our curriculum."
3.  **Generate Hashtags:** Include 3-5 relevant and popular hashtags (e.g., #[Location]Preschool, #EarlyLearning, #PlayBasedLearning, #[PreschoolName]).
4.  **Confirm Image Use:** For the 'imageSuggestion' field, briefly describe what you see in the image to confirm you've analyzed it correctly (e.g., "Using your photo of a smiling child painting a rainbow.").

The final 'postText' should be a complete, ready-to-paste block of text including the ad copy and hashtags. Return a single post in the 'socialMediaPosts' array.
`,
});

export async function generateMonthlyContent(input: GenerateMonthlyContentInput): Promise<GenerateMonthlyContentOutput> {
    const { output } = await contentGenerationPrompt(input);
    const content = output;
    if (!content) {
        throw new Error("AI failed to generate marketing content. Please try again.");
    }
    
    // Pass the original image back in the response so the UI can display it
    if (content.socialMediaPosts.length > 0) {
        content.socialMediaPosts[0].imageUrl = input.imageDataUri;
    }

    return content;
}
