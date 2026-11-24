import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import { sanitizeFirestoreId, truncateString } from '@/lib/ownership-verification';
import type { AuthUser } from '@/context/AuthContext';

export type EcdRegistrationStatus = 'full' | 'conditional' | 'unregistered';
export type GrantPipelineStatus = 'saved' | 'preparing' | 'submitted' | 'approved';

export interface VerifiedEcdGrant {
  id: string;
  title: string;
  provider: string;
  category:
    | 'DBE Government Subsidy'
    | 'Infrastructure & Safety'
    | 'NLC Lotteries & Equipment'
    | 'Corporate CSI & Foundations'
    | 'Practitioner Bursaries & Training';
  amountLabel: string;
  estimatedZAR: number;
  eligibility: string;
  deadline: string;
  url: string;
  portalLabel: string;
  requiredChecklistIds: string[];
  turnaroundTime: string;
}

export interface PipelineGrantEntry {
  grantId: string;
  title: string;
  provider: string;
  amountLabel: string;
  estimatedZAR: number;
  status: GrantPipelineStatus;
  deadline: string;
  url: string;
}

export interface FundingWorkspaceRecord {
  uid: string;
  schoolName: string;
  province: string;
  npoNumber?: string;
  registrationStatus: EcdRegistrationStatus;
  qualifyingChildren: number;
  daysPerMonth: number;
  complianceChecks: string[];
  pipelineGrants: PipelineGrantEntry[];
  estimatedPipelineZAR: number;
  createdAt?: Timestamp | string | null;
  updatedAt?: Timestamp | string | null;
}

export interface GrantProposalDraftRecord {
  proposalId: string;
  ownerUid: string;
  schoolName: string;
  province: string;
  npoNumber?: string;
  grantId: string;
  grantTitle: string;
  funderName: string;
  requestedAmountZAR: number;
  projectFocus: string;
  executiveSummary: string;
  fullProposalText: string;
  budgetBreakdown?: string;
  createdAt?: Timestamp | string | null;
  updatedAt?: Timestamp | string | null;
}

export interface DbeComplianceRequirement {
  id: string;
  title: string;
  statutoryRef: string;
  description: string;
  category: 'Statutory Registration' | 'Health & Municipal' | 'Financial & Governance' | 'Learner Records';
  templateId?: string;
}

export interface DbeComplianceTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  format: string;
  content: string;
}

export interface ProvincialDbeDesk {
  province: string;
  department: string;
  portalUrl: string;
  helpline: string;
  intakeWindow: string;
  registrationFocus: string;
}

// Official Gazetted South African DBE ECD Per-Child Daily Subsidy (increased from R17.00 to R24.00/child/day)
export const CURRENT_DBE_DAILY_SUBSIDY_ZAR = 24.0;
export const LEGACY_DSD_DAILY_SUBSIDY_ZAR = 17.0;
export const MAX_SUBSIDY_DAYS_PER_YEAR = 264;

