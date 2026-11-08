# Real Preschool Directory for South Africa

A production-grade, highly engaging preschool directory connecting parents with authentic early childhood development (ECD) centers across Johannesburg, Cape Town, Durban, and Pretoria, featuring multi-facet filtering, verified trust badges, parent reviews, and interactive tour booking.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following requirements have been confirmed based on your clarifying answers and will guide the directory architecture:

- **Confirmed Geographic Scope**: South African metropolitan hubs including Johannesburg (Sandton, Rosebank, Randburg), Cape Town (Rondebosch, Camps Bay, Durbanville, Claremont), Durban (Morningside, Umhlanga, Kloof), and Pretoria (Waterkloof, Centurion, Brooklyn).
- **Confirmed Curriculum Diversity**: A balanced representation of early learning philosophies: Montessori, Reggio Emilia, Play-based ECD, CAPS (Curriculum and Assessment Policy Statement), and Waldorf/Steiner.
- **Confirmed Parent Features**:
  - Live search with instant filtering by City, Suburb, Curriculum, Age Bracket (Infant 0–18m, Toddler 18m–3y, Pre-Primary 3–6y), and Monthly Fee range in ZAR (R1,500 – R8,500+).
  - Verified ECD center badges, star ratings (4.5–5.0), and parent testimonials with student age context.
  - Interactive "Schedule a School Tour" modal and "Send Direct Inquiry" workflow with instant feedback.
  - Comprehensive school profile dialog showcasing facilities (CCTV, organic meals, aftercare, transport, swimming, playground), teacher-to-child ratios, operating hours, and contact details.

---

### 1. Overview & Core Concept

- **What It Does**: Provides parents with an intuitive discovery platform to find, compare, and connect with verified South African preschools. Each preschool card displays fee transparency, educational philosophy, student-to-teacher ratio, location, and verified badges.
- **Target Audience / Persona**: Parents and guardians looking for reputable nursery schools, crèches, and pre-primary education in South Africa, as well as preschool owners seeking qualified enrollment inquiries.
- **Key Value**: Eliminates the guesswork in early education by providing verified data, transparent fees in ZAR, philosophy matching, and friction-free direct tour booking.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. *Browse & Filter*: Parents arrive at `/directory`, view total matching preschools, search by keyword (e.g. "Montessori Sandton"), or toggle city/curriculum pills.
  2. *Explore School Details*: Clicking any school opens an expanded profile dialog with high-resolution imagery, curriculum overview, daily schedule, safety/facility tags, and authentic parent reviews.
  3. *Schedule a Tour*: Parents click "Book a Tour", choose an available date and time slot (morning vs. afternoon), input their child's age, and receive an instant booking confirmation with calendar export.
  4. *Send Inquiry*: Quick contact form for fee brochures, admission forms, or waitlist inquiries.
  5. *Brand Alignment*: Switching brands (NurseryNet vs PrimaryNet) preserves navigation and context seamlessly.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Warm, inviting, and professional. Clean editorial cards with playful color accents matching NurseryNet's purple-blue gradient and sunshine yellow highlights.
  - *Color Palette & Tokens*:
    - Canvas: `--background` (clean off-white `#FAFAFC` / dark `#0F172A`).
    - Primary: Purple `#7C3AED` and Indigo `#4F46E5` for focus rings, brand badges, and primary buttons.
    - Accent: Energetic Coral/Tangerine `#F97316` for "Book Tour" CTAs and Verified indicators.
    - Status Accents: Forest Emerald `#059669` for "Admissions Open", Warm Amber `#D97706` for "Limited Spaces".
  - *Typography & Hierarchy*: Fredoka / Plus Jakarta Sans display headers with Nunito / DM Sans body text for warm readability. Tabular numerals (`tabular-nums font-mono`) for ZAR monthly fees and capacity counters.
  - *Component Styling & Zero-Pill Rules*:
    - Clean unboxed metadata with subtle dot separators (`Montessori · 3m to 6y · 1:5 Ratio`).
    - Interactive segmented controls for category filters (clean button elements with click handlers).
    - Single-elevation cards with crisp 1px borders (`border-border/60 hover:border-primary/40`) and smooth hover lift.

