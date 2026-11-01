import React, { useState, useEffect } from 'react';
import {
  Plus,
  X,
  AlertCircle,
  Trash2,
  ArrowLeft,
  Calendar,
  Clock,
  Lock,
  MapPin,
  Phone,
  FileText,
  Info,
  Check,
} from 'lucide-react';
import { useHostel } from '../context/HostelContext';
import { GatePass, GatePassStatus, GatePassType } from '../types/hostel';
import { ComplaintsDesk } from './ComplaintsDesk';

interface GatePassManagerProps {
  onOpenQr: (passNumber?: string) => void;
  initialCategoryTab?: 'GATE_PASS' | 'COMPLAINTS' | 'VISITORS';
}

type RequestCategoryTab = 'GATE_PASS' | 'COMPLAINTS' | 'VISITORS';
type PassFilterTab = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

interface VisitorPassEntry {
  id: string;
  visitorName: string;
  relation: string;
  visitDate: string;
  visitOutTime: string;
  status: 'Approved' | 'Pending' | 'Expired';
}

const VISITORS_STORAGE_KEY = 'poshtell_visitors_real_v1';

const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const SHORT_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Helper to get YYYY-MM-DD in local time
const getLocalDateString = (offsetMinutes = 0): string => {
  const d = new Date(Date.now() + offsetMinutes * 60 * 1000);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to get HH:mm in 24-hour local time
const getLocalTimeString = (offsetMinutes = 0): string => {
  const d = new Date(Date.now() + offsetMinutes * 60 * 1000);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Helper to get YYYY-MM-DDTHH:mm for visitor datetime-local inputs
const getLocalDateTimeInputValue = (offsetMinutes = 0): string => {
  return `${getLocalDateString(offsetMinutes)}T${getLocalTimeString(offsetMinutes)}`;
};

// Formats YYYY-MM-DD into "DD-MM-YY" (e.g. "21-10-26") matching the Apply Gate Pass screenshot
const formatDateDdMmYy = (yyyyMmDd: string): string => {
  if (!yyyyMmDd) return '—';
  const parts = yyyyMmDd.split('-');
  if (parts.length !== 3) return yyyyMmDd;
  const [year, month, day] = parts;
  return `${day}-${month}-${year.slice(-2)}`;
};

// Formats 24-hour "HH:mm" into 12-hour "h:mm AM/PM" (e.g. "2:30 PM")
const formatTime12Hour = (hhMm: string): string => {
  if (!hhMm) return '—';
  const [hStr, mStr = '00'] = hhMm.split(':');
  const hNum = parseInt(hStr, 10);
  if (Number.isNaN(hNum)) return hhMm;
  const ampm = hNum >= 12 ? 'PM' : 'AM';
  let hour12 = hNum % 12;
  if (hour12 === 0) hour12 = 12;
  return `${hour12}:${mStr.padStart(2, '0')} ${ampm}`;
};

// Formats user's saved phone/emergency contact cleanly (e.g. "98766 54321")
const getDefaultEmergencyContact = (rawPhone?: string, rawParent?: string): string => {
  const source =
    rawParent && rawParent !== '—' && rawParent.trim() !== ''
      ? rawParent
      : rawPhone && rawPhone !== '—' && rawPhone.trim() !== ''
      ? rawPhone
      : '';
  if (!source) return '';
  const cleaned = source.replace(/^\+91\s*/, '').trim();
  return cleaned;
};

// Custom SVG matching the blue arrow-into-box icon in the top-left of each Gate Pass history card
const ReasonPassIconSvg: React.FC = () => (
  <div className="w-12 h-12 rounded-full bg-[#E0E4FF] flex items-center justify-center shrink-0">
    <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#1E2A78]" fill="none">
      <path
        d="M9 4.5H17C18.1046 4.5 19 5.39543 19 6.5V17.5C19 18.6046 18.1046 19.5 17 19.5H9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 12H14.5M14.5 12L11 8.5M14.5 12L11 15.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

// Custom SVG matching the green arrow-into-box icon in the Out / Return Date & Time rows on history cards
const DateArrowIconSvg: React.FC = () => (
  <div className="w-9 h-9 rounded-full bg-[#EAFBF0] flex items-center justify-center shrink-0">
    <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#15803D]" fill="none">
      <path
        d="M10 5H16.5C17.6046 5 18.5 5.89543 18.5 7V17C18.5 18.1046 17.6046 19 16.5 19H10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 12H14M14 12L10.8 8.8M14 12L10.8 15.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

// Custom SVG matching the orange arrow-into-box icon in Gate Pass Details (Screenshot_20261101_174212)
const OrangeBoxArrowIconSvg: React.FC<{ size?: 'lg' | 'sm' }> = ({ size = 'sm' }) => (
  <div
    className={`${
      size === 'lg' ? 'w-12 h-12' : 'w-9 h-9'
    } rounded-full bg-[#FFF2EA] flex items-center justify-center shrink-0`}
  >
    <svg
      viewBox="0 0 24 24"
      className={`${size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'} text-[#EA6C2F]`}
      fill="none"
    >
      <path
        d="M10 5H16.5C17.6046 5 18.5 5.89543 18.5 7V17C18.5 18.1046 17.6046 19 16.5 19H10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 12H14M14 12L10.8 8.8M14 12L10.8 15.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

// Formats ISO or readable datetime string into "18 Oct 26 | 6:18 PM" matching the history screenshot
const formatPassDateTime = (raw: string): string => {
  if (!raw) return '—';
  if (raw.includes('|')) return raw;
  const parsed = new Date(raw);
  if (isNaN(parsed.getTime())) return raw;

  const day = parsed.getDate();
  const month = SHORT_MONTHS[parsed.getMonth()];
  const yearShort = String(parsed.getFullYear()).slice(-2);

  let hours = parsed.getHours();
  const minutes = String(parsed.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;

  return `${day} ${month} ${yearShort} | ${hours}:${minutes} ${ampm}`;
};

// Formats ISO datetime into "10 Oct, 05:30 PM" matching Gate Pass Details screenshot
const formatDetailsShortDateTime = (raw: string): string => {
  if (!raw) return '—';
  const parsed = new Date(raw);
  if (isNaN(parsed.getTime())) return raw;

  const day = parsed.getDate();
  const month = SHORT_MONTHS[parsed.getMonth()];
  let hours = parsed.getHours();
  const minutes = String(parsed.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;

  return `${day} ${month}, ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
};

// Formats Date object into "Sat, 10 Oct 2026 • 04:30 PM" matching Request Timeline in screenshot
const formatTimelineDateTime = (dateObj: Date): string => {
  const validDate = isNaN(dateObj.getTime()) ? new Date() : dateObj;
  const weekday = SHORT_WEEKDAYS[validDate.getDay()];
  const day = validDate.getDate();
  const month = SHORT_MONTHS[validDate.getMonth()];
  const year = validDate.getFullYear();

  let hours = validDate.getHours();
  const minutes = String(validDate.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;

  return `${weekday}, ${day} ${month} ${year}  •  ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
};

// Computes Request Submitted Date and Warden Approval Date (guaranteed 1–10 minutes after Request Submitted)
const getTimelineDatesForPass = (
  pass: GatePass
): { submittedDate: Date; wardenApprovedDate: Date } => {
  const rawSubmitted = new Date(pass.appliedAt);
  const submittedDate = isNaN(rawSubmitted.getTime()) ? new Date() : rawSubmitted;
  const submittedMs = submittedDate.getTime();

  if (pass.approvedAt) {
    const rawApproved = new Date(pass.approvedAt);
    const diffMinutes = (rawApproved.getTime() - submittedMs) / (60 * 1000);
    if (!isNaN(rawApproved.getTime()) && diffMinutes >= 1 && diffMinutes <= 10.5) {
      return { submittedDate, wardenApprovedDate: rawApproved };
    }
  }

  // Deterministic 1–10 minute offset based on pass id/number so it stays consistent across renders
  let hash = 0;
  const seed = pass.id || pass.passNumber || 'gp';
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const offsetMinutes = (hash % 10) + 1; // 1 to 10 minutes
  const wardenApprovedDate = new Date(submittedMs + offsetMinutes * 60 * 1000);
  return { submittedDate, wardenApprovedDate };
};

// Extracts clean destination and reasonForLeave for both new and previously saved passes
const getPassDestinationAndReason = (
  pass: GatePass
): { cleanDestination: string; cleanReason: string } => {
  if (pass.reasonForLeave && pass.reasonForLeave.trim() !== '') {
    return {
      cleanDestination: pass.destination || '—',
      cleanReason: pass.reasonForLeave.trim(),
    };
  }
  if (pass.destination && pass.destination.includes(' — ')) {
    const [destPart, ...reasonParts] = pass.destination.split(' — ');
    return {
      cleanDestination: destPart.trim() || '—',
      cleanReason: reasonParts.join(' — ').trim() || pass.purpose || pass.type,
    };
  }
  return {
    cleanDestination: pass.destination || '—',
    cleanReason: pass.purpose || pass.type || 'Personal work',
  };
};

export const GatePassManager: React.FC<GatePassManagerProps> = ({
  onOpenQr,
  initialCategoryTab = 'GATE_PASS',
}) => {
  const {
    profile,
    gatePasses,
    createGatePass,
    deleteGatePass,
  } = useHostel();

  const [categoryTab, setCategoryTab] = useState<RequestCategoryTab>(initialCategoryTab);
  const [statusFilter, setStatusFilter] = useState<PassFilterTab>('ALL');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [selectedPassId, setSelectedPassId] = useState<string | null>(null);

  useEffect(() => {
    setCategoryTab(initialCategoryTab);
  }, [initialCategoryTab]);

  // Active iframe-safe Date/Time picker modal ('OUT_DATE' | 'OUT_TIME' | 'RETURN_DATE' | 'RETURN_TIME' | null)
  const [activePicker, setActivePicker] = useState<
    'OUT_DATE' | 'OUT_TIME' | 'RETURN_DATE' | 'RETURN_TIME' | null
  >(null);

  // Apply Gate Pass Form State (matching the uploaded screenshot)
  const [passType, setPassType] = useState<GatePassType>('Day Out Pass');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [outDate, setOutDate] = useState<string>(() => getLocalDateString(60));
  const [outTime, setOutTime] = useState<string>(() => getLocalTimeString(60));
  const [returnDate, setReturnDate] = useState<string>(() => getLocalDateString(300));
  const [returnTime, setReturnTime] = useState<string>(() => getLocalTimeString(300));
  const [destination, setDestination] = useState<string>('');
  const [reasonDescription, setReasonDescription] = useState<string>('');
  const [emergencyContact, setEmergencyContact] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Real Visitor requests state persisted in device localStorage
  const [visitorPasses, setVisitorPasses] = useState<VisitorPassEntry[]>(() => {
    try {
      const saved = localStorage.getItem(VISITORS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCreatingVisitor, setIsCreatingVisitor] = useState<boolean>(false);
  const [visitorName, setVisitorName] = useState<string>('');
  const [visitorRelation, setVisitorRelation] = useState<string>('Parent');
  const [visitorInTime, setVisitorInTime] = useState<string>(() => getLocalDateTimeInputValue(0));
  const [visitorOutTime, setVisitorOutTime] = useState<string>(() =>
    getLocalDateTimeInputValue(180)
  );

  useEffect(() => {
    try {
      localStorage.setItem(VISITORS_STORAGE_KEY, JSON.stringify(visitorPasses));
    } catch {
      // ignore storage errors
    }
  }, [visitorPasses]);

  const selectedPass: GatePass | null = selectedPassId
    ? gatePasses.find((p) => p.id === selectedPassId) || null
    : null;

  const openNewGatePassScreen = () => {
    const defaultOutDate = getLocalDateString(60);
    const defaultOutTime = getLocalTimeString(60);
    const defaultRetTime = getLocalTimeString(300);

    setPassType('Day Out Pass');
    setIsDropdownOpen(false);
    setActivePicker(null);
    setOutDate(defaultOutDate);
    setOutTime(defaultOutTime);
    setReturnDate(defaultOutDate);
    setReturnTime(defaultRetTime);
    setDestination('');
    setReasonDescription('');
    setEmergencyContact('');
    setFormError(null);
    setIsCreating(true);
  };

  // Keep Return Date synced with Out Date when "Day Out Pass" is selected (locked to same day)
  const handleOutDateChange = (newDate: string) => {
    setOutDate(newDate);
    if (passType === 'Day Out Pass') {
      setReturnDate(newDate);
    }
  };

  // Real-time effective status check (if expectedReturnTime is over, treat as Expired unless Rejected)
  const getEffectiveStatus = (pass: GatePass): GatePassStatus => {
    const returnTs = new Date(pass.expectedReturnTime).getTime();
    if (
      !isNaN(returnTs) &&
      returnTs <= Date.now() &&
      pass.status !== 'Rejected' &&
      pass.status !== 'Expired' &&
      pass.status !== 'Returned'
    ) {
      return 'Expired';
    }
    return pass.status;
  };

  const filteredPasses = gatePasses.filter((pass) => {
    const effectiveStatus = getEffectiveStatus(pass);
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PENDING') {
      return effectiveStatus === 'Pending Warden Approval';
    }
    if (statusFilter === 'APPROVED') {
      return effectiveStatus === 'Approved' || effectiveStatus === 'Checked Out';
    }
    if (statusFilter === 'REJECTED') {
      return effectiveStatus === 'Rejected';
    }
    if (statusFilter === 'EXPIRED') {
      return effectiveStatus === 'Expired' || effectiveStatus === 'Returned';
    }
    return true;
  });

  const handleCreateGatePass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outDate || !outTime || !returnDate || !returnTime) {
      setFormError('Please select both Out Date & Time and Return Date & Time.');
      return;
    }
    if (!destination.trim()) {
      setFormError('Please enter your destination.');
      return;
    }
    if (!reasonDescription.trim()) {
      setFormError('Please briefly describe the reason for your request.');
      return;
    }

    const departureIso = `${outDate}T${outTime}`;
    const effectiveReturnDate = passType === 'Day Out Pass' ? outDate : returnDate;
    const returnIso = `${effectiveReturnDate}T${returnTime}`;

    const createdPass = createGatePass({
      type: passType,
      purpose: passType,
      destination: destination.trim(),
      reasonForLeave: reasonDescription.trim(),
      departureTime: departureIso,
      expectedReturnTime: returnIso,
      status: 'Approved',
      parentContact:
        emergencyContact.trim() ||
        getDefaultEmergencyContact(profile.phone, profile.parentMobile) ||
        profile.phone,
    });

    setFormError(null);
    setIsCreating(false);
    setStatusFilter('ALL');

    const createdEffectiveStatus = getEffectiveStatus(createdPass);
    if (createdEffectiveStatus === 'Approved' || createdEffectiveStatus === 'Checked Out') {
      onOpenQr(createdPass.passNumber);
    } else {
      setSelectedPassId(createdPass.id);
    }
  };

  const handleCreateVisitorPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || !visitorInTime || !visitorOutTime) return;
    const isPast = new Date(visitorOutTime).getTime() < Date.now();
    const newEntry: VisitorPassEntry = {
      id: `vis-${Date.now()}`,
      visitorName: visitorName.trim(),
      relation: visitorRelation.trim() || 'Visitor',
      visitDate: visitorInTime,
      visitOutTime: visitorOutTime,
      status: isPast ? 'Expired' : 'Approved',
    };
    const updated = [newEntry, ...visitorPasses];
    setVisitorPasses(updated);
    try {
      localStorage.setItem(VISITORS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    setVisitorName('');
    setIsCreatingVisitor(false);
  };

  // Returns card border color and status badge styling matching the screenshot
  const getCardStyleAndBadge = (status: GatePass['status']) => {
    switch (status) {
      case 'Expired':
      case 'Returned':
        return {
          cardBorder: 'border-[#9FB316]',
          badgeBg: 'bg-[#ECF47F]',
          dotColor: 'bg-[#F59E0B]',
          textColor: 'text-[#5F7011]',
          label: 'Expired',
        };
      case 'Rejected':
        return {
          cardBorder: 'border-[#E07A5F]',
          badgeBg: 'bg-[#FCE7E7]',
          dotColor: 'bg-[#E0533C]',
          textColor: 'text-[#991B1B]',
          label: 'Rejected',
        };
      case 'Approved':
      case 'Checked Out':
        return {
          cardBorder: 'border-[#22C55E]',
          badgeBg: 'bg-[#DCFCE7]',
          dotColor: 'bg-[#16A34A]',
          textColor: 'text-[#166534]',
          label: 'Approved',
        };
      case 'Pending Warden Approval':
      default:
        return {
          cardBorder: 'border-[#F59E0B]',
          badgeBg: 'bg-[#FEF3C7]',
          dotColor: 'bg-[#F97316]',
          textColor: 'text-[#92400E]',
          label: 'Pending',
        };
    }
  };

  // ===========================================================================
  // FULL-PAGE "GATE PASS DETAILS" SCREEN (Matches Screenshot_20261101_174212)
  // ===========================================================================
  if (selectedPass) {
    const effectiveStatus = getEffectiveStatus(selectedPass);
    const statusLabel = getCardStyleAndBadge(effectiveStatus).label;
    const { cleanDestination, cleanReason } = getPassDestinationAndReason(selectedPass);
    const { submittedDate, wardenApprovedDate } = getTimelineDatesForPass(selectedPass);
    const displayPassNumber = `#${selectedPass.passNumber.replace(/^#/, '')}`;

    return (
      <div className="max-w-xl mx-auto pb-28 pt-2 space-y-4">
        {/* Top Header: Back Arrow + Centered "Gate Pass Details" Title */}
        <div className="flex items-center justify-between py-3 mb-1">
          <button
            type="button"
            onClick={() => setSelectedPassId(null)}
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-[#334155] hover:bg-slate-100 active:scale-95 transition-all"
            aria-label="Back to Gate Pass History"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
          </button>
          <h1 className="text-[22px] sm:text-2xl font-bold text-[#0F172A] tracking-tight">
            Gate Pass Details
          </h1>
          <div className="w-8" aria-hidden="true" />
        </div>

        {/* Card 1: Summary Card (Reason, Status Badge, Out/Return Date & Time, Destination, Emgy. Contact) */}
        <div className="bg-white rounded-[24px] border border-slate-200/80 p-5 shadow-2xs">
          {/* Top Row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <OrangeBoxArrowIconSvg size="lg" />
              <div className="min-w-0">
                <span className="text-[12px] font-semibold uppercase tracking-wide text-[#94A3B8] block leading-tight">
                  REASON
                </span>
                <h2 className="text-[19px] sm:text-[20px] font-bold text-[#0F172A] truncate mt-0.5">
                  {selectedPass.purpose || selectedPass.type || 'Day Out Pass'}
                </h2>
              </div>
            </div>

            {/* Outlined Peach Status Pill ("Expired") */}
            <div className="px-4 py-1.5 rounded-full border border-[#EA6C2F] bg-[#FFF5EF] text-[#EA6C2F] text-xs sm:text-sm font-semibold shrink-0">
              {statusLabel}
            </div>
          </div>

          {/* Horizontal Divider */}
          <div className="border-t border-slate-200/80 my-4" />

          {/* 2x2 Details Grid */}
          <div className="grid grid-cols-2 gap-x-2.5 gap-y-4">
            {/* OUT DATE & TIME */}
            <div className="flex items-center gap-2.5 min-w-0">
              <OrangeBoxArrowIconSvg size="sm" />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8] block truncate">
                  OUT DATE &amp; TIME
                </span>
                <p className="text-[13px] sm:text-[14.5px] font-bold text-[#0F172A] leading-snug mt-0.5 break-words">
                  {formatDetailsShortDateTime(selectedPass.departureTime)}
                </p>
              </div>
            </div>

            {/* RETURN DATE & TIME */}
            <div className="flex items-center gap-2.5 min-w-0">
              <OrangeBoxArrowIconSvg size="sm" />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8] block truncate">
                  RETURN DATE &amp; TIME
                </span>
                <p className="text-[13px] sm:text-[14.5px] font-bold text-[#0F172A] leading-snug mt-0.5 break-words">
                  {formatDetailsShortDateTime(
                    selectedPass.actualReturnTime || selectedPass.expectedReturnTime
                  )}
                </p>
              </div>
            </div>

            {/* DESTINATION */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#FFF2EA] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-[#EA6C2F] stroke-[2]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8] block truncate">
                  DESTINATION
                </span>
                <p className="text-[13.5px] sm:text-[15px] font-bold text-[#0F172A] leading-snug mt-0.5 break-words">
                  {cleanDestination}
                </p>
              </div>
            </div>

            {/* EMGY. CONTACT */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#FFF2EA] flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-[#EA6C2F] stroke-[2]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8] block truncate">
                  EMGY. CONTACT
                </span>
                <p className="text-[13.5px] sm:text-[15px] font-bold text-[#0F172A] leading-snug mt-0.5 break-words">
                  {selectedPass.parentContact || profile.phone || '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Reason for leave */}
        <div className="bg-white rounded-[24px] border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-[#EA6C2F] stroke-[2.2] shrink-0" />
            <h3 className="text-[17px] font-bold text-[#0F172A]">Reason for leave</h3>
          </div>
          <p className="mt-3 text-[16px] font-semibold text-[#0F172A] leading-relaxed break-words">
            {cleanReason}
          </p>
        </div>

        {/* Card 3: Request Timeline */}
        <div className="bg-white rounded-[24px] border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-[#EA6C2F] stroke-[2.2] shrink-0" />
            <h3 className="text-[17px] font-bold text-[#0F172A]">Request Timeline</h3>
          </div>

          <p className="mt-1.5 text-[14px] font-semibold text-[#94A3B8]">{displayPassNumber}</p>
          <p className="mt-1 text-[16px] font-semibold text-[#EA6C2F]">Gate Pass Generated</p>

          {/* 3-Step Vertical Timeline */}
          <div className="mt-5 relative space-y-6">
            {/* Vertical Connecting Line */}
            <div
              className="absolute left-[17px] top-4 bottom-4 w-[2px] bg-[#E2E8F0]"
              aria-hidden="true"
            />

            {/* Step 1: Request Submitted */}
            <div className="relative flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-[#68A36E] flex items-center justify-center text-white shrink-0 z-10">
                <Check className="w-5 h-5 stroke-[2.6]" />
              </div>
              <div className="pt-0.5">
                <h4 className="text-[17px] font-semibold text-[#1E293B] leading-snug">
                  Request Submitted
                </h4>
                <p className="text-[14px] text-[#94A3B8] mt-0.5">
                  {formatTimelineDateTime(submittedDate)}
                </p>
              </div>
            </div>

            {/* Step 2: Warden Approval (1–10 mins after Request Submitted) */}
            <div className="relative flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-[#68A36E] flex items-center justify-center text-white shrink-0 z-10">
                <Check className="w-5 h-5 stroke-[2.6]" />
              </div>
              <div className="pt-0.5">
                <h4 className="text-[17px] font-semibold text-[#1E293B] leading-snug">
                  Warden Approval
                </h4>
                <p className="text-[14px] text-[#94A3B8] mt-0.5">
                  {formatTimelineDateTime(wardenApprovedDate)}
                </p>
              </div>
            </div>

            {/* Step 3: Gate Pass Generated */}
            <div className="relative flex items-center gap-4">
              <div className="w-9 h-9 rounded-full bg-[#ED8942] flex items-center justify-center shrink-0 z-10">
                <span className="w-2.5 h-2.5 rounded-full bg-white" />
              </div>
              <div>
                <h4 className="text-[17px] font-semibold text-[#1E293B] leading-snug">
                  Gate Pass Generated
                </h4>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Info Banner */}
        <div className="bg-[#FFF3EB] border border-[#F3B895] rounded-[20px] p-4 flex items-start gap-3.5">
          <Info className="w-5 h-5 text-[#EA6C2F] shrink-0 mt-0.5 stroke-[2.2]" />
          <p className="text-[14px] sm:text-[15px] text-[#64748B] leading-relaxed">
            Your request is currently under review. You will be notified once the status changes.
          </p>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // FULL-PAGE "APPLY GATE PASS" SCREEN (Matches Screenshot_20261021_134035)
  // ===========================================================================
  if (isCreating) {
    const isDayOutPass = passType === 'Day Out Pass';
    const leaveOptions: GatePassType[] = ['Day Out Pass', 'Overnight Leave', 'Vacation'];

    const currentTimeTarget =
      activePicker === 'OUT_TIME' ? outTime : activePicker === 'RETURN_TIME' ? returnTime : '14:00';
    const [curHourStr = '14', curMinStr = '00'] = currentTimeTarget.split(':');
    const curHour24 = parseInt(curHourStr, 10) || 0;
    const curAmPm: 'AM' | 'PM' = curHour24 >= 12 ? 'PM' : 'AM';
    const curHour12 = curHour24 % 12 === 0 ? 12 : curHour24 % 12;

    const updateSelectedTime12h = (newHour12: number, newMinStr: string, newAmPm: 'AM' | 'PM') => {
      let h24 = newHour12 % 12;
      if (newAmPm === 'PM') h24 += 12;
      const updated = `${String(h24).padStart(2, '0')}:${newMinStr}`;
      if (activePicker === 'OUT_TIME') setOutTime(updated);
      else setReturnTime(updated);
    };

    return (
      <div className="max-w-xl mx-auto pb-28 pt-2">
        {/* Top Header: Back Arrow + Centered "Apply Gate Pass" Title */}
        <div className="flex items-center justify-between py-3 mb-5">
          <button
            type="button"
            onClick={() => setIsCreating(false)}
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-[#334155] hover:bg-slate-100 active:scale-95 transition-all"
            aria-label="Back to Gate Pass History"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
          </button>
          <h1 className="text-[22px] sm:text-2xl font-bold text-[#0F172A] tracking-tight">
            Apply Gate Pass
          </h1>
          <div className="w-8" aria-hidden="true" />
        </div>

        <form onSubmit={handleCreateGatePass} className="space-y-6">
          {formError && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* 1. Select Leave Request For */}
          <div>
            <label className="block text-[16px] sm:text-[17px] font-bold text-[#0F172A] mb-3">
              Select Leave Request For
            </label>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="w-full rounded-[18px] border-[1.8px] border-[#F46E25] bg-white px-5 py-4 flex items-center justify-between text-left focus:outline-none shadow-2xs"
              >
                <span className="text-[16px] sm:text-[17px] font-medium text-[#334155]">
                  {passType}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  className={`w-5 h-5 text-[#475569] transition-transform ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                  fill="currentColor"
                >
                  <path d="M7 10l5 5 5-5H7z" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute left-0 right-0 mt-2 rounded-2xl bg-white border border-slate-200 shadow-xl z-30 overflow-hidden">
                  {leaveOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setPassType(option);
                        if (option === 'Day Out Pass') {
                          setReturnDate(outDate);
                        }
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-5 py-3.5 text-left text-[15px] sm:text-[16px] font-medium transition-colors flex items-center justify-between ${
                        passType === option
                          ? 'bg-[#FFF3EC] text-[#F46E25] font-semibold'
                          : 'text-[#334155] hover:bg-slate-50'
                      }`}
                    >
                      <span>{option}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 2. OUT DATE & TIME / RETURN DATE & TIME Card */}
          <div className="bg-white rounded-[24px] border border-[#EDA177] p-5 space-y-5 shadow-2xs">
            {/* OUT DATE & TIME */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-2.5 block">
                OUT DATE &amp; TIME
              </span>
              <div className="grid grid-cols-2 gap-3.5">
                {/* Out Date Pill */}
                <button
                  type="button"
                  onClick={() => setActivePicker('OUT_DATE')}
                  className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-4 py-3.5 flex items-center gap-3 cursor-pointer hover:border-[#F46E25] transition-colors text-left"
                >
                  <Calendar className="w-5 h-5 text-[#F46E25] shrink-0 stroke-[2]" />
                  <span className="text-[15px] sm:text-[16px] font-medium text-[#334155]">
                    {formatDateDdMmYy(outDate)}
                  </span>
                </button>

                {/* Out Time Pill (12-hour AM/PM) */}
                <button
                  type="button"
                  onClick={() => setActivePicker('OUT_TIME')}
                  className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-4 py-3.5 flex items-center gap-3 cursor-pointer hover:border-[#F46E25] transition-colors text-left"
                >
                  <Clock className="w-5 h-5 text-[#F46E25] shrink-0 stroke-[2]" />
                  <span className="text-[15px] sm:text-[16px] font-medium text-[#334155]">
                    {formatTime12Hour(outTime)}
                  </span>
                </button>
              </div>
            </div>

            {/* RETURN DATE & TIME */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-2.5 block">
                RETURN DATE &amp; TIME
              </span>
              <div className="grid grid-cols-2 gap-3.5">
                {/* Return Date Pill (Locked with Lock Icon for Day Out Pass, editable for Overnight/Vacation) */}
                <button
                  type="button"
                  onClick={() => {
                    if (!isDayOutPass) {
                      setActivePicker('RETURN_DATE');
                    }
                  }}
                  className={`bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-4 py-3.5 flex items-center gap-3 text-left ${
                    isDayOutPass ? 'cursor-default' : 'cursor-pointer hover:border-[#F46E25]'
                  } transition-colors`}
                >
                  {isDayOutPass ? (
                    <Lock className="w-5 h-5 text-[#64748B] shrink-0 stroke-[2]" />
                  ) : (
                    <Calendar className="w-5 h-5 text-[#F46E25] shrink-0 stroke-[2]" />
                  )}
                  <span
                    className={`text-[15px] sm:text-[16px] font-medium ${
                      isDayOutPass ? 'text-[#64748B]' : 'text-[#334155]'
                    }`}
                  >
                    {formatDateDdMmYy(isDayOutPass ? outDate : returnDate)}
                  </span>
                </button>

                {/* Return Time Pill (12-hour AM/PM) */}
                <button
                  type="button"
                  onClick={() => setActivePicker('RETURN_TIME')}
                  className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-4 py-3.5 flex items-center gap-3 cursor-pointer hover:border-[#F46E25] transition-colors text-left"
                >
                  <Clock className="w-5 h-5 text-[#F46E25] shrink-0 stroke-[2]" />
                  <span className="text-[15px] sm:text-[16px] font-medium text-[#334155]">
                    {formatTime12Hour(returnTime)}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Iframe-Safe Date & Time Picker Modal (12-Hour Format) */}
          {activePicker && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in">
              <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-[#0F172A]">
                      {activePicker === 'OUT_DATE' && 'Select Out Date'}
                      {activePicker === 'RETURN_DATE' && 'Select Return Date'}
                      {activePicker === 'OUT_TIME' && 'Select Out Time'}
                      {activePicker === 'RETURN_TIME' && 'Select Return Time'}
                    </h3>
                    {(activePicker === 'OUT_TIME' || activePicker === 'RETURN_TIME') && (
                      <p className="text-xs font-semibold text-[#F46E25] mt-0.5">
                        {formatTime12Hour(currentTimeTarget)}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setActivePicker(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {(activePicker === 'OUT_DATE' || activePicker === 'RETURN_DATE') && (
                  <div className="space-y-3">
                    <input
                      type="date"
                      value={activePicker === 'OUT_DATE' ? outDate : returnDate}
                      min={activePicker === 'RETURN_DATE' ? outDate : undefined}
                      onChange={(e) => {
                        if (activePicker === 'OUT_DATE') {
                          handleOutDateChange(e.target.value);
                        } else {
                          setReturnDate(e.target.value);
                        }
                      }}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-base font-semibold text-[#0F172A] focus:outline-none focus:border-[#F46E25]"
                    />
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {[
                        { label: 'Today', offset: 0 },
                        { label: 'Tomorrow', offset: 24 * 60 },
                        { label: 'In 2 Days', offset: 48 * 60 },
                      ].map((q) => {
                        const dVal = getLocalDateString(q.offset);
                        return (
                          <button
                            key={q.label}
                            type="button"
                            onClick={() => {
                              if (activePicker === 'OUT_DATE') {
                                handleOutDateChange(dVal);
                              } else {
                                setReturnDate(dVal);
                              }
                              setActivePicker(null);
                            }}
                            className="py-2.5 px-3 rounded-xl bg-[#FFF3EC] text-[#F46E25] font-semibold hover:bg-[#FCE4D6]"
                          >
                            {q.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {(activePicker === 'OUT_TIME' || activePicker === 'RETURN_TIME') && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2.5">
                      {/* Hour (1–12) */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">
                          Hour (1–12)
                        </label>
                        <select
                          value={curHour12}
                          onChange={(e) =>
                            updateSelectedTime12h(
                              parseInt(e.target.value, 10),
                              curMinStr,
                              curAmPm
                            )
                          }
                          className="w-full px-3 py-3 rounded-2xl border border-slate-300 bg-slate-50 text-base font-bold text-[#0F172A] focus:outline-none focus:border-[#F46E25]"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
                            <option key={h} value={h}>
                              {String(h).padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Minute (00–59) */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">
                          Minute
                        </label>
                        <select
                          value={curMinStr}
                          onChange={(e) =>
                            updateSelectedTime12h(curHour12, e.target.value, curAmPm)
                          }
                          className="w-full px-3 py-3 rounded-2xl border border-slate-300 bg-slate-50 text-base font-bold text-[#0F172A] focus:outline-none focus:border-[#F46E25]"
                        >
                          {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(
                            (m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      {/* AM / PM */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">
                          AM / PM
                        </label>
                        <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                          {(['AM', 'PM'] as const).map((period) => (
                            <button
                              key={period}
                              type="button"
                              onClick={() =>
                                updateSelectedTime12h(curHour12, curMinStr, period)
                              }
                              className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                                curAmPm === period
                                  ? 'bg-[#F46E25] text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              {period}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setActivePicker(null)}
                  className="w-full py-3 rounded-2xl bg-[#F46E25] hover:bg-[#E05D16] text-white font-semibold text-sm"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* 3. DESTINATION / REASON FOR LEAVE / EMERGENCY CONTACT Card */}
          <div className="bg-white rounded-[24px] border border-[#EDA177] p-5 space-y-5 shadow-2xs">
            {/* DESTINATION */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-2.5 block">
                DESTINATION
              </label>
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-4 py-3.5 flex items-center gap-3.5 focus-within:border-[#F46E25] transition-colors">
                <MapPin className="w-5 h-5 text-[#F46E25] shrink-0 stroke-[2]" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Guindy, Chennai"
                  className="w-full bg-transparent text-[15px] sm:text-[16px] font-medium text-[#0F172A] placeholder:text-[#334155]/80 focus:outline-none"
                />
              </div>
            </div>

            {/* REASON FOR LEAVE */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-2.5 block">
                REASON FOR LEAVE
              </label>
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 focus-within:border-[#F46E25] transition-colors">
                <textarea
                  rows={3}
                  value={reasonDescription}
                  onChange={(e) => setReasonDescription(e.target.value)}
                  placeholder="Briefly describe the reason for your request."
                  className="w-full bg-transparent text-[15px] sm:text-[16px] font-medium text-[#0F172A] placeholder:text-[#334155]/85 resize-none focus:outline-none leading-relaxed"
                />
              </div>
            </div>

            {/* EMERGENCY CONTACT */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-2.5 block">
                EMERGENCY CONTACT
              </label>
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-4 py-3.5 flex items-center gap-3.5 focus-within:border-[#F46E25] transition-colors">
                <Phone className="w-5 h-5 text-[#F46E25] shrink-0 stroke-[2]" />
                <input
                  type="tel"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="9797XXXX"
                  className="w-full bg-transparent text-[15px] sm:text-[16px] font-medium text-[#0F172A] placeholder:text-[#64748B] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 4. Submit Request Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 rounded-[20px] bg-[#F46E25] hover:bg-[#E05D16] active:scale-[0.99] text-white font-semibold text-[17px] shadow-lg shadow-[#F46E25]/25 transition-all"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto pb-24 relative min-h-[calc(100vh-6rem)]">
      {/* =========================================================================
          1. TOP PAGE TITLE: "Requests"
          ========================================================================= */}
      <div className="pt-2 pb-3">
        <h1 className="text-[26px] sm:text-3xl font-bold text-[#111827] tracking-tight">
          Requests
        </h1>
      </div>

      {/* =========================================================================
          2. TOP SUB-TAB BAR: Gate Pass | Complaints | Visitors
          ========================================================================= */}
      <div className="border-b border-slate-200 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="grid grid-cols-3 max-w-md mx-auto">
          {(
            [
              { id: 'GATE_PASS', label: 'Gate Pass' },
              { id: 'COMPLAINTS', label: 'Complaints' },
              { id: 'VISITORS', label: 'Visitors' },
            ] as const
          ).map((tab) => {
            const isActive = categoryTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryTab(tab.id)}
                className={`relative py-3.5 text-sm sm:text-[15px] text-center transition-colors focus:outline-none ${
                  isActive
                    ? 'font-semibold text-[#9A5B42]'
                    : 'font-medium text-[#8E95A2] hover:text-slate-700'
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-[3px] bg-[#E8A587] rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          TAB 1: GATE PASS VIEW (Matches Screenshot)
          ========================================================================= */}
      {categoryTab === 'GATE_PASS' && (
        <>
          {/* Horizontal Filter Pills: All | Pending | Approved | Rejected | Expired */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-5 -mx-4 px-4 sm:mx-0 sm:px-0">
            {(
              [
                { id: 'ALL', label: 'All' },
                { id: 'PENDING', label: 'Pending' },
                { id: 'APPROVED', label: 'Approved' },
                { id: 'REJECTED', label: 'Rejected' },
                { id: 'EXPIRED', label: 'Expired' },
              ] as const
            ).map((pill) => {
              const isSelected = statusFilter === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setStatusFilter(pill.id)}
                  className={`rounded-full text-sm transition-all shrink-0 focus:outline-none ${
                    isSelected
                      ? 'bg-[#F46E25] text-white font-semibold px-7 py-3 shadow-xs'
                      : 'bg-[#FCE4D6] text-[#1F2937] font-medium px-8 py-3 hover:bg-[#F9D5C0]'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          {/* Real Gate Pass History Cards List */}
          <div className="space-y-4">
            {filteredPasses.length === 0 ? (
              <div className="bg-white rounded-[24px] border border-slate-200 p-10 text-center space-y-2">
                <p className="text-base font-bold text-[#0F172A]">
                  {statusFilter === 'ALL'
                    ? 'No Gate Pass History Yet'
                    : `No ${statusFilter.charAt(0) + statusFilter.slice(1).toLowerCase()} Gate Passes`}
                </p>
                <p className="text-xs text-[#8E95A2]">
                  Tap the &ldquo;+ New Request&rdquo; button below to apply for a gate pass.
                </p>
              </div>
            ) : (
              filteredPasses.map((pass) => {
                const effectiveStatus = getEffectiveStatus(pass);
                const style = getCardStyleAndBadge(effectiveStatus);
                const isActivePass =
                  effectiveStatus === 'Approved' || effectiveStatus === 'Checked Out';
                return (
                  <div
                    key={pass.id}
                    onClick={() => {
                      if (isActivePass) {
                        onOpenQr(pass.passNumber);
                      } else {
                        setSelectedPassId(pass.id);
                      }
                    }}
                    className={`bg-white rounded-[24px] border-[1.2px] ${style.cardBorder} p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer`}
                  >
                    {/* Top Row: Left Blue Icon Circle + Reason & Title + Right Status Pill */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <ReasonPassIconSvg />
                        <div className="min-w-0">
                          <span className="text-xs sm:text-sm text-[#8E95A2] block leading-tight">
                            Reason
                          </span>
                          <h3 className="text-base sm:text-lg font-bold text-[#0F172A] truncate mt-0.5">
                            {pass.purpose || pass.type || 'Day Out Pass'}
                          </h3>
                        </div>
                      </div>

                      {/* Status Badge + Little Delete Option */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${style.badgeBg}`}
                        >
                          <span className={`w-2.5 h-2.5 rounded-full ${style.dotColor}`} />
                          <span className={`text-xs sm:text-sm font-semibold ${style.textColor}`}>
                            {style.label}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteGatePass(pass.id);
                          }}
                          title="Delete gate pass"
                          aria-label="Delete gate pass"
                          className="w-8 h-8 rounded-full bg-slate-100/80 hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Horizontal Divider */}
                    <div className="border-t border-slate-200/80 my-4" />

                    {/* Bottom Row: OUT DATE & TIME | RETURN DATE & */}
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Out Date & Time */}
                      <div className="flex items-center gap-2 min-w-0">
                        <DateArrowIconSvg />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] uppercase tracking-wide text-[#8E95A2] font-medium block truncate">
                            OUT DATE &amp; TIME
                          </span>
                          <p className="text-[11.5px] sm:text-[13px] font-semibold text-[#0F172A] leading-snug mt-0.5 truncate">
                            {formatPassDateTime(pass.departureTime)}
                          </p>
                        </div>
                      </div>

                      {/* Return Date & Time */}
                      <div className="flex items-center gap-2 min-w-0">
                        <DateArrowIconSvg />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] uppercase tracking-wide text-[#8E95A2] font-medium block truncate">
                            RETURN DATE &amp;
                          </span>
                          <p className="text-[11.5px] sm:text-[13px] font-semibold text-[#0F172A] leading-snug mt-0.5 truncate">
                            {formatPassDateTime(
                              pass.actualReturnTime || pass.expectedReturnTime
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Floating "+ New Request" Button (Anchored to Bottom Right of App Shell) */}
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[430px] pointer-events-none flex justify-end px-5 z-30">
            <button
              type="button"
              onClick={openNewGatePassScreen}
              className="pointer-events-auto bg-[#F46E25] hover:bg-[#E05D16] active:scale-95 text-white font-semibold text-[16px] px-6 py-4 rounded-[20px] shadow-xl shadow-[#F46E25]/30 flex items-center gap-2.5 transition-all"
            >
              <Plus className="w-6 h-6 stroke-[2.2]" />
              <span>New Request</span>
            </button>
          </div>
        </>
      )}

      {/* =========================================================================
          TAB 2: COMPLAINTS VIEW (Inside Requests Sub-Tab)
          ========================================================================= */}
      {categoryTab === 'COMPLAINTS' && (
        <div className="pt-5">
          <ComplaintsDesk />
        </div>
      )}

      {/* =========================================================================
          TAB 3: VISITORS VIEW (Inside Requests Sub-Tab)
          ========================================================================= */}
      {categoryTab === 'VISITORS' && (
        <div className="pt-5 space-y-4">
          {visitorPasses.length === 0 ? (
            <div className="bg-white rounded-[24px] border border-slate-200 p-10 text-center space-y-2">
              <p className="text-base font-bold text-[#0F172A]">No Visitor Requests Yet</p>
              <p className="text-xs text-[#8E95A2]">
                Tap &ldquo;+ New Request&rdquo; below to register a visitor pass.
              </p>
            </div>
          ) : (
            visitorPasses.map((v) => {
              const isExpired =
                v.status === 'Expired' || new Date(v.visitOutTime).getTime() < Date.now();
              return (
                <div
                  key={v.id}
                  className={`bg-white rounded-[24px] border-[1.2px] ${
                    isExpired ? 'border-[#9FB316]' : 'border-[#22C55E]'
                  } p-5 shadow-2xs`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <ReasonPassIconSvg />
                      <div>
                        <span className="text-xs sm:text-sm text-[#8E95A2] block">
                          {v.relation || 'Visitor Pass'}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-[#0F172A] mt-0.5">
                          {v.visitorName}
                        </h3>
                      </div>
                    </div>
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                        isExpired ? 'bg-[#ECF47F]' : 'bg-[#DCFCE7]'
                      }`}
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isExpired ? 'bg-[#F59E0B]' : 'bg-[#16A34A]'
                        }`}
                      />
                      <span
                        className={`text-xs sm:text-sm font-semibold ${
                          isExpired ? 'text-[#5F7011]' : 'text-[#166534]'
                        }`}
                      >
                        {isExpired ? 'Expired' : v.status}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-slate-200/80 my-4" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2.5">
                      <DateArrowIconSvg />
                      <div>
                        <span className="text-[10px] sm:text-[11px] uppercase tracking-wide text-[#8E95A2] font-medium block">
                          OUT DATE &amp; TIME
                        </span>
                        <p className="text-xs sm:text-[14px] font-medium text-[#0F172A] mt-0.5">
                          {formatPassDateTime(v.visitDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <DateArrowIconSvg />
                      <div>
                        <span className="text-[10px] sm:text-[11px] uppercase tracking-wide text-[#8E95A2] font-medium block">
                          RETURN DATE &amp;
                        </span>
                        <p className="text-xs sm:text-[14px] font-medium text-[#0F172A] mt-0.5">
                          {formatPassDateTime(v.visitOutTime)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[430px] pointer-events-none flex justify-end px-5 z-30">
            <button
              type="button"
              onClick={() => {
                setVisitorInTime(getLocalDateTimeInputValue(0));
                setVisitorOutTime(getLocalDateTimeInputValue(180));
                setIsCreatingVisitor(true);
              }}
              className="pointer-events-auto bg-[#F46E25] hover:bg-[#E05D16] active:scale-95 text-white font-semibold text-[16px] px-6 py-4 rounded-[20px] shadow-xl shadow-[#F46E25]/30 flex items-center gap-2.5 transition-all"
            >
              <Plus className="w-6 h-6 stroke-[2.2]" />
              <span>New Request</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          CREATE NEW VISITOR PASS MODAL
          ========================================================================= */}
      {isCreatingVisitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#F46E25] to-[#EA580C] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">New Visitor Request</h3>
                <p className="text-xs text-orange-100">Saved locally on this device</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingVisitor(false)}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateVisitorPass} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Visitor Name</label>
                <input
                  type="text"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="Enter visitor full name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F46E25]"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Relation</label>
                <input
                  type="text"
                  value={visitorRelation}
                  onChange={(e) => setVisitorRelation(e.target.value)}
                  placeholder="e.g. Parent / Sibling / Guardian"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F46E25]"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Check-In Time</label>
                  <input
                    type="datetime-local"
                    value={visitorInTime}
                    onChange={(e) => setVisitorInTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F46E25]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Check-Out Time</label>
                  <input
                    type="datetime-local"
                    value={visitorOutTime}
                    onChange={(e) => setVisitorOutTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F46E25]"
                    required
                  />
                </div>
              </div>
              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreatingVisitor(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#F46E25] hover:bg-[#E05D16] text-white font-semibold"
                >
                  Save Visitor Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
