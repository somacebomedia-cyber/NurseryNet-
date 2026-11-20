import realPreschoolsData from './real-preschools.json';
import ecdBenchmarksData from './ecd-benchmarks.json';
import { PRIMARY_SCHOOL_GRADE_R_UNITS } from './primary-grade-r-schools';
import {
  MAX_PRESCHOOL_PROFILE_PHOTOS,
  normalizeSchoolWebsiteOrSocialUrl,
  resolveRealPreschoolImages,
} from '@/lib/real-website-photos';

export type Province =
  | 'Western Cape'
  | 'Gauteng'
  | 'KwaZulu-Natal'
  | 'Eastern Cape'
  | 'Mpumalanga'
  | 'Limpopo'
  | 'North West'
  | 'Free State'
  | 'Northern Cape';

export type City = string;

export type Curriculum =
  | 'Montessori'
  | 'Reggio Emilia'
  | 'Play-Based'
  | 'CAPS'
  | 'Waldorf'
  | 'Other / General'
  | string;

export type EnrollmentStatus = 'Admissions Open' | 'Limited Spots' | 'Waitlist Only';

export type InstitutionType = 'preschool' | 'primary-grade-r';

export interface GradeRDetails {
  hasDedicatedReceptionUnit: boolean;
  receptionUnitName?: string;
  parentPrimarySchoolName?: string;
  grade1FeederPriority: boolean;
  feederPolicySummary?: string;
  primarySportsAndExtramurals: string[];
  aftercareIncluded?: boolean;
  governingBody?: 'Public Section 21 / Quintile 5' | 'Independent / IEB' | 'Public Primary School' | string;
}

export interface ParentReview {
  id: string;
  author: string;
  childAge: string;
  date: string;
  rating: number;
  comment: string;
}

export interface Preschool {
  id: string;
  slug?: string;
  name: string;
  tagline: string;
  description: string;
  institutionType?: InstitutionType;
  gradeRDetails?: GradeRDetails;
  province?: Province | string;
  district?: string;
  educationDistrict?: string;
  city: string;
  suburb: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  curriculum: Curriculum;
  ageRange: string;
  minAgeMonths: number;
  maxAgeMonths: number;
  monthlyFeeZAR: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  dsdRegistration?: 'Full' | 'Conditional' | 'Not Registered' | 'In Process' | string;
  isSubsidised?: boolean;
  npoNumber?: string | null;
  municipality?: string;
  wardId?: string | null;
  emisNumber?: string;
  sourceId?: string;
  primaryLanguage?: string;
  status: EnrollmentStatus;
  teacherRatio: string;
  operatingHours: string;
  facilities: string[];
  images: string[];
  phone: string;
  email: string;
  websiteUrl?: string;
  principal: string;
  reviews: ParentReview[];
  isClaimed?: boolean;
  claimedAt?: string | null;
}

export const PROVINCES: Province[] = [
  'Western Cape',
  'Gauteng',
  'KwaZulu-Natal',
  'Eastern Cape',
  'Mpumalanga',
  'Limpopo',
  'North West',
  'Free State',
  'Northern Cape',
];

export const CITIES = [
  'Johannesburg',
  'Cape Town',
  'Durban',
  'Pretoria',
  'Umzimkhulu',
  'Elsiesriver',
  'Khayelitsha',
  'Mitchells Plain',
  'Durbanville',
  'Milnerton',
  'Strand',
  'George',
  'Acornhoek',
  'Mkhuhlu',
  'Hluhluwe',
  'Jozini',
  'Thembisa',
  'Soweto',
  'Hout Bay',
  'Parow',
  'Mamelodi',
  'Gqeberha',
  'Somerset West',
  'Rustenburg',
];

export const CURRICULUMS: Curriculum[] = [
  'Montessori',
  'Reggio Emilia',
  'Play-Based',
  'CAPS',
  'Waldorf',
];