export const VERIFIED_SA_ECD_GRANTS: VerifiedEcdGrant[] = [
  {
    id: 'dbe-per-child-subsidy',
    title: 'Department of Basic Education (DBE) ECD Equitable Share Daily Subsidy',
    provider: 'Provincial Education Departments (PEDs) & DBE',
    category: 'DBE Government Subsidy',
    amountLabel: 'R24.00 per child / day (R6,336/child/year)',
    estimatedZAR: 158400, // 25 qualifying children * R24 * 264 days
    eligibility:
      'Conditionally or Fully Registered non-profit/community ECD programmes serving children aged 0–5 from households below the income means test or receiving SASSA Child Support Grants.',
    deadline: 'Annual Provincial PED Contracting (Jan – March & June Review)',
    url: 'https://www.education.gov.za/Programmes/EarlyChildhoodDevelopment.aspx',
    portalLabel: 'DBE Official ECD Portal',
    requiredChecklistIds: [
      'npo-cert',
      'dbe-partial-care',
      'means-test-affidavits',
      'attendance-register',
      'bank-account',
      'menu-nutrition',
    ],
    turnaroundTime: '60 – 90 Days (Quarterly Tranches)',
  },
  {
    id: 'dbe-vangasali-gold-standard',
    title: 'DBE Vangasali & Care and Support for Teaching & Learning (CSTL) Registration Drive',
    provider: 'Department of Basic Education & Nelson Mandela Foundation',
    category: 'Infrastructure & Safety',
    amountLabel: 'R25,000 – R120,000 compliance & starter pack support',
    estimatedZAR: 65000,
    eligibility:
      'Unregistered or Bronze-level community crèches seeking Bronze/Silver/Gold Vangasali registration compliance, safety packs, and municipal environmental health clearance.',
    deadline: 'Rolling Provincial Municipal Assessments',
    url: 'https://www.education.gov.za/Vangasali.aspx',
    portalLabel: 'DBE Vangasali Portal',
    requiredChecklistIds: ['attendance-register', 'health-env-cert', 'child-protection-register'],
    turnaroundTime: '30 – 60 Days',
  },
  {
    id: 'ilifa-labantwana-ecd-stimulus',
    title: 'Ilifa Labantwana ECD Infrastructure & Nutrition Stimulus Fund',
    provider: 'Ilifa Labantwana & Social Employment Fund Partners',
    category: 'Infrastructure & Safety',
    amountLabel: 'R35,000 – R150,000 per qualifying centre',
    estimatedZAR: 95000,
    eligibility:
      'Informal and conditionally registered ECD centres requiring sanitation upgrades (flush/enviro-loos), perimeter security fencing, kitchen fire safety, and nutritional vouchers.',
    deadline: 'Rolling Provincial Intake Windows (2026/2027)',
    url: 'https://ilifalabantwana.co.za/what-we-do/',
    portalLabel: 'Ilifa Labantwana Programme',
    requiredChecklistIds: ['npo-cert', 'health-env-cert', 'lease-pto-deed'],
    turnaroundTime: '45 – 75 Days',
  },
  {
    id: 'nlc-charities-ecd-grant',
    title: 'National Lotteries Commission (NLC) Charities & Early Learning Capital Grant',
    provider: 'National Lotteries Commission South Africa',
    category: 'NLC Lotteries & Equipment',
    amountLabel: 'Up to R250,000 (Small Grant) / R500,000+ (Medium)',
    estimatedZAR: 250000,
    eligibility:
      'Registered NPOs/NPCs operating for at least 12–24 months with signed annual financial statements, valid tax compliance pin, and an active NPO constitution.',
    deadline: 'Provincial Call Windows (Open Q2 & Q4)',
    url: 'https://www.nlcsa.org.za/charities/',
    portalLabel: 'NLC Charities Portal',
    requiredChecklistIds: [
      'npo-cert',
      'financial-statements',
      'sars-pbo-tax',
      'bank-account',
      'lease-pto-deed',
    ],
    turnaroundTime: '90 – 150 Days',
  },
  {
    id: 'dgmt-early-learning-innovation',
    title: 'DG Murray Trust (DGMT) All Children On Track & Early Learning Grants',
    provider: 'DG Murray Trust (DGMT)',
    category: 'Corporate CSI & Foundations',
    amountLabel: 'R75,000 – R300,000 project grants',
    estimatedZAR: 150000,
    eligibility:
      'Community ECD networks, toy libraries, and registered educares implementing structured early language stimulation, stunting prevention nutrition, and parent reading programmes.',
    deadline: 'Bi-annual Concept Note Submissions',
    url: 'https://dgmt.co.za/what-we-do/',
    portalLabel: 'DGMT Funding Portal',
    requiredChecklistIds: ['npo-cert', 'financial-statements', 'ncf-daily-programme', 'bank-account'],
    turnaroundTime: '60 – 90 Days',
  },
  {
    id: 'firstrand-tshikululu-ecd-fund',
    title: 'FirstRand Foundation & First National Bank (FNB) Early Childhood Fund',
    provider: 'FirstRand CSI (Managed via Tshikululu Social Investments)',
    category: 'Corporate CSI & Foundations',
    amountLabel: 'R50,000 – R200,000 per award',
    estimatedZAR: 120000,
    eligibility:
      'Township and rural registered NPO preschools demonstrating strong governance, Grade R numeracy/literacy readiness outcomes, and practitioner NQF Level 4/5 development.',
    deadline: 'Annual Call via Tshikululu Online Portal',
    url: 'https://tshikululu.org.za/apply-for-funding/',
    portalLabel: 'Tshikululu / FirstRand Portal',
    requiredChecklistIds: [
      'npo-cert',
      'sars-pbo-tax',
      'financial-statements',
      'ncf-daily-programme',
      'qualified-practitioners',
    ],
    turnaroundTime: '90 Days',
  },
  {
    id: 'nda-civil-society-ecd-grant',
    title: 'National Development Agency (NDA) ECD Civil Society Strengthening Grant',
    provider: 'National Development Agency (NDA)',
    category: 'Infrastructure & Safety',
    amountLabel: 'R50,000 – R250,000 (Grant + Equipment)',
    estimatedZAR: 110000,
    eligibility:
      'Community-based ECD NPOs and cooperatives in underserved municipalities requiring educational play equipment, mattresses, kitchen appliances, and governance mentoring.',
    deadline: 'Provincial NDA Office Call for Proposals',
    url: 'https://www.nda.org.za/home/Civil_Society_Development_24.html',
    portalLabel: 'NDA Civil Society Portal',
    requiredChecklistIds: ['npo-cert', 'bank-account', 'attendance-register', 'lease-pto-deed'],
    turnaroundTime: '60 – 90 Days',
  },
  {
    id: 'etdp-seta-ecd-practitioner-bursaries',
    title: 'ETDP SETA Early Childhood Development NQF Level 4 & 5 Practitioner Bursaries',
    provider: 'Education, Training and Development Practices SETA',
    category: 'Practitioner Bursaries & Training',
    amountLabel: 'Full Tuition + Stipend Learnerships (R35,000/practitioner)',
    estimatedZAR: 70000,
    eligibility:
      'South African ECD practitioners and assistant teachers employed at community preschools needing accredited NQF Level 4 or Level 5 Occupational ECD Certificates to meet DBE norms.',
    deadline: 'Annual SETA Discretionary Grant Window',
    url: 'https://www.etdpseta.org.za/',
    portalLabel: 'ETDP SETA Portal',
    requiredChecklistIds: ['npo-cert', 'qualified-practitioners', 'child-protection-register'],
    turnaroundTime: '60 Days',
  },
];

