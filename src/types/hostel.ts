export type CheckInStatus = 'IN_HOSTEL' | 'OUT_ON_PASS';

export type GatePassType = 'Day Out Pass' | 'Day Outing' | 'Overnight Leave' | 'Vacation';
export type GatePassStatus = 'Pending Warden Approval' | 'Approved' | 'Checked Out' | 'Returned' | 'Rejected' | 'Expired';

export interface GatePass {
  id: string;
  passNumber: string;
  type: GatePassType;
  purpose: string;
  destination: string;
  reasonForLeave?: string;
  departureTime: string;
  expectedReturnTime: string;
  actualReturnTime?: string;
  parentContact: string;
  status: GatePassStatus;
  appliedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  qrToken: string;
  rejectionReason?: string;
}

export type ComplaintCategory = 'Electrical' | 'Plumbing' | 'Wi-Fi / Internet' | 'Housekeeping' | 'Carpentry' | 'Mess / Food';
export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Emergency';
export type ComplaintStatus = 'Open' | 'Assigned to Technician' | 'Resolved';

export interface ComplaintTicket {
  id: string;
  ticketNumber: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  location: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  createdAt: string;
  residentUsn?: string;
  residentName?: string;
  assignedTo?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  rating?: number;
  ratingComment?: string;
}

export interface MealItem {
  id: string;
  name: string;
  isVeg: boolean;
  calories?: string;
}

export interface MealSchedule {
  mealType: 'Breakfast' | 'Lunch' | 'Evening Snacks' | 'Dinner';
  timing: string;
  items: MealItem[];
  specialItem?: string;
  optedOut: boolean;
}

export interface DayMessMenu {
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  dateLabel: string;
  isToday?: boolean;
  meals: {
    breakfast: MealSchedule;
    lunch: MealSchedule;
    snacks: MealSchedule;
    dinner: MealSchedule;
  };
  residentRating?: number;
}

export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue';

export interface FeeItem {
  name: string;
  amount: number;
}

export interface FeeInvoice {
  id: string;
  invoiceNumber: string;
  title: string;
  semesterPeriod: string;
  dueDate: string;
  totalAmount: number;
  status: InvoiceStatus;
  paidAt?: string;
  transactionRef?: string;
  paymentMethod?: string;
  breakdown: FeeItem[];
}

export interface KycDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  verificationStatus: 'Verified' | 'Under Review' | 'Action Required';
  documentNumberMasked: string;
}

export interface AdmissionMilestone {
  stage: number;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
  completedDate?: string;
}

export interface NocDepartmentCheck {
  id: string;
  department: string;
  inCharge: string;
  status: 'Cleared' | 'Pending Dues' | 'Awaiting Inspection';
  clearanceNote?: string;
  clearedAt?: string;
}

export interface NocApplication {
  isSubmitted: boolean;
  requestedDepartureDate?: string;
  departureTimeSlot?: string;
  destinationCity?: string;
  reasonForMoveOut?: string;
  bankAccountMasked?: string;
  cautionDepositRefundEstimated: number;
  departments: NocDepartmentCheck[];
  overallStatus: 'Draft' | 'In Progress' | 'Final NOC Issued';
  nocCertificateId?: string;
}

export interface ResidentProfile {
  id: string;
  poshtellId: string;
  usn: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  gender?: string;
  dateOfBirth?: string;
  parentName?: string;
  parentMobile?: string;
  parentEmail?: string;
  localGuardian?: string;
  permanentAddress?: string;
  agreementPeriod?: string;
  moveInDate?: string;
  moveOutDate?: string;
  collegeName: string;
  courseAndYear: string;
  hostelBuilding: string;
  roomNumber: string;
  floor: string;
  bedNumber: string;
  roomType: string;
  joinedDate: string;
  bloodGroup: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
  wardenName: string;
  wardenPhone: string;
  checkInStatus: CheckInStatus;
  lastGateActivity: {
    type: 'CHECK_IN' | 'CHECK_OUT';
    timestamp: string;
    gateName: string;
  };
}

export interface HostelNotice {
  id: string;
  title: string;
  category: 'General' | 'Mess' | 'Maintenance' | 'Emergency' | 'Curfew';
  date: string;
  content: string;
  isImportant?: boolean;
}

export interface GateLogEntry {
  id: string;
  timestamp: string;
  type: 'CHECK_IN' | 'CHECK_OUT';
  gateName: string;
  verifier: string;
  passReference?: string;
}
