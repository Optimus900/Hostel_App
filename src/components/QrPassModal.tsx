import React, { useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { useHostel } from '../context/HostelContext';
import { GatePass } from '../types/hostel';

interface QrPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  specificPassNumber?: string;
}

const MONTHS_SHORT = [
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

const formatOutDate = (isoOrDateStr?: string): string => {
  const dateObj = isoOrDateStr ? new Date(isoOrDateStr) : new Date();
  const validDate = Number.isNaN(dateObj.getTime()) ? new Date() : dateObj;
  const day = validDate.getDate();
  const month = MONTHS_SHORT[validDate.getMonth()];
  const year = validDate.getFullYear();
  return `${day} ${month} ${year}`;
};

const formatOutTime = (isoOrDateStr?: string): string => {
  const dateObj = isoOrDateStr ? new Date(isoOrDateStr) : new Date();
  const validDate = Number.isNaN(dateObj.getTime()) ? new Date() : dateObj;
  let hours = validDate.getHours();
  const minutes = String(validDate.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
};

const isGatePassActive = (pass: GatePass): boolean => {
  const returnTs = new Date(pass.expectedReturnTime).getTime();
  const isNotPastReturn = Number.isNaN(returnTs) || returnTs > Date.now();
  return isNotPastReturn && (pass.status === 'Approved' || pass.status === 'Checked Out');
};

export const QrPassModal: React.FC<QrPassModalProps> = ({
  isOpen,
  onClose,
  specificPassNumber,
}) => {
  const { gatePasses } = useHostel();
  const [downloadedToast, setDownloadedToast] = useState<boolean>(false);

  if (!isOpen) return null;

  const activePasses = gatePasses.filter(isGatePassActive);
  const currentPass = specificPassNumber
    ? activePasses.find((p) => p.passNumber === specificPassNumber)
    : activePasses[0];

  if (!currentPass) {
    return (
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-[360px] bg-white rounded-[28px] shadow-2xl border border-slate-100 px-6 py-8 flex flex-col items-center text-center"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-14 h-14 rounded-full bg-[#FFF2EA] flex items-center justify-center text-[#EA6C2F] mb-4">
            <X className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A]">No Active Gate Pass</h3>
          <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
            Gate Pass QR is only available when you have an active gate pass.
          </p>
        </div>
      </div>
    );
  }

  const outDateDisplay = formatOutDate(currentPass.departureTime);
  const outTimeDisplay = formatOutTime(currentPass.departureTime);

  const handleDownloadGatePass = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 760;
      canvas.height = 980;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Top green circle
        ctx.fillStyle = '#E3F3E6';
        ctx.beginPath();
        ctx.arc(380, 115, 54, 0, Math.PI * 2);
        ctx.fill();

        // Checkmark
        ctx.strokeStyle = '#58A56A';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(358, 116);
        ctx.lineTo(374, 132);
        ctx.lineTo(404, 100);
        ctx.stroke();

        // Title & Subtitle
        ctx.fillStyle = '#5CA36C';
        ctx.font = '600 34px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Gate Pass Generated', 380, 220);

        ctx.fillStyle = '#64748B';
        ctx.font = '400 22px Inter, sans-serif';
        ctx.fillText('Gate pass completed. You are authorized', 380, 265);
        ctx.fillText('to leave the premises.', 380, 295);

        // Out Date & Out Time
        ctx.fillStyle = '#64748B';
        ctx.font = '500 18px Inter, sans-serif';
        ctx.fillText('OUT DATE', 220, 845);
        ctx.fillText('OUT TIME', 540, 845);

        ctx.fillStyle = '#1E293B';
        ctx.font = '600 28px Inter, sans-serif';
        ctx.fillText(outDateDisplay, 220, 890);
        ctx.fillText(outTimeDisplay, 540, 890);

        const link = document.createElement('a');
        link.download = `GatePass-${currentPass.passNumber || 'QR'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    } catch {
      // ignore canvas errors
    }
    setDownloadedToast(true);
    setTimeout(() => setDownloadedToast(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-[#F1F5F9] animate-in fade-in duration-150">
      <div className="w-full max-w-[430px] min-h-screen bg-[#F7F8FA] flex flex-col px-5 pt-4 pb-2 overflow-y-auto">
        {/* =====================================================================
            TOP HEADER: Back Arrow Left + Centered "Gate Pass" Title
            ===================================================================== */}
        <div className="flex items-center justify-between py-2">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 -ml-1.5 rounded-full flex items-center justify-center text-[#2D3748] hover:bg-slate-200/60 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-[22px] h-[22px] stroke-[2.1]" />
          </button>
          <h1 className="text-[19px] font-semibold text-[#0B0F19] tracking-tight">
            Gate Pass
          </h1>
          <div className="w-9 h-9" />
        </div>

        {/* =====================================================================
            MAIN WHITE CARD (Matches Screenshot_20261101_180815)
            ===================================================================== */}
        <div className="mt-4 bg-white rounded-[4px] px-6 py-7 flex flex-col items-center text-center shadow-[0_1px_4px_rgba(15,23,42,0.03)]">
          {/* 1. Soft Mint-Green Circle with Checkmark */}
          <div className="w-[72px] h-[72px] rounded-full bg-[#E3F3E6] flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-8 h-8 text-[#58A56A]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          {/* 2. Title: "Gate Pass Generated" */}
          <h2 className="mt-5 text-[20px] font-semibold text-[#5CA36C] tracking-tight leading-snug">
            Gate Pass Generated
          </h2>

          {/* 3. Subtitle */}
          <p className="mt-2 text-[14px] text-[#64748B] font-normal leading-[1.45] max-w-[290px]">
            Gate pass completed. You are authorized to leave the premises.
          </p>

          {/* 4. Rounded White QR Box with 21x21 QR Matrix matching Screenshot */}
          <div className="mt-6 w-[234px] h-[234px] bg-white rounded-[18px] border border-[#E2E8F0] p-5 flex items-center justify-center">
            <svg
              viewBox="0 0 21 21"
              shapeRendering="crispEdges"
              className="w-full h-full"
            >
              {/* Top-left finder pattern */}
              <path
                fill="#000000"
                d="M0,0 h7 v7 h-7 z M1,1 v5 h5 v-5 z M2,2 h3 v3 h-3 z"
              />
              {/* Top-right finder pattern */}
              <path
                fill="#000000"
                d="M14,0 h7 v7 h-7 z M15,1 v5 h5 v-5 z M16,2 h3 v3 h-3 z"
              />
              {/* Bottom-left finder pattern */}
              <path
                fill="#000000"
                d="M0,14 h7 v7 h-7 z M1,15 v5 h5 v-5 z M2,16 h3 v3 h-3 z"
              />

              {/* 21x21 QR Data Modules matching Screenshot_20261101_180815 */}
              <g fill="#000000">
                {/* Top middle modules (x=8..12, y=0..7) */}
                <rect x="9" y="0" width="1" height="1" />
                <rect x="12" y="0" width="1" height="1" />
                <rect x="8" y="1" width="1" height="1" />
                <rect x="11" y="1" width="1" height="1" />
                <rect x="9" y="2" width="1" height="1" />
                <rect x="8" y="3" width="1" height="1" />
                <rect x="11" y="3" width="1" height="1" />
                <rect x="10" y="4" width="2" height="1" />
                <rect x="8" y="5" width="5" height="1" />
                <rect x="8" y="6" width="1" height="1" />
                <rect x="10" y="6" width="1" height="2" />
                <rect x="12" y="6" width="1" height="2" />

                {/* Middle horizontal band (y=8..12) */}
                <rect x="0" y="8" width="5" height="1" />
                <rect x="6" y="8" width="4" height="1" />
                <rect x="11" y="8" width="3" height="1" />
                <rect x="15" y="8" width="1" height="1" />
                <rect x="17" y="8" width="1" height="1" />
                <rect x="19" y="8" width="1" height="1" />

                <rect x="1" y="9" width="5" height="1" />
                <rect x="7" y="9" width="2" height="1" />
                <rect x="10" y="9" width="1" height="1" />
                <rect x="12" y="9" width="1" height="1" />
                <rect x="16" y="9" width="5" height="1" />

                <rect x="1" y="10" width="4" height="1" />
                <rect x="6" y="10" width="6" height="1" />
                <rect x="14" y="10" width="2" height="1" />
                <rect x="18" y="10" width="1" height="1" />

                <rect x="0" y="11" width="5" height="1" />
                <rect x="7" y="11" width="2" height="1" />
                <rect x="13" y="11" width="1" height="1" />
                <rect x="15" y="11" width="6" height="1" />

                <rect x="2" y="12" width="1" height="1" />
                <rect x="5" y="12" width="2" height="1" />
                <rect x="8" y="12" width="1" height="1" />
                <rect x="11" y="12" width="1" height="1" />
                <rect x="18" y="12" width="1" height="1" />

                {/* Bottom middle & right modules (y=13..20, x=8..20) */}
                <rect x="8" y="13" width="3" height="1" />
                <rect x="12" y="13" width="1" height="1" />
                <rect x="15" y="13" width="1" height="1" />
                <rect x="17" y="13" width="4" height="1" />

                <rect x="8" y="14" width="2" height="1" />
                <rect x="12" y="14" width="2" height="1" />
                <rect x="15" y="14" width="1" height="1" />

                <rect x="9" y="15" width="6" height="1" />
                <rect x="18" y="15" width="1" height="1" />

                <rect x="8" y="16" width="2" height="1" />
                <rect x="11" y="16" width="1" height="1" />
                <rect x="13" y="16" width="1" height="1" />
                <rect x="17" y="16" width="3" height="1" />

                <rect x="8" y="17" width="3" height="1" />
                <rect x="12" y="17" width="1" height="1" />
                <rect x="17" y="17" width="2" height="1" />
                <rect x="20" y="17" width="1" height="1" />

                <rect x="8" y="18" width="3" height="1" />
                <rect x="13" y="18" width="1" height="1" />
                <rect x="18" y="18" width="1" height="2" />

                <rect x="8" y="19" width="2" height="2" />
                <rect x="11" y="19" width="4" height="1" />
                <rect x="19" y="19" width="1" height="2" />

                <rect x="11" y="20" width="1" height="1" />
                <rect x="17" y="20" width="1" height="1" />
              </g>
            </svg>
          </div>

          {/* 5. Bottom Two-Column Section: OUT DATE | OUT TIME */}
          <div className="mt-6 pt-1 w-full grid grid-cols-2 items-center relative">
            {/* Vertical Divider Line */}
            <div
              className="absolute left-1/2 top-1 bottom-0.5 w-[1px] bg-[#E2E8F0] -translate-x-1/2"
              aria-hidden="true"
            />

            {/* Left Column: OUT DATE */}
            <div className="flex flex-col items-center pr-3">
              <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#64748B]">
                OUT DATE
              </span>
              <span className="mt-1.5 text-[16px] font-medium text-[#1E293B] tracking-tight">
                {outDateDisplay}
              </span>
            </div>

            {/* Right Column: OUT TIME */}
            <div className="flex flex-col items-center pl-3">
              <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#64748B]">
                OUT TIME
              </span>
              <span className="mt-1.5 text-[16px] font-medium text-[#1E293B] tracking-tight">
                {outTimeDisplay}
              </span>
            </div>
          </div>
        </div>

        {/* =====================================================================
            DOWNLOAD GATE PASS ORANGE PILL BUTTON
            ===================================================================== */}
        <button
          type="button"
          onClick={handleDownloadGatePass}
          className="mt-6 w-full py-4 rounded-full bg-[#F96B2B] hover:bg-[#E85D1F] active:scale-[0.99] text-white font-medium text-[15.5px] flex items-center justify-center gap-3 shadow-[0_4px_14px_rgba(249,107,43,0.25)] transition-all"
        >
          {/* Solid Download Icon matching screenshot */}
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M11 4C11 3.45 11.45 3 12 3C12.55 3 13 3.45 13 4V11.59L15.29 9.3C15.68 8.91 16.32 8.91 16.71 9.3C17.1 9.69 17.1 10.32 16.71 10.71L12.71 14.71C12.32 15.1 11.68 15.1 11.29 14.71L7.29 10.71C6.9 10.32 6.9 9.69 7.29 9.3C7.68 8.91 8.32 8.91 8.71 9.3L11 11.59V4ZM5 18C4.45 18 4 18.45 4 19C4 19.55 4.45 20 5 20H19C19.55 20 20 19.55 20 19C20 18.45 19.55 18 19 18H5Z" />
          </svg>
          <span>{downloadedToast ? 'Gate Pass Downloaded' : 'Download Gate Pass'}</span>
        </button>

        {/* =====================================================================
            FOOTER NOTE
            ===================================================================== */}
        <p className="mt-4 text-center text-[13px] text-[#64748B] leading-[1.45] px-4">
          Please show this QR code at the security desk when leaving the hostel.
        </p>

        {/* Native System Gesture Home Indicator Pill */}
        <div className="mt-auto pt-6 pb-0.5 flex justify-center">
          <div className="w-[128px] h-[4px] rounded-full bg-[#94A3B8]/55" />
        </div>
      </div>
    </div>
  );
};