export const DBE_COMPLIANCE_CHECKLIST: DbeComplianceRequirement[] = [
  {
    id: 'npo-cert',
    title: 'Active NPO / NPC Registration Certificate & Constitution',
    statutoryRef: 'Nonprofit Organisations Act 71 of 1997',
    description:
      'Official 6-digit NPO registration certificate and signed founding constitution with an independent management committee (Chairperson, Treasurer, Secretary).',
    category: 'Statutory Registration',
  },
  {
    id: 'dbe-partial-care',
    title: 'DBE ECD Programme & Partial Care Registration (Form 11 / Form 16)',
    statutoryRef: 'Children’s Act 38 of 2005 (Transferred to DBE)',
    description:
      'Conditional (Bronze/Silver) or Full (Gold) Registration certificate confirming indoor space (1.5m² per child) and outdoor play space (2m² per child).',
    category: 'Statutory Registration',
    templateId: 'dbe-self-assessment',
  },
  {
    id: 'health-env-cert',
    title: 'Municipal Environmental Health & Fire Safety Certificate of Acceptability',
    statutoryRef: 'National Environmental Health Norms & Standards',
    description:
      'Valid municipal environmental health clearance certifying safe food preparation area, 1 toilet/potty per 20 children, fire extinguisher, and first-aid kit.',
    category: 'Health & Municipal',
    templateId: 'dbe-self-assessment',
  },
  {
    id: 'attendance-register',
    title: 'Daily Learner & Practitioner Attendance Registers',
    statutoryRef: 'DBE Equitable Share Audit Requirement',
    description:
      'Signed daily attendance registers reconciled monthly (minimum 18–22 operational days/month) required before each quarterly R24/child/day tranche payout.',
    category: 'Learner Records',
    templateId: 'dbe-attendance-register',
  },
  {
    id: 'means-test-affidavits',
    title: 'Parent Income Means-Test Affidavits & SASSA Verification Pack',
    statutoryRef: 'DBE Per-Child Subsidy Means Threshold',
    description:
      'Signed parent/guardian income declarations, SASSA Child Support Grant proof, and certified copies of child birth certificates and Road-to-Health clinic cards.',
    category: 'Learner Records',
    templateId: 'dbe-means-test-affidavit',
  },
  {
    id: 'bank-account',
    title: 'Dedicated NPO Bank Account (Two-Signatory Governance)',
    statutoryRef: 'PFMA & Provincial PED Transfer Rules',
    description:
      'Bank confirmation letter (not older than 3 months) in the registered name of the ECD Centre/NPO with at least two non-related committee signatories.',
    category: 'Financial & Governance',
    templateId: 'dbe-budget-ringfence',
  },
  {
    id: 'menu-nutrition',
    title: 'Approved 5-Day Balanced Nutrition Menu & 50% Food Ring-Fence Log',
    statutoryRef: 'DBE National ECD Nutrition Guidelines',
    description:
      'Displayed weekly meal schedule (breakfast porridge, mid-morning fruit, balanced protein/vegetable lunch) with invoices proving 50% subsidy spend on nutrition.',
    category: 'Health & Municipal',
    templateId: 'dbe-budget-ringfence',
  },
  {
    id: 'child-protection-register',
    title: 'Form 29 Part B National Child Protection Register (CPR) Clearances',
    statutoryRef: 'Section 126 of the Children’s Act',
    description:
      'SAPS Police Clearance and Form 29 clearance for all principals, practitioners, cooks, and grounds staff confirming zero child abuse offenses.',
    category: 'Statutory Registration',
  },
  {
    id: 'lease-pto-deed',
    title: 'Title Deed, Signed Lease Agreement, or Traditional Council PTO Letter',
    statutoryRef: 'Municipal Land Use & Infrastructure Grant Rules',
    description:
      'Proof of lawful occupation (Title Deed, 3+ year lease, or Permission to Occupy letter from Traditional Authority) required for infrastructure grants.',
    category: 'Health & Municipal',
  },
  {
    id: 'financial-statements',
    title: 'Annual Accounting Officer Report & SARS Tax Compliance PIN',
    statutoryRef: 'NPO Directorate & NLC Compliance',
    description:
      'Signed annual income/expenditure report by a registered Accounting Officer plus an active SARS Tax Compliance Status (TCS) PIN for NLC and CSI grants.',
    category: 'Financial & Governance',
  },
];

