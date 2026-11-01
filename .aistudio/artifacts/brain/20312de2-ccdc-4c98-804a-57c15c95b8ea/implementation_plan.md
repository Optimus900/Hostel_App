# Myposhtell — Official Student Hostel Resident Application

Myposhtell is a comprehensive, mobile-first and responsive web student hostel resident platform modeled after the official **Myposhtell** application by Memedeo Communications Private Limited. It replaces manual paperwork and warden queues with a single, clean digital portal for managing hostel admissions, gate passes, contactless QR check-in, daily mess menus, maintenance complaints, fee payments, announcements, move-out NOC clearances, and one-tap SOS alerts.

## User Review & Critical Decisions

> [!IMPORTANT]
> Below is the summary of your confirmed preferences from our clarification step, which govern the scope and design of this build:

- **Confirmed Role Scope**: **Student Resident App Only** — Focuses entirely on a rich, authentic student resident experience with interactive self-service flows (plus instant simulation triggers so you can test how pending gate passes, complaints, or NOC steps transition to "Approved" or "Resolved" in real time).
- **Confirmed Layout Architecture**: **Responsive Web & Mobile App** — Delivers a full multi-column workspace on desktop viewports (`1440px` baseline with left navigation sidebar and multi-card dashboard grid) while adapting seamlessly to a thumb-friendly mobile experience (`375px–430px` with compact top bar, bottom tab navigation, and slide-up sheets).
- **Confirmed Data Strategy**: **Instant Local Persistence with Pre-Loaded Realistic Hostel Data** — Comes pre-populated with realistic hostel resident profile data, room allocation, fee ledger, 7-day Indian hostel mess schedule, active gate passes, and maintenance logs persisted in `localStorage`.

---

## 1. Overview & Core Concept

- **What It Does**: Centralizes every touchpoint of a student's hostel stay—from initial admission and KYC verification to daily check-ins, meal planning, maintenance requests, fee settlement, and final move-out clearance.
- **Target Audience / Persona**: University and college students residing in managed hostels (e.g., *Poshtell Stays — Block B, Koramangala / North Campus*) who need quick, transparent access to hostel services without chasing staff or filling out paper slips.
- **Key Value**: Eliminates administrative friction with real-time status tracking, instant digital QR gate verification, transparent fee invoicing, and one-tap emergency safety tools.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Home Dashboard & Quick Actions**: At a glance, the student sees their resident ID card (Room `B-402`, Floor 4, Bed B), current hostel check-in status (`Checked In` / `Out on Gate Pass`), today's live Mess Menu card (Breakfast, Lunch, Snacks, Dinner with countdown/timings), next upcoming fee due, latest hostel announcements, and quick-launch actions.
2. **Digital QR Gate Check-In & Pass Verification**: A dedicated modal/drawer and dashboard card generating a dynamic, time-stamped personal QR code with resident photo, Hostel ID, room details, and a "Simulate Gate Scan (Check Out / Check In)" action that logs real-time entry/exit timestamps.
3. **Gate Pass & Leave Requests**: Students can apply for a **Day Outing Gate Pass** (few hours) or **Overnight / Home Leave** (multi-day with parent contact & destination address). Includes a live status tracker (`Pending Warden Approval` → `Approved` → `Checked Out` → `Returned`) with a one-click "Simulate Warden Approval" button so the user can test the complete pass lifecycle.
4. **Complaints & Maintenance Desk**: Students can raise tickets across categories (*Electrical, Plumbing, Wi-Fi/Internet, Housekeeping, Carpentry, Mess/Food*) with priority level, room location, description, and issue tracking (`Open` → `Assigned to Technician` → `Resolved`) plus feedback rating upon resolution.
5. **Weekly Mess Menu & Meal Feedback**: Interactive 7-day day-of-week selector (`Mon` through `Sun`) showing Breakfast, Lunch, Evening Snacks, and Dinner items, veg/non-veg indicators, nutritional/timing tags, a "Skip Meal / Opt-Out" toggle to reduce food waste, and daily meal rating.
6. **Fee Payments & Ledger (Razorpay / CCAvenue Checkout Simulation)**: Breakdown of Semester Hostel Rent, Mess Advance, Caution Deposit, and Late Fees. Includes an interactive multi-step payment checkout modal (UPI, NetBanking, Card) that generates downloadable/printable payment receipts and updates the paid ledger immediately.
7. **Hostel Admission, KYC & Move-Out (NOC) Portal**:
   - **Admission & KYC Tracker**: Displays the 5-stage onboarding pipeline (*Application Submitted → KYC Documents Verified → Fee Paid → Room Allocated → Biometric/QR Activated*) and allows viewing/updating uploaded KYC documents (Aadhaar, College ID, Emergency Contact).
   - **Move-Out & NOC Request**: Step-by-step departure clearance workflow where students select a move-out date, book a departure slot, and track live departmental clearances (*Mess Dues, Library/Assets, Room Inventory Inspection, Accounts Refund, Final Warden NOC*).
