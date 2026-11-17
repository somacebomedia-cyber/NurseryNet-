import type { Preschool } from '@/data/preschools';

export type CustomFieldType = 'text' | 'select' | 'checkbox' | 'textarea';

export interface CustomApplicationField {
  id: string;
  label: string;
  type: CustomFieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export interface ApplicationFormConfig {
  schoolName?: string;
  formTitle: string;
  welcomeNote: string;
  requireIdNumbers: boolean;
  requireMedicalInfo: boolean;
  requireEmergencyContact: boolean;
  customFields: CustomApplicationField[];
  requiredDocumentsChecklist: string[];
  updatedAt: string;
}

export interface PreschoolApplication {
  id: string;
  batchId: string;
  schoolId: string;
  schoolName: string;
  schoolCity: string;
  schoolProvince: string;
  schoolPhone: string;
  childFullName: string;
  childDateOfBirth: string;
  childAgeGroup: string;
  preferredStartDate: string;
  parentFullName: string;
  parentRelationship: string;
  parentIdOrPassport?: string;
  parentPhone: string;
  parentEmail: string;
  residentialAddress: string;
  medicalAllergies?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  customAnswers: Record<string, string>;
  documentsAcknowledged: string[];
  status: 'new' | 'under_review' | 'accepted' | 'waitlisted';
  submittedAt: string;
}

export interface ParentEnrolmentPassport {
  childFullName: string;
  childDateOfBirth: string;
  childAgeGroup: string;
  preferredStartDate: string;
  parentFullName: string;
  parentRelationship: string;
  parentIdOrPassport: string;
  parentPhone: string;
  parentEmail: string;
  residentialAddress: string;
  medicalAllergies: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  customAnswers: Record<string, string>;
  updatedAt: string;
}

export const DEFAULT_APPLICATION_FORM_CONFIG: ApplicationFormConfig = {
  formTitle: 'Official Learner Enrolment Application Form',
  welcomeNote:
    'Complete this online admission form to apply directly to our school. Once submitted, our Principal receives your application immediately on their dashboard.',
  requireIdNumbers: true,
  requireMedicalInfo: true,
  requireEmergencyContact: true,
  customFields: [
    {
      id: 'field-home-language',
      label: 'Child’s Primary Home Language',
      type: 'select',
      required: true,
      options: ['English', 'isiZulu', 'isiXhosa', 'Afrikaans', 'Sesotho', 'Setswana', 'Sepedi', 'Other'],
    },
    {
      id: 'field-aftercare',
      label: 'Attendance & Aftercare Option',
      type: 'select',
      required: true,
      options: ['Full Day (07:00 – 17:30)', 'Half Day (07:00 – 13:00)', 'Full Day + Holiday Care'],
    },
    {
      id: 'field-transport',
      label: 'Does your child require school transport collection?',
      type: 'checkbox',
      required: false,
    },
    {
      id: 'field-previous-ecd',
      label: 'Previous Preschool / Crèche Attended (if any)',
      type: 'text',
      required: false,
      placeholder: 'e.g. First time attending or name of previous crèche',
    },
  ],
  requiredDocumentsChecklist: [
    'Certified copy of Child’s Birth Certificate or Immunisation Clinic Card (Road to Health)',
    'Copy of Parent / Legal Guardian SA ID or Passport',
    'Proof of Residential Address (Municipal bill or affidavit)',
  ],
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_SUBMITTED_APPLICATIONS: PreschoolApplication[] = [
  {
    id: 'app-demo-201',
    batchId: 'batch-demo-1',
    schoolId: 'sunshine-early-learning-centre',
    schoolName: 'Sunshine Early Learning Centre',
    schoolCity: 'Johannesburg',
    schoolProvince: 'Gauteng',
    schoolPhone: '082 555 1829',
    childFullName: 'Amahle Ndlovu',
    childDateOfBirth: '2023-04-12',
    childAgeGroup: 'Toddler (1–3 years)',
    preferredStartDate: 'January 2027 (Term 1)',
    parentFullName: 'Thandiwe Ndlovu',
    parentRelationship: 'Mother',
    parentIdOrPassport: '9204180192084',
    parentPhone: '082 614 3390',
    parentEmail: 'thandiwe.ndlovu@gmail.com',
    residentialAddress: '42 Acacia Avenue, Randburg, Johannesburg',
    medicalAllergies: 'No known food allergies; clinic card up to date',
    emergencyContactName: 'Bongani Ndlovu',
    emergencyContactPhone: '083 712 4401',
    customAnswers: {
      'Child’s Primary Home Language': 'isiZulu',
      'Attendance & Aftercare Option': 'Full Day (07:00 – 17:30)',
      'Does your child require school transport collection?': 'No',
      'Previous Preschool / Crèche Attended (if any)': 'First time attending preschool',
    },
    documentsAcknowledged: [
      'Certified copy of Child’s Birth Certificate or Immunisation Clinic Card (Road to Health)',
      'Copy of Parent / Legal Guardian SA ID or Passport',
    ],
    status: 'new',
    submittedAt: '2026-11-16',
  },
];

const FORM_CONFIG_KEY = 'nurserynet_application_form_config';
const APPLICATIONS_STORAGE_KEY = 'nurserynet_applications';
const PASSPORT_STORAGE_KEY = 'nurserynet_parent_passport';

export function calculateAgeGroupFromDob(dob: string): string {
  if (!dob) return 'Toddler (1–3 years)';
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return 'Toddler (1–3 years)';
  const now = new Date();
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (months <= 12) return 'Infant / Baby Care (3–12 months)';
  if (months <= 36) return 'Toddler (1–3 years)';
  if (months <= 54) return 'Preschool (3–4 years)';
  return 'Grade R / Pre-Primary (5–6 years)';
}

export function getSavedParentPassport(): ParentEnrolmentPassport | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PASSPORT_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
    // Fallback: check if parent previously booked a tour or sent an inquiry in this browser
    const rawTours = JSON.parse(localStorage.getItem('nurserynet_tours') || '[]');
    if (Array.isArray(rawTours) && rawTours.length > 0) {
      const latest = rawTours[0];
      return {
        childFullName: latest.childName || '',
        childDateOfBirth: '2023-05-14',
        childAgeGroup: latest.childAge || 'Toddler (1–3 years)',
        preferredStartDate: 'January 2027 (Term 1)',
        parentFullName: latest.parentName || '',
        parentRelationship: 'Mother',
        parentIdOrPassport: '',
        parentPhone: latest.phone || '',
        parentEmail: latest.email || '',
        residentialAddress: '',
        medicalAllergies: latest.notes || 'None reported',
        emergencyContactName: '',
        emergencyContactPhone: '',
        customAnswers: {},
        updatedAt: new Date().toISOString(),
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function saveParentPassport(passport: Omit<ParentEnrolmentPassport, 'updatedAt'>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      PASSPORT_STORAGE_KEY,
      JSON.stringify({
        ...passport,
        updatedAt: new Date().toISOString(),
      })
    );
  } catch (err) {
    console.error('Failed to save parent enrolment passport', err);
  }
}

export function getApplicationFormConfig(): ApplicationFormConfig {
  if (typeof window === 'undefined') return DEFAULT_APPLICATION_FORM_CONFIG;
  try {
    const raw = localStorage.getItem(FORM_CONFIG_KEY);
    if (!raw) return DEFAULT_APPLICATION_FORM_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_APPLICATION_FORM_CONFIG,
      ...parsed,
      customFields: Array.isArray(parsed.customFields)
        ? parsed.customFields
        : DEFAULT_APPLICATION_FORM_CONFIG.customFields,
      requiredDocumentsChecklist: Array.isArray(parsed.requiredDocumentsChecklist)
        ? parsed.requiredDocumentsChecklist
        : DEFAULT_APPLICATION_FORM_CONFIG.requiredDocumentsChecklist,
    };
  } catch {
    return DEFAULT_APPLICATION_FORM_CONFIG;
  }
}

export function saveApplicationFormConfig(config: ApplicationFormConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      FORM_CONFIG_KEY,
      JSON.stringify({
        ...config,
        updatedAt: new Date().toISOString(),
      })
    );
    window.dispatchEvent(new Event('nurserynet_form_config_updated'));
  } catch (err) {
    console.error('Failed to save application form config', err);
  }
}