export const OFFICIAL_DBE_COMPLIANCE_TEMPLATES: DbeComplianceTemplate[] = [
  {
    id: 'dbe-attendance-register',
    title: 'DBE Monthly Subsidy Learner Attendance & Tranche Claim Register',
    category: 'DBE Subsidy Audit Pack',
    description:
      'Official South African PED-compliant monthly attendance register calculating qualifying learner days at the gazetted R24.00/child/day rate for quarterly claims.',
    format: 'Printable PED Audit Sheet',
    content: `REPUBLIC OF SOUTH AFRICA — DEPARTMENT OF BASIC EDUCATION (DBE)
PROVINCIAL EDUCATION DEPARTMENT (PED) ECD EQUITABLE SHARE SUBSIDY
MONTHLY LEARNER ATTENDANCE & TRANCHE CLAIM REGISTER (R24.00 / CHILD / DAY)

================================================================================
CENTRE DETAILS
================================================================================
Official ECD Centre Name: ______________________________________________________
NPO Registration Number:  ________________________  EMIS / DBE No: _____________
Province & District:      ________________________  Municipality: ______________
Claim Month & Year:       ________________________  Operational Days: ____ / 22

================================================================================
DAILY LEARNER ATTENDANCE SUMMARY (QUALIFYING MEANS-TESTED CHILDREN)
================================================================================
No | Learner Surname & Full Name      | DOB (YYYY/MM/DD) | Birth Cert / Clinic Card | Days Present | Subsidy (Days x R24)
---+----------------------------------+------------------+--------------------------+--------------+---------------------
01 | ________________________________ | ____ / __ / __   | [ ] Verified On File     | _____ days   | R __________________
02 | ________________________________ | ____ / __ / __   | [ ] Verified On File     | _____ days   | R __________________
03 | ________________________________ | ____ / __ / __   | [ ] Verified On File     | _____ days   | R __________________
04 | ________________________________ | ____ / __ / __   | [ ] Verified On File     | _____ days   | R __________________
05 | ________________________________ | ____ / __ / __   | [ ] Verified On File     | _____ days   | R __________________
06 | ________________________________ | ____ / __ / __   | [ ] Verified On File     | _____ days   | R __________________
07 | ________________________________ | ____ / __ / __   | [ ] Verified On File     | _____ days   | R __________________
08 | ________________________________ | ____ / __ / __   | [ ] Verified On File     | _____ days   | R __________________
09 | ________________________________ | ____ / __ / __   | [ ] Verified On File     | _____ days   | R __________________
10 | ________________________________ | ____ / __ / __   | [ ] Verified On File     | _____ days   | R __________________

================================================================================
MONTHLY SUBSIDY RECONCILIATION & RING-FENCED ALLOCATION
================================================================================
Total Qualifying Children Registered:     _____________ children
Total Learner Attendance Days This Month: _____________ learner-days
Gazetted DBE Daily Tariff:                R 24.00 per child per operational day
TOTAL MONTHLY SUBSIDY CLAIMED:            R _____________________ ZAR

MANDATORY RING-FENCED EXPENDITURE BREAKDOWN:
1. Child Nutrition & Daily Meals (50%):          R _____________________
2. Practitioner Stipends & Salaries (30%):       R _____________________
3. Learning Stimulation & Admin Overheads (20%): R _____________________

================================================================================
CERTIFICATION BY PRINCIPAL & NPO TREASURER
================================================================================
We hereby certify that the attendance figures above are true, accurate, and supported
by daily classroom registers and parent means-test files available for PED inspection.

Principal Signature: ________________________  Date: ____ / ____ / 2026
NPO Treasurer / Chair: ______________________  Date: ____ / ____ / 2026
Official Centre Stamp: [STAMP]`,
  },
  {
    id: 'dbe-means-test-affidavit',
    title: 'Parent Income Means-Test Declaration & SASSA Subsidy Consent Form',
    category: 'DBE Subsidy Audit Pack',
    description:
      'Mandatory household income declaration form verifying that a child qualifies for the DBE R24/day per-child subsidy via SASSA CSG or low-income threshold.',
    format: 'Parent Declaration Form',
    content: `REPUBLIC OF SOUTH AFRICA — EARLY CHILDHOOD DEVELOPMENT SUBSIDY
PARENT / LEGAL GUARDIAN INCOME MEANS-TEST DECLARATION & CONSENT FORM

================================================================================
SECTION A: CHILD & ECD CENTRE PARTICULARS
================================================================================
Name of ECD Centre:         ____________________________________________________
Child Full Names & Surname: ____________________________________________________
Child Date of Birth:        ____ / ____ / 20____   Gender: [ ] Female  [ ] Male
SA Birth Certificate No:    ____________________________________________________
Road-to-Health Clinic Card: [ ] Copy Attached   Immunisations Up to Date: [ ] Yes

================================================================================
SECTION B: PARENT / CAREGIVER HOUSEHOLD INCOME MEANS TEST
================================================================================
Parent / Primary Caregiver Name: _______________________________________________
SA ID / Passport Number:         _______________________________________________
Residential Address / Ward:      _______________________________________________
Contact Cell / WhatsApp:         _______________________________________________

QUALIFYING CRITERIA (Tick applicable qualification category):
[ ] Category 1: Child receives a SASSA Child Support Grant (CSG) or Foster Child Grant
    SASSA Reference / Card Last 4 Digits: ______________________________________
[ ] Category 2: Combined gross monthly household income is below the provincial
    DBE ECD Means-Test Threshold (Under R4,500 / month per parent)
    Declared Monthly Household Income: R ___________________ / month
[ ] Category 3: Unemployed single caregiver / child-headed or vulnerable household

================================================================================
SECTION C: SUPPORTING DOCUMENTS ATTACHED (MANDATORY FOR PED AUDIT)
================================================================================
[ ] Certified copy of Child's Unabridged Birth Certificate
[ ] Copy of Road-to-Health Immunisation Clinic Card
[ ] Certified copy of Parent / Guardian SA ID Document
[ ] Proof of SASSA Grant receipt OR 3-Month Bank Statement / Unemployment Affidavit

================================================================================
SECTION D: SWORN DECLARATION & POPIA CONSENT
================================================================================
I, the undersigned parent/legal guardian, declare that the financial information
provided above is true and correct. I consent to the ECD Centre submitting this
record to the Provincial Department of Basic Education solely for the purpose of
claiming the per-child daily ECD nutrition and learning subsidy.

Parent / Guardian Signature: _______________________  Date: ____ / ____ / 2026
Principal Verification Sign: _______________________  Date: ____ / ____ / 2026`,
  },
  {
    id: 'dbe-budget-ringfence',
    title: 'DBE 50/30/20 Subsidy Ring-Fenced Expenditure & Nutrition Log',
    category: 'DBE Subsidy Audit Pack',
    description:
      'Financial reconciliation ledger proving compliance with the 50% Nutrition, 30% Practitioner Stipend, and 20% Stimulation/Admin expenditure rule.',
    format: 'Financial Audit Ledger',
    content: `SOUTH AFRICAN ECD SUBSIDY FINANCIAL RECONCILIATION & RING-FENCE LEDGER
COMPLIANT WITH PROVINCIAL EDUCATION DEPARTMENT (PED) FINANCIAL NORMS

ECD Centre Name: _________________________________  NPO #: _____________________
Reporting Quarter: [ ] Q1 (Apr-Jun)  [ ] Q2 (Jul-Sep)  [ ] Q3 (Oct-Dec)  [ ] Q4 (Jan-Mar)
Total Tranche Received from PED: R ________________________ ZAR

================================================================================
1. CHILD NUTRITION & MEAL ALLOCATION (MANDATORY 50% MINIMUM)
================================================================================
Required 50% Allocation: R ________________________
Actual Nutrition Spend:  R ________________________
Invoice / Receipt Log:
- Maize Meal, Oats, Sorghum & Fortified Porridge:  R ______________ (Inv #: _____)
- Fresh Vegetables, Fruit & Legumes (Beans/Lentils):R ______________ (Inv #: _____)
- Protein (Eggs, Chicken, Pilchards, Milk, Maas):  R ______________ (Inv #: _____)
- Cooking Gas / Electricity for Kitchen Prep:      R ______________ (Inv #: _____)

================================================================================
2. PRACTITIONER & COOK STIPEND ALLOCATION (MANDATORY 30% TARGET)
================================================================================
Required 30% Allocation: R ________________________
Actual Stipend Spend:    R ________________________
EFT Payroll Verification:
- Lead ECD Practitioner (NQF Level 4/5):           R ______________ (EFT Ref: ___)
- Assistant Practitioner / Caregiver:              R ______________ (EFT Ref: ___)
- Nutrition Cook / General Assistant:              R ______________ (EFT Ref: ___)

================================================================================
3. LEARNING STIMULATION MATERIALS & ADMIN (MAXIMUM 20% CAP)
================================================================================
Allowed 20% Allocation:  R ________________________
Actual Materials/Admin:  R ________________________
- Age-appropriate Puzzles, Books, Crayons, Paper:  R ______________ (Inv #: _____)
- Hygiene & Sanitation (Soap, Sanitizer, Tissues): R ______________ (Inv #: _____)
- Bank Charges & Audit Stationery:                 R ______________ (Inv #: _____)

================================================================================
DECLARATION BY NPO TREASURER & PRINCIPAL
================================================================================
All original till slips, supplier tax invoices, and bank statements are filed in
the Centre Audit Binder for 5 years in accordance with the NPO Act.

NPO Treasurer Signature: _________________________  Date: ____ / ____ / 2026
Principal Signature:     _________________________  Date: ____ / ____ / 2026`,
  },
  {
    id: 'dbe-self-assessment',
    title: 'Vangasali Bronze-Silver-Gold Environmental Health & Safety Audit Checklist',
    category: 'DBE Subsidy Audit Pack',
    description:
      'Pre-inspection walk-through checklist used by municipal environmental health practitioners (EHPs) and DBE district officials for Conditional and Full registration.',
    format: 'Inspector Walk-Through Checklist',
    content: `DEPARTMENT OF BASIC EDUCATION (DBE) & MUNICIPAL ENVIRONMENTAL HEALTH
ECD REGISTRATION PRE-INSPECTION SELF-ASSESSMENT (BRONZE / SILVER / GOLD)

ECD Centre Name: _________________________________  Ward / Municipality: ________
Inspection Date: ____ / ____ / 2026                 Total Learners: _____________

================================================================================
PART 1: PHYSICAL INFRASTRUCTURE & SPACE NORMS
================================================================================
[ ] Indoor Play & Learning Space provides at least 1.5m² per enrolled child
[ ] Outdoor Play Area provides at least 2.0m² per child and is free of hazards
[ ] Perimeter Fence & Lockable Gate (Min 1.8m height) prevent unauthorized access
[ ] Separate Sick Bay / Isolation Corner available for unwell children
[ ] Natural ventilation (windows/doors) and leak-free roof structure verified

================================================================================
PART 2: WATER, SANITATION & HYGIENE (WASH)
================================================================================
[ ] Safe, clean drinking water available on site (Municipal tap or treated tank)
[ ] Minimum 1 child-sized flush toilet / potty per 20 children (Separate from staff)
[ ] Handwashing station with running water and liquid soap at toilet & eating area
[ ] Nappy-changing surface is washable, disinfected after every use, with closed bin

================================================================================
PART 3: KITCHEN, FOOD SAFETY & FIRE PROTECTION
================================================================================
[ ] Food preparation area is separated from child play zones by a safety gate/door
[ ] Dry food stored at least 15cm off the floor in sealed pest-proof containers
[ ] Serviced Fire Extinguisher (min 4.5kg DCP) mounted on wall with clear exit sign
[ ] Stocked First-Aid Kit mounted out of reach of children + Emergency Numbers poster
[ ] At least 1 staff member holds a valid First Aid Level 1 Certificate

================================================================================
PART 4: GOVERNANCE, RATIOS & CHILD PROTECTION
================================================================================
[ ] Practitioner-to-Child Ratios met:
    - 0 to 18 months: 1:6     - 18 to 36 months: 1:12
    - 3 to 4 years:   1:20    - 4 to 5 years:    1:30
[ ] Form 29 Part B Child Protection Register (CPR) clearance on file for all staff
[ ] Daily NCF 0-4 Early Learning Routine displayed on classroom wall
[ ] Incident, Accident & Medication Administration Register maintained daily

Self-Audit Score: _____ / 18 Criteria Met
Principal Signature: _____________________________  Date: ____ / ____ / 2026`,
  },
];

