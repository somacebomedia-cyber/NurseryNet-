/**
 * NurseryNet - Subscription Tier Architecture
 * Path: src/config/tiers.ts
 *
 * Monetization model for preschool listings. Free listings are sourced from
 * official government open data; paid tiers add visibility and lead routing.
 */

export interface SubscriptionTier {
  id: 'free' | 'verified' | 'pro_featured';
  name: string;
  tagline: string;
  monthlyPriceZAR: number;
  annualPriceZAR: number;
  isPinnedTopSlot: boolean;
  hasVerifiedBadge: boolean;
  directLeadRouting: boolean;
  maxGalleryImages: number;
  popular?: boolean;
  features: string[];
}

export class TiersConfig {
  static readonly FREE: SubscriptionTier = {
    id: 'free',
    name: 'Free Listing',
    tagline: 'Standard listing on national ECD index',
    monthlyPriceZAR: 0,
    annualPriceZAR: 0,
    isPinnedTopSlot: false,
    hasVerifiedBadge: false,
    directLeadRouting: false,
    maxGalleryImages: 1,
    features: [
      'Basic profile from official DSD audit data',
      'Appear in province & municipality search results',
      'Parents contact you via public phone directory',
      'Census 2021 municipal fee benchmark display',
    ],
  };

  static readonly VERIFIED: SubscriptionTier = {
    id: 'verified',
    name: 'Verified Centre',
    tagline: 'Claim your profile and receive direct tour bookings',
    monthlyPriceZAR: 349,
    annualPriceZAR: 3550, // ~15% discount
    isPinnedTopSlot: false,
    hasVerifiedBadge: true,
    directLeadRouting: true,
    maxGalleryImages: 8,
    popular: true,
    features: [
      'Official Green Verified Trust Badge after ownership proof',
      'Claim & edit all profile details (fees, meals, hours, ratios)',
      'Direct Tour Booking & Enquiry Lead Inbox (Email + WhatsApp)',
      'Up to 8 high-resolution photos & facility gallery',
      'Fast response badge displayed to prospective parents',
      'Access to Free School Growth Kit & document templates',
    ],
  };

  static readonly PRO_FEATURED: SubscriptionTier = {
    id: 'pro_featured',
    name: 'Featured Top Slot',
    tagline: 'Maximum visibility & top placement in your area',
    monthlyPriceZAR: 690,
    annualPriceZAR: 7000,
    isPinnedTopSlot: true,
    hasVerifiedBadge: true,
    directLeadRouting: true,
    maxGalleryImages: 20,
    features: [
      'Everything included in Verified Centre',
      'Pinned #1 Top Slot in your municipality search results',
      'Featured badge & gold border on directory cards',
      'Priority placement in monthly City Parent Guides',
      'Full Analytics Dashboard: views, phone clicks, conversion funnel',
      'Dedicated listing manager & priority WhatsApp support',
    ],
  };

  static all(): SubscriptionTier[] {
    return [TiersConfig.FREE, TiersConfig.VERIFIED, TiersConfig.PRO_FEATURED];
  }
}