8. **One-Tap SOS Emergency Alert**: High-visibility emergency trigger in the header/sidebar that launches a 3-second countdown modal (with cancel option) before dispatching an urgent alert with the student's Room No. and live location coordinates to the Chief Warden, Security Desk, and Ambulance helpline.

### Visual Identity & Theme
- **Aesthetic Direction**: Clean, trustworthy, modern Indian PropTech / Student Living utility interface matching the authentic **Myposhtell** visual identity—crisp white surfaces, royal blue interactive anchors, emerald confirmation indicators, and high-legibility tabular numbers.
- **Color Palette & Mood**:
  - **60% Dominant Neutral Canvas**: Crisp Alabaster/Cool White (`#F8FAFC` / `bg-slate-50`) background with pure white (`#FFFFFF`) single-elevation surface cards.
  - **30% Structural Surfaces & Typography**: Deep Slate (`#0F172A`) primary text, Muted Slate (`#64748B`) secondary labels, and subtle hairline dividers (`#E2E8F0`).
  - **10% Accent & Semantic Budget**:
    - Primary Brand Accent: Poshtell Royal Blue (`#1D4ED8` / `bg-blue-700`) for primary CTAs, active tabs, and QR verification frames.
    - Semantic Positive: Emerald (`#15803D`) paired with explicit text labels (`Approved`, `Paid`, `Checked In`).
    - Semantic Warning: Amber (`#B45309`) for `Pending Approval` or `Due Soon`.
    - Semantic Alert/SOS: Crimson (`#DC2626`) for `SOS Emergency`, `Overdue`, or `Rejected`.
- **Typography & Hierarchy**:
  - **Display / Headings**: `Plus Jakarta Sans` (SemiBold/Bold 600–700) for crisp, welcoming section headers and resident card titles.
  - **Body Prose**: `DM Sans` (Regular/Medium 400–500) for effortless scannability across menus, notices, and forms.
  - **Monospace / Tabular Data**: `JetBrains Mono` (`tabular-nums`) for gate pass IDs, timestamps, invoice amounts (`₹45,000`), room numbers, and QR verification timers.
- **Component Styling & Layout**:
  - **Desktop (`lg:`)**: Left sidebar navigation (`256px` fixed) + Top header bar following the 3-zone contract + Multi-column content area (`max-w-7xl`).
  - **Mobile (`< lg`)**: Sticky compact top header + scrollable content canvas + Fixed 5-tab bottom navigation bar (`Home`, `Gate Pass`, `QR Scan`, `Mess`, `Support/More`) adhering strictly to the $\ge 44\times44\text{px}$ touch hitbox and $\le 15\%$ sticky viewport height budget.
  - **Zero-Pill Metadata Discipline**: Metadata (timestamps, ticket IDs, categories, floor/room info) rendered as clean unboxed text separated by middle dots (`·`), reserving interactive button styling strictly for functional filter tabs and action triggers.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Self-Contained Interactive Status Simulators for Student-Only Role**
  - *Chosen Approach*: Since the app is scoped to the Student Resident perspective, we include subtle, realistic "Simulate Warden Approval" / "Simulate Gate Scan" / "Simulate Technician Resolution" quick-triggers on pending items.
  - *Why*: Allows you to experience the entire lifecycle of a Gate Pass (from submission to QR generation to gate check-out/in) and NOC clearance without needing to log out and switch to a separate admin app.
