export type City = 'Johannesburg' | 'Cape Town' | 'Durban' | 'Pretoria';

export type Curriculum = 'Montessori' | 'Reggio Emilia' | 'Play-Based' | 'CAPS' | 'Waldorf';

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
  name: string;
  tagline: string;
  description: string;
  city: City;
  suburb: string;
  address: string;
  curriculum: Curriculum;
  ageRange: string;
  minAgeMonths: number;
  maxAgeMonths: number;
  monthlyFeeZAR: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  status: EnrollmentStatus;
  teacherRatio: string;
  operatingHours: string;
  facilities: string[];
  images: string[];
  phone: string;
  email: string;
  principal: string;
  reviews: ParentReview[];
}

export const CITIES: City[] = ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria'];

export const CURRICULUMS: Curriculum[] = ['Montessori', 'Reggio Emilia', 'Play-Based', 'CAPS', 'Waldorf'];

export const ALL_FACILITIES = [
  'CCTV Security',
  'Nutritious Meals',
  'Aftercare Available',
  'Sensory Garden',
  'Extramural Sports',
  'Transport Service',
  'Swimming Lessons',
  'Solar Back-up Power',
];

export const PRESCHOOLS: Preschool[] = [
  {
    id: 'little-ashford-sandton',
    name: 'Little Ashford Preschool Sandton',
    tagline: 'Reggio-inspired early learning fostering curiosity, imagination and confidence.',
    description: 'Little Ashford Sandton provides a modern, child-centric early childhood experience nestled in quiet parklands near Sandton CBD. Our Reggio Emilia approach recognizes children as capable researchers of their world, supported by atelierista art studios and natural light classrooms.',
    city: 'Johannesburg',
    suburb: 'Sandton',
    address: '14 Kelvin Drive, Morningside / Sandton, Johannesburg, 2196',
    curriculum: 'Reggio Emilia',
    ageRange: '3 months – 5 years',
    minAgeMonths: 3,
    maxAgeMonths: 60,
    monthlyFeeZAR: 6400,
    rating: 4.9,
    reviewCount: 38,
    isVerified: true,
    status: 'Admissions Open',
    teacherRatio: '1:4',
    operatingHours: '06:45 – 17:45',
    facilities: ['CCTV Security', 'Nutritious Meals', 'Aftercare Available', 'Sensory Garden', 'Extramural Sports', 'Solar Back-up Power'],
    images: [
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1200&q=80',
    ],
    phone: '+27 11 784 2190',
    email: 'sandton@littleashford.co.za',
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
    name: 'Camps Bay Montessori Preschool',
    tagline: 'Authentic AMI Montessori education framed by ocean air and mountain trails.',
    description: 'Perched along the Atlantic Seaboard, Camps Bay Montessori offers dual indoor-outdoor prepared environments where children gain independence, practical life mastery, and early phonics at their own individual pace.',
    city: 'Cape Town',
    suburb: 'Camps Bay',
    address: '28 The Drive, Camps Bay, Cape Town, 8005',
    curriculum: 'Montessori',
    ageRange: '18 months – 6 years',
    minAgeMonths: 18,
    maxAgeMonths: 72,
    monthlyFeeZAR: 6900,
    rating: 5.0,
    reviewCount: 42,
    isVerified: true,
    status: 'Limited Spots',
    teacherRatio: '1:5',
    operatingHours: '07:30 – 17:30',
    facilities: ['CCTV Security', 'Nutritious Meals', 'Sensory Garden', 'Extramural Sports', 'Swimming Lessons', 'Solar Back-up Power'],
    images: [
      'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    ],
    phone: '+27 21 438 5210',
    email: 'admissions@campsbaymontessori.co.za',
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
    name: 'Umhlanga Ridge Early Learning Academy',
    tagline: 'Modern, balanced coastal preschool blending active play with early STEM discovery.',
    description: 'Located in the heart of Umhlanga Ridgeside, this purpose-built academy combines spacious green playgrounds with early coding toys, swimming coaching, and whole-food organic meal plans crafted by pediatric nutritionists.',
    city: 'Durban',
    suburb: 'Umhlanga',
    address: '8 Horizon View, Umhlanga Ridge, Durban, 4319',
    curriculum: 'Play-Based',
    ageRange: '6 months – 5 years',
    minAgeMonths: 6,
    maxAgeMonths: 60,
    monthlyFeeZAR: 5400,
    rating: 4.9,
    reviewCount: 31,
    isVerified: true,
    status: 'Admissions Open',
    teacherRatio: '1:5',
    operatingHours: '07:00 – 17:30',
    facilities: ['CCTV Security', 'Nutritious Meals', 'Aftercare Available', 'Swimming Lessons', 'Transport Service', 'Solar Back-up Power'],
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
    name: 'Waterkloof Pre-Primary School',
    tagline: 'Established heritage preschool recognized for foundational excellence and bilingual CAPS.',
    description: 'Serving Pretoria families for over 35 years, Waterkloof Pre-Primary offers expansive shade-covered lawns, bike tracks, mud kitchens, and an acclaimed Grade R foundation phase preparing students for top junior primary schools.',
    city: 'Pretoria',
    suburb: 'Waterkloof',
    address: '185 Milner Street, Waterkloof, Pretoria, 0181',
    curriculum: 'CAPS',
    ageRange: '18 months – 6 years',
    minAgeMonths: 18,
    maxAgeMonths: 72,
    monthlyFeeZAR: 4600,
    rating: 4.9,
    reviewCount: 45,
    isVerified: true,
    status: 'Admissions Open',
    teacherRatio: '1:6',
    operatingHours: '07:15 – 17:30',
    facilities: ['CCTV Security', 'Nutritious Meals', 'Aftercare Available', 'Extramural Sports', 'Sensory Garden'],
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
        comment: 'The Grade R school-readiness program is second to none in Pretoria. Our twins are entering primary school reading confidently and with joyful social skills.'
      }
    ]
  },
  {
    id: 'rondebosch-montessori',
    name: 'Rondebosch Montessori Pre-Primary',
    tagline: 'Cultivating joyful independence, critical thinking and emotional intelligence.',
    description: 'Set in a leafy southern suburbs property with mature oak trees, Rondebosch Montessori adheres strictly to Association Montessori Internationale (AMI) standards. Children engage in sensorial exploration, practical life, mathematics, and nature study.',
    city: 'Cape Town',
    suburb: 'Rondebosch',
    address: '42 Park Road, Rondebosch, Cape Town, 7700',
    curriculum: 'Montessori',
    ageRange: '18 months – 6 years',
    minAgeMonths: 18,
    maxAgeMonths: 72,
    monthlyFeeZAR: 5900,
    rating: 4.9,
    reviewCount: 29,
    isVerified: true,
    status: 'Limited Spots',
    teacherRatio: '1:5',
    operatingHours: '07:30 – 17:00',
    facilities: ['CCTV Security', 'Nutritious Meals', 'Aftercare Available', 'Sensory Garden', 'Solar Back-up Power'],
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
        comment: 'A calm, orderly, yet wonderfully warm atmosphere. Our daughter has blossomed in confidence and speech articulation.'
      }
    ]
  },
  {
    id: 'rosebank-early-learning',
    name: 'Rosebank Early Learning Centre',
    tagline: 'Vibrant experiential learning celebrating multicultural childhood and creative play.',
    description: 'Walking distance from Rosebank Gautrain station, this center is favored by busy working parents for its flexible hours, robust security, home-cooked organic meals, and play-based curriculum rich in music, movement, and early numeracy.',
    city: 'Johannesburg',
    suburb: 'Rosebank',
    address: '37 Bolton Road, Parkwood / Rosebank, Johannesburg, 2193',
    curriculum: 'Play-Based',
    ageRange: '3 months – 5 years',
    minAgeMonths: 3,
    maxAgeMonths: 60,
    monthlyFeeZAR: 5800,
    rating: 4.8,
    reviewCount: 35,
    isVerified: true,
    status: 'Admissions Open',
    teacherRatio: '1:4',
    operatingHours: '06:30 – 18:00',
    facilities: ['CCTV Security', 'Nutritious Meals', 'Aftercare Available', 'Extramural Sports', 'Solar Back-up Power'],
    images: [
      'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=1200&q=80',
    ],
    phone: '+27 11 447 9821',
    email: 'enquiries@rosebankearlylearning.co.za',
    principal: 'Tariro Moyo',
    reviews: [
      {
        id: 'r7',
        author: 'Jessica Edwards',
        childAge: 'Child aged 2 yrs',
        date: 'August 2026',
        rating: 5,
        comment: 'The location near the Gautrain and the late pickup options are lifesavers. But most importantly, the carers treat every child like family.'
      }
    ]
  },
  {
    id: 'constantia-waldorf',
    name: 'Constantia Waldorf Kindergarten',
    tagline: 'Nurturing head, heart and hands through gentle seasonal rhythms and natural materials.',
    description: 'Surrounded by Constantia vineyards, our kindergarten offers a screen-free haven where storytelling, bread baking, puppet plays, and outdoor forest exploration foster wholesome imaginative development before formal schooling.',
    city: 'Cape Town',
    suburb: 'Constantia',
    address: 'Spes Bona Road, Constantia, Cape Town, 7806',
    curriculum: 'Waldorf',
    ageRange: '2 years – 6 years',
    minAgeMonths: 24,
    maxAgeMonths: 72,
    monthlyFeeZAR: 6200,
    rating: 4.8,
    reviewCount: 27,
    isVerified: true,
    status: 'Limited Spots',
    teacherRatio: '1:6',
    operatingHours: '07:45 – 16:00',
    facilities: ['Nutritious Meals', 'Sensory Garden', 'Aftercare Available', 'Solar Back-up Power'],
    images: [
      'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    ],
    phone: '+27 21 794 2103',
    email: 'kindergarten@waldorfconstantia.co.za',
    principal: 'Marcelle Thorne',
    reviews: [
      {
        id: 'r8',
        author: 'Chloe & Greg M.',
        childAge: 'Child aged 4 yrs',
        date: 'October 2026',
        rating: 5,
        comment: 'If you want your child to have an authentic, unhurried, magical childhood filled with nature and wooden toys, Constantia Waldorf is pure bliss.'
      }
    ]
  },
  {
    id: 'morningside-pre-primary-dbn',
    name: 'Morningside Pre-Primary Durban',
    tagline: 'A warm, inclusive community pre-school rich in play, music and social emotional growth.',
    description: 'Set in a gracious colonial homestead with sprawling subtropical gardens in Morningside, this non-profit community school has nurtured generations of Durban children through balanced play and creative arts.',
    city: 'Durban',
    suburb: 'Morningside',
    address: '92 Florida Road / Montpelier, Morningside, Durban, 4001',
    curriculum: 'Play-Based',
    ageRange: '18 months – 6 years',
    minAgeMonths: 18,
    maxAgeMonths: 72,
    monthlyFeeZAR: 4500,
    rating: 4.8,
    reviewCount: 34,
    isVerified: true,
    status: 'Admissions Open',
    teacherRatio: '1:5',
    operatingHours: '07:15 – 17:15',
    facilities: ['CCTV Security', 'Nutritious Meals', 'Aftercare Available', 'Extramural Sports', 'Swimming Lessons'],
    images: [
      'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=1200&q=80',
    ],
    phone: '+27 31 303 1450',
    email: 'admin@morningsidepreprep.co.za',
    principal: 'Brenda Pillay',
    reviews: [
      {
        id: 'r9',
        author: 'Zama Khumalo',
        childAge: 'Child aged 3 yrs',
        date: 'September 2026',
        rating: 5,
        comment: 'The sandpit, jungle gyms, and wonderful caring teachers make this school feel like a home away from home.'
      }
    ]
  },
  {
    id: 'centurion-montessori',
    name: 'Centurion Montessori House of Children',
    tagline: 'Empowering children to discover their innate potential through authentic Montessori.',
    description: 'Conveniently located for Pretoria and Midrand commuters, Centurion Montessori provides sun-drenched prepared classrooms, child-sized furniture, and individualized learning contracts that inspire self-motivation and focus.',
    city: 'Pretoria',
    suburb: 'Centurion',
    address: '55 Jean Avenue, Clubview, Centurion, 0157',
    curriculum: 'Montessori',
    ageRange: '12 months – 6 years',
    minAgeMonths: 12,
    maxAgeMonths: 72,
    monthlyFeeZAR: 5100,
    rating: 4.8,
    reviewCount: 22,
    isVerified: true,
    status: 'Admissions Open',
    teacherRatio: '1:5',
    operatingHours: '06:45 – 17:30',
    facilities: ['CCTV Security', 'Nutritious Meals', 'Aftercare Available', 'Sensory Garden', 'Solar Back-up Power'],
    images: [
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1200&q=80',
    ],
    phone: '+27 12 660 1192',
    email: 'admissions@centurionmontessori.co.za',
    principal: 'Liesel Becker',
    reviews: [
      {
        id: 'r10',
        author: 'Willem & Annelie S.',
        childAge: 'Child aged 4 yrs',
        date: 'October 2026',
        rating: 5,
        comment: 'Outstanding focus on mathematics and practical independence. Our son loves preparing his own snack and pouring water without spills.'
      }
    ]
  },
  {
    id: 'brooklyn-little-explorers',
    name: 'Brooklyn Little Explorers Reggio Atelier',
    tagline: 'An inquiry-based atelier school where children express themselves in 100 languages.',
    description: 'Situated in the diplomatic enclave of Brooklyn, Pretoria, this international-minded preschool integrates loose parts play, natural light studios, pottery wheels, and dual English/French introduction.',
    city: 'Pretoria',
    suburb: 'Brooklyn',
    address: '112 Anderson Street, Brooklyn, Pretoria, 0181',
    curriculum: 'Reggio Emilia',
    ageRange: '3 months – 5 years',
    minAgeMonths: 3,
    maxAgeMonths: 60,
    monthlyFeeZAR: 5600,
    rating: 4.9,
    reviewCount: 26,
    isVerified: true,
    status: 'Limited Spots',
    teacherRatio: '1:4',
    operatingHours: '07:00 – 17:30',
    facilities: ['CCTV Security', 'Nutritious Meals', 'Aftercare Available', 'Sensory Garden', 'Extramural Sports', 'Solar Back-up Power'],
    images: [
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1200&q=80',
    ],
    phone: '+27 12 346 5509',
    email: 'bonjour@brooklynexplorers.co.za',
    principal: 'Dominique Laurent',
    reviews: [
      {
        id: 'r11',
        author: 'Kagiso Molefe',
        childAge: 'Child aged 2 yrs',
        date: 'November 2026',
        rating: 5,
        comment: 'The atelierista art projects and light tables are incredible. The school feels like an inspirational Scandinavian studio for kids.'
      }
    ]
  },
  {
    id: 'kloof-village-montessori',
    name: 'Kloof Village Montessori Pre-School',
    tagline: 'Tranquil Upper Highway early learning surrounded by indigenous trees and birdsong.',
    description: 'Located in the mist belt of Kloof, KwaZulu-Natal, this school provides small, intimate classrooms where each directress guides children across language, mathematics, sensory development, and botanical science.',
    city: 'Durban',
    suburb: 'Kloof',
    address: '15 Village Road, Kloof, Durban, 3610',
    curriculum: 'Montessori',
    ageRange: '18 months – 6 years',
    minAgeMonths: 18,
    maxAgeMonths: 72,
    monthlyFeeZAR: 4900,
    rating: 4.9,
    reviewCount: 19,
    isVerified: true,
    status: 'Admissions Open',
    teacherRatio: '1:5',
    operatingHours: '07:15 – 17:00',
    facilities: ['CCTV Security', 'Nutritious Meals', 'Sensory Garden', 'Aftercare Available', 'Extramural Sports'],
    images: [
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    ],
    phone: '+27 31 764 8831',
    email: 'hello@kloofmontessori.co.za',
    principal: 'Sarah Henderson',
    reviews: [
      {
        id: 'r12',
        author: 'Craig & Michelle D.',
        childAge: 'Child aged 3 yrs',
        date: 'October 2026',
        rating: 5,
        comment: 'Such peaceful classrooms. The children learn to resolve conflicts with grace and courtesy, and our daughter is thriving.'
      }
    ]
  },
  {
    id: 'greenside-nursery-jhb',
    name: 'Greenside Community Nursery School',
    tagline: 'Warm community school building curiosity, social empathy and school readiness.',
    description: 'A beloved institution in Johannesburg northern suburbs, Greenside Nursery combines structured CAPS development with generous open-air mud kitchens, bike tracks, and visiting sensory specialists.',
    city: 'Johannesburg',
    suburb: 'Greenside',
    address: '52 Greenfield Road, Greenside, Johannesburg, 2193',
    curriculum: 'CAPS',
    ageRange: '2 years – 6 years',
    minAgeMonths: 24,
    maxAgeMonths: 72,
    monthlyFeeZAR: 4800,
    rating: 4.7,
    reviewCount: 33,
    isVerified: true,
    status: 'Admissions Open',
    teacherRatio: '1:6',
    operatingHours: '07:00 – 17:30',
    facilities: ['CCTV Security', 'Nutritious Meals', 'Aftercare Available', 'Extramural Sports', 'Solar Back-up Power'],
    images: [
      'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80',
    ],
    phone: '+27 11 646 1205',
    email: 'info@greensidenursery.co.za',
    principal: 'Gillian Scott',
    reviews: [
      {
        id: 'r13',
        author: 'Lebo Ramaphosa',
        childAge: 'Child aged 4 yrs',
        date: 'September 2026',
        rating: 5,
        comment: 'The teachers have decades of experience. The school concerts and family picnic days make you feel part of a wonderful village.'
      }
    ]
  },
  {
    id: 'little-village-durbanville',
    name: 'Little Village Preschool Durbanville',
    tagline: 'Wholesome bilingual early learning in the Cape Winelands outskirts.',
    description: 'Offering dual English and Afrikaans classes with a focus on gross motor skill development, phonics, and emotional literacy, Little Village is set on a secure farm-style holding with miniature farm animals and vegetable gardens.',
    city: 'Cape Town',
    suburb: 'Durbanville',
    address: '14 Vissershok Road, Durbanville, Cape Town, 7550',
    curriculum: 'Play-Based',
    ageRange: '3 months – 5 years',
    minAgeMonths: 3,
    maxAgeMonths: 60,
    monthlyFeeZAR: 4200,
    rating: 4.8,
    reviewCount: 28,
    isVerified: true,
    status: 'Admissions Open',
    teacherRatio: '1:5',
    operatingHours: '06:45 – 17:45',
    facilities: ['CCTV Security', 'Nutritious Meals', 'Aftercare Available', 'Sensory Garden', 'Transport Service'],
    images: [
      'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=1200&q=80',
    ],
    phone: '+27 21 976 3421',
    email: 'admin@littlevillagedville.co.za',
    principal: 'Martie Van Zyl',
    reviews: [
      {
        id: 'r14',
        author: 'Ruan & Lizelle B.',
        childAge: 'Child aged 2 yrs',
        date: 'October 2026',
        rating: 5,
        comment: 'The animal interactions and sensory vegetable patch are wonderful for toddlers. Very fair fee structure for the quality offered.'
      }
    ]
  },
  {
    id: 'stepping-stones-bryanston',
    name: 'Stepping Stones Montessori Bryanston',
    tagline: 'Inspiring curious minds through individualized Montessori guidance and expansive outdoor ateliers.',
    description: 'Nestled on two acres of lush garden in Bryanston, Stepping Stones provides complete 3-year Montessori cycles with swimming facilities, organic kitchen garden, and dedicated music directresses.',
    city: 'Johannesburg',
    suburb: 'Sandton',
    address: '109 Nicole Way, Bryanston, Sandton / Johannesburg, 2191',
    curriculum: 'Montessori',
    ageRange: '18 months – 6 years',
    minAgeMonths: 18,
    maxAgeMonths: 72,
    monthlyFeeZAR: 6500,
    rating: 4.9,
    reviewCount: 36,
    isVerified: true,
    status: 'Waitlist Only',
    teacherRatio: '1:5',
    operatingHours: '07:15 – 17:30',
    facilities: ['CCTV Security', 'Nutritious Meals', 'Aftercare Available', 'Swimming Lessons', 'Sensory Garden', 'Solar Back-up Power'],
    images: [
      'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    ],
    phone: '+27 11 706 5540',
    email: 'info@steppingstonesmontessori.co.za',
    principal: 'Katherine Ross',
    reviews: [
      {
        id: 'r15',
        author: 'Timothy & Lerato P.',
        childAge: 'Child aged 5 yrs',
        date: 'November 2026',
        rating: 5,
        comment: 'The waitlist was worth it. Our daughter has acquired deep reading and numeracy skills effortlessly, all while maintaining her joyous love for play.'
      }
    ]
  },
  {
    id: 'glenwood-early-childhood',
    name: 'Glenwood Early Childhood Centre',
    tagline: 'Affordable, accredited foundation phase learning with strong community roots.',
    description: 'A registered ECD centre in Glenwood Durban providing loving care, CAPS curriculum milestones, speech therapy partnerships, and wholesome balanced meals for growing toddlers and preschoolers.',
    city: 'Durban',
    suburb: 'Glenwood',
    address: '142 Bulwer Road, Glenwood, Durban, 4001',
    curriculum: 'CAPS',
    ageRange: '3 months – 5 years',
    minAgeMonths: 3,
    maxAgeMonths: 60,
    monthlyFeeZAR: 3800,
    rating: 4.7,
    reviewCount: 24,
    isVerified: true,
    status: 'Admissions Open',
    teacherRatio: '1:6',
    operatingHours: '06:45 – 17:30',
    facilities: ['CCTV Security', 'Nutritious Meals', 'Aftercare Available', 'Transport Service'],
    images: [
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=1200&q=80',
    ],
    phone: '+27 31 205 6672',
    email: 'info@glenwoodecd.co.za',
    principal: 'Nonhlanhla Mthembu',
    reviews: [
      {
        id: 'r16',
        author: 'Devan Chetty',
        childAge: 'Child aged 3 yrs',
        date: 'August 2026',
        rating: 5,
        comment: 'Extremely caring teachers who send daily notebook updates. Great value for working parents in the Berea / Glenwood area.'
      }
    ]
  },
  {
    id: 'pretoria-east-play-learn',
    name: 'Pretoria East Play & Learn Academy',
    tagline: 'Nurturing curiosity, physical coordination and creativity in Faerie Glen.',
    description: 'With shaded sandparks, splash play zones, and child-led exploration rooms, Pretoria East Play & Learn provides a warm developmental haven for infants to pre-schoolers with solar backup and on-site registered nurse visits.',
    city: 'Pretoria',
    suburb: 'Faerie Glen',
    address: '892 Atterbury Road, Faerie Glen, Pretoria, 0081',
    curriculum: 'Play-Based',
    ageRange: '6 months – 5 years',
    minAgeMonths: 6,
    maxAgeMonths: 60,
    monthlyFeeZAR: 4300,
    rating: 4.8,
    reviewCount: 30,
    isVerified: true,
    status: 'Admissions Open',
    teacherRatio: '1:5',
    operatingHours: '06:30 – 17:45',
    facilities: ['CCTV Security', 'Nutritious Meals', 'Aftercare Available', 'Sensory Garden', 'Solar Back-up Power'],
    images: [
      'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=1200&q=80',
    ],
    phone: '+27 12 991 4452',
    email: 'admissions@ptaeastplay.co.za',
    principal: 'Elmarie Botha',
    reviews: [
      {
        id: 'r17',
        author: 'Francois & Naledi V.',
        childAge: 'Child aged 2 yrs',
        date: 'November 2026',
        rating: 5,
        comment: 'The cleanliness, security gates, and warmth of the teachers are immediately noticeable from your first visit.'
      }
    ]
  }
];
