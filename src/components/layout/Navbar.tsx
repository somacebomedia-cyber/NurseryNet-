// src/components/layout/Navbar.tsx
"use client";

import Link from 'next/link';
import { Home, Search, Briefcase, DollarSign, LayoutDashboard, Menu, X, Handshake, ClipboardList, ChevronDown, Wand2, TrendingUp, Gift, Eye, Award, LogOut, Compass, UserPlus, FileText, School, BookOpenCheck, GraduationCap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useState, Fragment } from 'react';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from '@/context/AuthContext';
import { useBrand, Brand } from '@/context/BrandContext';
import { NurseryNetLogo } from '@/components/ui/logo';

export const navContent = {
  NurseryNet: {
    main: { href: '/', label: 'Home', icon: Home },
    directory: { href: '/directory', label: 'Directory', icon: Search },
    forSection: { 
        href: '/preschools', 
        label: 'For Preschools', 
        icon: Briefcase,
        subLinks: [
          { href: '/preschools/logo-generator', label: 'AI Logo Generator', icon: Wand2 },
          { href: '/funding', label: 'AI Funding Hub', icon: Search },
          { href: '/preschools/roi-calculator', label: 'ROI Calculator', icon: TrendingUp },
          { href: '/preschools/growth-kit', label: 'Free Resources', icon: Gift },
          { href: '/preschools/profile-preview', label: 'Profile Preview', icon: Eye },
          { href: '/pricing', label: 'Pricing & Plans', icon: DollarSign, isSeparator: true },
        ]
    },
  },
  PrimaryNet: {
    main: { href: '/', label: 'Home', icon: Home },
    directory: { href: '/directory', label: 'Directory', icon: Search },
    forSection: { 
        href: '/preschools', 
        label: 'For Schools', 
        icon: School,
        subLinks: [
          { href: '#', label: 'AI Grading Assistant', icon: Wand2 },
          { href: '#', label: 'Parent Communication Tools', icon: Users },
          { href: '/pricing', label: 'Pricing & Plans', icon: DollarSign, isSeparator: true },
        ]
    },
  },
  HighschoolNet: {
    main: { href: '/', label: 'Home', icon: Home },
    directory: { href: '/directory', label: 'Directory', icon: Search },
    forSection: { 
        href: '/preschools',
        label: 'For Counselors', 
        icon: BookOpenCheck,
        subLinks: [
          { href: '#', label: 'AI Career Guidance', icon: GraduationCap },
          { href: '#', label: 'University App Hub', icon: Briefcase },
           { href: '/pricing', label: 'Pricing & Plans', icon: DollarSign, isSeparator: true },
        ]
    },
  },
  TertiaryNet: {
    main: { href: '/', label: 'Home', icon: Home },
    directory: { href: '/directory', label: 'Directory', icon: Search },
    forSection: { 
        href: '/preschools',
        label: 'For Admissions',
        icon: GraduationCap,
        subLinks: [
          { href: '#', label: 'AI Research Assistant', icon: Wand2 },
          { href: '#', label: 'Corporate Partnerships', icon: Briefcase },
           { href: '/pricing', label: 'Pricing & Plans', icon: DollarSign, isSeparator: true },
        ]
    },
  },
};

export const brandQueryParam = (brand: Brand) => {
    switch (brand) {
      case 'NurseryNet': return '';
      case 'PrimaryNet': return 'brand=primary';
      case 'HighschoolNet': return 'brand=highschool';
      case 'TertiaryNet': return 'brand=tertiary';
      default: return '';
    }
};

const addQuery = (href: string, query: string) => {
    if (!query) return href;
    return href.includes('?') ? `${href}&${query}` : `${href}?${query}`;
}