export const PROVINCIAL_DBE_ECD_DESKS: ProvincialDbeDesk[] = [
  {
    province: 'Gauteng',
    department: 'Gauteng Department of Education (GDE) — ECD Directorate',
    portalUrl: 'https://gde.gov.za/',
    helpline: '0800 000 789 / (011) 355 0000',
    intakeWindow: 'Annual Non-Profit Business Plan Window (January – March)',
    registrationFocus: 'Urban township backyard crèche silver-to-gold regularization & R24/day nutrition tranche.',
  },
  {
    province: 'Western Cape',
    department: 'Western Cape Education Department (WCED) — ECD Directorate',
    portalUrl: 'https://wcedonline.westerncape.gov.za/early-childhood-development',
    helpline: '0861 819 919 / (021) 467 2000',
    intakeWindow: 'Annual CEMIS / ECD Cycle (November – February)',
    registrationFocus: 'e-Portal registration, municipal fire/zoning waivers, and Grade R/RR articulation.',
  },
  {
    province: 'KwaZulu-Natal',
    department: 'KZN Department of Education — Early Childhood Development Directorate',
    portalUrl: 'https://www.kzneducation.gov.za/',
    helpline: '0800 204 353 / (033) 846 5000',
    intakeWindow: 'District Circuit Intake (January – April)',
    registrationFocus: 'Traditional Authority PTO letters, rural sanitation upgrades, and 264-day nutrition claims.',
  },
  {
    province: 'Eastern Cape',
    department: 'Eastern Cape Department of Education (ECDOE) — ECD & Foundation Phase',
    portalUrl: 'https://eceducation.gov.za/',
    helpline: '0800 203 116 / (040) 608 4200',
    intakeWindow: 'Annual District Verification (February – May)',
    registrationFocus: 'Rural water/sanitation compliance, Vangasali Bronze registration, and practitioner stipends.',
  },
  {
    province: 'Limpopo',
    department: 'Limpopo Department of Education (LDoE) — ECD Directorate',
    portalUrl: 'http://www.edu.limpopo.gov.za/',
    helpline: '(015) 290 7600 / 0800 864 686',
    intakeWindow: 'Annual District SLA Signing (February – April)',
    registrationFocus: 'Community educare NPO governance, borehole/water storage, and daily meal registers.',
  },
  {
    province: 'Mpumalanga',
    department: 'Mpumalanga Department of Education — ECD Sub-Directorate',
    portalUrl: 'https://www.mpumalanga.gov.za/dept/education',
    helpline: '(013) 766 5000 / 0800 203 116',
    intakeWindow: 'Annual Provincial NPO Call (January – March)',
    registrationFocus: 'Conditional registration extensions, toy library distribution, and NQF Level 4 training.',
  },
  {
    province: 'Free State',
    department: 'Free State Department of Education — ECD & Primary Directorate',
    portalUrl: 'https://www.education.fs.gov.za/',
    helpline: '(051) 404 8000',
    intakeWindow: 'Annual District Intake (February – April)',
    registrationFocus: 'Municipal environmental health certificates, kitchen safety, and SASSA means-test audits.',
  },
  {
    province: 'North West',
    department: 'North West Department of Education — ECD Directorate',
    portalUrl: 'https://www.nwpg.gov.za/Education/',
    helpline: '(018) 388 3429 / 0800 111 268',
    intakeWindow: 'Annual Circuit Verification (January – April)',
    registrationFocus: 'Mining-belt community crèche upgrades, fencing grants, and quarterly attendance returns.',
  },
  {
    province: 'Northern Cape',
    department: 'Northern Cape Department of Education — ECD Unit',
    portalUrl: 'http://ncdoe.ncpg.gov.za/',
    helpline: '(053) 839 6500',
    intakeWindow: 'Annual District SLA Window (February – April)',
    registrationFocus: 'Remote district mobile ECD hubs, solar/water infrastructure, and practitioner bursaries.',
  },
];

