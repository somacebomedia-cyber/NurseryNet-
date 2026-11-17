// src/app/dashboard/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useBrand } from '@/context/BrandContext';
import { useAuth } from '@/context/AuthContext';
import { TiersConfig } from '@/config/tiers';
import SchoolMicrositeBuilder from '@/components/preschools/SchoolMicrositeBuilder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  Eye,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  Save,
  TrendingUp,
  Globe,
  MessageCircle,
  PauseCircle,
  ArrowDownCircle,
  Sparkles,
  Check,
  AlertCircle,
} from 'lucide-react';

interface UnifiedLead {
  id: string;
  type: 'tour' | 'inquiry';
  schoolName?: string;
  parentName: string;
  childAge?: string;
  inquiryType?: string;
  message?: string;
  tourDate: string;
  timeSlot: string;
  phone: string;
  email: string;
  status: 'pending' | 'confirmed' | 'completed';
}

const DEFAULT_BOOKINGS: UnifiedLead[] = [
  {
    id: 'tour-101',
    type: 'tour',
    parentName: 'Lerato Moloi',
    childAge: '3 years old',
    tourDate: '2026-11-18',
    timeSlot: '09:30 AM',
    phone: '082 555 1829',
    email: 'lerato.m@gmail.com',
    status: 'pending',
  },
  {
    id: 'tour-102',
    type: 'tour',
    parentName: 'David van der Merwe',
    childAge: '18 months (Toddler)',
    tourDate: '2026-11-20',
    timeSlot: '11:00 AM',
    phone: '083 441 9022',
    email: 'david.vdm@outlook.com',
    status: 'confirmed',
  },
  {
    id: 'tour-103',
    type: 'tour',
    parentName: 'Sipho Zulu',
    childAge: '4 years old (Grade RR)',
    tourDate: '2026-11-22',
    timeSlot: '14:00 PM',
    phone: '071 889 0012',
    email: 'sipho.zulu@work.co.za',
    status: 'pending',
  },
];

function formatSaWhatsAppNumber(rawPhone?: string): string {
  const digits = (rawPhone || '0825551829').replace(/\D/g, '');
  if (digits.startsWith('27') && digits.length >= 11) return digits;
  if (digits.startsWith('0') && digits.length >= 10) return `27${digits.slice(1)}`;
  return `27${digits}`;
}

