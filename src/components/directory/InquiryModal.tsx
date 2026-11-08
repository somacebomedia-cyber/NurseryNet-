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
import { Mail, CheckCircle, User, Phone, Send, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InquiryModalProps {
  preschool: Preschool | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function InquiryModal({ preschool, isOpen, onClose }: InquiryModalProps) {
  const { toast } = useToast();
  const [parentName, setParentName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [inquiryType, setInquiryType] = useState('Full Fee Structure & Brochure');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  if (!preschool) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName || !email) {
      toast({
        title: "Required Information Missing",
        description: "Please enter your name and email address.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);

      toast({
        title: "Inquiry Sent to Admissions",
        description: `${preschool.name}'s admissions coordinator (${preschool.email}) has received your inquiry.`,
      });
    }, 500);
  };

  const handleResetAndClose = () => {
    setIsSent(false);
    setParentName('');
    setEmail('');
    setPhone('');
    setMessage('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && handleResetAndClose()}>
      <DialogContent className="max-w-md p-6 rounded-2xl bg-card border-border">
        {isSent ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <DialogTitle className="font-heading text-xl font-bold text-foreground">
                Inquiry Sent!
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-2 max-w-xs mx-auto">
                Thank you, {parentName}. <strong>{preschool.name}</strong> will email you the requested admissions package within 24 hours.
              </DialogDescription>
            </div>
            <Button
              onClick={handleResetAndClose}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-xl font-bold text-xs"
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                <Mail className="w-4 h-4" />
                Admissions Office
              </div>
              <DialogTitle className="font-heading text-lg font-bold text-foreground">
                Inquire with {preschool.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Get tuition fee schedules, application forms, or ask about curriculum placement.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  What would you like to receive?
                </label>
                <select
                  value={inquiryType}
                  onChange={(e) => setInquiryType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                >
                  <option value="Full Fee Structure & Brochure">Full Fee Structure & Brochure</option>
                  <option value="Admission Application Forms">Admission Application Forms</option>
                  <option value="Waitlist & Availability Check">Waitlist & Availability Check</option>
                  <option value="Special Care / Dietary Questions">Special Care / Dietary Questions</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kagiso Dlamini"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.co.za"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Phone / WhatsApp (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="+27 83 555 1234"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Message / Specific Questions
                </label>
                <textarea
                  rows={3}
                  placeholder="Ask about sibling discounts, teacher qualifications, potty training requirements..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
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
                className="text-xs font-bold h-10 px-5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
              >
                {isSubmitting ? 'Sending...' : 'Send Inquiry'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
