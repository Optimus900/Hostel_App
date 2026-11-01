import React, { useState } from 'react';
import {
  Plus,
  Search,
  SlidersHorizontal,
  Bed,
  Calendar,
  Hash,
  X,
  Trash2,
} from 'lucide-react';
import { useHostel } from '../context/HostelContext';
import { ComplaintCategory, ComplaintPriority, ComplaintTicket } from '../types/hostel';

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

// Formats ISO date string into "31 Aug, 06:11 PM" matching the Complaints screenshot
const formatComplaintDateTime = (raw: string): string => {
  if (!raw) return '31 Aug, 06:11 PM';
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;

  const day = parsed.getDate();
  const month = SHORT_MONTHS[parsed.getMonth()];
  let hours = parsed.getHours();
  const minutes = String(parsed.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;

  return `${day} ${month}, ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
};

// Formats resident profile into compact room code like "T3/F2/213/B"
const getCompactRoomCode = (
  ticketLocation: string,
  tower?: string,
  room?: string,
  bed?: string
): string => {
  if (ticketLocation && ticketLocation.includes('/')) {
    return ticketLocation;
  }
  const tMatch = tower?.match(/\d+/)?.[0] || '3';
  const rMatch = room?.match(/\d+/)?.[0] || '213';
  const fMatch = rMatch.length >= 3 ? rMatch[0] : '2';
  const bClean = bed?.replace(/^bed\s*/i, '').trim() || 'B';
  return `T${tMatch}/F${fClean(fMatch)}/${rMatch}/${bClean}`;
};

const fClean = (val: string) => val || '2';

// Custom SVG matching the orange electrical plug with curved cord icon inside the peach circle
const MaintenancePlugIconSvg: React.FC = () => (
  <div className="w-14 h-14 rounded-full bg-[#FDECE3] flex items-center justify-center shrink-0">
    <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#F46E25]" fill="none">
      {/* Curved cord */}
      <path
        d="M6.5 8C6.5 6.34315 7.84315 5 9.5 5C11.1569 5 12.5 6.34315 12.5 8V12.5C12.5 14.433 10.933 16 9 16H7.5C6.11929 16 5 14.8807 5 13.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Plug body */}
      <rect x="12" y="12.5" width="5" height="6" rx="1" fill="currentColor" />
      {/* Plug prongs */}
      <path
        d="M17 14H19.5M17 17H19.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

export const ComplaintsDesk: React.FC = () => {
  const { complaints, createComplaint, deleteComplaint, profile } = useHostel();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showFilterRow, setShowFilterRow] = useState<boolean>(false);
  const [isRaising, setIsRaising] = useState<boolean>(false);

  // New Request Form State
  const [categoryType, setCategoryType] = useState<string>('Maintenance');
  const [subCategory, setSubCategory] = useState<ComplaintCategory>('Electrical');
  const [priority, setPriority] = useState<ComplaintPriority>('Medium');
  const [description, setDescription] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  const subCategories: ComplaintCategory[] = [
    'Electrical',
    'Plumbing',
    'Wi-Fi / Internet',
    'Housekeeping',
    'Carpentry',
    'Mess / Food',
  ];

  // Only show real complaints created by the currently logged-in resident
  const userComplaints = complaints.filter((tkt) => {
    if (tkt.id === 'cmp-201' || tkt.ticketNumber === '#REQ-62A025') return false;
    if (tkt.residentUsn && profile.usn) {
      return tkt.residentUsn.trim().toLowerCase() === profile.usn.trim().toLowerCase();
    }
    if (tkt.residentName && profile.fullName) {
      return tkt.residentName.trim().toLowerCase() === profile.fullName.trim().toLowerCase();
    }
    // Exclude legacy tickets that have no owner metadata
    return Boolean(tkt.residentUsn || tkt.residentName);
  });

  // Summary Counts (formatted as 2-digit numbers matching screenshot: 01, 01, 00, 00)
  const totalCount = userComplaints.length;
  const openCount = userComplaints.filter((c) => c.status === 'Open').length;
  const inProgressCount = userComplaints.filter(
    (c) => c.status === 'Assigned to Technician'
  ).length;
  const resolvedCount = userComplaints.filter((c) => c.status === 'Resolved').length;

  const formatTwoDigits = (n: number): string => String(n).padStart(2, '0');

  const filteredTickets = userComplaints.filter((tkt) => {
    if (statusFilter !== 'ALL' && tkt.status !== statusFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = (tkt.title || '').toLowerCase().includes(q);
      const matchDesc = (tkt.description || '').toLowerCase().includes(q);
      const matchCat = (tkt.category || '').toLowerCase().includes(q);
      const matchId = (tkt.ticketNumber || '').toLowerCase().includes(q);
      return matchTitle || matchDesc || matchCat || matchId;
    }
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setFormError('Please describe the issue you are facing.');
      return;
    }

    const formattedDesc = description.trim().startsWith('[')
      ? description.trim()
      : `[${subCategory}] ${description.trim()}`;

    const compactLoc = getCompactRoomCode(
      '',
      profile.hostelBuilding,
      profile.roomNumber,
      profile.bedNumber
    );

    createComplaint({
      category: subCategory,
      priority,
      title: categoryType || 'Maintenance',
      description: formattedDesc,
      location: compactLoc,
    });

    setDescription('');
    setFormError(null);
    setIsRaising(false);
  };

  const getStatusBadgeStyle = (status: ComplaintTicket['status']) => {
    switch (status) {
      case 'Assigned to Technician':
        return {
          pillBg: 'bg-[#E0F2FE]',
          dotColor: 'bg-[#0284C7]',
          textColor: 'text-[#0284C7]',
          cardBorder: 'border-[#7DD3FC]',
          label: 'In Progress',
        };
      case 'Resolved':
        return {
          pillBg: 'bg-[#DCFCE7]',
          dotColor: 'bg-[#16A34A]',
          textColor: 'text-[#15803D]',
          cardBorder: 'border-[#86EFAC]',
          label: 'Resolved',
        };
      case 'Open':
      default:
        return {
          pillBg: 'bg-[#FFF3EB]',
          dotColor: 'bg-[#F46E25]',
          textColor: 'text-[#EA6C2F]',
          cardBorder: 'border-[#EB8A52]',
          label: 'Open',
        };
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* =====================================================================
          1. TOP 4-COLUMN STATS CARD (01 Total Requests | 01 Open | 00 In Progress | 00 Resolved)
          ===================================================================== */}
      <div className="bg-white rounded-[24px] border border-slate-200/80 py-5 px-2 shadow-2xs">
        <div className="grid grid-cols-4 divide-x divide-slate-200">
          {/* Total Requests */}
          <div className="flex flex-col items-center justify-center px-1">
            <span className="text-[24px] sm:text-[26px] font-bold text-[#F46E25] leading-none">
              {formatTwoDigits(totalCount)}
            </span>
            <span className="text-[12px] sm:text-[13px] font-semibold text-[#334155] text-center leading-tight mt-2">
              Total
              <br />
              Requests
            </span>
          </div>

          {/* Open */}
          <div className="flex flex-col items-center justify-center px-1">
            <span className="text-[24px] sm:text-[26px] font-bold text-[#F59E42] leading-none">
              {formatTwoDigits(openCount)}
            </span>
            <span className="text-[12px] sm:text-[13px] font-semibold text-[#334155] text-center leading-tight mt-2">
              Open
            </span>
          </div>

          {/* In Progress */}
          <div className="flex flex-col items-center justify-center px-1">
            <span className="text-[24px] sm:text-[26px] font-bold text-[#0284C7] leading-none">
              {formatTwoDigits(inProgressCount)}
            </span>
            <span className="text-[12px] sm:text-[13px] font-semibold text-[#334155] text-center leading-tight mt-2">
              In Progress
            </span>
          </div>

          {/* Resolved */}
          <div className="flex flex-col items-center justify-center px-1">
            <span className="text-[24px] sm:text-[26px] font-bold text-[#589E67] leading-none">
              {formatTwoDigits(resolvedCount)}
            </span>
            <span className="text-[12px] sm:text-[13px] font-semibold text-[#334155] text-center leading-tight mt-2">
              Resolved
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. SEARCH BAR ("Search requests...") + FILTER SLIDERS ICON
          ===================================================================== */}
      <div className="bg-white rounded-[20px] border border-slate-200/80 px-4 py-3.5 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Search className="w-5 h-5 text-[#64748B] shrink-0 stroke-[2]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search requests..."
            className="w-full bg-transparent text-[15px] sm:text-[16px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilterRow((prev) => !prev)}
          aria-label="Filter complaints"
          className="p-1 text-[#475569] hover:text-[#0F172A] transition-colors shrink-0"
        >
          <SlidersHorizontal className="w-5 h-5 stroke-[2]" />
        </button>
      </div>

      {/* Optional Status Filter Pills when filter icon is tapped */}
      {showFilterRow && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'Open', label: 'Open' },
            { id: 'Assigned to Technician', label: 'In Progress' },
            { id: 'Resolved', label: 'Resolved' },
          ].map((pill) => {
            const active = statusFilter === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setStatusFilter(pill.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 ${
                  active
                    ? 'bg-[#F46E25] text-white'
                    : 'bg-[#FCE4D6] text-[#1F2937] hover:bg-[#F9D5C0]'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      )}

      {/* =====================================================================
          3. COMPLAINT CARDS LIST (Matches Screenshot_20261101_175323)
          ===================================================================== */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-[24px] border border-slate-200 p-10 text-center space-y-2">
            <p className="text-base font-bold text-[#0F172A]">No Complaints Found</p>
            <p className="text-xs text-[#8E95A2]">
              Tap &ldquo;+ New Request&rdquo; below to raise a maintenance request.
            </p>
          </div>
        ) : (
          filteredTickets.map((tkt) => {
            const badge = getStatusBadgeStyle(tkt.status);
            const roomCode = getCompactRoomCode(
              tkt.location,
              profile.hostelBuilding,
              profile.roomNumber,
              profile.bedNumber
            );
            const displayTicketNumber = tkt.ticketNumber.startsWith('#')
              ? tkt.ticketNumber
              : `#${tkt.ticketNumber}`;

            return (
              <div
                key={tkt.id}
                className={`bg-white rounded-[24px] border-[1.2px] ${badge.cardBorder} p-5 shadow-2xs`}
              >
                {/* Top Row: Left Plug Icon + Category/Maintenance + Right Status Pill */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <MaintenancePlugIconSvg />
                    <div className="min-w-0">
                      <span className="text-[13px] sm:text-[14px] font-medium text-[#8E95A2] block leading-tight">
                        Category
                      </span>
                      <h3 className="text-[19px] sm:text-[21px] font-bold text-[#1E293B] truncate mt-0.5">
                        {tkt.title && tkt.title.length <= 24 ? tkt.title : 'Maintenance'}
                      </h3>
                    </div>
                  </div>

                  {/* Status Pill ("Open") + Delete Button */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full shrink-0 ${badge.pillBg}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${badge.dotColor}`} />
                      <span className={`text-[13px] sm:text-[14px] font-semibold ${badge.textColor}`}>
                        {badge.label}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteComplaint(tkt.id)}
                      title="Delete complaint"
                      aria-label="Delete complaint"
                      className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* First Divider */}
                <div className="border-t border-slate-200/80 my-4" />

                {/* Middle 3-Column Info Row: Bed Code | Date & Time | Request ID */}
                <div className="grid grid-cols-3 gap-1.5 text-center items-start">
                  {/* Col 1: Room/Bed */}
                  <div className="flex flex-col items-center min-w-0 px-0.5">
                    <Bed className="w-5 h-5 text-[#589E67] stroke-[1.8] shrink-0" />
                    <span className="text-[11.5px] sm:text-[13px] font-semibold text-[#1E293B] mt-1.5 leading-tight break-words w-full">
                      {roomCode}
                    </span>
                  </div>

                  {/* Col 2: Date & Time */}
                  <div className="flex flex-col items-center min-w-0 px-0.5">
                    <Calendar className="w-5 h-5 text-[#589E67] stroke-[1.8] shrink-0" />
                    <span className="text-[11.5px] sm:text-[13px] font-semibold text-[#1E293B] mt-1.5 leading-tight break-words w-full">
                      {formatComplaintDateTime(tkt.createdAt)}
                    </span>
                  </div>

                  {/* Col 3: Request Number */}
                  <div className="flex flex-col items-center min-w-0 px-0.5">
                    <Hash className="w-5 h-5 text-[#589E67] stroke-[1.8] shrink-0" />
                    <span className="text-[11.5px] sm:text-[13px] font-semibold text-[#1E293B] mt-1.5 leading-tight break-words w-full">
                      {displayTicketNumber}
                    </span>
                  </div>
                </div>

                {/* Second Divider */}
                <div className="border-t border-slate-200/80 my-4" />

                {/* Bottom Description */}
                <p className="text-[15px] sm:text-[16px] font-medium text-[#475569] leading-relaxed break-words">
                  {tkt.description}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* =====================================================================
          4. FLOATING "+ New Request" BUTTON (Anchored to Bottom Right of App Shell)
          ===================================================================== */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[430px] pointer-events-none flex justify-end px-5 z-30">
        <button
          type="button"
          onClick={() => {
            setFormError(null);
            setIsRaising(true);
          }}
          className="pointer-events-auto bg-[#F46E25] hover:bg-[#E05D16] active:scale-95 text-white font-semibold text-[16px] px-6 py-4 rounded-[20px] shadow-xl shadow-[#F46E25]/30 flex items-center gap-2.5 transition-all"
        >
          <Plus className="w-6 h-6 stroke-[2.2]" />
          <span>New Request</span>
        </button>
      </div>

      {/* =====================================================================
          NEW COMPLAINT MODAL
          ===================================================================== */}
      {isRaising && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#F46E25] to-[#EA580C] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">New Complaint Request</h3>
                <p className="text-xs text-orange-100">Hostel Maintenance &amp; Support</p>
              </div>
              <button
                type="button"
                onClick={() => setIsRaising(false)}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium">
                  {formError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Category</label>
                <input
                  type="text"
                  value={categoryType}
                  onChange={(e) => setCategoryType(e.target.value)}
                  placeholder="Maintenance"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:border-[#F46E25]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Issue Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {subCategories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSubCategory(c)}
                      className={`p-2 rounded-xl font-medium border text-center transition-all ${
                        subCategory === c
                          ? 'bg-[#FFF3EB] border-[#F46E25] text-[#EA6C2F] font-semibold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Priority</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Low', 'Medium', 'High', 'Emergency'] as ComplaintPriority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`p-2 rounded-xl font-medium border text-center transition-all ${
                        priority === p
                          ? 'bg-[#F46E25] text-white border-[#F46E25]'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. usb socket is not working, plz fix it , i need it"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#F46E25]"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRaising(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#F46E25] hover:bg-[#E05D16] text-white font-semibold"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
