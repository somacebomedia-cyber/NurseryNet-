
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Filter, ChevronDown, ChevronUp } from "lucide-react";

const filterTags = [
  { value: "urgent", label: "Urgent" },
  { value: "new", label: "New" },
  { value: "popular", label: "Popular" },
  { value: "large-amount", label: "Large Amount" },
  { value: "recurring", label: "Recurring" },
];

export default function FundingFilters() {
  const [showFilters, setShowFilters] = useState(false);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const toggleTag = (tagValue: string) => {
    setActiveTags((prev) =>
      prev.includes(tagValue)
        ? prev.filter((t) => t !== tagValue)
        : [...prev, tagValue]
    );
  };

  return (
    <Card className="mb-8 shadow-lg glassmorphism">
      <CardHeader className="flex flex-row items-center justify-between pb-4 cursor-pointer" onClick={() => setShowFilters(!showFilters)}>
        <CardTitle className="text-xl text-primary flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Advanced Filters
        </CardTitle>
        <Button variant="ghost" size="icon" >
          {showFilters ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </Button>
      </CardHeader>
      {showFilters && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="fundingAmount" className="font-medium">Funding Amount</Label>
              <Select>
                <SelectTrigger id="fundingAmount">
                  <SelectValue placeholder="Any Amount" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Amount</SelectItem>
                  <SelectItem value="10k-50k">R10,000 - R50,000</SelectItem>
                  <SelectItem value="50k-100k">R50,000 - R100,000</SelectItem>
                  <SelectItem value="100k-500k">R100,000 - R500,000</SelectItem>
                  <SelectItem value="500k+">R500,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline" className="font-medium">Application Deadline</Label>
              <Select>
                <SelectTrigger id="deadline">
                  <SelectValue placeholder="Any Deadline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Deadline</SelectItem>
                  <SelectItem value="30days">Next 30 days</SelectItem>
                  <SelectItem value="60days">Next 60 days</SelectItem>
                  <SelectItem value="90days">Next 90 days</SelectItem>
                  <SelectItem value="none">No deadline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="educationLevel" className="font-medium">Education Level</Label>
              <Select>
                <SelectTrigger id="educationLevel">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="ecd">Early Childhood</SelectItem>
                  <SelectItem value="primary">Primary School</SelectItem>
                  <SelectItem value="high">High School</SelectItem>
                  <SelectItem value="higher">Higher Education</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {filterTags.map((tag) => (
              <Button
                key={tag.value}
                variant={activeTags.includes(tag.value) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleTag(tag.value)}
                className={`rounded-full px-4 py-1 text-sm transition-all ${activeTags.includes(tag.value) ? 'bg-primary text-primary-foreground' : 'bg-muted/50 hover:bg-muted'}`}
              >
                {tag.label}
              </Button>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