export const DEFAULT_COMPLIANCE_CHECKS = [
  'npo-cert',
  'attendance-register',
  'means-test-affidavits',
  'bank-account',
  'menu-nutrition',
];

const LOCAL_FUNDING_STORAGE_KEY = 'nurserynet_funding_workspace_v2';

/**
 * Determines whether the current principal has an active paid subscription
 * (`Verified Centre` R149/mo or `Featured Top Slot` R390/mo) via Firestore or local active plan state.
 */
export function hasActivePaidSubscription(user: AuthUser | null): boolean {
  if (user?.subscriptionStatus === 'active' && (user.planId === 'creative' || user.planId === 'growth')) {
    return true;
  }
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('nurserynet_active_plan');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          (parsed.tierId === 'verified' ||
            parsed.tierId === 'pro_featured' ||
            Number(parsed.monthlyPriceZAR) >= 149)
        ) {
          return true;
        }
      }
    } catch {
      // ignore storage errors
    }
  }
  return false;
}

export function calculateEstimatedPipelineZAR(
  pipelineGrants: PipelineGrantEntry[],
  qualifyingChildren: number,
  daysPerMonth: number
): number {
  const annualDbeSubsidy = qualifyingChildren * CURRENT_DBE_DAILY_SUBSIDY_ZAR * (daysPerMonth * 11);
  if (pipelineGrants.length === 0) {
    return Math.round(annualDbeSubsidy);
  }
  let sum = 0;
  for (const g of pipelineGrants) {
    if (g.grantId === 'dbe-per-child-subsidy') {
      sum += annualDbeSubsidy;
    } else {
      sum += Number(g.estimatedZAR) || 75000;
    }
  }
  return Math.min(50000000, Math.max(0, Math.round(sum)));
}

