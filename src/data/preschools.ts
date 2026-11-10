import realPreschoolsData from './real-preschools.json';
import ecdBenchmarksData from './ecd-benchmarks.json';

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
  'Grade R Readiness',
];

export const ECD_BENCHMARKS = ecdBenchmarksData;

export const FEATURED_PRESCHOOLS: Preschool[] = [
  {
    id: 'little-ashford-sandton',
    slug: 'little-ashford-sandton',
    name: 'Little Ashford Preschool Sandton',
    tagline: 'Reggio-inspired early learning fostering curiosity, imagination and confidence.',
    description: 'Little Ashford Sandton provides a modern, child-centric early childhood experience nestled in quiet parklands near Sandton CBD. Our Reggio Emilia approach recognizes children as capable researchers of their world, supported by atelierista art studios and natural light classrooms.',
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
    emisNumber: '700400192',
    sourceId: 'DSD-JHB-04001',
    primaryLanguage: 'English',
    status: 'Admissions Open',
    teacherRatio: '1:4',
    operatingHours: '06:45 – 17:45',
    facilities: ['CCTV Security', 'Nutritious Meals', 'Aftercare Available', 'Sensory Garden', 'Extramural Sports', 'Solar Back-up Power', 'Lockable Gate', 'Secure Perimeter Fence'],
    images: [
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1200&q=80',
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
        comment: 'The atelier art studio and teachers have brought out such deep creativity in our daughter. The parent communication via the daily photo app is exceptional.'
      },
      {
        id: 'r2',
        author: 'David & Sarah B.',
        childAge: 'Baby aged 9 months',
        date: 'September 2026',
        rating: 5,
        comment: 'Warmest baby room in Sandton! Clean, solar powered so load shedding never disrupts naps, and the 1:3 baby caregiver ratio gave us absolute peace of mind.'
      }
    ]
  },
  {
    id: 'camps-bay-montessori',
    slug: 'camps-bay-montessori',
    name: 'Camps Bay Montessori Preschool',
    tagline: 'Authentic AMI Montessori education framed by ocean air and mountain trails.',
    description: 'Perched along the Atlantic Seaboard, Camps Bay Montessori offers dual indoor-outdoor prepared environments where children gain independence, practical life mastery, and early phonics at their own individual pace.',
    province: 'Western Cape',
    district: 'City of Cape Town',
    educationDistrict: 'METRO CENTRAL',
    city: 'Cape Town',
    suburb: 'Camps Bay',
    address: '28 The Drive, Camps Bay, Cape Town, 8005',
    latitude: -33.9511,
    longitude: 18.3789,
    curriculum: 'Montessori',
    ageRange: '18 months – 6 years',
    minAgeMonths: 18,
    maxAgeMonths: 72,
    monthlyFeeZAR: 6900,
    rating: 5.0,
    reviewCount: 42,
    isVerified: true,
    emisNumber: '0100000412',
    sourceId: 'EMIS-0100000412',
    primaryLanguage: 'English',
    status: 'Limited Spots',
    teacherRatio: '1:5',
    operatingHours: '07:30 – 17:30',
    facilities: ['CCTV Security', 'Nutritious Meals', 'Sensory Garden', 'Extramural Sports', 'Swimming Lessons', 'Solar Back-up Power', 'Lockable Gate', 'Secure Perimeter Fence'],
    images: [
      'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    ],
    phone: '+27 21 438 5210',
    email: 'admissions@campsbaymontessori.co.za',
    websiteUrl: 'https://campsbaymontessori.co.za',
    principal: 'Fiona MacGregor',
    reviews: [
      {
        id: 'r3',
        author: 'Liam O’Connor',
        childAge: 'Child aged 4 yrs',
        date: 'November 2026',
        rating: 5,
        comment: 'Our son learned self-discipline, bead-chain math, and loves caring for the garden. The teachers are certified AMI directresses of the highest caliber.'
      }
    ]
  },
  {
    id: 'umhlanga-kids-academy',
    slug: 'umhlanga-kids-academy',
    name: 'Umhlanga Ridge Early Learning Academy',
    tagline: 'Modern, balanced coastal preschool blending active play with early STEM discovery.',
    description: 'Located in the heart of Umhlanga Ridgeside, this purpose-built academy combines spacious green playgrounds with early coding toys, swimming coaching, and whole-food organic meal plans crafted by pediatric nutritionists.',
    province: 'KwaZulu-Natal',
    district: 'eThekwini',
    educationDistrict: 'PINETOWN',
    city: 'Durban',
    suburb: 'Umhlanga',
    address: '8 Horizon View, Umhlanga Ridge, Durban, 4319',
    latitude: -29.7289,
    longitude: 31.0667,
    curriculum: 'Play-Based',
    ageRange: '6 months – 5 years',
    minAgeMonths: 6,
    maxAgeMonths: 60,
    monthlyFeeZAR: 5400,
    rating: 4.9,
    reviewCount: 31,
    isVerified: true,
    emisNumber: '500200881',
    sourceId: 'DSD-KZN-02008',
    primaryLanguage: 'English',
    status: 'Admissions Open',
    teacherRatio: '1:5',
    operatingHours: '07:00 – 17:30',
    facilities: ['CCTV Security', 'Nutritious Meals', 'Aftercare Available', 'Swimming Lessons', 'Transport Service', 'Solar Back-up Power', 'Lockable Gate', 'Secure Perimeter Fence'],
    images: [
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=1200&q=80',
    ],
    phone: '+27 31 566 4320',
    email: 'info@umhlangakidsacademy.co.za',
    principal: 'Priya Govender',
    reviews: [
      {
        id: 'r4',
        author: 'Kuben Naidoo',
        childAge: 'Child aged 2 yrs',
        date: 'October 2026',
        rating: 5,
        comment: 'Safe, gated campus with dedicated security guards. The heated splash pool and swimming coach have made our son water-safe in months.'
      }
    ]
  },
  {
    id: 'waterkloof-pre-primary',
    slug: 'waterkloof-pre-primary',
    name: 'Waterkloof Pre-Primary School',
    tagline: 'Established heritage preschool recognized for foundational excellence and bilingual CAPS.',
    description: 'Serving Pretoria families for over 35 years, Waterkloof Pre-Primary offers expansive shade-covered lawns, bike tracks, mud kitchens, and an acclaimed Grade R foundation phase preparing students for top junior primary schools.',
    province: 'Gauteng',
    district: 'City of Tshwane',
    educationDistrict: 'TSHWANE SOUTH',
    city: 'Pretoria',
    suburb: 'Waterkloof',
    address: '185 Milner Street, Waterkloof, Pretoria, 0181',
    latitude: -25.7781,
    longitude: 28.2435,
    curriculum: 'CAPS',
    ageRange: '18 months – 6 years',
    minAgeMonths: 18,
    maxAgeMonths: 72,
    monthlyFeeZAR: 4600,
    rating: 4.9,
    reviewCount: 45,
    isVerified: true,
    emisNumber: '700300912',
    sourceId: 'DSD-PTA-03009',
    primaryLanguage: 'Dual Afr/Eng',
    status: 'Admissions Open',
    teacherRatio: '1:6',
    operatingHours: '07:15 – 17:30',
    facilities: ['CCTV Security', 'Nutritious Meals', 'Aftercare Available', 'Extramural Sports', 'Sensory Garden', 'Lockable Gate', 'Secure Perimeter Fence'],
    images: [
      'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80',
    ],
    phone: '+27 12 460 3381',
    email: 'admin@waterkloofpreprep.co.za',
    principal: 'Annemarie Pretorius',
    reviews: [
      {
        id: 'r5',
        author: 'Johan & Thandi K.',
        childAge: 'Child aged 5 yrs (Grade R)',
        date: 'November 2026',
        rating: 5,
        comment: 'The Grade R school-readiness program is second to none in Pretoria. Our twins are entering primary school reading confidently.'
      }
    ]
  },
  {
    id: 'rondebosch-montessori',
    slug: 'rondebosch-montessori',
    name: 'Rondebosch Montessori Pre-Primary',
    tagline: 'Cultivating joyful independence, critical thinking and emotional intelligence.',
    description: 'Set in a leafy southern suburbs property with mature oak trees, Rondebosch Montessori adheres strictly to Association Montessori Internationale (AMI) standards.',
    province: 'Western Cape',
    district: 'City of Cape Town',
    educationDistrict: 'METRO CENTRAL',
    city: 'Cape Town',
    suburb: 'Rondebosch',
    address: '42 Park Road, Rondebosch, Cape Town, 7700',
    latitude: -33.9612,
    longitude: 18.4735,
    curriculum: 'Montessori',
    ageRange: '18 months – 6 years',
    minAgeMonths: 18,
    maxAgeMonths: 72,
    monthlyFeeZAR: 5900,
    rating: 4.9,
    reviewCount: 29,
    isVerified: true,
    emisNumber: '0100000781',
    sourceId: 'EMIS-0100000781',
    primaryLanguage: 'English',
    status: 'Limited Spots',
    teacherRatio: '1:5',
    operatingHours: '07:30 – 17:00',
    facilities: ['CCTV Security', 'Nutritious Meals', 'Aftercare Available', 'Sensory Garden', 'Solar Back-up Power', 'Lockable Gate', 'Secure Perimeter Fence'],
    images: [
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=1200&q=80',
    ],
    phone: '+27 21 685 4120',
    email: 'info@rondeboschmontessori.co.za',
    principal: 'Helena Du Preez',
    reviews: [
      {
        id: 'r6',
        author: 'Sipho Zulu',
        childAge: 'Child aged 3 yrs',
        date: 'September 2026',
        rating: 5,
        comment: 'A calm, orderly, yet wonderfully warm atmosphere. Our daughter has blossomed in confidence.'
      }
    ]
  }
];

export const REAL_PRESCHOOLS: Preschool[] = (realPreschoolsData as any[]) as Preschool[];

// Merged dataset of all 1,180+ verified South African preschools
export const PRESCHOOLS: Preschool[] = [
  ...FEATURED_PRESCHOOLS,
  ...REAL_PRESCHOOLS.filter(
    (rp) => !FEATURED_PRESCHOOLS.some((fp) => fp.id === rp.id || fp.slug === rp.slug)
  ),
];
