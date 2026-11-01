import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  Wrench,
  DoorOpen,
  Users,
  WashingMachine,
  Building2,
  Bed,
  User,
  Megaphone,
  X,
  CheckCircle2,
  Plus,
  Clock,
  Sparkles,
  QrCode,
} from 'lucide-react';
import { useHostel } from '../context/HostelContext';
import { FeeInvoice } from '../types/hostel';
import {
  MyPoshtellLogo,
  WavingHandSvg,
  HostelBuildingIllustration,
  BreakfastThumbnailSvg,
  LunchThumbnailSvg,
  DinnerThumbnailSvg,
  HousekeepingCleanSvg,
  CookieBiteSvg,
} from './PoshtellIllustrations';

interface ResidentDashboardProps {
  onOpenQr: () => void;
  onNavigateTab: (tab: 'HOME' | 'GATE_PASS' | 'MESS' | 'COMPLAINTS' | 'FEES_NOC' | 'PROFILE') => void;
  onPayInvoice: (inv: FeeInvoice) => void;
  onTriggerSos: () => void;
}

interface VisitorPassItem {
  id: string;
  visitorName: string;
  relation: string;
  visitDate: string;
  timeWindow: string;
  status: 'Approved' | 'Pending Approval';
}

export const ResidentDashboard: React.FC<ResidentDashboardProps> = ({
  onOpenQr,
  onNavigateTab,
  onPayInvoice,
  onTriggerSos,
}) => {
  const { profile, notices, messMenu, toggleCheckInStatus } = useHostel();

  const currentWeekdayName = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ][new Date().getDay()];
  const todayMess =
    messMenu.find((d) => d.dayOfWeek === currentWeekdayName) || messMenu[0];

  const [showNotificationsModal, setShowNotificationsModal] = useState<boolean>(false);
  const [showVisitorModal, setShowVisitorModal] = useState<boolean>(false);
  const [showLaundryModal, setShowLaundryModal] = useState<boolean>(false);
  const [showAllActionsModal, setShowAllActionsModal] = useState<boolean>(false);
  const [showAnnouncementsList, setShowAnnouncementsList] = useState<boolean>(false);

  // Visitor Pass interactive state
  const [visitors, setVisitors] = useState<VisitorPassItem[]>([
    {
      id: 'vis-1',
      visitorName: 'Dr. Rajesh Sharma',
      relation: 'Parent / Father',
      visitDate: '24 Oct 2026',
      timeWindow: '10:00 AM - 05:00 PM',
      status: 'Approved',
    },
  ]);
  const [newVisitorName, setNewVisitorName] = useState<string>('');
  const [newVisitorRelation, setNewVisitorRelation] = useState<string>('Parent');
  const [newVisitorDate, setNewVisitorDate] = useState<string>('2026-10-25');

  // Laundry interactive state
  const [laundryUsedKg, setLaundryUsedKg] = useState<number>(14);
  const totalLaundryQuotaKg = 25;
  const [laundryBookedMsg, setLaundryBookedMsg] = useState<string | null>(null);

  const handleCreateVisitorPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVisitorName.trim()) return;
    setVisitors((prev) => [
      {
        id: `vis-${Date.now()}`,
        visitorName: newVisitorName.trim(),
        relation: newVisitorRelation,
        visitDate: newVisitorDate,
        timeWindow: '10:00 AM - 06:00 PM',
        status: 'Approved',
      },
      ...prev,
    ]);
    setNewVisitorName('');
  };

  const handleBookLaundryBag = () => {
    if (laundryUsedKg + 3 <= totalLaundryQuotaKg) {
      setLaundryUsedKg((prev) => prev + 3);
      setLaundryBookedMsg('Laundry bag pickup (3 kg) scheduled for today at 05:30 PM!');
      setTimeout(() => setLaundryBookedMsg(null), 3500);
    }
  };

  const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const formatCompactMoveDate = (rawDate: string | undefined, fallback: string): string => {
    if (!rawDate || rawDate === '—' || !rawDate.trim()) return fallback;
    const trimmed = rawDate.trim();

    if (/^[A-Za-z]{3}\s+\d{1,2},\s*\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const dmyMatch = trimmed.match(/^(\d{1,2})\s+([A-Za-z]+),?\s+(\d{2,4})$/);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10);
      const monthStr = dmyMatch[2].slice(0, 3).toLowerCase();
      const monthIdx = SHORT_MONTHS.findIndex((m) => m.toLowerCase() === monthStr);
      const yr = dmyMatch[3].slice(-2);
      if (monthIdx !== -1) {
        return `${SHORT_MONTHS[monthIdx]} ${day}, ${yr}`;
      }
    }

    const mdyMatch = trimmed.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{2,4})$/);
    if (mdyMatch) {
      const monthStr = mdyMatch[1].slice(0, 3).toLowerCase();
      const monthIdx = SHORT_MONTHS.findIndex((m) => m.toLowerCase() === monthStr);
      const day = parseInt(mdyMatch[2], 10);
      const yr = mdyMatch[3].slice(-2);
      if (monthIdx !== -1) {
        return `${SHORT_MONTHS[monthIdx]} ${day}, ${yr}`;
      }
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      const m = SHORT_MONTHS[parsed.getMonth()];
      const d = parsed.getDate();
      const y = String(parsed.getFullYear()).slice(-2);
      return `${m} ${d}, ${y}`;
    }

    return trimmed.length > 11 ? fallback : trimmed;
  };

  const moveInLabel = formatCompactMoveDate(profile.moveInDate, 'Aug 8, 26');
  const moveOutLabel = formatCompactMoveDate(profile.moveOutDate, 'Jul 26, 27');

  return (
    <div className="space-y-4 pb-6">
      {/* =========================================================================
          1. EXACT MY POSHTELL HERO BANNER (Matches Screenshot_20261101_181928)
          Full-bleed warm peach banner, MY POSHTELL logo, White squircle bell card,
          "Hi, 👋", Large Name, "Tower - 3 • Room 213 • Bed B", and 3D Hostel Building
          ========================================================================= */}
      <div className="relative -mx-4 bg-gradient-to-b from-[#FCEEE3] via-[#FDF3EB] to-[#FFFBF8] pt-5 pb-6 px-5 overflow-hidden rounded-bl-[28px] border-b border-[#F3DFD1]">
        {/* Soft curved architectural top arch matching screenshot */}
        <div
          className="absolute -top-28 left-1/2 -translate-x-1/2 w-[500px] h-[210px] rounded-[100%] bg-[#F7DEC9]/45 pointer-events-none"
          aria-hidden="true"
        />

        {/* Angled warm terracotta/peach ground band along the bottom matching screenshot */}
        <div
          className="absolute bottom-1 -left-4 right-0 h-[12px] bg-[#F2B795]/75 -rotate-[2deg] pointer-events-none"
          aria-hidden="true"
        />

        {/* Top Bar inside Hero: Logo left, White Bell Squircle Button right */}
        <div className="relative z-10 flex items-start justify-between">
          <div className="pl-1 pt-0.5">
            <MyPoshtellLogo className="w-[44px] h-[38px]" />
          </div>

          <button
            type="button"
            onClick={() => setShowNotificationsModal(true)}
            className="w-[42px] h-[42px] rounded-[13px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-stone-100/80 flex items-center justify-center text-[#1E293B] hover:bg-stone-50 active:scale-95 transition-all"
            aria-label="Notifications"
          >
            <Bell className="w-[19px] h-[19px] text-[#1E293B] stroke-[2]" />
          </button>
        </div>

        {/* Greeting Block & Right 3D Hostel Illustration */}
        <div className="relative z-10 mt-4 flex items-end justify-between min-h-[104px]">
          <div className="pb-0.5 max-w-[70%] relative z-10">
            <div className="flex items-center gap-1.5">
              <span className="text-[20px] font-bold text-[#2D3B4E] tracking-tight leading-none">
                Hi,
              </span>
              <WavingHandSvg className="w-[24px] h-[24px] shrink-0" />
            </div>

            <h1 className="text-[25px] font-extrabold text-[#2D3B4E] tracking-[-0.02em] mt-1 leading-[1.15]">
              {profile.fullName}
            </h1>

            {/* Subtitle: Tower • Room • Bed */}
            <p className="text-[13px] font-normal text-[#5A6578] mt-1.5 flex items-center gap-1.5 whitespace-nowrap">
              <span>{profile.hostelBuilding}</span>
              <span aria-hidden="true">•</span>
              <span>{profile.roomNumber}</span>
              <span aria-hidden="true">•</span>
              <span>{profile.bedNumber}</span>
            </p>
          </div>

          {/* 3D Warm Terracotta Hostel Building Illustration flush on bottom-right */}
          <div className="absolute -right-5 -bottom-6 z-0 pointer-events-none">
            <HostelBuildingIllustration className="w-[152px] h-[138px]" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. THREE-COLUMN STATUS SUMMARY BAR
          (Active Resident | Move-in: Aug 8, 26 | Move-out: Jul 26, 27)
          ========================================================================= */}
      <div className="bg-[#F8FAFC] rounded-[18px] border border-[#E2E8F0] py-3 px-2 grid grid-cols-3 divide-x divide-[#E2E8F0]">
        {/* Col 1: Active Resident */}
        <button
          type="button"
          onClick={toggleCheckInStatus}
          className="flex flex-col items-start px-1.5 text-left focus:outline-none min-w-0 overflow-hidden"
        >
          <div className="w-[22px] h-[22px] rounded-full border-[2px] border-[#15803D] flex items-center justify-center mb-1.5 shrink-0">
            <span
              className={`w-[9px] h-[9px] rounded-full ${
                profile.checkInStatus === 'IN_HOSTEL' ? 'bg-[#15803D]' : 'bg-amber-500'
              }`}
            />
          </div>
          <span className="text-[10.5px] font-medium text-[#1E293B] tracking-[-0.015em] leading-snug whitespace-nowrap">
            {profile.checkInStatus === 'IN_HOSTEL' ? 'Active Resident' : 'Out on Pass'}
          </span>
        </button>

        {/* Col 2: Move-in: Aug 8, 26 */}
        <button
          type="button"
          onClick={() => onNavigateTab('PROFILE')}
          className="flex flex-col items-start px-1.5 text-left focus:outline-none min-w-0 overflow-hidden"
        >
          <Calendar className="w-[20px] h-[20px] text-[#EA6C2F] mb-1.5 shrink-0" strokeWidth={1.9} />
          <span className="text-[10.5px] font-medium text-[#1E293B] tracking-[-0.015em] leading-snug whitespace-nowrap">
            Move-in: {moveInLabel}
          </span>
        </button>

        {/* Col 3: Move-out: Jul 26, 27 */}
        <button
          type="button"
          onClick={() => onNavigateTab('FEES_NOC')}
          className="flex flex-col items-start pl-1.5 pr-0.5 text-left focus:outline-none min-w-0 overflow-hidden"
        >
          {/* Pink/Red Exit Icon matching screenshot */}
          <div className="w-[20px] h-[20px] rounded-[5px] bg-[#E11D48] text-white flex items-center justify-center mb-1.5 shrink-0">
            <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none">
              <path
                d="M4 8H12.5M12.5 8L9.5 5M12.5 8L9.5 11"
                stroke="white"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-[10.5px] font-medium text-[#1E293B] tracking-[-0.015em] leading-snug whitespace-nowrap">
            Move-out: {moveOutLabel}
          </span>
        </button>
      </div>

      {/* =========================================================================
          3. QUICK ACTIONS 2x2 GRID (Matches Screenshot_20261101_181928 Scale)
          (Complaint | Gate Pass | Visitor | Laundry)
          ========================================================================= */}
      <div className="pt-0.5">
        <div className="flex items-center justify-between mb-3 px-0.5">
          <h2 className="text-[17.5px] font-semibold text-[#1E293B] tracking-tight">
            Quick Actions
          </h2>
          <button
            type="button"
            onClick={() => setShowAllActionsModal(true)}
            className="text-[13.5px] font-medium text-[#D97736] hover:text-[#B85D23] transition-colors"
          >
            See All
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Tile 1: Complaint */}
          <button
            type="button"
            onClick={() => onNavigateTab('COMPLAINTS')}
            className="bg-white hover:bg-slate-50/50 active:scale-[0.98] rounded-[18px] border border-[#E2E8F0] py-4 px-3 flex flex-col items-center justify-center text-center shadow-[0_1px_4px_rgba(0,0,0,0.02)] transition-all"
          >
            <Wrench className="w-[24px] h-[24px] text-[#D97736] mb-2.5" strokeWidth={1.8} />
            <span className="text-[14.5px] font-medium text-[#1E293B] tracking-tight">
              Complaint
            </span>
            <span className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
              Lodge an issue or request
            </span>
          </button>

          {/* Tile 2: Gate Pass */}
          <button
            type="button"
            onClick={() => onNavigateTab('GATE_PASS')}
            className="bg-white hover:bg-slate-50/50 active:scale-[0.98] rounded-[18px] border border-[#E2E8F0] py-4 px-3 flex flex-col items-center justify-center text-center shadow-[0_1px_4px_rgba(0,0,0,0.02)] transition-all"
          >
            <DoorOpen className="w-[24px] h-[24px] text-[#B45309] mb-2.5" strokeWidth={1.8} />
            <span className="text-[14.5px] font-medium text-[#1E293B] tracking-tight">
              Gate Pass
            </span>
            <span className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
              Request an exit pass
            </span>
          </button>

          {/* Tile 3: Visitor */}
          <button
            type="button"
            onClick={() => setShowVisitorModal(true)}
            className="bg-white hover:bg-slate-50/50 active:scale-[0.98] rounded-[18px] border border-[#E2E8F0] py-4 px-3 flex flex-col items-center justify-center text-center shadow-[0_1px_4px_rgba(0,0,0,0.02)] transition-all"
          >
            <Users className="w-[24px] h-[24px] text-[#3F8A27] mb-2.5" strokeWidth={1.9} />
            <span className="text-[14.5px] font-medium text-[#1E293B] tracking-tight">
              Visitor
            </span>
            <span className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
              Request a visitor pass
            </span>
          </button>

          {/* Tile 4: Laundry */}
          <button
            type="button"
            onClick={() => setShowLaundryModal(true)}
            className="bg-white hover:bg-slate-50/50 active:scale-[0.98] rounded-[18px] border border-[#E2E8F0] py-4 px-3 flex flex-col items-center justify-center text-center shadow-[0_1px_4px_rgba(0,0,0,0.02)] transition-all"
          >
            {/* Solid Orange Washing Machine Icon matching screenshot */}
            <svg
              viewBox="0 0 24 24"
              className="w-[24px] h-[24px] text-[#EA6C2F] mb-2.5"
              fill="currentColor"
            >
              <path d="M6 2C4.34 2 3 3.34 3 5V19C3 20.66 4.34 22 6 22H18C19.66 22 21 20.66 21 19V5C21 3.34 19.66 2 18 2H6ZM6.5 5C7.33 5 8 5.67 8 6.5C8 7.33 7.33 8 6.5 8C5.67 8 5 7.33 5 6.5C5 5.67 5.67 5 6.5 5ZM12 9.5C14.76 9.5 17 11.74 17 14.5C17 17.26 14.76 19.5 12 19.5C9.24 19.5 7 17.26 7 14.5C7 11.74 9.24 9.5 12 9.5ZM12 11.5C10.34 11.5 9 12.84 9 14.5C9 16.16 10.34 17.5 12 17.5C13.66 17.5 15 16.16 15 14.5C15 12.84 13.66 11.5 12 11.5Z" />
            </svg>
            <span className="text-[14.5px] font-medium text-[#1E293B] tracking-tight">
              Laundry
            </span>
            <span className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
              View quota and usage
            </span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          4. "MY ROOM" SECTION CARD (Matches Screenshot_20261101_181928 Scale)
          3 sub-cards (TOWER, ROOM NO., BED NO.), Warden & Housekeeping
          ========================================================================= */}
      <div className="bg-[#FAF7F5] rounded-[22px] border border-[#EFE6DF] p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-[17.5px] font-semibold text-[#1E293B] tracking-tight">My Room</h2>
          <button
            type="button"
            onClick={() => onNavigateTab('PROFILE')}
            className="text-[13.5px] font-medium text-[#D97736] hover:text-[#B85D23]"
          >
            View Details
          </button>
        </div>

        {/* 3 Mini Cards Row */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Card 1: TOWER */}
          <div className="bg-white rounded-[16px] border border-[#F2DCD0] p-3 flex flex-col items-start min-w-0">
            <Building2 className="w-[20px] h-[20px] text-[#EA6C2F] mb-2 shrink-0" strokeWidth={2} />
            <span className="text-[10px] font-normal uppercase tracking-wide text-[#7E8B9B]">
              TOWER
            </span>
            <span className="text-[13.5px] font-medium text-[#1E293B] mt-0.5 leading-tight whitespace-nowrap">
              {profile.hostelBuilding}
            </span>
          </div>

          {/* Card 2: ROOM NO. */}
          <div className="bg-white rounded-[16px] border border-[#F2DCD0] p-3 flex flex-col items-start min-w-0">
            {/* Solid Door Icon matching screenshot */}
            <svg
              viewBox="0 0 24 24"
              className="w-[20px] h-[20px] text-[#EA6C2F] mb-2 shrink-0"
              fill="currentColor"
            >
              <path d="M6 3C4.9 3 4 3.9 4 5V19H2V21H22V19H20V5C20 3.9 19.1 3 18 3H6ZM15.5 11C16.33 11 17 11.67 17 12.5C17 13.33 16.33 14 15.5 14C14.67 14 14 13.33 14 12.5C14 11.67 14.67 11 15.5 11Z" />
            </svg>
            <span className="text-[10px] font-normal uppercase tracking-wide text-[#7E8B9B]">
              ROOM NO.
            </span>
            <span className="text-[13.5px] font-medium text-[#1E293B] mt-0.5 leading-tight whitespace-nowrap">
              {profile.roomNumber}
            </span>
          </div>

          {/* Card 3: BED NO. */}
          <div className="bg-white rounded-[16px] border border-[#F2DCD0] p-3 flex flex-col items-start min-w-0">
            <Bed className="w-[20px] h-[20px] text-[#EA6C2F] mb-2 shrink-0" strokeWidth={2} />
            <span className="text-[10px] font-normal uppercase tracking-wide text-[#7E8B9B]">
              BED NO.
            </span>
            <span className="text-[13.5px] font-medium text-[#1E293B] mt-0.5 leading-tight whitespace-nowrap">
              {profile.bedNumber}
            </span>
          </div>
        </div>

        <div className="border-t border-slate-200/70 pt-3.5 space-y-3">
          {/* WARDEN ROW */}
          <div className="flex items-center gap-3">
            <div className="w-[38px] h-[38px] rounded-full bg-[#A7F3D0] flex items-center justify-center shrink-0">
              <User className="w-[18px] h-[18px] text-[#15803D]" strokeWidth={1.8} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-normal uppercase tracking-wider text-[#7E8B9B] block">
                WARDEN
              </span>
              <p className="text-[13.5px] font-medium text-[#1E293B] leading-snug">
                RAVIKUMARA RAVIKUMARA, Amulya Kumar Sahu
              </p>
            </div>
          </div>

          {/* HOUSEKEEPING ROW */}
          <div className="flex items-center gap-3">
            <div className="w-[38px] h-[38px] rounded-full bg-[#BAE6FD]/75 flex items-center justify-center shrink-0">
              <HousekeepingCleanSvg className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-normal uppercase tracking-wider text-[#7E8B9B] block">
                HOUSEKEEPING
              </span>
              <p className="text-[13.5px] font-medium text-[#1E293B] mt-0.5">
                Tue &amp; Fri | 10:00 AM
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          5. "TODAY'S MESS" SECTION CARD
          Matches screenshot: Cookie icon, "Today's Mess", day tag, "View Menu",
          and Breakfast / Lunch / Dinner rows with published menu items
          ========================================================================= */}
      <div className="bg-[#FFFDF9] rounded-[22px] border border-[#F3E9D8] p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
          <div className="flex items-center gap-2">
            <CookieBiteSvg className="w-[22px] h-[22px]" />
            <h2 className="text-[16.5px] font-semibold text-[#1E293B]">Today&apos;s Mess</h2>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FBF0E4] text-[#D97736] text-[11.5px] font-medium">
              {todayMess?.dayOfWeek || 'Sunday'}
            </span>
            <button
              onClick={() => onNavigateTab('MESS')}
              className="text-[13px] font-medium text-[#D97736] hover:text-[#B85D23]"
            >
              View Menu
            </button>
          </div>
        </div>

        {/* Meal Rows */}
        <div className="divide-y divide-slate-200/60">
          {/* Breakfast */}
          <div
            onClick={() => onNavigateTab('MESS')}
            className="py-3.5 flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <BreakfastThumbnailSvg />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-[14px] font-medium text-[#1E293B]">Breakfast</span>
                <span className="text-[11px] text-[#64748B]">
                  {todayMess?.meals.breakfast.timing || '7:00 AM – 9:00 AM'}
                </span>
              </div>
              <p className="text-[12.5px] text-[#64748B] truncate mt-0.5">
                {todayMess?.meals.breakfast.items.map((item) => item.name).join(' • ') ||
                  'Kali Dosa-Aloo Palya • Shavige Bath • Coconut Chutney'}
              </p>
            </div>
          </div>

          {/* Lunch */}
          <div
            onClick={() => onNavigateTab('MESS')}
            className="py-3.5 flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <LunchThumbnailSvg />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-[14px] font-medium text-[#1E293B]">Lunch</span>
                <span className="text-[11px] text-[#64748B]">
                  {todayMess?.meals.lunch.timing || '12:30 PM – 2:30 PM'}
                </span>
              </div>
              <p className="text-[12.5px] text-[#64748B] truncate mt-0.5">
                {todayMess?.meals.lunch.items.map((item) => item.name).join(' • ') ||
                  'Raita • Paneer Lababdar • Veg Biryani • Hyderabadi Chicken Biryani'}
              </p>
            </div>
          </div>

          {/* Dinner */}
          <div
            onClick={() => onNavigateTab('MESS')}
            className="pt-3.5 pb-0.5 flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <DinnerThumbnailSvg />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-[14px] font-medium text-[#1E293B]">Dinner</span>
                <span className="text-[11px] text-[#64748B]">
                  {todayMess?.meals.dinner.timing || '7:00 PM – 9:00 PM'}
                </span>
              </div>
              <p className="text-[12.5px] text-[#64748B] truncate mt-0.5">
                {todayMess?.meals.dinner.items.map((item) => item.name).join(' • ') ||
                  'Salad • Bhindi do pyaza • Soppu Sambar-Rasam'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          6. "ANNOUNCEMENTS" SECTION CARD
          Matches screenshot: Soft lavender card with megaphone icon, "Announcements",
          "View All", and "No recent announcements" (expandable to past notices)
          ========================================================================= */}
      <div className="bg-[#FAF7FF] rounded-[22px] border border-[#EDE5FA] p-4">
        <div className="flex items-center justify-between pb-3 border-b border-purple-200/50">
          <div className="flex items-center gap-2">
            <Megaphone className="w-[18px] h-[18px] text-[#6D28D9]" strokeWidth={1.9} />
            <h2 className="text-[16.5px] font-semibold text-[#1E293B]">Announcements</h2>
          </div>
          <button
            onClick={() => setShowAnnouncementsList(!showAnnouncementsList)}
            className="text-[13px] font-medium text-[#D97736] hover:text-[#B85D23]"
          >
            {showAnnouncementsList ? 'Hide Archive' : 'View All'}
          </button>
        </div>

        {!showAnnouncementsList ? (
          <div className="py-5 text-center">
            <p className="text-[12.5px] font-normal text-slate-500">
              No recent announcements
            </p>
          </div>
        ) : (
          <div className="pt-3.5 space-y-2.5">
            {notices.map((n) => (
              <div
                key={n.id}
                className="p-3 rounded-2xl bg-white border border-purple-100 text-xs"
              >
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>{n.title}</span>
                  <span className="text-[10px] font-mono text-slate-400">{n.date}</span>
                </div>
                <p className="text-slate-600 mt-1 leading-relaxed">{n.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================================
          VISITOR PASS MODAL (Triggered when clicking "Visitor" Quick Action)
          ========================================================================= */}
      {showVisitorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xl">
            <div className="bg-[#4D8B31] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <div>
                  <h3 className="font-bold text-base">Visitor Gate Pass</h3>
                  <p className="text-[11px] text-emerald-100">Request Day Entry for Parents &amp; Guests</p>
                </div>
              </div>
              <button
                onClick={() => setShowVisitorModal(false)}
                className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <form onSubmit={handleCreateVisitorPass} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Visitor Full Name
                  </label>
                  <input
                    type="text"
                    value={newVisitorName}
                    onChange={(e) => setNewVisitorName(e.target.value)}
                    placeholder="e.g. Mr. Rajesh Sharma"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Relation
                    </label>
                    <select
                      value={newVisitorRelation}
                      onChange={(e) => setNewVisitorRelation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                    >
                      <option>Parent</option>
                      <option>Sibling</option>
                      <option>Guardian</option>
                      <option>Friend</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Visit Date
                    </label>
                    <input
                      type="date"
                      value={newVisitorDate}
                      onChange={(e) => setNewVisitorDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#4D8B31] hover:bg-[#3d7026] text-white font-semibold text-xs flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Generate Visitor Pass</span>
                </button>
              </form>

              <div className="border-t border-slate-100 pt-3 space-y-2">
                <span className="text-[11px] font-bold uppercase text-slate-400 block">
                  Active Visitor Passes
                </span>
                {visitors.map((v) => (
                  <div
                    key={v.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{v.visitorName}</p>
                      <p className="text-[11px] text-slate-500">
                        {v.relation} · {v.visitDate} ({v.timeWindow})
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200">
                      {v.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          LAUNDRY QUOTA & USAGE MODAL (Triggered when clicking "Laundry" Quick Action)
          ========================================================================= */}
      {showLaundryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xl">
            <div className="bg-[#EA580C] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <WashingMachine className="w-5 h-5" />
                <div>
                  <h3 className="font-bold text-base">Hostel Laundry Service</h3>
                  <p className="text-[11px] text-orange-100">Monthly Wash &amp; Iron Quota Tracker</p>
                </div>
              </div>
              <button
                onClick={() => setShowLaundryModal(false)}
                className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase text-orange-800">
                    MONTHLY QUOTA USAGE
                  </span>
                  <p className="text-2xl font-extrabold text-slate-900 font-mono mt-0.5">
                    {laundryUsedKg} kg <span className="text-sm font-normal text-slate-500">/ {totalLaundryQuotaKg} kg</span>
                  </p>
                </div>
                <div className="text-right text-xs">
                  <span className="font-bold text-emerald-700 block">
                    {totalLaundryQuotaKg - laundryUsedKg} kg Remaining
                  </span>
                  <span className="text-[11px] text-slate-500">Resets 1st Nov</span>
                </div>
              </div>

              {laundryBookedMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{laundryBookedMsg}</span>
                </div>
              )}

              <div className="text-xs text-slate-600 space-y-1.5">
                <p>
                  <strong>Collection Days ({profile.hostelBuilding}):</strong> Monday &amp; Thursday (08:00 AM – 10:00 AM)
                </p>
                <p>
                  <strong>Delivery Turnaround:</strong> Within 48 Hours to {profile.roomNumber}
                </p>
              </div>

              <button
                onClick={handleBookLaundryBag}
                className="w-full py-3 rounded-xl bg-[#EA580C] hover:bg-[#D9460F] text-white font-semibold text-xs shadow-sm transition-colors"
              >
                Log New Laundry Bag Drop-off (3 kg)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          NOTIFICATIONS MODAL (Triggered from Top-Right Bell Button)
          ========================================================================= */}
      {showNotificationsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Notifications &amp; Alerts</h3>
              <button
                onClick={() => setShowNotificationsModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5 max-h-80 overflow-y-auto">
              {notices.map((n) => (
                <div key={n.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{n.title}</span>
                    <span className="text-[10px] font-mono text-slate-400">{n.date}</span>
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed">{n.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SEE ALL QUICK ACTIONS MODAL
          ========================================================================= */}
      {showAllActionsModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">All Hostel Services</h3>
              <button
                onClick={() => setShowAllActionsModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                onClick={() => {
                  setShowAllActionsModal(false);
                  onOpenQr();
                }}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-[#D97736] text-left flex items-center gap-2.5"
              >
                <QrCode className="w-5 h-5 text-[#D97736]" />
                <span className="font-bold text-slate-800">Digital Gate QR</span>
              </button>
              <button
                onClick={() => {
                  setShowAllActionsModal(false);
                  onNavigateTab('COMPLAINTS');
                }}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-[#D97736] text-left flex items-center gap-2.5"
              >
                <Wrench className="w-5 h-5 text-[#D97736]" />
                <span className="font-bold text-slate-800">Complaint Desk</span>
              </button>
              <button
                onClick={() => {
                  setShowAllActionsModal(false);
                  onNavigateTab('GATE_PASS');
                }}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-[#D97736] text-left flex items-center gap-2.5"
              >
                <DoorOpen className="w-5 h-5 text-[#B45309]" />
                <span className="font-bold text-slate-800">Gate Pass</span>
              </button>
              <button
                onClick={() => {
                  setShowAllActionsModal(false);
                  setShowVisitorModal(true);
                }}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-[#D97736] text-left flex items-center gap-2.5"
              >
                <Users className="w-5 h-5 text-[#4D8B31]" />
                <span className="font-bold text-slate-800">Visitor Pass</span>
              </button>
              <button
                onClick={() => {
                  setShowAllActionsModal(false);
                  setShowLaundryModal(true);
                }}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-[#D97736] text-left flex items-center gap-2.5"
              >
                <WashingMachine className="w-5 h-5 text-[#EA580C]" />
                <span className="font-bold text-slate-800">Laundry Quota</span>
              </button>
              <button
                onClick={() => {
                  setShowAllActionsModal(false);
                  onNavigateTab('MESS');
                }}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-[#D97736] text-left flex items-center gap-2.5"
              >
                <CookieBiteSvg className="w-5 h-5" />
                <span className="font-bold text-slate-800">Mess Menu</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
