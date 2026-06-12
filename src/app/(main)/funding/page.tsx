// src/app/(main)/funding/page.tsx
"use client";

import { useState } from "react";
import CategoryTabs from "@/components/funding/CategoryTabs";
import FeaturedFundingCard from "@/components/funding/FeaturedFundingCard";
import FundingStats from "@/components/funding/FundingStats";
import FundingFilters from "@/components/funding/FundingFilters";
import { Button } from "@/components/ui/button";
import { HandCoins, Search, Loader2 } from "lucide-react";
import { findFundingOpportunities, type FindFundingOutput } from "@/ai/flows/find-funding-opportunities";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import FundingCard from "@/components/funding/FundingCard";
import { useAuth } from "@/context/AuthContext";
import BusinessPlanGenerator from "@/components/marketing/BusinessPlanGenerator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, DraftingCompass } from 'lucide-react';
import { GenerateFundingProposalInput, GenerateFundingProposalOutput, generateFundingProposal } from "@/ai/flows/generate-funding-proposal";
import ProposalGenerator from "@/components/funding/ProposalGenerator";
import { FindFundingOutputSchema, FundingOpportunitySchema } from "@/ai/schemas/funding-schemas";


const mockStats = {
  activeOpportunities: "1,200+",
  totalAvailable: "R100M+",
  schoolsFunded: "450+",
  successRate: "25%",
};


export default function FundingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("Grants for playground equipment for preschools in Gauteng");
  const [fundingResults, setFundingResults] = useState<FindFundingOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedOpportunity, setSelectedOpportunity] = useState<FindFundingOutput['opportunities'][0] | null>(null);
  const [proposalResult, setProposalResult] = useState<GenerateFundingProposalOutput | null>(null);
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);


  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFundingResults(null);
    setProposalResult(null);
    setSelectedOpportunity(null);

    const fundingNeeds = "We need funding to upgrade our outdoor playground with safer, more modern equipment and to purchase new educational toys for our classrooms. Our mission is to provide a safe, stimulating play-based learning environment.";

    try {
      const result = await findFundingOpportunities({
        preschoolName: user?.name || "My Preschool",
        query: searchQuery,
        fundingNeeds: fundingNeeds,
        location: "Gauteng", // This would come from user profile
        registrationStatus: "Registered NPO", // This would come from user profile
      });

      // Safely parse the response on the client side
      const validationResult = FindFundingOutputSchema.safeParse(result);

      if (validationResult.success) {
        if (!validationResult.data.opportunities || validationResult.data.opportunities.length === 0) {
           toast({
            title: "No Results",
            description: "The AI couldn't find any specific funding for that query. Try broadening your search.",
          });
        }
        setFundingResults(validationResult.data);
      } else {
        console.error("Client-side Zod validation error:", validationResult.error);
        throw new Error("AI returned data in an unexpected format. Please check console for details.");
      }

    } catch (err: any) {
      console.error("Funding search error:", err);
      const message = err.message || "An unknown error occurred.";
      setError(message);
      toast({
        title: "Search Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateProposal = async (opportunity: FindFundingOutput['opportunities'][0]) => {
    if (!user) {
      toast({ title: "Please log in", description: "You must be logged in to generate a proposal.", variant: "destructive" });
      return;
    }
    setSelectedOpportunity(opportunity);
    setProposalResult(null);
    setIsGeneratingProposal(true);

    try {
      const input: GenerateFundingProposalInput = {
        preschool: {
          name: user.name || "My Preschool",
          location: "Gauteng", // Replace with actual profile data
          fundingNeeds: "We need to upgrade our playground equipment and purchase new educational toys.", // Replace with actual profile data
          registrationStatus: "Registered NPO", // Replace with actual profile data
        },
        fundingOpportunity: {
          fundingName: opportunity.title || "Untitled Funding",
          organization: opportunity.providerName || "Unknown Provider",
          description: opportunity.description || "No description provided.",
        }
      };

      const result = await generateFundingProposal(input);
      setProposalResult(result);
      toast({ title: "Proposal Generated!", description: `A draft proposal for ${opportunity.title} is ready.` });

    } catch (error: any) {
      console.error("Proposal generation error:", error);
      setError(error.message || "Failed to generate proposal.");
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsGeneratingProposal(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    // In a real app, this would trigger a refetch of data or filter client-side
    console.log("Filtering by category:", category);
  };

  return (
    <div className="bg-gradient-to-br from-background to-secondary/20 py-12 md:py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <HandCoins className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-primary sm:text-5xl md:text-6xl">
            AI Funding Hub
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground sm:text-xl">
            A suite of AI-powered tools to help you find funding, write proposals, and create a solid business plan to secure the capital you need.
          </p>
        </header>

        <Tabs defaultValue="finder" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 max-w-2xl mx-auto h-auto">
                <TabsTrigger value="finder" className="h-12"><Search className="mr-2"/>Funding Finder</TabsTrigger>
                <TabsTrigger value="proposal" className="h-12"><DraftingCompass className="mr-2"/>Proposal Writer</TabsTrigger>
                <TabsTrigger value="plan" className="lg:col-span-1 h-12"><FileText className="mr-2"/>Business Plan Generator</TabsTrigger>
            </TabsList>
            
            <TabsContent value="finder" className="mt-8">
              <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-12 space-y-4">
                <div className="relative">
                  <Input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g., 'Grants for playground equipment in Gauteng'"
                    className="h-14 pl-12 text-lg"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-5 w-5" />
                  )}
                  {isLoading ? "Searching for Funding..." : "Find My Funding"}
                </Button>
              </form>

              <FundingStats stats={mockStats} />
              <FeaturedFundingCard 
                title="The Presidential Youth Employment Initiative (PYEI)"
                description="A flagship government program providing funding to organizations, including schools, to create employment opportunities for youth."
                applyLink="#"
                learnMoreLink="#"
              />
              <CategoryTabs onValueChange={handleCategoryChange} />
              <FundingFilters />

              {isLoading && (
                  <div className="flex justify-center items-center py-20">
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  </div>
              )}
              
              {error && (
                  <Alert variant="destructive" className="my-8">
                      <AlertTitle>Search Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                  </Alert>
              )}

              {fundingResults && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
                      {fundingResults.opportunities.map((opp) => (
                          <FundingCard 
                            key={opp.id}
                            {...opp}
                            headerImage={`https://picsum.photos/seed/${opp.id}/400/180`}
                            headerImageHint="abstract funding graphic"
                            providerLogo={`https://picsum.photos/seed/${opp.providerName}/60/60`}
                            providerLogoHint={`${opp.providerName} logo`}
                            onGenerateProposal={() => handleGenerateProposal(opp)}
                          />
                      ))}
                  </div>
              )}
            </TabsContent>

            <TabsContent value="proposal" className="mt-8">
                <ProposalGenerator
                  opportunity={selectedOpportunity}
                  proposal={proposalResult}
                  isLoading={isGeneratingProposal}
                  error={error}
                />
            </TabsContent>

            <TabsContent value="plan" className="mt-8">
                <BusinessPlanGenerator />
            </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}