export function getLocalFundingWorkspaceFallback(): FundingWorkspaceRecord {
  const defaultGrants: PipelineGrantEntry[] = [
    {
      grantId: VERIFIED_SA_ECD_GRANTS[0].id,
      title: VERIFIED_SA_ECD_GRANTS[0].title,
      provider: VERIFIED_SA_ECD_GRANTS[0].provider,
      amountLabel: VERIFIED_SA_ECD_GRANTS[0].amountLabel,
      estimatedZAR: 133056,
      status: 'preparing',
      deadline: VERIFIED_SA_ECD_GRANTS[0].deadline,
      url: VERIFIED_SA_ECD_GRANTS[0].url,
    },
    {
      grantId: VERIFIED_SA_ECD_GRANTS[2].id,
      title: VERIFIED_SA_ECD_GRANTS[2].title,
      provider: VERIFIED_SA_ECD_GRANTS[2].provider,
      amountLabel: VERIFIED_SA_ECD_GRANTS[2].amountLabel,
      estimatedZAR: VERIFIED_SA_ECD_GRANTS[2].estimatedZAR,
      status: 'saved',
      deadline: VERIFIED_SA_ECD_GRANTS[2].deadline,
      url: VERIFIED_SA_ECD_GRANTS[2].url,
    },
  ];

  let schoolName = 'Sunshine Early Learning Centre';
  let province = 'Gauteng';
  let npoNumber = '';

  if (typeof window !== 'undefined') {
    try {
      const savedPlan = localStorage.getItem('nurserynet_active_plan');
      if (savedPlan) {
        const parsedPlan = JSON.parse(savedPlan);
        if (parsedPlan.schoolName) schoolName = parsedPlan.schoolName;
        if (parsedPlan.province) province = parsedPlan.province;
        if (parsedPlan.npoNumber) npoNumber = parsedPlan.npoNumber;
      }

      const raw = localStorage.getItem(LOCAL_FUNDING_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as FundingWorkspaceRecord;
        return {
          ...parsed,
          schoolName: parsed.schoolName || schoolName,
          province: parsed.province || province,
          npoNumber: parsed.npoNumber || npoNumber,
        };
      }
    } catch {
      // ignore storage errors
    }
  }

  const qualifyingChildren = 25;
  const daysPerMonth = 22;
  return {
    uid: 'guest',
    schoolName,
    province,
    npoNumber,
    registrationStatus: 'conditional',
    qualifyingChildren,
    daysPerMonth,
    complianceChecks: DEFAULT_COMPLIANCE_CHECKS,
    pipelineGrants: defaultGrants,
    estimatedPipelineZAR: calculateEstimatedPipelineZAR(defaultGrants, qualifyingChildren, daysPerMonth),
  };
}

export function saveLocalFundingWorkspaceFallback(record: FundingWorkspaceRecord): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_FUNDING_STORAGE_KEY, JSON.stringify(record));
    window.dispatchEvent(new Event('nurserynet_funding_updated'));
  } catch {
    // ignore storage errors
  }
}

/**
 * Subscribes to the authenticated user's `/funding_workspaces/{uid}` document in Firestore.
 */
export function subscribeToFundingWorkspace(
  uid: string,
  onUpdate: (workspace: FundingWorkspaceRecord | null) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const cleanUid = sanitizeFirestoreId(uid);
  const path = `funding_workspaces/${cleanUid}`;
  return onSnapshot(
    doc(db, 'funding_workspaces', cleanUid),
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as FundingWorkspaceRecord);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
}

/**
 * Creates or updates the authenticated user's `/funding_workspaces/{uid}` document in Firestore
 * while strictly adhering to the schema and size limits in `firestore.rules`.
 */
