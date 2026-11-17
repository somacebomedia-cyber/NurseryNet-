"use client";

import { useState } from 'react';
import { Preschool } from '@/data/preschools';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Calendar, Clock, CheckCircle, User, Phone, Mail, Sparkles, MapPin, MessageCircle, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TourBookingModalProps {
  preschool: Preschool | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatSaWhatsAppNumber(rawPhone?: string): string {
  const digits = (rawPhone || '0825551234').replace(/\D/g, '');
  if (digits.startsWith('27') && digits.length >= 11) return digits;
  if (digits.startsWith('0') && digits.length >= 10) return `27${digits.slice(1)}`;
  return `27${digits}`;
}

export default function TourBookingModal({ preschool, isOpen, onClose }: TourBookingModalProps) {
  const { toast } = useToast();
  const [parentName, setParentName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [childAge, setChildAge] = useState('2-3 years');
  const [tourDate, setTourDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('09:30 AM (Morning Circle)');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  if (!preschool) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName || !email || !phone) {
      toast({
        title: "Required Fields Missing",
        description: "Please provide your name, email, and phone number to schedule the tour.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsBooked(true);

      // Save to localStorage for Owner Dashboard persistence
      try {
        const stored = JSON.parse(localStorage.getItem('nurserynet_tours') || '[]');
        const newTour = {
          id: `tour-${Date.now()}`,
          type: 'tour',
          status: 'pending',
          schoolId: preschool.id,
          schoolName: preschool.name,
          parentName,
          email,
          phone,
          childAge,
          tourDate,
          timeSlot,
          notes,
          bookedAt: new Date().toISOString(),
        };
        localStorage.setItem('nurserynet_tours', JSON.stringify([newTour, ...(Array.isArray(stored) ? stored : [])]));
        window.dispatchEvent(new Event('nurserynet_leads_updated'));
      } catch (err) {
        console.error('Failed to store booked tour', err);
      }

      toast({
        title: "Tour Scheduled Successfully!",
        description: `Your appointment with ${preschool.name} is confirmed for ${tourDate} at ${timeSlot}.`,
      });
    }, 500);
  };

  const handleDownloadCalendarInvite = () => {
    const cleanDate = tourDate.replace(/-/g, '');
    const startHour = timeSlot.includes('11:30') ? '113000' : timeSlot.includes('14:30') ? '143000' : '093000';
    const endHour = timeSlot.includes('11:30') ? '123000' : timeSlot.includes('14:30') ? '153000' : '103000';
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//NurseryNet South Africa//Campus Tour//EN',
      'BEGIN:VEVENT',
      `UID:tour-${Date.now()}@nurserynet.app`,
      `DTSTAMP:${cleanDate}T080000Z`,
      `DTSTART:${cleanDate}T${startHour}`,
      `DTEND:${cleanDate}T${endHour}`,
      `SUMMARY:Preschool Tour: ${preschool.name}`,
      `LOCATION:${(preschool.address || preschool.city || '').replace(/,/g, '\\,')}`,
      `DESCRIPTION:Private Preschool Tour for ${parentName} (${childAge}). Host: ${preschool.principal} (Principal). Phone: ${preschool.phone || 'On file'}.`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${preschool.slug || 'preschool'}-tour-invite.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Calendar Invite Downloaded',
      description: 'Open the .ics file to add this campus visit to Google, Apple, or Outlook Calendar.',
    });
  };

  const whatsAppPrincipalUrl = `https://wa.me/${formatSaWhatsAppNumber(preschool.phone)}?text=${encodeURIComponent(
    `Hi ${preschool.principal || preschool.name}, I just booked a campus tour via NurseryNet for ${tourDate} at ${timeSlot}.\n\nParent: ${parentName}\nChild Age: ${childAge}\nPhone: ${phone}${notes ? `\nNotes: ${notes}` : ''}\n\nLooking forward to visiting!`
  )}`;

  const handleResetAndClose = () => {
    setIsBooked(false);
    setParentName('');
    setEmail('');
    setPhone('');
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && handleResetAndClose()}>
      <DialogContent className="max-w-lg p-6 rounded-2xl bg-card border-border">
        {isBooked ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div>
              <DialogTitle className="font-heading text-2xl font-bold text-foreground">
                Tour Confirmed!
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1.5 max-w-sm mx-auto">
                Your campus visit with <strong>{preschool.name}</strong> has been logged in the Principal&apos;s Owner Dashboard.
              </DialogDescription>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border text-left text-xs space-y-2 font-mono tabular-nums">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-sans">Date:</span>
                <span className="font-semibold text-foreground">{tourDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-sans">Time Slot:</span>
                <span className="font-semibold text-foreground">{timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-sans">Address:</span>
                <span className="font-semibold text-foreground font-sans text-right">{preschool.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-sans">Host:</span>
                <span className="font-semibold text-foreground font-sans">{preschool.principal} (Principal)</span>
              </div>
            </div>

            {/* Instant Follow-Up & Calendar Lock-In Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <Button
                asChild
                className="w-full h-11 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                <a href={whatsAppPrincipalUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4 mr-1.5" />
                  WhatsApp Principal Now
                </a>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadCalendarInvite}
                className="w-full h-11 rounded-xl font-bold text-xs border-primary/40 text-primary hover:bg-primary/10"
              >
                <Download className="w-4 h-4 mr-1.5" />
                Add to Calendar (.ics)
              </Button>
            </div>

            <div className="pt-1 flex flex-col gap-2">
              <Button
                variant="ghost"
                onClick={handleResetAndClose}
                className="w-full h-10 rounded-xl font-semibold text-xs text-muted-foreground hover:text-foreground"
              >
                Back to Directory
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider">
                <Calendar className="w-4 h-4" />
                Schedule a Visit
              </div>
              <DialogTitle className="font-heading text-xl font-bold text-foreground">
                Visit {preschool.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Meet the teachers, explore the classrooms, and experience the learning atmosphere in person.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 pt-2">
              {/* Date & Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    required
                    value={tourDate}
                    onChange={(e) => setTourDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Time Slot
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  >
                    <option value="09:30 AM (Morning Circle)">09:30 AM (Morning Circle)</option>
                    <option value="11:30 AM (Outdoor Play & Lunch)">11:30 AM (Play & Lunch)</option>
                    <option value="14:30 PM (Afternoon Creative)">14:30 PM (Afternoon Creative)</option>
                  </select>
                </div>
              </div>

              {/* Parent Info */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Parent / Guardian Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sindi Khumalo"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="parent@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Phone / WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      placeholder="+27 82 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Child Age */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Child's Current Age / Stage
                </label>
                <select
                  value={childAge}
                  onChange={(e) => setChildAge(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                >
                  <option value="Infant (3–12 months)">Infant (3–12 months)</option>
                  <option value="Toddler (1–2 years)">Toddler (1–2 years)</option>
                  <option value="Preschool (2–4 years)">Preschool (2–4 years)</option>
                  <option value="Pre-Primary / Grade R (5–6 years)">Pre-Primary / Grade R (5–6 years)</option>
                </select>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Special Interests or Questions (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Dietary requirements, potty training support, transport need..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="text-xs h-10 px-4 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="text-xs font-bold h-10 px-6 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-md"
              >
                {isSubmitting ? 'Confirming...' : 'Confirm Tour Booking'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