export const ALL_FACILITIES = [
  'Dedicated Grade R Reception Unit',
  'Grade 1 Feeder Priority',
  'Primary School Sports & Extramurals',
  'Grade R Readiness',
  'CCTV Security',
  'Nutritious Meals',
  'Aftercare Available',
  'Sensory Garden',
  'Extramural Sports',
  'Transport Service',
  'Swimming Lessons',
  'Solar Back-up Power',
  'Lockable Gate',
  'Secure Perimeter Fence',
  'Outdoor Playground',
];

export const ECD_BENCHMARKS = ecdBenchmarksData;

export const FEATURED_PRESCHOOLS: Preschool[] = [
  ...PRIMARY_SCHOOL_GRADE_R_UNITS,
  {
    id: 'nawi-learn-toddler-centre-umzimkhulu',
    slug: 'nawi-learn-toddler-centre-umzimkhulu',
    name: 'Nawi Learn Toddler Centre',
    tagline: 'Nurturing early childhood learning, joyful outdoor play, and school readiness in Umzimkhulu.',
    description:
      'Nawi Learn Toddler Centre is a dedicated early childhood development centre in Umzimkhulu, KwaZulu-Natal, offering a warm, safe, and stimulating play-based curriculum where toddlers and young learners build foundational literacy, numeracy, and social confidence.',
    province: 'KwaZulu-Natal',
    district: 'Harry Gwala',
    educationDistrict: 'HARRY GWALA',
    city: 'Umzimkhulu',
    suburb: 'Skoonplaas / Umzimkhulu',
    address: 'Erf 28 Riverbend Road, Skoonplaas, Umzimkhulu, KwaZulu-Natal, 3297',
    latitude: -30.2633,
    longitude: 29.9389,
    curriculum: 'Play-Based',
    ageRange: '12 months – 5 years',
    minAgeMonths: 12,
    maxAgeMonths: 60,
    monthlyFeeZAR: 950,
    rating: 5.0,
    reviewCount: 28,
    isVerified: true,
    dsdRegistration: 'Full',
    isSubsidised: false,
    npoNumber: '248-901 NPO',
    municipality: 'Umzimkhulu',
    sourceId: 'DSD-KZN-UMZ-001',
    primaryLanguage: 'English & isiZulu',
    status: 'Admissions Open',
    teacherRatio: '1:5',
    operatingHours: '07:00 – 17:00',
    facilities: [
      'Lockable Gate',
      'Secure Perimeter Fence',
      'Nutritious Meals',
      'Outdoor Playground',
      'Aftercare Available',
      'Grade R Readiness',
    ],
    images: [
      '/images/preschools/nawi-learn-cover-1.jpg',
      '/images/preschools/nawi-learn-cover-2.jpg',
      '/images/preschools/nawi-learn-outdoor-3.jpg',
      '/images/preschools/nawi-learn-learners-4.jpg',
      '/images/preschools/nawi-learn-play-5.jpg',
      '/images/preschools/nawi-learn-friends-6.jpg',
    ],
    phone: '+27 79 448 6843',
    email: 'info@nawilearn.co.za',
    websiteUrl: 'https://www.nawilearn.co.za',
    principal: 'Principal / ECD Director',
    reviews: [
      {
        id: 'r-nawi-1',
        author: 'Zanele M.',
        childAge: 'Child aged 3 yrs',
        date: 'November 2026',
        rating: 5,
        comment:
          'Nawi Learn has been a blessing for our family in Umzimkhulu. The teachers are so loving, the outdoor play area is spotless and safe, and our little one looks forward to school every morning.',
      },
      {
        id: 'r-nawi-2',
        author: 'Sibusiso & Thuli K.',
        childAge: 'Toddler aged 2 yrs',
        date: 'October 2026',
        rating: 5,
        comment:
          'Wonderful care, healthy snack times, and genuine communication with parents. Highly recommended!',
      },
    ],
  },
  {
    id: 'little-ashford-sandton',
    slug: 'little-ashford-sandton',
    name: 'Little Ashford Preschool Sandton',
    tagline: 'Reggio-inspired early learning fostering curiosity, imagination and confidence.',
    description:
      'Little Ashford Sandton provides a modern, child-centric early childhood experience nestled in quiet parklands near Sandton CBD. Our Reggio Emilia approach recognizes children as capable researchers of their world, supported by atelierista art studios and natural light classrooms.',
    province: 'Gauteng',
    district: 'City of Johannesburg',
    educationDistrict: 'JOHANNESBURG EAST',
    city: 'Johannesburg',
    suburb: 'Sandton',
    address: '14 Kelvin Drive, Morningside / Sandton, Johannesburg, 2196',
    latitude: -26.0754,
    longitude: 28.0611,
    curriculum: 'Reggio Emilia',
    ageRange: '3 months – 5 years',
    minAgeMonths: 3,
    maxAgeMonths: 60,
    monthlyFeeZAR: 6400,
    rating: 4.9,
    reviewCount: 38,
    isVerified: true,
    dsdRegistration: 'Full',
    isSubsidised: false,
    npoNumber: '048-161 NPO',
    municipality: 'City of Johannesburg',
    sourceId: 'DSD-JHB-04001',
    primaryLanguage: 'English',
    status: 'Admissions Open',
    teacherRatio: '1:4',
    operatingHours: '06:45 – 17:45',
    facilities: [
      'CCTV Security',
      'Nutritious Meals',
      'Aftercare Available',
      'Sensory Garden',
      'Extramural Sports',
      'Solar Back-up Power',
      'Lockable Gate',
      'Secure Perimeter Fence',
    ],
    images: [
      '/images/preschools/little-ashford-cover-1.jpg',
      '/images/preschools/little-ashford-campus-2.jpg',
      '/images/preschools/little-ashford-campus-3.jpg',
    ],
    phone: '+27 11 784 2190',
    email: 'sandton@littleashford.co.za',
    websiteUrl: 'https://littleashford.co.za',
    principal: 'Claire Van Der Merwe',
    reviews: [
      {
        id: 'r1',
        author: 'Noluthando M.',
        childAge: 'Child aged 3 yrs',
        date: 'October 2026',
        rating: 5,
        comment:
          'The atelier art studio and teachers have brought out such deep creativity in our daughter. The parent communication via the daily photo app is exceptional.',
      },
      {
        id: 'r2',
        author: 'David & Sarah B.',
        childAge: 'Baby aged 9 months',
        date: 'September 2026',
        rating: 5,
        comment:
          'Warmest baby room in Sandton! Clean, solar powered so load shedding never disrupts naps, and the 1:3 baby caregiver ratio gave us absolute peace of mind.',
      },
    ],
  },
  {
    id: 'pinelands-montessori',
    slug: 'pinelands-montessori',
    name: 'Pinelands Montessori Preschool',
    tagline: 'Authentic Montessori prepared environments cultivating curiosity and independence in Cape Town.',
    description:
      'Located in leafy Pinelands, Cape Town, Pinelands Montessori Preschool offers spacious indoor and outdoor Montessori learning spaces for toddlers and 3–6 year olds, guided by qualified Montessori directresses.',
    province: 'Western Cape',
    district: 'City of Cape Town',
    educationDistrict: 'METRO CENTRAL',
    city: 'Cape Town',
    suburb: 'Pinelands',
    address: 'Pinelands, Cape Town, Western Cape, 7405',
    latitude: -33.9345,
    longitude: 18.5032,
    curriculum: 'Montessori',
    ageRange: '18 months – 6 years',
    minAgeMonths: 18,
    maxAgeMonths: 72,
    monthlyFeeZAR: 5200,
    rating: 5.0,
    reviewCount: 42,
    isVerified: true,
    dsdRegistration: 'Full',
    isSubsidised: false,
    npoNumber: '019-354 NPO',
    municipality: 'City of Cape Town',
    sourceId: 'DSD-CPT-00412',
    primaryLanguage: 'English',
    status: 'Admissions Open',
    teacherRatio: '1:5',
    operatingHours: '07:30 – 17:00',
    facilities: [
      'CCTV Security',
      'Nutritious Meals',
      'Sensory Garden',
      'Outdoor Playground',
      'Aftercare Available',
      'Solar Back-up Power',
      'Lockable Gate',
      'Secure Perimeter Fence',
    ],
    images: [
      'https://pinelandsmontessori.co.za/_astro/hero.6aNz8wqQ_MoRFl.webp?dpl=dpl_Fq6R9YfCjCLkTeeVDE9ghtjEHsDZ',
      'https://pinelandsmontessori.co.za/_astro/playground.BC2MG3ee_Z2i9Wvo.webp?dpl=dpl_Fq6R9YfCjCLkTeeVDE9ghtjEHsDZ',
      'https://pinelandsmontessori.co.za/_astro/toddler.XJpsN3zC_Z1eKRuM.webp?dpl=dpl_Fq6R9YfCjCLkTeeVDE9ghtjEHsDZ',
      'https://pinelandsmontessori.co.za/_astro/3-6.BA2ml9yO_1NqF9G.webp?dpl=dpl_Fq6R9YfCjCLkTeeVDE9ghtjEHsDZ',
      'https://pinelandsmontessori.co.za/_astro/primary.KXIl2U9R_Z2gjsnV.webp?dpl=dpl_Fq6R9YfCjCLkTeeVDE9ghtjEHsDZ',
      'https://pinelandsmontessori.co.za/_astro/school.UJHE7c-D_20bL3x.webp?dpl=dpl_Fq6R9YfCjCLkTeeVDE9ghtjEHsDZ',
    ],
    phone: '+27 21 531 4820',
    email: 'info@pinelandsmontessori.co.za',
    websiteUrl: 'https://pinelandsmontessori.co.za',
    principal: 'Fiona MacGregor',
    reviews: [
      {
        id: 'r3',
        author: 'Liam O’Connor',
        childAge: 'Child aged 4 yrs',
        date: 'November 2026',
        rating: 5,
        comment:
          'Our son learned self-discipline, practical life skills, and loves the outdoor playground. The teachers are certified Montessori directresses of the highest caliber.',
      },
    ],
  },
  {
    id: 'nurture-and-nature-montessori-ballito',
    slug: 'nurture-and-nature-montessori-ballito',
    name: 'Nurture and Nature Montessori Preschool',
    tagline: 'Coastal Montessori preschool blending hands-on discovery with outdoor nature exploration.',
    description:
      'Situated on the KwaZulu-Natal North Coast, Nurture and Nature Montessori Preschool combines prepared Montessori classrooms with lush outdoor gardens, sensory play, and holistic early childhood development.',
    province: 'KwaZulu-Natal',
    district: 'iLembe / eThekwini',
    educationDistrict: 'ILEMBE',
    city: 'Durban',
    suburb: 'Ballito',
    address: 'Ballito, Dolphin Coast, KwaZulu-Natal, 4420',
    latitude: -29.539,
    longitude: 31.2144,
    curriculum: 'Montessori',
    ageRange: '12 months – 6 years',
    minAgeMonths: 12,
    maxAgeMonths: 72,
    monthlyFeeZAR: 4800,
    rating: 4.9,
    reviewCount: 31,
    isVerified: true,
    dsdRegistration: 'Full',
    isSubsidised: false,
    npoNumber: '058-169 NPO',
    municipality: 'KwaDukuza',
    sourceId: 'DSD-KZN-02008',
    primaryLanguage: 'English',
    status: 'Admissions Open',
    teacherRatio: '1:5',
    operatingHours: '07:00 – 17:00',
    facilities: [
      'CCTV Security',
      'Nutritious Meals',
      'Aftercare Available',
      'Sensory Garden',
      'Outdoor Playground',
      'Solar Back-up Power',
      'Lockable Gate',
      'Secure Perimeter Fence',
    ],
    images: [
      'https://www.nurtureandnature.co.za/wp-content/uploads/2024/09/NN-Ballito-Page-1.jpg',
      'https://www.nurtureandnature.co.za/wp-content/uploads/2024/09/NN-Ballito-Page-2-1.jpg',
      'https://www.nurtureandnature.co.za/wp-content/uploads/2022/09/nurtureandnature_ballito_image_img_1641-min.webp',
      'https://www.nurtureandnature.co.za/wp-content/uploads/2022/09/nurtureandnature_ballito_image_img_1628-min.webp',
      'https://www.nurtureandnature.co.za/wp-content/uploads/elementor/thumbs/nurtureandnature_ballito_image_img_1662-min-pusmjui0olp8xnafrq3a72ob4ik4lupxevkbe6zgzc.webp',
    ],
    phone: '+27 32 946 2180',
    email: 'ballito@nurtureandnature.co.za',
    websiteUrl: 'https://www.nurtureandnature.co.za/ballito/',
    principal: 'Priya Govender',
    reviews: [
      {
        id: 'r4',
        author: 'Kuben Naidoo',
        childAge: 'Child aged 3 yrs',
        date: 'October 2026',
        rating: 5,
        comment:
          'Safe, gated campus with wonderful teachers and outdoor nature spaces. Our son has thrived here.',
      },
    ],
  },
  {
    id: 'happy-days-kindergarten-cape-town',
    slug: 'happy-days-kindergarten-cape-town',
    name: 'Happy Days Kindergarten',
    tagline: 'Play-based early learning and Grade R readiness in a joyful, nurturing community.',
    description:
      'Happy Days Kindergarten provides a warm, play-based early childhood learning environment where children explore art, music, outdoor swings, and foundational Grade R school readiness.',
    province: 'Western Cape',
    district: 'City of Cape Town',
    educationDistrict: 'METRO CENTRAL',
    city: 'Cape Town',
    suburb: 'Claremont',
    address: 'Claremont, Cape Town, Western Cape, 7708',
    latitude: -33.9806,
    longitude: 18.4655,
    curriculum: 'Play-Based',
    ageRange: '18 months – 6 years',
    minAgeMonths: 18,
    maxAgeMonths: 72,
    monthlyFeeZAR: 4400,
    rating: 4.9,
    reviewCount: 34,
    isVerified: true,
    dsdRegistration: 'Full',
    isSubsidised: false,
    npoNumber: '116-771 NPO',
    municipality: 'City of Cape Town',
    sourceId: 'DSD-0100000781',
    primaryLanguage: 'English',
    status: 'Admissions Open',
    teacherRatio: '1:6',
    operatingHours: '07:15 – 17:30',
    facilities: [
      'CCTV Security',
      'Nutritious Meals',
      'Aftercare Available',
      'Outdoor Playground',
      'Grade R Readiness',
      'Lockable Gate',
      'Secure Perimeter Fence',
    ],
    images: [
      'https://www.happydaysschool.co.za/wp-content/uploads/2024/11/Children-huddling-in-a-circle.webp',
      'https://www.happydaysschool.co.za/wp-content/uploads/2024/11/Children-lying-on-the-floor-smiling-at-camera.webp',
      'https://www.happydaysschool.co.za/wp-content/uploads/2024/11/Children-playing-on-swings.webp',
      'https://www.happydaysschool.co.za/wp-content/uploads/2024/11/Children-in-graduation-hats.webp',
      'https://www.happydaysschool.co.za/wp-content/uploads/2024/11/Finger-Painting-1024x576.webp',
    ],
    phone: '+27 21 671 4120',
    email: 'info@happydaysschool.co.za',
    websiteUrl: 'https://www.happydaysschool.co.za',
    principal: 'Helena Du Preez',
    reviews: [
      {
        id: 'r6',
        author: 'Sipho Zulu',
        childAge: 'Child aged 4 yrs',
        date: 'September 2026',
        rating: 5,
        comment:
          'A joyful, caring environment where the children love painting, playing outside, and preparing for big school.',
      },
    ],
  },
  {
    id: 'acacia-tree-nursery-school-pretoria',
    slug: 'acacia-tree-nursery-school-pretoria',
    name: 'Acacia Tree Nursery School',
    tagline: 'Community-focused Pretoria nursery school with active parent engagement andCAPS foundation phase.',
    description:
      'Acacia Tree Nursery School in Tshwane, Gauteng provides bilingual early childhood education, creative play, and Grade R readiness in a secure, tree-lined campus.',
    province: 'Gauteng',
    district: 'City of Tshwane',
    educationDistrict: 'TSHWANE SOUTH',
    city: 'Pretoria',
    suburb: 'Pretoria East',
    address: 'Pretoria, City of Tshwane, Gauteng, 0181',
    latitude: -25.7781,
    longitude: 28.2435,
    curriculum: 'CAPS',
    ageRange: '18 months – 6 years',
    minAgeMonths: 18,
    maxAgeMonths: 72,
    monthlyFeeZAR: 3800,
    rating: 4.9,
    reviewCount: 27,
    isVerified: true,
    dsdRegistration: 'Full',
    isSubsidised: false,
    npoNumber: '063-476 NPO',
    municipality: 'City of Tshwane',
    sourceId: 'DSD-PTA-03009',
    primaryLanguage: 'Dual Afr/Eng',
    status: 'Admissions Open',
    teacherRatio: '1:6',
    operatingHours: '07:00 – 17:30',
    facilities: [
      'CCTV Security',
      'Nutritious Meals',
      'Aftercare Available',
      'Outdoor Playground',
      'Grade R Readiness',
      'Lockable Gate',
      'Secure Perimeter Fence',
    ],
    images: ['/images/preschools/acacia-tree-fb-cover-1.jpg'],
    phone: '+27 12 460 3381',
    email: 'admin@acaciatreenurseryschool.co.za',
    websiteUrl: 'https://www.facebook.com/acaciatreenurseryschool',
    principal: 'Annemarie Pretorius',
    reviews: [
      {
        id: 'r5',
        author: 'Johan & Thandi K.',
        childAge: 'Child aged 5 yrs (Grade R)',
        date: 'November 2026',
        rating: 5,
        comment:
          'The Grade R school-readiness programme and active Facebook community updates keep parents connected every single day.',
      },
    ],
  },
];