export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const { brand } = useBrand();
  
  const content = navContent[brand] || navContent.NurseryNet;
  const bqp = brandQueryParam(brand);
  
  const sharedLinks = [
    { 
      href: '#', 
      label: 'Explore', 
      icon: Compass,
      isDropdown: true,
      subLinks: [
        { href: `/funding`, label: 'Funding', icon: Handshake },
        { href: `/rankings`, label: 'Rankings', icon: Award },
      ]
    },
  ];

  const mainNavLinks = [content.main, content.directory, content.forSection, ...sharedLinks];


  const NavLinkItem = ({ href, label, icon: Icon, onClick, className }: { href: string, label: string, icon: React.ElementType, onClick?: () => void, className?: string }) => (
    <Link href={addQuery(href, bqp)} passHref>
      <Button variant="ghost" className={cn("w-full justify-start md:w-auto font-medium text-foreground hover:text-primary", className)} onClick={onClick}>
        <Icon className="mr-2 h-5 w-5" />
        {label}
      </Button>
    </Link>
  );
  
  const AuthButtonItem = ({ label, icon: Icon, onClick, className, href }: { href?: string, label: string, icon: React.ElementType, onClick?: () => void, className?: string }) => {
    const content = (
      <Button variant="ghost" className={cn("w-full justify-start md:w-auto font-medium", className)} onClick={onClick}>
        <Icon className="mr-2 h-5 w-5" />
        {label}
      </Button>
    );

    return href ? <Link href={href} passHref>{content}</Link> : content;
  };


  const handleMobileSubmenuToggle = (label: string) => {
    setOpenMobileSubmenu(openMobileSubmenu === label ? null : label);
  };
  
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setOpenMobileSubmenu(null);
  }

  const renderNavLinks = (isMobile = false) => (
    mainNavLinks.map((link, index) => {
      const subLinks = 'subLinks' in link ? link.subLinks : undefined;

      const key = `${link.label}-${index}`;

      if (!isMobile) {
        if (subLinks) {
          return (
            <DropdownMenu key={key}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="font-medium text-foreground hover:text-primary">
                  <link.icon className="mr-2 h-5 w-5" />
                  {link.label}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60">
                 {link.href !== '#' && (
                    <>
                    <DropdownMenuItem asChild>
                      <Link href={addQuery(link.href, bqp)} className="flex items-center w-full font-semibold">
                         Overview
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator/>
                    </>
                 )}
                {subLinks.map((subLink, subIndex) => (
                   <Fragment key={`${subLink.label}-${subIndex}`}>
                    {subLink.isSeparator && <DropdownMenuSeparator />}
                    <DropdownMenuItem asChild>
                      <Link href={addQuery(subLink.href, bqp)} className="flex items-center w-full">
                        <subLink.icon className="mr-2 h-4 w-4" />
                        {subLink.label}
                      </Link>
                    </DropdownMenuItem>
                  </Fragment>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
        return <NavLinkItem key={key} href={link.href} label={link.label} icon={link.icon} />;
      }
      
      // Mobile rendering
      const mobileKey = `${link.label}-${index}-mobile`;
      return !subLinks ? (
        <SheetClose asChild key={mobileKey}>
            <NavLinkItem 
                href={link.href} 
                label={link.label} 
                icon={link.icon} 
                onClick={closeMobileMenu} 
                className="py-3 px-4 text-base"
            />
        </SheetClose>
      ) : (
        <AccordionItem key={mobileKey} value={link.label} className="border-b-0">
          <AccordionTrigger 
            className="flex w-full justify-start items-center py-3 px-4 font-medium text-base text-foreground hover:text-primary hover:no-underline"
            onClick={() => handleMobileSubmenuToggle(link.label)}
          >
            <link.icon className="mr-2 h-5 w-5" />
            {link.label}
          </AccordionTrigger>
          <AccordionContent className="pl-6">
              {link.href !== '#' && (
                 <SheetClose asChild>
                  <NavLinkItem 
                      href={link.href} 
                      label="Overview" 
                      icon={Briefcase} 
                      onClick={closeMobileMenu}
                      className="py-2 px-4 text-sm" 
                  />
                </SheetClose>
              )}
              {subLinks?.map((subLink, subIndex) => (
                 <SheetClose asChild key={`${subLink.label}-${subIndex}`}>
                     <NavLinkItem 
                        href={subLink.href} 
                        label={subLink.label} 
                        icon={subLink.icon} 
                        onClick={closeMobileMenu}
                        className="py-2 px-4 text-sm" 
                      />
                 </SheetClose>
              ))}
          </AccordionContent>
        </AccordionItem>
      );
    })
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={`/${bqp}`} className="flex items-center space-x-2">
          <NurseryNetLogo brand={brand} className="h-8 w-8" />
          <span className="font-heading text-2xl font-bold text-primary">{brand}</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          {renderNavLinks()}
          <NavLinkItem href="/dashboard" label="Dashboard" icon={LayoutDashboard} />
        </nav>
        
        <div className="hidden md:flex items-center space-x-2">
          {user ? (
            <Button variant="outline" onClick={logout}>
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          ) : (
            <Button asChild>
              <Link href="/signup"><UserPlus className="mr-2 h-5 w-5" /> Get Started</Link>
            </Button>
          )}
        </div>

        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs bg-background p-0">
              <div className="flex flex-col h-full">
                <SheetHeader className="flex flex-row justify-between items-center p-6 border-b space-y-0">
                   <SheetTitle asChild>
                     <Link href={`/${bqp}`} className="flex items-center space-x-2" onClick={closeMobileMenu}>
                       <NurseryNetLogo brand={brand} className="h-7 w-7" />
                       <span className="font-heading text-xl font-bold text-primary">{brand}</span>
                     </Link>
                   </SheetTitle>
                   <SheetClose asChild>
                      <Button variant="ghost" size="icon" onClick={() => setOpenMobileSubmenu(null)}>
                         <X className="h-6 w-6" />
                         <span className="sr-only">Close menu</span>
                       </Button>
                   </SheetClose>
                 </SheetHeader>
                <div className="flex-grow overflow-y-auto">
                    <Accordion type="single" collapsible className="w-full px-2 py-4">
                        <Fragment>
                           {renderNavLinks(true)}
                           <SheetClose asChild>
                               <NavLinkItem 
                                   href="/dashboard" 
                                   label="Dashboard" 
                                   icon={LayoutDashboard} 
                                   onClick={closeMobileMenu} 
                                   className="py-3 px-4 text-base"
                               />
                           </SheetClose>
                        </Fragment>
                    </Accordion>
                </div>
                <div className="p-4 border-t">
                  {user ? (
                    <SheetClose asChild>
                       <AuthButtonItem label="Logout" icon={LogOut} onClick={() => { logout(); closeMobileMenu(); }} />
                    </SheetClose>
                  ) : (
                    <SheetClose asChild>
                      <AuthButtonItem href="/signup" label="Get Started" icon={UserPlus} onClick={closeMobileMenu} className="w-full justify-center bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" />
                    </SheetClose>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