export async function saveFundingWorkspaceToFirestore(
  uid: string,
  workspace: Omit<FundingWorkspaceRecord, 'uid' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  const cleanUid = sanitizeFirestoreId(uid);
  const path = `funding_workspaces/${cleanUid}`;
  const docRef = doc(db, 'funding_workspaces', cleanUid);

  const sanitizedChecks = Array.isArray(workspace.complianceChecks)
    ? workspace.complianceChecks
        .filter((id) => typeof id === 'string' && id.trim().length > 0)
        .map((id) => truncateString(id.trim(), 80))
        .slice(0, 20)
    : [];

  const sanitizedGrants: PipelineGrantEntry[] = Array.isArray(workspace.pipelineGrants)
    ? workspace.pipelineGrants.slice(0, 25).map((g) => ({
        grantId: truncateString(g.grantId || 'grant', 128),
        title: truncateString(g.title || 'SA ECD Grant', 200),
        provider: truncateString(g.provider || 'DBE / Donor', 160),
        amountLabel: truncateString(g.amountLabel || 'Variable', 120),
        estimatedZAR: Math.min(25000000, Math.max(0, Math.round(Number(g.estimatedZAR) || 50000))),
        status:
          g.status === 'saved' ||
          g.status === 'preparing' ||
          g.status === 'submitted' ||
          g.status === 'approved'
            ? g.status
            : 'saved',
        deadline: truncateString(g.deadline || 'Rolling Window', 120),
        url: truncateString(g.url || 'https://www.education.gov.za', 300),
      }))
    : [];

  const qualifyingChildren = Math.min(1000, Math.max(0, Math.round(Number(workspace.qualifyingChildren) || 25)));
  const daysPerMonth = Math.min(31, Math.max(1, Math.round(Number(workspace.daysPerMonth) || 22)));
  const estimatedPipelineZAR = calculateEstimatedPipelineZAR(
    sanitizedGrants,
    qualifyingChildren,
    daysPerMonth
  );

  const safeStatus: EcdRegistrationStatus =
    workspace.registrationStatus === 'full' ||
    workspace.registrationStatus === 'conditional' ||
    workspace.registrationStatus === 'unregistered'
      ? workspace.registrationStatus
      : 'conditional';

  const baseFields: Record<string, unknown> = {
    schoolName: truncateString(workspace.schoolName || 'Sunshine Early Learning Centre', 160),
    province: truncateString(workspace.province || 'Gauteng', 80),
    registrationStatus: safeStatus,
    qualifyingChildren,
    daysPerMonth,
    complianceChecks: sanitizedChecks,
    pipelineGrants: sanitizedGrants,
    estimatedPipelineZAR,
    updatedAt: serverTimestamp(),
  };

  if (workspace.npoNumber !== undefined) {
    baseFields.npoNumber = truncateString(workspace.npoNumber, 80);
  }

  // Also mirror to local fallback for instant cross-tab sync
  saveLocalFundingWorkspaceFallback({
    uid: cleanUid,
    schoolName: String(baseFields.schoolName),
    province: String(baseFields.province),
    npoNumber: workspace.npoNumber ? truncateString(workspace.npoNumber, 80) : '',
    registrationStatus: safeStatus,
    qualifyingChildren,
    daysPerMonth,
    complianceChecks: sanitizedChecks,
    pipelineGrants: sanitizedGrants,
    estimatedPipelineZAR,
  });

  try {
    const existingSnap = await getDoc(docRef);
    if (existingSnap.exists()) {
      await updateDoc(docRef, baseFields);
    } else {
      await setDoc(docRef, {
        uid: cleanUid,
        ...baseFields,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Subscribes to the authenticated user's saved AI Grant Proposal Drafts in Firestore.
 */
export function subscribeToUserGrantProposals(
  uid: string,
  onUpdate: (proposals: GrantProposalDraftRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const cleanUid = sanitizeFirestoreId(uid);
  const path = 'grant_proposals';
  const q = query(collection(db, path), where('ownerUid', '==', cleanUid));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: GrantProposalDraftRecord[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as GrantProposalDraftRecord);
      });
      list.sort((a, b) => {
        const tA = typeof a.createdAt === 'object' && a.createdAt && 'toMillis' in a.createdAt ? a.createdAt.toMillis() : 0;
        const tB = typeof b.createdAt === 'object' && b.createdAt && 'toMillis' in b.createdAt ? b.createdAt.toMillis() : 0;
        return tB - tA;
      });
      onUpdate(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
}

/**
 * Saves an AI-generated or edited Grant Proposal Draft to `/grant_proposals/{proposalId}`.
 */
export async function saveGrantProposalToFirestore(params: {
  proposalId?: string;
  ownerUid: string;
  schoolName: string;
  province: string;
  npoNumber?: string;
  grantId: string;
  grantTitle: string;
  funderName: string;
  requestedAmountZAR: number;
  projectFocus: string;
  executiveSummary: string;
  fullProposalText: string;
  budgetBreakdown?: string;
}): Promise<string> {
  const cleanOwnerUid = sanitizeFirestoreId(params.ownerUid);
  const proposalId = params.proposalId
    ? sanitizeFirestoreId(params.proposalId)
    : sanitizeFirestoreId(`prop_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
  const path = `grant_proposals/${proposalId}`;
  const docRef = doc(db, 'grant_proposals', proposalId);

  const payload: Record<string, unknown> = {
    proposalId,
    ownerUid: cleanOwnerUid,
    schoolName: truncateString(params.schoolName || 'Sunshine Early Learning Centre', 160),
    province: truncateString(params.province || 'Gauteng', 80),
    grantId: truncateString(params.grantId || 'custom-grant', 128),
    grantTitle: truncateString(params.grantTitle || 'ECD Funding Proposal', 200),
    funderName: truncateString(params.funderName || 'Department of Basic Education', 160),
    requestedAmountZAR: Math.min(25000000, Math.max(0, Math.round(Number(params.requestedAmountZAR) || 85000))),
    projectFocus: truncateString(params.projectFocus || 'Early learning nutrition and infrastructure upgrade', 500),
    executiveSummary: truncateString(params.executiveSummary || 'Executive summary for South African ECD grant application.', 2000),
    fullProposalText: truncateString(params.fullProposalText || 'Full motivation letter and implementation plan.', 12000),
    updatedAt: serverTimestamp(),
  };

  if (params.npoNumber) {
    payload.npoNumber = truncateString(params.npoNumber, 80);
  }
  if (params.budgetBreakdown) {
    payload.budgetBreakdown = truncateString(params.budgetBreakdown, 3000);
  }

  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      await updateDoc(docRef, {
        schoolName: payload.schoolName,
        province: payload.province,
        ...(params.npoNumber ? { npoNumber: payload.npoNumber } : {}),
        requestedAmountZAR: payload.requestedAmountZAR,
        projectFocus: payload.projectFocus,
        executiveSummary: payload.executiveSummary,
        fullProposalText: payload.fullProposalText,
        ...(params.budgetBreakdown ? { budgetBreakdown: payload.budgetBreakdown } : {}),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(docRef, {
        ...payload,
        createdAt: serverTimestamp(),
      });
    }
    return proposalId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteGrantProposalFromFirestore(proposalId: string): Promise<void> {
  const cleanId = sanitizeFirestoreId(proposalId);
  const path = `grant_proposals/${cleanId}`;
  try {
    await deleteDoc(doc(db, 'grant_proposals', cleanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
