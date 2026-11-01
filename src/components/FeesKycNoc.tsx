import React, { useState } from 'react';
import { ChevronRight, X, CheckCircle2, Download } from 'lucide-react';
import { FeeInvoice } from '../types/hostel';
import { useHostel } from '../context/HostelContext';

interface FeesKycNocProps {
  onPayInvoice?: (invoice: FeeInvoice) => void;
}

interface PaymentTransactionItem {
  id: string;
  category: 'HOSTEL' | 'MESS';
  title: string;
  amount: string;
  status: 'Confirmed';
  dateLabel: string;
  referenceId: string;
  paymentMethod: string;
}

const TRANSACTIONS: PaymentTransactionItem[] = [
  {
    id: 'txn-hostel-1',
    category: 'HOSTEL',
    title: 'Hostel Fee Payment',
    amount: '1,19,000',
    status: 'Confirmed',
    dateLabel: '—',
    referenceId: 'POSH-TXN-884120',
    paymentMethod: 'Online / UPI',
  },
  {
    id: 'txn-hostel-2',
    category: 'HOSTEL',
    title: 'Hostel Fee Payment',
    amount: '40,000',
    status: 'Confirmed',
    dateLabel: '8 Aug 2026',
    referenceId: 'POSH-TXN-792415',
    paymentMethod: 'Online / NetBanking',
  },
  {
    id: 'txn-mess-1',
    category: 'MESS',
    title: 'Mess Fee Payment',
    amount: '94,500',
    status: 'Confirmed',
    dateLabel: '—',
    referenceId: 'POSH-TXN-884199',
    paymentMethod: 'Online / UPI',
  },
];

// Bed outline icon matching the screenshot
const BedOutlineSvg: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M3.5 18V12.5C3.5 11.6716 4.17157 11 5 11H19C19.8284 11 20.5 11.6716 20.5 12.5V18"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.5 15.5H20.5"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.5 11V8.5C5.5 7.67157 6.17157 7 7 7H17C17.8284 7 18.5 7.67157 18.5 8.5V11"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 7V11"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