export function getSubmittedApplications(): PreschoolApplication[] {
  if (typeof window === 'undefined') return DEFAULT_SUBMITTED_APPLICATIONS;
  try {
    const raw = localStorage.getItem(APPLICATIONS_STORAGE_KEY);
    const stored: PreschoolApplication[] = raw ? JSON.parse(raw) : [];
    const safeStored = Array.isArray(stored) ? stored : [];
    const existingIds = new Set(safeStored.map((a) => a.id));
    const merged = [
      ...safeStored,
      ...DEFAULT_SUBMITTED_APPLICATIONS.filter((d) => !existingIds.has(d.id)),
    ];
    return merged;
  } catch {
    return DEFAULT_SUBMITTED_APPLICATIONS;
  }
}

export function submitBatchApplications(
  targetSchools: Preschool[],
  basePayload: Omit<
    PreschoolApplication,
    'id' | 'batchId' | 'schoolId' | 'schoolName' | 'schoolCity' | 'schoolProvince' | 'schoolPhone' | 'status' | 'submittedAt'
  >
): PreschoolApplication[] {
  if (typeof window === 'undefined' || targetSchools.length === 0) return [];
  const batchId = `batch-${Date.now()}`;
  const today = new Date().toISOString().split('T')[0];

  const created: PreschoolApplication[] = targetSchools.map((school, idx) => ({
    ...basePayload,
    id: `app-${Date.now()}-${idx}`,
    batchId,
    schoolId: school.id,
    schoolName: school.name,
    schoolCity: school.city || school.municipality || 'South Africa',
    schoolProvince: String(school.province || ''),
    schoolPhone: school.phone || '082 555 1829',
    status: 'new',
    submittedAt: today,
  }));

  try {
    const existing = getSubmittedApplications();
    localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify([...created, ...existing]));
    // Also persist to Universal Parent Enrolment Passport for future 1-click agentic autofill
    saveParentPassport({
      childFullName: basePayload.childFullName,
      childDateOfBirth: basePayload.childDateOfBirth,
      childAgeGroup: basePayload.childAgeGroup,
      preferredStartDate: basePayload.preferredStartDate,
      parentFullName: basePayload.parentFullName,
      parentRelationship: basePayload.parentRelationship,
      parentIdOrPassport: basePayload.parentIdOrPassport || '',
      parentPhone: basePayload.parentPhone,
      parentEmail: basePayload.parentEmail,
      residentialAddress: basePayload.residentialAddress,
      medicalAllergies: basePayload.medicalAllergies || '',
      emergencyContactName: basePayload.emergencyContactName || '',
      emergencyContactPhone: basePayload.emergencyContactPhone || '',
      customAnswers: basePayload.customAnswers,
    });
    window.dispatchEvent(new Event('nurserynet_leads_updated'));
  } catch (err) {
    console.error('Failed to store submitted applications', err);
  }

  return created;
}

export function updateApplicationStatus(
  applicationId: string,
  nextStatus: PreschoolApplication['status']
): PreschoolApplication[] {
  const all = getSubmittedApplications();
  const updated = all.map((app) => (app.id === applicationId ? { ...app, status: nextStatus } : app));
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('nurserynet_leads_updated'));
    } catch {
      // Ignore storage error
    }
  }
  return updated;
}
