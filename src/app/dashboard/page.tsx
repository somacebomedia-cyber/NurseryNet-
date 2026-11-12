// src/app/dashboard/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useBrand } from '@/context/BrandContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Eye, 
  MessageSquare, 
  ShieldCheck, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Phone, 
  Mail, 
  Save, 
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';

interface TourBooking {
  id: string;
  parentName: string;
  childAge: string;
  tourDate: string;
  timeSlot: string;
  phone: string;
  email: string;
  status: 'pending' | 'confirmed' | 'completed';
}

export default function DashboardPage() {
  const { brand } = useBrand();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'leads' | 'profile' | 'billing'>('leads');
  const [activePlan, setActivePlan] = useState<{ tierName: string; schoolName: string } | null>(null);

  // Edit form states
  const [schoolName, setSchoolName] = useState('Sunshine Early Learning Centre');
  const [monthlyFee, setMonthlyFee] = useState('1450');
  const [operatingHours, setOperatingHours] = useState('07:00 - 17:30');
  const [capacity, setCapacity] = useState('45');
  const [savedNotice, setSavedNotice] = useState(false);

  const [bookings, setBookings] = useState<TourBooking[]>([
    {
      id: 'tour-101',
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
      parentName: 'Sipho Zulu',
      childAge: '4 years old (Grade RR)',
      tourDate: '2026-11-22',
      timeSlot: '14:00 PM',
      phone: '071 889 0012',
      email: 'sipho.zulu@work.co.za',
      status: 'pending',
    },
  ]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('nurserynet_active_plan');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setActivePlan(parsed);
          if (parsed.schoolName) setSchoolName(parsed.schoolName);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const handleConfirmTour = (id: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'confirmed' } : b));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Banner */}
      <section className="py-10 bg-muted/30 border-b border-border/40">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-0.5 rounded-full">
                  Principal & Owner Portal
                </span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> DSD Verified Listing
                </span>
              </div>
              <h1 className="font-heading text-3xl font-extrabold text-foreground">
                {schoolName}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Active Plan: <strong className="text-primary">{activePlan?.tierName || 'Verified Centre (R349/mo)'}</strong> · Connected to South African Directory
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/directory">View Public Profile</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/pricing">Upgrade Placement</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Stats KPI Cards */}
      <section className="py-8">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-5 bg-card border border-border rounded-xl shadow-sm">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold mb-2">
                <span>Profile Views (30d)</span>
                <Eye className="h-4 w-4 text-primary" />
              </div>
              <div className="font-heading text-3xl font-extrabold text-foreground font-mono tabular-nums">
                248
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">+18% vs last month</span>
            </div>

            <div className="p-5 bg-card border border-border rounded-xl shadow-sm">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold mb-2">
                <span>Tour Bookings</span>
                <Calendar className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="font-heading text-3xl font-extrabold text-foreground font-mono tabular-nums">
                {bookings.length}
              </div>
              <span className="text-[11px] text-muted-foreground">2 pending confirmation</span>
            </div>

            <div className="p-5 bg-card border border-border rounded-xl shadow-sm">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold mb-2">
                <span>WhatsApp Clicks</span>
                <Phone className="h-4 w-4 text-amber-500" />
              </div>
              <div className="font-heading text-3xl font-extrabold text-foreground font-mono tabular-nums">
                39
              </div>
              <span className="text-[11px] text-muted-foreground">Direct parent enquiries</span>
            </div>

            <div className="p-5 bg-card border border-border rounded-xl shadow-sm">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold mb-2">
                <span>Response Time</span>
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div className="font-heading text-3xl font-extrabold text-foreground font-mono tabular-nums">
                1.4 hrs
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">Fast Responder Badge</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-border mb-8 flex gap-2">
            <button
              onClick={() => setActiveTab('leads')}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'leads'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Tour Bookings & Inbound Leads ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'profile'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Edit School Profile
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'billing'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Subscription & Invoicing
            </button>
          </div>

          {/* TAB 1: LEADS INBOX */}
          {activeTab === 'leads' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Recent Parent Tour Requests
                </h3>
                <span className="text-xs text-muted-foreground">
                  Notifications are mirrored to your verified WhatsApp phone
                </span>
              </div>

              {bookings.map((booking) => (
                <div 
                  key={booking.id}
                  className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-heading font-bold text-base text-foreground">{booking.parentName}</h4>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        booking.status === 'confirmed' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>Child: <strong>{booking.childAge}</strong></span>
                      <span>·</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="h-3 w-3" /> {booking.tourDate} at {booking.timeSlot}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {booking.phone}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {booking.status === 'pending' ? (
                      <Button 
                        size="sm" 
                        onClick={() => handleConfirmTour(booking.id)}
                        className="w-full sm:w-auto font-semibold"
                      >
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Accept Tour
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled className="w-full sm:w-auto text-emerald-600">
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Confirmed
                      </Button>
                    )}
                    <Button asChild size="sm" variant="outline">
                      <a href={`tel:${booking.phone}`}>Call Parent</a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: EDIT PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="max-w-2xl bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-5">
              <h3 className="font-heading text-lg font-bold text-foreground">Update Parent-Facing Information</h3>

              {savedNotice && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 text-emerald-800 dark:text-emerald-200 rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Changes saved! Your public directory listing is updated in real time.</span>
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

              <div className="grid grid-cols-2 gap-4">
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

          {/* TAB 3: BILLING */}
          {activeTab === 'billing' && (
            <div className="max-w-2xl bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6">
              <h3 className="font-heading text-lg font-bold text-foreground">Stitch Money Subscription</h3>

              <div className="p-4 bg-muted/40 rounded-xl border border-border flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-foreground text-sm">{activePlan?.tierName || 'Verified Centre Plan'}</h4>
                  <span className="text-xs text-muted-foreground">Active via Stitch Capitec Pay / Instant EFT</span>
                </div>
                <div className="text-right">
                  <span className="font-bold font-mono text-foreground">R349.00 / mo</span>
                  <span className="block text-[11px] text-emerald-600 font-semibold">Renews Next Month</span>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <Button asChild>
                  <Link href="/pricing">Change Subscription Plan</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard/roadmap">View Feature Roadmap</Link>
                </Button>
              </div>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
