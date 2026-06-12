// src/ai/schemas/report-card-schemas.ts
/**
 * @fileOverview Shared Zod schemas for the AI report card generation flow.
 */
import { z } from 'zod';

export const GenerateReportCardInputSchema = z.object({
  studentId: z.string().describe("The unique identifier for the student."),
  studentName: z.string().describe("The name of the student."),
  term: z.string().describe("The school term for the report (e.g., 'Term 1, 2024')."),
  preschoolName: z.string().describe("The name of the preschool."),
});
export type GenerateReportCardInput = z.infer<typeof GenerateReportCardInputSchema>;

const SubjectPerformanceSchema = z.object({
    subject: z.string().describe("The subject area, e.g., 'Literacy', 'Numeracy', 'Fine Motor Skills'."),
    summary: z.string().describe("A brief summary of the student's performance and progress in this subject."),
    grade: z.string().describe("A qualitative grade, e.g., 'Exceeding Expectations', 'Meeting Expectations', 'Developing'."),
});

export const GenerateReportCardOutputSchema = z.object({
    overallSummary: z.string().describe("A one-paragraph overview of the student's progress this term."),
    teacherComment: z.string().describe("A warm, heartfelt, honest, and pragmatic comment from the teacher that is positive and solution-oriented."),
    subjectPerformances: z.array(SubjectPerformanceSchema).describe("An array of performance summaries for different subjects."),
});
export type GenerateReportCardOutput = z.infer<typeof GenerateReportCardOutputSchema>;
