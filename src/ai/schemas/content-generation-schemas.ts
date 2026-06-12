
// src/ai/schemas/content-generation-schemas.ts
/**
 * @fileOverview Shared Zod schemas for the AI content generation flow.
 * This has been updated to generate a single, targeted social media ad
 * based on a user's image and marketing goal.
 */
import { z } from 'zod';

export const GenerateMonthlyContentInputSchema = z.object({
  preschoolName: z.string().describe('The name of the preschool.'),
  imageDataUri: z
    .string()
    .describe(
      "A user-provided photo from the preschool, as a data URI that must include a MIME type and use Base64 encoding."
    ),
  postGoal: z.enum(['Awareness', 'Engagement', 'Enrollment']).describe("The marketing goal of the post (e.g., 'Brand Awareness', 'Drive Engagement', 'Boost Enrollment')."),
  customInstructions: z.string().optional().describe("Optional custom instructions from the user to guide the AI."),
});
export type GenerateMonthlyContentInput = z.infer<typeof GenerateMonthlyContentInputSchema>;


const SocialPostSchema = z.object({
    postText: z.string().describe("The full text for the social media post, including ad copy and relevant hashtags, tailored to the marketing goal."),
    imageSuggestion: z.string().describe("A confirmation or brief description of how the AI interpreted the user's image."),
    imageUrl: z.string().url().optional().describe("The original user-provided image data URI is passed back for display."),
});

export const GenerateMonthlyContentOutputSchema = z.object({
    socialMediaPosts: z.array(SocialPostSchema).describe("An array containing the single generated social media post."),
});
export type GenerateMonthlyContentOutput = z.infer<typeof GenerateMonthlyContentOutputSchema>;
