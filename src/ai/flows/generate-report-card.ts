// src/ai/flows/generate-report-card.ts
'use server';
/**
 * @fileOverview An AI agent that generates a quarterly report card for a student.
 *
 * - generateReportCard - A function that synthesizes worksheet data into a report card.
 * - GenerateReportCardInput - The input type for the function.
 * - GenerateReportCardOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GenerateReportCardInputSchema, GenerateReportCardOutputSchema, type GenerateReportCardInput, type GenerateReportCardOutput } from '@/ai/schemas/report-card-schemas';

export type { GenerateReportCardInput, GenerateReportCardOutput };

// Mock Tool: In a real application, this would query Firestore for all graded worksheets
// for a specific student within a given term/date range.
const getStudentWorksheetDataTool = ai.defineTool(
    {
        name: 'getStudentWorksheetData',
        description: 'Retrieves all graded worksheet data for a given student for the specified term.',
        inputSchema: z.object({
            studentId: z.string(),
            term: z.string(),
        }),
        outputSchema: z.array(
            z.object({
                date: z.string(),
                subject: z.string(), // e.g., 'Literacy', 'Numeracy', 'Art'
                task: z.string(), // e.g., 'Letter Tracing A-E', 'Counting to 10', 'Coloring within lines'
                grade: z.string(), // e.g., '10/10', 'Excellent', 'Needs Practice'
                notes: z.string(), // AI's notes from the grading
            })
        ),
    },
    async ({ studentId, term }) => {
        // This is mock data. A real implementation would query a database.
        console.log(`Fetching mock worksheet data for student ${studentId} for ${term}`);
        return [
            { date: '2024-07-05', subject: 'Literacy', task: 'Tracing the letter A', grade: 'Excellent', notes: 'Very steady hand, good pencil control.' },
            { date: '2024-07-10', subject: 'Numeracy', task: 'Counting 5 blocks', grade: '10/10', notes: 'Correctly identified and counted all blocks.' },
            { date: '2024-07-12', subject: 'Fine Motor Skills', task: 'Coloring a circle', grade: 'Good Effort', notes: 'Mostly stayed within the lines, can work on consistency.' },
            { date: '2024-07-18', subject: 'Literacy', task: 'Matching pictures to words', grade: '4/5 Correct', notes: 'Excellent recognition, mixed up "cat" and "car".' },
            { date: '2024-07-22', subject: 'Art', task: 'Finger painting a tree', grade: 'Wonderful!', notes: 'Showed great creativity and use of color.' },
            { date: '2024-08-01', subject: 'Numeracy', task: 'Shape recognition', grade: 'Perfect!', notes: 'Correctly identified square, circle, and triangle.' },
        ];
    }
);

const reportCardPrompt = ai.definePrompt({
    name: 'generateReportCardPrompt',
    input: { schema: GenerateReportCardInputSchema },
    output: { schema: GenerateReportCardOutputSchema },
    tools: [getStudentWorksheetDataTool],
    system: `You are an experienced and caring preschool educator tasked with creating a quarterly report card.
Student Name: {{studentName}}
Preschool: {{preschoolName}}
Term: {{term}}

1.  Use the 'getStudentWorksheetDataTool' to fetch all the student's graded worksheets for the term.
2.  Synthesize this data to create a comprehensive report.
3.  For each key subject area (like Literacy, Numeracy, Fine Motor Skills, Art), provide a summary of performance and a qualitative grade ('Exceeding Expectations', 'Meeting Expectations', 'Developing').
4.  Write an 'overallSummary' of the student's progress.
5.  Crucially, write a 'teacherComment'. This comment must be warm, heartfelt, honest, and pragmatic. It should be positive and solution-oriented, highlighting strengths while gently suggesting areas for focus. For example, instead of "is bad at coloring," say "is showing wonderful creativity in art and we will continue to practice staying within the lines together."
6.  Return the final report card strictly in the specified JSON format.
`,
});

export async function generateReportCard(input: GenerateReportCardInput): Promise<GenerateReportCardOutput> {
    const llmResponse = await reportCardPrompt(input);
    if (!llmResponse.output) {
        throw new Error("AI failed to generate the report card. Please try again.");
    }
    return llmResponse.output;
}
