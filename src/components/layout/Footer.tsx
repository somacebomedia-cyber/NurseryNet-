// src/components/layout/Footer.tsx
"use client";

import Link from 'next/link';
import { Rocket, Download, ChevronsUpDown, Home, Search, Briefcase, DollarSign, Wand2, TrendingUp, Gift, Eye, Award, Handshake, ClipboardList, BookOpenCheck, GraduationCap, Users } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBrand, Brand } from '@/context/BrandContext';
import { NurseryNetLogo } from '@/components/ui/logo';
import { navContent, brandQueryParam } from './Navbar';


const BrandSwitcher = () => {
  const { brand, setBrand } = useBrand();

  const brands: Brand[] = ['NurseryNet', 'PrimaryNet', 'HighschoolNet', 'TertiaryNet'];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="text-xs text-muted-foreground hover:bg-muted/50">
          <NurseryNetLogo brand={brand} className="h-4 w-4 mr-2" />
          Switch Brand: <span className="font-semibold text-foreground ml-1">{brand}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {brands.map((b) => (
          <DropdownMenuItem key={b} onSelect={() => setBrand(b)} className="cursor-pointer">
             <NurseryNetLogo brand={b} className="h-4 w-4 mr-2" />
            {b}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};


export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { brand } = useBrand();
  const bqp = brandQueryParam(brand);


  return (
    <footer className="border-t border-border/40 bg-background/95">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex flex-col items-center gap-2 text-center md:items-start md:text-left">
            <Link href={`/${bqp}`} className="flex items-center space-x-2">
              <NurseryNetLogo brand={brand} className="h-7 w-7 text-primary" />
              <span className="font-heading text-xl font-extrabold text-primary">{brand}</span>
            </Link>
            <div className="text-sm text-muted-foreground">
              <span>&copy; {currentYear} {brand}. All rights reserved.</span>
              <a href="https://nurserynet.app" target="_blank" rel="noopener noreferrer" className="ml-2 hover:text-primary hover:underline">
                nurserynet.app
              </a>
            </div>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 md:justify-end items-center">
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">
                Contact Us
            </Link>
            <Link href="/jobs" className="text-sm text-muted-foreground hover:text-primary">
                Jobs
            </Link>
            <Link href="/affiliates" className="text-sm text-muted-foreground hover:text-primary">
              Affiliate Program
            </Link>
             <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
              Terms of Service
            </Link>
            <Link href="/dashboard/roadmap" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              <Rocket className="h-4 w-4" />
              Launch Roadmap
            </Link>
            <a href="/logo-viewer.html" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-accent hover:underline flex items-center gap-1">
              <Download className="h-4 w-4" />
              Download Logo
            </a>
          </nav>
        </div>
        <Separator className="my-6" />
        <div className="flex justify-center">
           <BrandSwitcher />
        </div>
      </div>
    </footer>
  );
}