- **Decision 2: Unified Responsive Shell (Desktop Sidebar + Mobile Bottom Nav)**
  - *Chosen Approach*: Single state-driven React application that renders a multi-column workspace on desktop and an ergonomic thumb-zone layout with bottom tabs on mobile screens.
  - *Why*: Ensures full `1440px` desktop viewport presence while feeling like a native Play Store app when viewed on mobile dimensions.
- **Decision 3: Structured LocalStorage State Engine with Reset-to-Default Option**
  - *Chosen Approach*: Persist all passes, complaints, meal opt-outs, fee payments, and NOC requests in `localStorage` with a one-click "Reset Demo Data" option in the profile menu.
  - *Why*: Guarantees zero-latency interactions, immediate persistence across browser refreshes, and easy testing of payment and admission workflows.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        MYPOSHTELL APPLICATION SHELL                        │
│  ┌──────────────────────┐  ┌────────────────────────────────────────────┐  │
│  │ Desktop Sidebar Nav  │  │ Top Bar (Brand · Quick Nav · SOS Trigger) │  │
│  │ & Mobile Bottom Tabs │  └────────────────────────────────────────────┘  │
│  └──────────┬───────────┘                         │                        │
│             ▼                                     ▼                        │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    CENTRAL HOSTEL STATE STORE                        │  │
│  │  (Resident Profile, Gate Passes, Complaints, Mess Menu, Fees, NOC)   │  │
│  └──────┬─────────────┬─────────────┬─────────────┬─────────────┬───────┘  │
│         │             │             │             │             │          │
│         ▼             ▼             ▼             ▼             ▼          │
│  ┌────────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌─────────────┐  │
│  │  Dashboard │ │ Gate Pass │ │ Mess Menu │ │Complaint &│ │ Fees, KYC & │  │
│  │ & Live QR  │ │  & Leave  │ │ & Ratings │ │Maintenance│ │ Move-Out NOC│  │
│  │ Check-In   │ │  Manager  │ │  Planner  │ │   Desk    │ │   Portal    │  │
│  └────────────┘ └───────────┘ └───────────┘ └───────────┘ └─────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State
- **`ResidentProfile`**: Student name, Poshtell ID (`POSH-2026-8841`), hostel name, block/floor/room/bed allocation, check-in status (`IN_HOSTEL` | `OUT_ON_PASS`), emergency contacts, and KYC document verification statuses.
- **`GatePass[]`**: ID, type (`Day Outing` | `Overnight Leave` | `Vacation`), destination, reason, departure & expected return timestamps, parent approval status, warden status (`Pending` | `Approved` | `Checked Out` | `Returned` | `Rejected`), and QR verification token.
- **`ComplaintTicket[]`**: Ticket ID, category, title, description, room location, priority, status (`Open` | `In Progress` | `Resolved`), assigned staff name, created timestamp, and student satisfaction rating.
- **`MessDayMenu[]`**: Day of week, Breakfast/Lunch/Snacks/Dinner items, timings, special items, student opt-out status per meal, and user rating.
- **`FeeInvoice[]`**: Invoice ID, title (e.g., *Even Semester Hostel & Mess Fee*), breakdown items, due date, amount, status (`Paid` | `Pending` | `Overdue`), transaction ID, and payment method.
- **`NocApplication`**: Move-out date, departure time slot, reason, bank refund details, and 5-department clearance checklist.

### Interactive Component & State Mapping
- **QR Check-In Modal**: Displays live rotating security hash + countdown timer; clicking *"Simulate Gate Security Scan"* toggles resident status between `IN_HOSTEL` and `OUT_ON_PASS` and appends a timestamped entry to the Gate Log.
- **Gate Pass Drawer/Modal**: Validates departure/return dates and contact numbers; adds new pass to top of list; *"Fast-Forward Approval"* button transitions `Pending` → `Approved` and unlocks the pass QR code.
- **Mess Menu View**: Switching days updates the 4 meal cards; toggling *"Opt Out of Meal"* updates attendance count and displays a confirmation toast; clicking stars submits meal feedback.
- **Payment Checkout Modal**: Selecting a pending invoice opens a simulated Razorpay/CCAvenue gateway where choosing UPI/Card and confirming marks the invoice `Paid`, generates a transaction reference, and enables receipt viewing.
- **SOS Emergency Modal**: Clicking SOS opens an immediate high-contrast confirmation with a 3-second countdown, audible/visual alert state, and instant dispatch log to Hostel Warden & Security.
