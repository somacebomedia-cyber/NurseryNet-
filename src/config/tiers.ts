/**
 * NurseryNet - Subscription Tier Architecture
 * Path: src/config/tiers.ts
 *
 * Monetization model for preschool listings. Free listings are sourced from
 * official government open data; paid tiers add visibility, lead routing,
 * and a complimentary school website in the top tier.
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
  includesFreeWebsite: boolean;
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
    includesFreeWebsite: false,
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
    monthlyPriceZAR: 149,
    annualPriceZAR: 1520, // ~15% annual discount (R149 * 12 * 0.85)
    isPinnedTopSlot: false,
    hasVerifiedBadge: true,
    directLeadRouting: true,
    includesFreeWebsite: false,
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
    tagline: 'Top search placement + your own Free Custom School Website',
    monthlyPriceZAR: 390,
    annualPriceZAR: 3980, // ~15% annual discount (R390 * 12 * 0.85)
    isPinnedTopSlot: true,
    hasVerifiedBadge: true,
    directLeadRouting: true,
    includesFreeWebsite: true,
    maxGalleryImages: 20,
    features: [
      'Free Custom School Website (mobile-ready microsite + tour booking)',
      'Everything included in Verified Centre',
      'Pinned #1 Top Slot in your municipality search results',
      'Featured badge & gold border on directory cards',
      'Priority placement in monthly City Parent Guides',
      'Full Analytics Dashboard: views, phone clicks, conversion funnel',
    ],
  };

  static all(): SubscriptionTier[] {
    return [TiersConfig.FREE, TiersConfig.VERIFIED, TiersConfig.PRO_FEATURED];
  }
}