// Fork & Knife icon matching the screenshot
const UtensilsIconSvg: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    {/* Fork on the left */}
    <path
      d="M6.5 4V9.5C6.5 11 7.6 12 9 12C10.4 12 11.5 11 11.5 9.5V4"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 4V20"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Knife on the right */}
    <path
      d="M16.5 4V20"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16.5 4C15 5.2 14.2 7.5 14.2 10.5C14.2 12 15.2 12.8 16.5 12.8"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const FeesKycNoc: React.FC<FeesKycNocProps> = () => {
  const { profile } = useHostel();
  const [selectedTxn, setSelectedTxn] = useState<PaymentTransactionItem | null>(null);

  const hostelTxns = TRANSACTIONS.filter((t) => t.category === 'HOSTEL');
  const messTxns = TRANSACTIONS.filter((t) => t.category === 'MESS');

  return (
    <div className="max-w-xl mx-auto pb-8">
      {/* =========================================================================
          1. TOP PAGE TITLE: "Payments"
          ========================================================================= */}
      <div className="pt-2 pb-5">
        <h1 className="text-[28px] sm:text-3xl font-bold text-[#0F172A] tracking-tight">
          Payments
        </h1>
      </div>

      {/* =========================================================================
          2. ORANGE SUMMARY BANNER CARD
          Total Amount Paid: ₹ 2,53,500
          Hostel Fee: ₹ 1,59,000 | Mess Fee: ₹ 94,500
          ========================================================================= */}
      <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#F06C28] via-[#E46224] to-[#C8531E] p-6 sm:p-7 text-white shadow-lg shadow-[#E46224]/20">
        {/* Decorative subtle overlapping circles on the right matching screenshot */}
        <div
          className="absolute -top-8 -right-10 w-44 h-44 rounded-full bg-white/[0.08] pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-16 right-4 w-36 h-36 rounded-full bg-white/[0.06] pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10">
          <p className="text-[15px] sm:text-base font-medium text-white/80">
            Total Amount Paid
          </p>

          <h2 className="mt-1.5 text-[36px] sm:text-[40px] font-bold tracking-tight text-white leading-none">
            ₹ 2,53,500
          </h2>

          {/* Bottom Split: Hostel Fee | Mess Fee */}
          <div className="mt-7 grid grid-cols-2 items-center relative">
            {/* Vertical Divider */}
            <div
              className="absolute left-1/2 top-1 bottom-1 w-[1px] bg-white/25 -translate-x-1/2"
              aria-hidden="true"
            />

            {/* Left Column: Hostel Fee */}
            <div className="flex items-center gap-3 pr-3">
              <div className="w-11 h-11 rounded-[14px] bg-white/20 flex items-center justify-center shrink-0">
                <BedOutlineSvg className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-[13px] font-medium text-white/75 block leading-tight">
                  Hostel Fee
                </span>
                <span className="text-[15px] sm:text-[17px] font-semibold text-white block mt-0.5">
                  ₹ 1,59,000
                </span>
              </div>
            </div>

            {/* Right Column: Mess Fee */}
            <div className="flex items-center gap-3 pl-4">
              <div className="w-11 h-11 rounded-[14px] bg-white/20 flex items-center justify-center shrink-0">
                <UtensilsIconSvg className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-[13px] font-medium text-white/75 block leading-tight">
                  Mess Fee
                </span>
                <span className="text-[15px] sm:text-[17px] font-semibold text-white block mt-0.5">
                  ₹ 94,500
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. TRANSACTION HISTORY HEADER
          ========================================================================= */}
      <div className="mt-8 mb-5 flex items-center justify-between">
        <h2 className="text-[20px] sm:text-[22px] font-bold text-[#334155] tracking-tight">
          Transaction History
        </h2>
        <span className="px-4 py-1.5 rounded-full bg-[#FFF3EB] text-[#E66420] text-xs sm:text-[13px] font-semibold">
          3 txns
        </span>
      </div>

      {/* =========================================================================
          4. SECTION 1: HOSTEL & DEPOSIT (₹ 1,59,000)
          ========================================================================= */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-1 h-5 rounded-full bg-[#F06C28]" />
            <h3 className="text-[17px] sm:text-[18px] font-semibold text-[#334155]">
              Hostel &amp; Deposit
            </h3>
          </div>
          <span className="text-[15px] sm:text-[16px] font-semibold text-[#F06C28]">
            ₹ 1,59,000
          </span>
        </div>

        <div className="space-y-3.5">
          {hostelTxns.map((txn) => (
            <div
              key={txn.id}
              onClick={() => setSelectedTxn(txn)}
              className="bg-white rounded-[24px] border border-[#E2E8F0] p-4 sm:p-5 flex items-center justify-between gap-3 shadow-2xs hover:shadow-md transition-all cursor-pointer"
            >
              {/* Left Icon + Title & Confirmed Badge */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 rounded-[18px] bg-[#FDF1E8] flex items-center justify-center shrink-0">
                  <BedOutlineSvg className="w-6 h-6 text-[#EA6A27]" />
                </div>

                <div className="min-w-0">
                  <h4 className="text-[16px] sm:text-[17px] font-semibold text-[#0F172A] truncate">
                    {txn.title}
                  </h4>

                  <div className="mt-1.5 flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-full bg-[#EAFBF0] text-[#2F9E5B] text-xs font-medium">
                      {txn.status}
                    </span>
                    <span className="text-xs sm:text-[13px] text-[#7E8B9B] font-normal">
                      {txn.dateLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Amount + Subtle Chevron */}
              <div className="flex flex-col items-end justify-between self-stretch py-0.5 shrink-0">
                <span className="text-[16px] sm:text-[17px] font-semibold text-[#2C3545]">
                  ₹ {txn.amount}
                </span>
                <ChevronRight className="w-4 h-4 text-[#CBD5E1] mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          5. SECTION 2: MESS FEE (₹ 94,500)
          ========================================================================= */}
      <div className="mt-7 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-1 h-5 rounded-full bg-[#F06C28]" />
            <h3 className="text-[17px] sm:text-[18px] font-semibold text-[#334155]">
              Mess Fee
            </h3>
          </div>
          <span className="text-[15px] sm:text-[16px] font-semibold text-[#F06C28]">
            ₹ 94,500
          </span>
        </div>

        <div className="space-y-3.5">
          {messTxns.map((txn) => (
            <div
              key={txn.id}
              onClick={() => setSelectedTxn(txn)}
              className="bg-white rounded-[24px] border border-[#E2E8F0] p-4 sm:p-5 flex items-center justify-between gap-3 shadow-2xs hover:shadow-md transition-all cursor-pointer"
            >
              {/* Left Green Utensils Icon + Title & Confirmed Badge */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 rounded-[18px] bg-[#E8F8EE] flex items-center justify-center shrink-0">
                  <UtensilsIconSvg className="w-6 h-6 text-[#1E8E4A]" />
                </div>

                <div className="min-w-0">
                  <h4 className="text-[16px] sm:text-[17px] font-semibold text-[#0F172A] truncate">
                    {txn.title}
                  </h4>

                  <div className="mt-1.5 flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-full bg-[#EAFBF0] text-[#2F9E5B] text-xs font-medium">
                      {txn.status}
                    </span>
                    <span className="text-xs sm:text-[13px] text-[#7E8B9B] font-normal">
                      {txn.dateLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Amount + Subtle Chevron */}
              <div className="flex flex-col items-end justify-between self-stretch py-0.5 shrink-0">
                <span className="text-[16px] sm:text-[17px] font-semibold text-[#2C3545]">
                  ₹ {txn.amount}
                </span>
                <ChevronRight className="w-4 h-4 text-[#CBD5E1] mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          TRANSACTION RECEIPT MODAL (When tapping any transaction card)
          ========================================================================= */}
      {selectedTxn && (
        <div
          onClick={() => setSelectedTxn(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-[28px] border border-slate-200 p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                    selectedTxn.category === 'HOSTEL'
                      ? 'bg-[#FDF1E8] text-[#EA6A27]'
                      : 'bg-[#E8F8EE] text-[#1E8E4A]'
                  }`}
                >
                  {selectedTxn.category === 'HOSTEL' ? (
                    <BedOutlineSvg className="w-5 h-5" />
                  ) : (
                    <UtensilsIconSvg className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">{selectedTxn.title}</h3>
                  <span className="text-xs text-[#2F9E5B] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {selectedTxn.status}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTxn(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid</span>
                <span className="font-bold text-slate-900">₹ {selectedTxn.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Resident</span>
                <span className="font-semibold text-slate-900">{profile.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Date</span>
                <span className="font-semibold text-slate-900">
                  {selectedTxn.dateLabel === '—' ? 'Aug 2026' : selectedTxn.dateLabel}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reference ID</span>
                <span className="font-mono font-semibold text-slate-900">
                  {selectedTxn.referenceId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Mode</span>
                <span className="font-semibold text-slate-900">{selectedTxn.paymentMethod}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Receipt</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTxn(null)}
                className="flex-1 py-3 rounded-2xl bg-[#F06C28] hover:bg-[#E05D16] text-white font-semibold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
