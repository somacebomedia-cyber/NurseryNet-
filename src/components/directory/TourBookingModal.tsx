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
import { Calendar, Clock, CheckCircle, User, Phone, Mail, Sparkles, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TourBookingModalProps {
  preschool: Preschool | null;
  isOpen: boolean;
  onClose: () => void;
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

      // Save to localStorage for persistence
      try {
        const stored = JSON.parse(localStorage.getItem('nurserynet_tours') || '[]');
        stored.push({
          schoolId: preschool.id,
          schoolName: preschool.name,
          parentName,
          email,
          phone,
          childAge,
          tourDate,
          timeSlot,
          bookedAt: new Date().toISOString()
        });
        localStorage.setItem('nurserynet_tours', JSON.stringify(stored));
      } catch (err) {
        console.error('Failed to store booked tour', err);
      }

      toast({
        title: "Tour Scheduled Successfully! 🎉",
        description: `Your appointment with ${preschool.name} is confirmed for ${tourDate} at ${timeSlot}. Check your email for directions.`,
      });
    }, 600);
  };

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
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div>
              <DialogTitle className="font-heading text-2xl font-bold text-foreground">
                Tour Confirmed!
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                We've reserved your private campus tour with <strong>{preschool.name}</strong>.
              </DialogDescription>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-semibold text-foreground">{tourDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time Slot:</span>
                <span className="font-semibold text-foreground">{timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Address:</span>
                <span className="font-semibold text-foreground text-right">{preschool.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Host:</span>
                <span className="font-semibold text-foreground">{preschool.principal} (Principal)</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Button
                onClick={handleResetAndClose}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-xl font-bold"
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
