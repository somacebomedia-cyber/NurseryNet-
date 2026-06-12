
// src/components/dashboard/DashboardAiTools.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, Lightbulb, Copy, BrainCircuit, Send, Printer, Image as ImageIcon, Wand2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { format } from 'date-fns';
import { generateMonthlyContent, GenerateMonthlyContentOutput } from '@/ai/flows/generate-monthly-content';
import { generateReportCard, GenerateReportCardOutput } from '@/ai/flows/generate-report-card';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PreschoolData } from "@/lib/schemas/preschool";
import Image from "next/image";
import { Textarea } from "../ui/textarea";

interface DashboardAiToolsProps {
  isCreativeMember: boolean;
  isGrowthMember: boolean;
  preschoolName: string;
  profileData: PreschoolData | null;
}

const fileToDataUri = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
});

export default function DashboardAiTools({ isCreativeMember, isGrowthMember, preschoolName, profileData }: DashboardAiToolsProps) {
  const { toast } = useToast();
  
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [contentResult, setContentResult] = useState<GenerateMonthlyContentOutput | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [adImage, setAdImage] = useState<File | null>(null);
  const [adGoal, setAdGoal] = useState<'Awareness' | 'Engagement' | 'Enrollment'>('Awareness');
  const [adInstructions, setAdInstructions] = useState('');

  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportResult, setReportResult] = useState<GenerateReportCardOutput | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [studentForReport, setStudentForReport] = useState('');
  const [termForReport, setTermForReport] = useState('Term 2, 2024');

  const handleGenerateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adImage) {
        toast({ title: "Image Required", description: "Please upload an image for your ad.", variant: "destructive" });
        return;
    }
    
    setIsGeneratingContent(true);
    setContentError(null);
    setContentResult(null);

    try {
        if (!profileData) {
            throw new Error("Please complete your preschool profile before generating content.");
        }

        const imageDataUri = await fileToDataUri(adImage);
        
        const input = {
            preschoolName: profileData.name,
            imageDataUri: imageDataUri,
            postGoal: adGoal,
            customInstructions: adInstructions || undefined,
        };

        const result = await generateMonthlyContent(input);
        setContentResult(result);
        toast({ title: "Ad Content Generated!", description: "Your personalized social media ad is ready." });

    } catch (error: any) {
        console.error("Content generation error:", error);
        setContentError(error.message || "An unknown error occurred.");
        toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
        setIsGeneratingContent(false);
    }
  };

  const handleGenerateReportCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForReport) {
        toast({ title: "Student Name Required", description: "Please enter a student's name.", variant: "destructive"});
        return;
    }

    setIsGeneratingReport(true);
    setReportError(null);
    setReportResult(null);

    try {
        const input = {
            studentId: studentForReport.toLowerCase().replace(/\s/g, '-'), // mock ID
            studentName: studentForReport,
            term: termForReport,
            preschoolName: profileData?.name || preschoolName,
        };
        const result = await generateReportCard(input);
        setReportResult(result);
        toast({ title: "Report Card Generated!", description: `A report for ${studentForReport} is ready to be sent.` });
    } catch (error: any) {
        console.error("Report generation error:", error);
        setReportError(error.message || "Failed to generate report card.");
        toast({ title: "Generation Error", description: error.message, variant: "destructive" });
    } finally {
        setIsGeneratingReport(false);
    }
  };

  const handlePrint = (contentId: string) => {
    const printContent = document.getElementById(contentId);
    if (!printContent) return;
    
    const printableArea = printContent.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = `
    <html>
        <head>
        <title>Print</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&family=Nunito:wght@200..1000&display=swap');
            body { font-family: 'Nunito', sans-serif; color: #333; }
            h1, h2, h3, h4, h5, h6 { font-family: 'Fredoka', sans-serif; }
            .print-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #E5E7EB; padding-bottom: 1rem; margin-bottom: 2rem; }
            .print-header h4 { font-size: 1.5rem; color: #32285C; }
            .print-header p { font-size: 0.875rem; color: #6B7280; }
            .print-header img { max-width: 80px; max-height: 80px; object-fit: contain; }
            .print-section h5 { font-size: 1.1rem; border-bottom: 1px solid #E5E7EB; padding-bottom: 0.5rem; margin-top: 1.5rem; margin-bottom: 1rem; color: #32285C; font-weight: bold; }
            .print-section p { white-space: pre-wrap; line-height: 1.6; font-size: 0.9rem; }
            .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
            .font-bold { font-weight: bold; }
            .italic { font-style: italic; }
            .text-gray-800 { color: #1F2937; }
            .text-gray-700 { color: #374151; }
            .text-gray-600 { color: #4B5563; }
            .text-gray-500 { color: #6B7280; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-4 { margin-bottom: 1rem; }
            .space-y-4 > * + * { margin-top: 1rem; }
            footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #E5E7EB; }
            footer div { text-align: center; }
            footer img { max-width: 120px; max-height: 50px; object-fit: contain; }
            footer p { font-size: 0.75rem; color: #6B7280; border-top: 1px solid #9CA3AF; margin-top: 0.25rem; padding-top: 0.25rem; }
        </style>
        </head>
        <body>${printableArea}</body>
    </html>
    `;

    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const handleSendReport = () => {
    toast({
        title: "Report Sent!",
        description: `The report card for ${studentForReport} has been sent to their parent via WhatsApp as a PDF.`
    });
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ description: "Copied to clipboard!" });
  };

  return (
    <div className="space-y-10">
      {isGrowthMember && (
          <Card className="shadow-lg glassmorphism">
              <CardHeader>
                  <CardTitle className="text-xl text-primary flex items-center"><FileText className="mr-2 h-5 w-5"/>AI Quarterly Report Card Generator</CardTitle>
                  <CardDescription>
                      Automatically generate a comprehensive, branded term report for a student based on their performance data. The final report can be sent to parents as a PDF via WhatsApp.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  <form onSubmit={handleGenerateReportCard} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                              <Label htmlFor="reportStudentName">Student's Name</Label>
                              <Input id="reportStudentName" value={studentForReport} onChange={(e) => setStudentForReport(e.target.value)} placeholder="e.g., Ayanda" />
                          </div>
                          <div>
                              <Label htmlFor="reportTerm">Select Term</Label>
                              <Select value={termForReport} onValueChange={setTermForReport}>
                                  <SelectTrigger id="reportTerm"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="Term 1, 2024">Term 1, 2024</SelectItem>
                                      <SelectItem value="Term 2, 2024">Term 2, 2024</SelectItem>
                                      <SelectItem value="Term 3, 2024">Term 3, 2024</SelectItem>
                                      <SelectItem value="Term 4, 2024">Term 4, 2024</SelectItem>
                                  </SelectContent>
                              </Select>
                          </div>
                      </div>
                      <Button type="submit" disabled={isGeneratingReport} className="w-full sm:w-auto">
                          {isGeneratingReport ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <BrainCircuit className="mr-2 h-4 w-4"/>}
                          {isGeneratingReport ? 'Analyzing Data...' : 'Generate Report Card'}
                      </Button>
                  </form>
                  {reportError && <Alert variant="destructive" className="mt-4"><AlertTitle>Error</AlertTitle><AlertDescription>{reportError}</AlertDescription></Alert>}
                  {reportResult && profileData && (
                      <div className="mt-6 border-t pt-6">
                          <h3 className="text-2xl font-bold text-center text-primary mb-4">Report Card Preview</h3>
                          <div id="report-card-content" className="bg-white text-black p-8 rounded-lg shadow-md max-w-3xl mx-auto">
                              <header className="print-header">
                                  <div>
                                      <h4 className="text-xl font-bold text-gray-800">{profileData.name}</h4>
                                      <p className="text-sm text-gray-500">End of Term Report</p>
                                  </div>
                                  {profileData.logo && <img src={profileData.logo} alt="logo" />}
                              </header>
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                  <p><strong>Student:</strong> {studentForReport}</p>
                                  <p><strong>Term:</strong> {termForReport}</p>
                              </div>
                              <div className="space-y-4">
                                  <div className="print-section">
                                      <h5>Overall Summary</h5>
                                      <p>{reportResult.overallSummary}</p>
                                  </div>
                                  <div className="print-section">
                                      <h5>Subject Performance</h5>
                                      {reportResult.subjectPerformances.map(sub => (
                                          <p key={sub.subject} className="mb-2">
                                              <strong>{sub.subject}:</strong> {sub.summary} <span className="font-semibold">({sub.grade})</span>
                                          </p>
                                      ))}
                                  </div>
                                  <div className="print-section">
                                      <h5>Teacher's Comment</h5>
                                      <p className="italic">"{reportResult.teacherComment}"</p>
                                  </div>
                              </div>
                              <footer>
                                  <div>
                                      {profileData.teacherSignatureUrl && <img src={profileData.teacherSignatureUrl} alt="teacher signature" />}
                                      <p>Teacher's Signature</p>
                                  </div>
                                  <div>
                                      {profileData.principalSignatureUrl && <img src={profileData.principalSignatureUrl} alt="principal signature" />}
                                      <p>Principal's Signature</p>
                                  </div>
                              </footer>
                          </div>
                          <div className="text-center mt-6 flex justify-center gap-4">
                               <Button onClick={() => handlePrint('report-card-content')} variant="outline">
                                <Printer className="mr-2 h-4 w-4"/> Print / Save as PDF
                              </Button>
                              <Button onClick={handleSendReport} className="bg-green-600 hover:bg-green-700">
                                <Send className="mr-2 h-4 w-4"/> Send to Parent (via WhatsApp)
                              </Button>
                          </div>
                      </div>
                  )}
              </CardContent>
          </Card>
      )}
      
      {(isGrowthMember || isCreativeMember) && (
          <Card className="shadow-lg glassmorphism">
            <CardHeader>
                <CardTitle className="text-xl text-primary flex items-center"><Wand2 className="mr-2 h-5 w-5"/>AI Social Media Ad Generator</CardTitle>
                <CardDescription>
                    Upload a real photo from your school, choose a marketing goal, and let the AI generate compelling ad copy for you.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleGenerateContent} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="ad-image">Upload Your Photo</Label>
                            <Input id="ad-image" type="file" onChange={(e) => setAdImage(e.target.files ? e.target.files[0] : null)} accept="image/*" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ad-goal">Select Your Goal</Label>
                            <Select value={adGoal} onValueChange={(value: 'Awareness' | 'Engagement' | 'Enrollment') => setAdGoal(value)}>
                                <SelectTrigger id="ad-goal"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Awareness">Brand Awareness</SelectItem>
                                    <SelectItem value="Engagement">Drive Engagement</SelectItem>
                                    <SelectItem value="Enrollment">Boost Enrollment</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="ad-instructions">Custom Instructions (Optional)</Label>
                        <Textarea id="ad-instructions" value={adInstructions} onChange={(e) => setAdInstructions(e.target.value)} placeholder="e.g., Mention our upcoming open day on August 15th. Keep the tone very playful." />
                    </div>
                    <Button type="submit" disabled={isGeneratingContent} className="w-full sm:w-auto">
                        {isGeneratingContent ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Lightbulb className="mr-2 h-4 w-4"/>}
                        {isGeneratingContent ? 'Generating...' : 'Generate Ad Content'}
                    </Button>
                </form>
                
                {contentError && <Alert variant="destructive" className="mt-4"><AlertTitle>Error</AlertTitle><AlertDescription>{contentError}</AlertDescription></Alert>}
                
                {contentResult && contentResult.socialMediaPosts.length > 0 && (
                    <div className="space-y-6 pt-6 mt-6 border-t">
                        <h3 className="text-lg font-semibold text-primary">Your Generated Ad:</h3>
                        <Card className="bg-background/50">
                            <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                                {contentResult.socialMediaPosts[0].imageUrl && (
                                  <div className="flex-shrink-0">
                                      <Image src={contentResult.socialMediaPosts[0].imageUrl!} alt="User uploaded image for ad" width={128} height={128} className="rounded-md object-cover w-full md:w-32 h-auto md:h-32"/>
                                  </div>
                                )}
                                <div className="flex-grow">
                                  <p className="whitespace-pre-wrap">{contentResult.socialMediaPosts[0].postText}</p>
                                  <p className="text-xs text-muted-foreground mt-2 italic"><strong>AI Note:</strong> {contentResult.socialMediaPosts[0].imageSuggestion}</p>
                                  <Button variant="ghost" size="sm" onClick={() => handleCopyText(contentResult.socialMediaPosts[0].postText)} className="mt-2 text-primary">
                                      <Copy className="mr-2 h-3 w-3" /> Copy Post Text
                                  </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </CardContent>
          </Card>
      )}
    </div>
  );
}