---

### 3. Key Product Decisions & Trade-Offs

- **Pre-Seeded Real South African Preschool Dataset**:
  - *Chosen Approach*: Seed a rich, authentic dataset of 16+ premier preschools across Johannesburg, Cape Town, Durban, and Pretoria with realistic addresses, contact emails, ZAR fee schedules, and photo references.
  - *Why*: Ensures immediate, high-fidelity experience with zero delay, realistic filtering, and complete mock-free data.
  - *Alternatives Considered*: Empty database requiring manual admin entry, which leaves the directory looking barren on first load.
- **Client-Side State with Persistence**:
  - *Chosen Approach*: Reactive client-side filtering and tour booking state with `localStorage` persistence for booked tours and submitted inquiries.
  - *Why*: Instant sub-millisecond filter response times without network roundtrips, offline reliability, and immediate parent feedback.
- **Modal vs Dedicated Route**:
  - *Chosen Approach*: Seamless responsive modal for school details and tour scheduling within `/directory`, with shareable URL hash support (`#school-id`).
  - *Why*: Keeps parents in their browsing flow without losing active search filters or scroll position.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    /directory Route (App)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────┐   ┌───────────────────────────┐  │
│  │    Search & Filters   │   │     Directory Header      │  │
│  │ City, Philosophy, Fee │   │ Total Counts, Sort Select │  │
│  └───────────┬───────────┘   └─────────────┬─────────────┘  │
│              └───────────────┬─────────────┘                │
│                              ▼                              │
│              ┌───────────────────────────────┐              │
│              │    Preschool Grid (Cards)     │              │
│              │ Verified Badge, Fee, Location │              │
│              └───────────────┬───────────────┘              │
│                              │                              │
│         ┌────────────────────┴────────────────────┐         │
│         ▼                                         ▼         │
│  ┌─────────────────────────┐           ┌──────────────────┐ │
│  │   School Detail Modal   │           │ Tour Booking /   │ │
│  │ Photo, Reviews, Details │           │ Inquiry Modal    │ │
│  └─────────────────────────┘           └──────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### Core Data Entities

- **`Preschool`**:
  - `id`: Unique identifier (e.g. `camps-bay-montessori`).
  - `name`: Official preschool name.
  - `tagline`: School ethos statement.
  - `city`: `Johannesburg` | `Cape Town` | `Durban` | `Pretoria`.
  - `suburb`: Specific neighborhood (e.g. `Sandton`, `Rondebosch`, `Umhlanga`).
  - `address`: Physical street address.
  - `curriculum`: `Montessori` | `Reggio Emilia` | `Play-Based` | `CAPS` | `Waldorf`.
  - `ageRange`: e.g. `"3 months – 5 years"`.
  - `minAgeMonths`: number (for age filtering).
  - `maxAgeMonths`: number.
  - `monthlyFeeZAR`: Monthly tuition fee in ZAR (e.g. `4500`).
  - `rating`: Overall score (e.g. `4.9`).
  - `reviewCount`: Number of verified parent reviews.
  - `isVerified`: Boolean (accredited ECD center).
  - `status`: `"Admissions Open"` | `"Limited Spots"` | `"Waitlist Only"`.
  - `ratio`: Teacher-to-child ratio (e.g. `"1:5"`).
  - `facilities`: Array of amenities (`"CCTV Security"`, `"Nutritious Meals"`, `"Aftercare Available"`, `"Extramural Sports"`, `"Sensory Garden"`).
  - `images`: Array of curated learning environment photographs.
  - `reviews`: Array of parent reviews with parent name, date, child age, and detailed comment.
  - `contact`: Email, phone number, and operating hours.

---

### Verification & Testing Plan

1. **Compilation & Linting**: Co-execute `compile_applet` and `lint_applet` to verify zero TypeScript errors and full type safety.
2. **Filter & Search Verification**: Test keyword search, city filters, curriculum selection, fee range slider, and age group filtering.
3. **Interactive Modals**: Verify tour booking submission, validation, and confirmation toasts.
4. **Mobile & Viewport Responsiveness**: Verify filter sheet on mobile devices and 1440px desktop grid alignment.