export default function DashboardPage() {
  const { brand } = useBrand();
  const { user } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<'leads' | 'profile' | 'website' | 'billing'>('leads');
  const [leadFilter, setLeadFilter] = useState<'all' | 'pending' | 'confirmed' | 'inquiry'>('all');
  const [retentionModalOpen, setRetentionModalOpen] = useState(false);

  const [activePlan, setActivePlan] = useState<{
    tierId?: string;
    tierName: string;
    monthlyPriceZAR?: number;
    annualPriceZAR?: number;
    billingCycle?: 'monthly' | 'annual';
    status?: 'active' | 'paused';
    pauseUntilDate?: string;
    includesFreeWebsite?: boolean;
    schoolName: string;
  } | null>(null);

  // Edit form & onboarding milestone states
  const [schoolName, setSchoolName] = useState('Sunshine Early Learning Centre');
  const [monthlyFee, setMonthlyFee] = useState('1450');
  const [operatingHours, setOperatingHours] = useState('07:00 - 17:30');
  const [capacity, setCapacity] = useState('45');
  const [whatsappPhone, setWhatsappPhone] = useState('082 555 1829');
  const [npoNumber, setNpoNumber] = useState('');
  const [websitePreviewed, setWebsitePreviewed] = useState(false);
  const [whatsAppClicks, setWhatsAppClicks] = useState(39);
  const [savedNotice, setSavedNotice] = useState(false);

  const [bookings, setBookings] = useState<UnifiedLead[]>(DEFAULT_BOOKINGS);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'website' || tabParam === 'profile' || tabParam === 'billing' || tabParam === 'leads') {
      setActiveTab(tabParam);
      if (tabParam === 'website') {
        setWebsitePreviewed(true);
      }
    }
  }, [searchParams]);

  // Hydrate active plan, profile fields, and live parent tour bookings & inquiries from localStorage
  useEffect(() => {
    const loadStoredState = () => {
      if (typeof window === 'undefined') return;

      const storedPlan = localStorage.getItem('nurserynet_active_plan');
      if (storedPlan) {
        try {
          const parsed = JSON.parse(storedPlan);
          setActivePlan(parsed);
          if (parsed.schoolName) setSchoolName(parsed.schoolName);
          if (parsed.monthlyFeeZAR) setMonthlyFee(String(parsed.monthlyFeeZAR));
          if (parsed.operatingHours) setOperatingHours(parsed.operatingHours);
          if (parsed.whatsappPhone) setWhatsappPhone(parsed.whatsappPhone);
          if (parsed.npoNumber) setNpoNumber(parsed.npoNumber);
          if (parsed.websitePreviewed) setWebsitePreviewed(Boolean(parsed.websitePreviewed));
        } catch (e) {
          console.error(e);
        }
      }

      try {
        const rawTours = JSON.parse(localStorage.getItem('nurserynet_tours') || '[]');
        const rawInquiries = JSON.parse(localStorage.getItem('nurserynet_inquiries') || '[]');
        const statusOverrides: Record<string, 'pending' | 'confirmed' | 'completed'> = JSON.parse(
          localStorage.getItem('nurserynet_lead_statuses') || '{}'
        );

        const mappedTours: UnifiedLead[] = Array.isArray(rawTours)
          ? rawTours.map((t: any, idx: number) => {
              const id = t.id || `live-tour-${idx}-${t.bookedAt || ''}`;
              return {
                id,
                type: 'tour',
                schoolName: t.schoolName,
                parentName: t.parentName || 'Parent Enquiry',
                childAge: t.childAge || 'Preschool Age',
                message: t.notes,
                tourDate: t.tourDate || new Date().toISOString().split('T')[0],
                timeSlot: t.timeSlot || '09:30 AM',
                phone: t.phone || '082 000 0000',
                email: t.email || 'parent@example.co.za',
                status: statusOverrides[id] || t.status || 'pending',
              };
            })
          : [];

        const mappedInquiries: UnifiedLead[] = Array.isArray(rawInquiries)
          ? rawInquiries.map((inq: any, idx: number) => {
              const id = inq.id || `live-inq-${idx}-${inq.createdAt || ''}`;
              return {
                id,
                type: 'inquiry',
                schoolName: inq.schoolName,
                parentName: inq.parentName || 'Parent Admission Enquiry',
                inquiryType: inq.inquiryType || 'Fee Structure & Brochure',
                message: inq.message,
                tourDate: inq.createdAt || new Date().toISOString().split('T')[0],
                timeSlot: 'Admissions Pack Request',
                phone: inq.phone || 'Email enquiry',
                email: inq.email || 'parent@example.co.za',
                status: statusOverrides[id] || inq.status || 'pending',
              };
            })
          : [];

        const defaultWithOverrides = DEFAULT_BOOKINGS.map((b) => ({
          ...b,
          status: statusOverrides[b.id] || b.status,
        }));

        setBookings([...mappedTours, ...mappedInquiries, ...defaultWithOverrides]);
      } catch (e) {
        console.error('Failed to hydrate live leads', e);
      }
    };

    loadStoredState();
    window.addEventListener('nurserynet_leads_updated', loadStoredState);
    window.addEventListener('storage', loadStoredState);
    return () => {
      window.removeEventListener('nurserynet_leads_updated', loadStoredState);
      window.removeEventListener('storage', loadStoredState);
    };
  }, []);

  const currentMonthlyPrice =
    activePlan?.monthlyPriceZAR ??
    (activePlan?.tierId === 'pro_featured'
      ? TiersConfig.PRO_FEATURED.monthlyPriceZAR
      : activePlan?.tierId === 'free'
      ? 0
      : TiersConfig.VERIFIED.monthlyPriceZAR);

  const numericMonthlyFee = Math.max(150, Number(monthlyFee) || 1450);
  const annualTuitionPerChild = numericMonthlyFee * 12;
  const roiMultiple = currentMonthlyPrice > 0 ? Math.max(1, Math.round(annualTuitionPerChild / (currentMonthlyPrice * 12))) : 10;

  // Profile Strength & Activation Checklist (5 concrete milestones, 20% each)
  const checklistItems = useMemo(
    () => [
      {
        id: 'tuition',
        label: 'School Name & Monthly Tuition',
        detail: `R${numericMonthlyFee.toLocaleString()}/mo published`,
        done: Boolean(schoolName.trim() && Number(monthlyFee) > 0),
        actionLabel: 'Edit Tuition',
        onAction: () => setActiveTab('profile'),
      },
      {
        id: 'hours',
        label: 'Operating Hours & Learner Capacity',
        detail: `${operatingHours} · ${capacity} learners`,
        done: Boolean(operatingHours.trim() && Number(capacity) > 0),
        actionLabel: 'Update Hours',
        onAction: () => setActiveTab('profile'),
      },
      {
        id: 'whatsapp',
        label: 'Verified WhatsApp Lead Routing',
        detail: whatsappPhone.trim() ? `Mirrored to ${whatsappPhone}` : 'Add WhatsApp number',
        done: Boolean(whatsappPhone.replace(/\D/g, '').length >= 9),
        actionLabel: 'Verify Phone',
        onAction: () => setActiveTab('profile'),
      },
      {
        id: 'dsd',
        label: 'DSD / NPO Accreditation Certificate',
        detail: npoNumber.trim() ? `NPO #${npoNumber} verified` : 'Add DSD or NPO registration #',
        done: Boolean(npoNumber.trim().length >= 3),
        actionLabel: 'Add NPO #',
        onAction: () => setActiveTab('profile'),
      },
      {
        id: 'website',
        label: 'Custom School Website & Tour Page',
        detail: websitePreviewed ? 'Microsite customized' : 'Preview & customize free website',
        done: websitePreviewed || Boolean(activePlan?.includesFreeWebsite),
        actionLabel: 'Open Builder',
        onAction: () => {
          setWebsitePreviewed(true);
          setActiveTab('website');
        },
      },
    ],
    [schoolName, monthlyFee, numericMonthlyFee, operatingHours, capacity, whatsappPhone, npoNumber, websitePreviewed, activePlan]
  );

  const profileStrengthPct = useMemo(() => {
    const completedCount = checklistItems.filter((item) => item.done).length;
    return completedCount * 20;
  }, [checklistItems]);

  const filteredBookings = useMemo(() => {
    if (leadFilter === 'pending') return bookings.filter((b) => b.status === 'pending');
    if (leadFilter === 'confirmed') return bookings.filter((b) => b.status === 'confirmed');
    if (leadFilter === 'inquiry') return bookings.filter((b) => b.type === 'inquiry');
    return bookings;
  }, [bookings, leadFilter]);

  const pendingCount = useMemo(() => bookings.filter((b) => b.status === 'pending').length, [bookings]);

  const handleConfirmTour = (id: string) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'confirmed' } : b)));
    try {
      const statusOverrides = JSON.parse(localStorage.getItem('nurserynet_lead_statuses') || '{}');
      statusOverrides[id] = 'confirmed';
      localStorage.setItem('nurserynet_lead_statuses', JSON.stringify(statusOverrides));
    } catch {
      // Ignore storage error
    }
    toast({
      title: 'Lead Confirmed',
      description: 'Parent tour status updated to Confirmed.',
    });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedPlan = {
      ...(activePlan || {}),
      tierName: activePlan?.tierName || 'Verified Centre',
      schoolName,
      monthlyFeeZAR: Number(monthlyFee) || 1450,
      operatingHours,
      capacity: Number(capacity) || 45,
      whatsappPhone,
      npoNumber,
      websitePreviewed,
    };
    setActivePlan(updatedPlan);
    try {
      localStorage.setItem('nurserynet_active_plan', JSON.stringify(updatedPlan));
    } catch {
      // Ignore storage error
    }
    setSavedNotice(true);
    toast({
      title: 'School Profile Updated',
      description: 'Your tuition fees, DSD/NPO accreditation, and WhatsApp routing are live.',
    });
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleApplyRetentionOption = (action: 'pause' | 'downgrade_verified' | 'switch_annual' | 'downgrade_free') => {
    const pauseDate = new Date();
    pauseDate.setDate(pauseDate.getDate() + 30);
    const formattedPauseDate = pauseDate.toISOString().split('T')[0];

    let nextPlan: NonNullable<typeof activePlan> = {
      ...(activePlan || {}),
      tierName: activePlan?.tierName || TiersConfig.VERIFIED.name,
      schoolName,
    };

    if (action === 'pause') {
      nextPlan = {
        ...nextPlan,
        status: 'paused',
        pauseUntilDate: formattedPauseDate,
      };
      toast({
        title: 'Billing Paused for 30 Days',
        description: `Your Verified badge and lead inbox remain active. Billing resumes on ${formattedPauseDate}.`,
      });
    } else if (action === 'downgrade_verified') {
      nextPlan = {
        ...nextPlan,
        tierId: 'verified',
        tierName: TiersConfig.VERIFIED.name,
        monthlyPriceZAR: TiersConfig.VERIFIED.monthlyPriceZAR,
        includesFreeWebsite: false,
        status: 'active',
        pauseUntilDate: undefined,
      };
      toast({
        title: 'Switched to Verified Centre (R149/mo)',
        description: 'Your monthly cost has been lowered while retaining your Verified Shield and Lead Inbox.',
      });
    } else if (action === 'switch_annual') {
      const baseMonthly = currentMonthlyPrice || TiersConfig.VERIFIED.monthlyPriceZAR;
      const discountedMonthly = Math.round(baseMonthly * 0.85);
      nextPlan = {
        ...nextPlan,
        billingCycle: 'annual',
        monthlyPriceZAR: discountedMonthly,
        status: 'active',
        pauseUntilDate: undefined,
      };
      toast({
        title: '15% Annual Discount Applied',
        description: `Your effective rate is now R${discountedMonthly}/mo billed annually.`,
      });
    } else if (action === 'downgrade_free') {
      nextPlan = {
        ...nextPlan,
        tierId: 'free',
        tierName: TiersConfig.FREE.name,
        monthlyPriceZAR: 0,
        includesFreeWebsite: false,
        status: 'active',
        pauseUntilDate: undefined,
      };
      toast({
        title: 'Downgraded to Free Public Listing',
        description: 'Your school history is preserved. You can reactivate Verified Lead Routing anytime.',
      });
    }

    setActivePlan(nextPlan);
    try {
      localStorage.setItem('nurserynet_active_plan', JSON.stringify(nextPlan));
    } catch {
      // Ignore storage error
    }
    setRetentionModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Banner */}
      <section className="py-10 bg-muted/30 border-b border-border/40">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1 text-xs">
                <span className="font-semibold text-primary">Principal &amp; Owner Portal</span>
                <span className="text-muted-foreground" aria-hidden="true">·</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {npoNumber ? `DSD Verified · NPO #${npoNumber}` : 'DSD Verified Listing'}
                </span>
                {activePlan?.status === 'paused' && (
                  <>
                    <span className="text-muted-foreground" aria-hidden="true">·</span>
                    <span className="text-amber-600 font-semibold flex items-center gap-1">
                      <PauseCircle className="h-3.5 w-3.5" /> Billing Paused until {activePlan.pauseUntilDate}
                    </span>
                  </>
                )}
              </div>
              <h1 className="font-heading text-3xl font-extrabold text-foreground">
                {schoolName}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono tabular-nums">
                Active Plan:{' '}
                <strong className="text-primary font-sans">
                  {activePlan?.tierName
                    ? `${activePlan.tierName} (R${currentMonthlyPrice}/mo)`
                    : `Verified Centre (R${TiersConfig.VERIFIED.monthlyPriceZAR}/mo)`}
                </strong>{' '}
                · Connected to South African Directory
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button asChild variant="outline" size="sm" className="whitespace-nowrap shrink-0">
                <Link href="/directory">View Public Profile</Link>
              </Button>
              <Button asChild size="sm" className="whitespace-nowrap shrink-0">
                <Link href="/pricing">Upgrade Placement</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Stats KPI Cards & Profile Strength Meter */}
      <section className="py-8">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-5 bg-card border border-border rounded-xl">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold mb-2">
                <span>Profile Views (30d)</span>
                <Eye className="h-4 w-4 text-primary" />
              </div>
              <div className="font-heading text-3xl font-extrabold text-foreground font-mono tabular-nums">
                248
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">+18% vs last month</span>
            </div>

            <div className="p-5 bg-card border border-border rounded-xl">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold mb-2">
                <span>Tour &amp; Admission Leads</span>
                <Calendar className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="font-heading text-3xl font-extrabold text-foreground font-mono tabular-nums">
                {bookings.length}
              </div>
              <span className="text-[11px] text-muted-foreground font-mono tabular-nums">
                {pendingCount} awaiting principal confirmation
              </span>
            </div>

            <div className="p-5 bg-card border border-border rounded-xl">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold mb-2">
                <span>WhatsApp Replies &amp; Clicks</span>
                <Phone className="h-4 w-4 text-amber-500" />
              </div>
              <div className="font-heading text-3xl font-extrabold text-foreground font-mono tabular-nums">
                {whatsAppClicks}
              </div>
              <span className="text-[11px] text-muted-foreground">Direct parent conversations</span>
            </div>

            <div className="p-5 bg-card border border-border rounded-xl">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold mb-2">
                <span>Estimated Annual ROI</span>
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div className="font-heading text-3xl font-extrabold text-foreground font-mono tabular-nums">
                R{annualTuitionPerChild.toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold font-mono tabular-nums">
                1 enrolled child = {roiMultiple}x plan cost
              </span>
            </div>
          </div>

          {/* Profile Strength & Activation Checklist */}
          <div className="mb-8 p-5 bg-card border border-border rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h2 className="font-heading text-base font-bold text-foreground">
                    School Profile Strength &amp; Activation Checklist
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Complete all 5 onboarding milestones to maximize parent search ranking and tour conversions.
                </p>
              </div>
              <div className="text-right font-mono tabular-nums">
                <span className="text-lg font-extrabold text-primary">{profileStrengthPct}%</span>
                <span className="text-xs text-muted-foreground ml-1">Complete</span>
              </div>
            </div>

            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${profileStrengthPct}%` }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
              {checklistItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.onAction}
                  className={`p-3 rounded-xl border text-left transition-colors flex flex-col justify-between gap-2 ${
                    item.done
                      ? 'bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/50'
                      : 'bg-background border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-foreground leading-snug">{item.label}</span>
                    {item.done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-1 text-[11px]">
                    <span className="text-muted-foreground truncate">{item.detail}</span>
                    <span className="font-semibold text-primary whitespace-nowrap shrink-0">
                      {item.done ? 'Edit' : item.actionLabel}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-border mb-8 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('leads')}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'leads'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Tour Bookings &amp; Inbound Leads ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'profile'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Edit School Profile
            </button>
            <button
              onClick={() => {
                setWebsitePreviewed(true);
                setActiveTab('website');
              }}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'website'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Globe className="h-4 w-4" />
              Free School Website
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'billing'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Subscription &amp; Retention
            </button>
          </div>

          {/* TAB 1: LEADS INBOX */}
          {activeTab === 'leads' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div>
                  <h3 className="font-heading text-lg font-bold text-foreground">
                    Live Parent Tour Bookings &amp; Admission Enquiries
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Tours and enquiries submitted in the Directory sync here in real time and mirror to {whatsappPhone}.
                  </p>
                </div>

                {/* Segmented Lead Filter Controls */}
                <div className="flex items-center gap-1 p-1 bg-muted rounded-lg self-start sm:self-auto">
                  {[
                    { id: 'all', label: `All (${bookings.length})` },
                    { id: 'pending', label: `Pending (${pendingCount})` },
                    { id: 'confirmed', label: 'Confirmed' },
                    { id: 'inquiry', label: 'Enquiries' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setLeadFilter(tab.id as any)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                        leadFilter === tab.id
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredBookings.length === 0 ? (
                <div className="p-8 text-center bg-card border border-dashed border-border rounded-xl space-y-2">
                  <p className="text-sm font-semibold text-foreground">No leads in this filter view</p>
                  <p className="text-xs text-muted-foreground">
                    Switch back to All Leads or test booking a tour on any school in the Directory to see live sync in action.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setLeadFilter('all')} className="mt-2 text-xs">
                    Show All Leads
                  </Button>
                </div>
              ) : (
                filteredBookings.map((booking) => {
                  const whatsAppReplyUrl = `https://wa.me/${formatSaWhatsAppNumber(booking.phone)}?text=${encodeURIComponent(
                    booking.type === 'inquiry'
                      ? `Hi ${booking.parentName}, thank you for your NurseryNet enquiry at ${booking.schoolName || schoolName} regarding "${booking.inquiryType}". Here are our latest admission details:`
                      : `Hi ${booking.parentName}, this is the Principal at ${booking.schoolName || schoolName}. We are pleased to confirm your preschool tour for ${booking.tourDate} at ${booking.timeSlot}!`
                  )}`;

                  return (
                    <div
                      key={booking.id}
                      className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <h4 className="font-heading font-bold text-base text-foreground">{booking.parentName}</h4>
                          <span className="text-muted-foreground" aria-hidden="true">·</span>
                          <span
                            className={`font-bold flex items-center gap-1 ${
                              booking.status === 'confirmed'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {booking.status === 'confirmed' ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <Clock className="w-3.5 h-3.5" />
                            )}
                            <span className="capitalize">{booking.status}</span>
                          </span>
                          {booking.schoolName && booking.schoolName !== schoolName && (
                            <>
                              <span className="text-muted-foreground" aria-hidden="true">·</span>
                              <span className="text-primary font-semibold">{booking.schoolName}</span>
                            </>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          {booking.type === 'inquiry' ? (
                            <span>
                              Request: <strong className="text-foreground">{booking.inquiryType}</strong>
                            </span>
                          ) : (
                            <span>
                              Child: <strong className="text-foreground">{booking.childAge}</strong>
                            </span>
                          )}
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-1 font-mono tabular-nums">
                            <Calendar className="h-3 w-3" /> {booking.tourDate} ({booking.timeSlot})
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-1 font-mono tabular-nums">
                            <Phone className="h-3 w-3" /> {booking.phone}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {booking.email}
                          </span>
                        </div>

                        {booking.message && (
                          <p className="text-xs text-foreground/85 pt-1">
                            Note: &ldquo;{booking.message}&rdquo;
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
                        {booking.status === 'pending' ? (
                          <Button
                            size="sm"
                            onClick={() => handleConfirmTour(booking.id)}
                            className="font-semibold whitespace-nowrap"
                          >
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                            {booking.type === 'inquiry' ? 'Mark Replied' : 'Accept Tour'}
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled className="text-emerald-600 whitespace-nowrap">
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Confirmed
                          </Button>
                        )}

                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          onClick={() => setWhatsAppClicks((c) => c + 1)}
                          className="border-emerald-600/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 font-semibold whitespace-nowrap"
                        >
                          <a href={whatsAppReplyUrl} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="mr-1.5 h-3.5 w-3.5" /> WhatsApp Parent
                          </a>
                        </Button>

                        <Button asChild size="sm" variant="ghost" className="whitespace-nowrap">
                          <a href={`tel:${booking.phone}`}>Call</a>
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: EDIT PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="max-w-2xl bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-5">
              <div>
                <h3 className="font-heading text-lg font-bold text-foreground">Update Parent-Facing Information</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Completing all fields raises your Profile Strength to 100% and unlocks the Fast Responder badge.
                </p>
              </div>

              {savedNotice && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 text-emerald-800 dark:text-emerald-200 rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Changes saved! Your public directory listing and Profile Strength are updated in real time.</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="schoolName" className="text-xs font-semibold">School Name</Label>
                <Input
                  id="schoolName"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="monthlyFee" className="text-xs font-semibold">Monthly Tuition Fee (ZAR)</Label>
                  <Input
                    id="monthlyFee"
                    type="number"
                    value={monthlyFee}
                    onChange={(e) => setMonthlyFee(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="capacity" className="text-xs font-semibold">Maximum Capacity (Learners)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="whatsappPhone" className="text-xs font-semibold">Verified WhatsApp Phone (SA)</Label>
                  <Input
                    id="whatsappPhone"
                    type="tel"
                    placeholder="e.g. 082 555 1829"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="npoNumber" className="text-xs font-semibold">DSD / NPO Registration Number</Label>
                  <Input
                    id="npoNumber"
                    placeholder="e.g. 248-901 NPO"
                    value={npoNumber}
                    onChange={(e) => setNpoNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="hours" className="text-xs font-semibold">Operating Hours</Label>
                <Input
                  id="hours"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  placeholder="e.g. 07:00 - 17:30 Monday - Friday"
                  required
                />
              </div>

              <Button type="submit" className="font-semibold">
                <Save className="mr-2 h-4 w-4" /> Save Listing Changes
              </Button>
            </form>
          )}

          {/* TAB 3: FREE SCHOOL WEBSITE */}
          {activeTab === 'website' && (
            <div className="space-y-6">
              {currentMonthlyPrice < TiersConfig.PRO_FEATURED.monthlyPriceZAR && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-foreground">
                    <strong>Interactive Preview Mode:</strong> Customizing your microsite is live to preview below. Publish your custom website free with the <strong>Featured Top Slot (R{TiersConfig.PRO_FEATURED.monthlyPriceZAR}/mo)</strong> plan.
                  </div>
                  <Button asChild size="sm" className="shrink-0 font-semibold">
                    <Link href="/pricing">Upgrade to R{TiersConfig.PRO_FEATURED.monthlyPriceZAR}/mo</Link>
                  </Button>
                </div>
              )}
              <SchoolMicrositeBuilder />
            </div>
          )}

          {/* TAB 4: BILLING & RETENTION */}
          {activeTab === 'billing' && (
            <div className="max-w-3xl bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-heading text-lg font-bold text-foreground">
                    Stitch Money Subscription &amp; ROI Tracker
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Flexible monthly or annual billing with instant 30-day seasonal pause protection.
                  </p>
                </div>
                <span className="text-xs font-mono font-semibold text-emerald-600">
                  {activePlan?.status === 'paused'
                    ? `Paused until ${activePlan.pauseUntilDate}`
                    : 'Active · Renews Next Month'}
                </span>
              </div>

              <div className="p-4 bg-muted/40 rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-foreground text-sm">
                    {activePlan?.tierName || 'Verified Centre Plan'}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    Active via Stitch Capitec Pay / Instant EFT ·{' '}
                    <span className="capitalize">{activePlan?.billingCycle || 'monthly'}</span> billing
                  </span>
                </div>
                <div className="sm:text-right font-mono tabular-nums">
                  <span className="font-extrabold text-lg text-foreground">R{currentMonthlyPrice}.00 / mo</span>
                  <span className="block text-[11px] text-emerald-600 font-sans font-semibold">
                    1 Enrolled Learner = R{annualTuitionPerChild.toLocaleString()}/yr ({roiMultiple}x ROI)
                  </span>
                </div>
              </div>

              {/* Tuition ROI Breakdown */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2 text-xs">
                <div className="flex items-center justify-between font-semibold text-foreground">
                  <span>Your School&apos;s Enrollment ROI Math</span>
                  <span className="font-mono tabular-nums text-primary">
                    {bookings.length} Leads Generated · {whatsAppClicks} WhatsApp Enquiries
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  At your current tuition of <strong className="text-foreground font-mono">R{numericMonthlyFee.toLocaleString()}/mo</strong>, enrolling just <strong>1 child</strong> from your NurseryNet directory leads generates <strong className="text-foreground font-mono">R{annualTuitionPerChild.toLocaleString()}</strong> in annual tuition—covering your subscription more than <strong className="text-primary font-mono">{roiMultiple} times over</strong>.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/pricing">Upgrade or Change Plan</Link>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRetentionModalOpen(true)}
                >
                  Pause, Downgrade or Cancel Plan
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/dashboard/roadmap">View Feature Roadmap</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Subscription Pause, Downgrade & ROI Save Modal */}
      <Dialog open={retentionModalOpen} onOpenChange={setRetentionModalOpen}>
        <DialogContent className="max-w-lg p-6 rounded-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl font-bold text-foreground">
              Flexible Subscription Options for {schoolName}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Before cancelling your verified placement, choose a flexible option below to protect your school&apos;s search ranking and parent lead inbox.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {/* ROI Reminder Banner */}
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1">
              <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                <span>Live Activity on Your Listing</span>
                <span className="font-mono tabular-nums">{bookings.length} Tours · 248 Views</span>
              </div>
              <p className="text-muted-foreground">
                1 enrolled learner brings <strong className="text-foreground font-mono">R{annualTuitionPerChild.toLocaleString()}/yr</strong> in tuition vs. <strong className="text-foreground font-mono">R{currentMonthlyPrice}/mo</strong>.
              </p>
            </div>

            {/* Option 1: Pause for 30 Days */}
            <div className="p-4 rounded-xl border border-border bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <PauseCircle className="w-4 h-4 text-primary" />
                  <span>Pause Billing for 30 Days (R0 Next Month)</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Ideal for school holidays or when your classes are at 100% capacity. Keeps your DSD Verified badge intact.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => handleApplyRetentionOption('pause')}
                className="whitespace-nowrap shrink-0 font-semibold"
              >
                Pause 30 Days
              </Button>
            </div>

            {/* Option 2: Step Down to Verified (R149/mo) */}
            {currentMonthlyPrice > TiersConfig.VERIFIED.monthlyPriceZAR && (
              <div className="p-4 rounded-xl border border-border bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <ArrowDownCircle className="w-4 h-4 text-emerald-600" />
                    <span>Step Down to Verified Centre (R149/mo)</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Save R241/mo while keeping your Green Verified Shield and direct WhatsApp/Email tour booking inbox.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleApplyRetentionOption('downgrade_verified')}
                  className="whitespace-nowrap shrink-0 font-semibold"
                >
                  Switch to R149/mo
                </Button>
              </div>
            )}

            {/* Option 3: Switch to Annual & Save 15% */}
            <div className="p-4 rounded-xl border border-border bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Lock In 15% Off with Annual Billing</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Reduce your effective monthly rate by 15% for the academic year.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleApplyRetentionOption('switch_annual')}
                className="whitespace-nowrap shrink-0 font-semibold"
              >
                Apply 15% Discount
              </Button>
            </div>

            {/* Option 4: Downgrade to Free Public Listing */}
            <div className="pt-2 border-t border-border flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                Still want to switch to an unverified R0/mo basic listing?
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleApplyRetentionOption('downgrade_free')}
                className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 whitespace-nowrap shrink-0"
              >
                Downgrade to Free
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