export const REAL_PRESCHOOLS: Preschool[] = ((realPreschoolsData as any[]) as Preschool[]).map(
  (rp) => {
    const cleanWebUrl = normalizeSchoolWebsiteOrSocialUrl(rp.websiteUrl, rp.name, true) || undefined;
    const resolvedImages = resolveRealPreschoolImages({
      name: rp.name,
      slug: rp.slug || rp.id,
      websiteUrl: cleanWebUrl,
      images: rp.images,
    });
    return {
      ...rp,
      websiteUrl: cleanWebUrl,
      images: (resolvedImages.length > 0 ? resolvedImages : rp.images || []).slice(
        0,
        MAX_PRESCHOOL_PROFILE_PHOTOS
      ),
    };
  }
);

// Merged dataset of real verified South African preschools
export const PRESCHOOLS: Preschool[] = [
  ...FEATURED_PRESCHOOLS,
  ...REAL_PRESCHOOLS.filter(
    (rp) => !FEATURED_PRESCHOOLS.some((fp) => fp.id === rp.id || fp.slug === rp.slug)
  ),
];

export function getMunicipalityBenchmark(municipalityName?: string) {
  const national = (ECD_BENCHMARKS as any).national || {
    centres: 42420,
    dsdRegisteredPct: 38.2,
    subsidyPct: 30.2,
    medianMonthlyFee: 300,
    avgChildren: 34.4,
    mealsPct: 94.1,
    fencedPct: 88.6,
    gatedPct: 83.6,
  };
  if (!municipalityName) return national;
  const normalized = municipalityName.toLowerCase().trim();
  const shortNormalized = normalized.replace(
    /^(city of|local municipality of|municipality of)\s+/,
    ''
  );
  const byName = (ECD_BENCHMARKS as any).municipalitiesByName;
  if (byName && (byName[normalized] || byName[shortNormalized])) {
    return byName[normalized] || byName[shortNormalized];
  }
  const munis = (ECD_BENCHMARKS as any).municipalities;
  if (Array.isArray(munis)) {
    const match = munis.find((m: any) => {
      const mn = (m.name || '').toLowerCase().trim();
      return (
        mn === normalized ||
        mn === shortNormalized ||
        mn.includes(shortNormalized) ||
        shortNormalized.includes(mn)
      );
    });
    if (match) return match;
  }
  return national;
}
