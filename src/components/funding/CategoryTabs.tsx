
"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LucideIcon } from "lucide-react";
import { LayoutGrid, Landmark, Building2, Globe, GraduationCap, Hammer } from "lucide-react";

interface Category {
  value: string;
  label: string;
  icon: LucideIcon;
}

const categories: Category[] = [
  { value: "all", label: "All Funding", icon: LayoutGrid },
  { value: "government", label: "Government", icon: Landmark },
  { value: "private", label: "Private", icon: Building2 },
  { value: "international", label: "International", icon: Globe },
  { value: "scholarship", label: "Scholarships", icon: GraduationCap },
  { value: "infrastructure", label: "Infrastructure", icon: Hammer },
];

interface CategoryTabsProps {
  onValueChange: (category: string) => void;
  defaultValue?: string;
}

export default function CategoryTabs({ onValueChange, defaultValue = "all" }: CategoryTabsProps) {
  return (
    <div className="mb-8">
      <Tabs defaultValue={defaultValue} onValueChange={onValueChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 h-auto p-1 bg-primary/10">
          {categories.map((category) => (
            <TabsTrigger
              key={category.value}
              value={category.value}
              className="flex flex-col items-center justify-center h-auto p-3 space-y-1 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-primary/20 transition-all text-xs sm:text-sm"
            >
              <category.icon className="w-6 h-6 mb-1" />
              <span>{category.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
