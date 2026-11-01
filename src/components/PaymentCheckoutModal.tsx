import React, { useState } from 'react';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  X,
  Smartphone,
  Building,
  QrCode,
  Download,
} from 'lucide-react';
import { FeeInvoice } from '../types/hostel';
import { useHostel } from '../context/HostelContext';

interface PaymentCheckoutModalProps {
  invoice: FeeInvoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  invoice,
  isOpen,
  onClose,
}) => {
  const { payInvoice } = useHostel();
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [upiId, setUpiId] = useState<string>('aarav@okaxis');
  const [processing, setProcessing] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [completedTxRef, setCompletedTxRef] = useState<string>('');

  if (!isOpen || !invoice) return null;

  const handlePayNow = () => {
    setProcessing(true);
    setTimeout(() => {
      const txRef = `RZP_${Math.floor(10000000 + Math.random() * 90000000)}`;
      const methodName =
        selectedMethod === 'UPI'
          ? `Instant UPI (${upiId})`
          : selectedMethod === 'CARD'
          ? 'Debit / Credit Card (Mastercard •••• 4492)'
          : 'HDFC NetBanking Direct';

      payInvoice(invoice.id, methodName);
      setCompletedTxRef(txRef);
      setProcessing(false);
      setPaymentSuccess(true);
    }, 1500);
  };

  const handleResetAndClose = () => {
    setPaymentSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Top Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
              ₹
            </div>
            <div>
              <h3 className="font-semibold text-sm leading-tight">Poshtell Secure Pay</h3>
              <p className="text-[11px] text-slate-400">Powered by Razorpay & CCAvenue Gateway</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {paymentSuccess ? (
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Payment Successfully Completed!</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Hostel accommodation and mess fees have been settled for the semester.
            </p>

            {/* Receipt Summary */}
            <div className="w-full mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice Ref:</span>
                <span className="font-mono font-medium text-slate-900">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono text-blue-700">{completedTxRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Settled:</span>
                <span className="font-bold text-slate-900 font-mono text-sm">
                  ₹{invoice.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Timestamp:</span>
                <span className="text-slate-700">Just Now (Instant Bank Acknowledgment)</span>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => window.print()}
                className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Receipt PDF</span>
              </button>
              <button
                onClick={handleResetAndClose}
                className="py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs flex items-center justify-center transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {/* Invoice Brief */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between mb-5">
              <div>
                <span className="text-[11px] font-medium text-blue-800">HOSTEL INVOICE</span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">{invoice.title}</h4>
                <p className="text-xs text-slate-500">{invoice.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500">Amount Due</span>
                <p className="text-lg font-bold text-slate-900 font-mono">
                  ₹{invoice.totalAmount.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Payment Method Selector */}
            <label className="block text-xs font-semibold text-slate-700 mb-2">Select Payment Method</label>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setSelectedMethod('UPI')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedMethod === 'UPI'
                    ? 'border-blue-600 bg-blue-50/40 text-blue-900 ring-2 ring-blue-600/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <Smartphone className="w-4 h-4 mb-1.5 text-blue-700" />
                <div className="text-xs font-semibold">UPI Apps</div>
                <div className="text-[10px] text-slate-500">GPay, PhonePe, Paytm</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('CARD')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedMethod === 'CARD'
                    ? 'border-blue-600 bg-blue-50/40 text-blue-900 ring-2 ring-blue-600/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <CreditCard className="w-4 h-4 mb-1.5 text-blue-700" />
                <div className="text-xs font-semibold">Cards</div>
                <div className="text-[10px] text-slate-500">Debit / Credit</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('NETBANKING')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedMethod === 'NETBANKING'
                    ? 'border-blue-600 bg-blue-50/40 text-blue-900 ring-2 ring-blue-600/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <Building className="w-4 h-4 mb-1.5 text-blue-700" />
                <div className="text-xs font-semibold">NetBanking</div>
                <div className="text-[10px] text-slate-500">HDFC, SBI, ICICI</div>
              </button>
            </div>

            {/* Method Details */}
            {selectedMethod === 'UPI' && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 mb-5">
                <label className="block text-[11px] font-medium text-slate-600">Enter UPI VPA ID</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="student@okaxis"
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <span className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200 flex items-center">
                    Verified
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Or scan directly with any UPI App on arrival. Instant payment acknowledgment.
                </p>
              </div>
            )}

            {selectedMethod === 'CARD' && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 mb-5">
                <input
                  type="text"
                  defaultValue="4532 •••• •••• 4492"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  readOnly
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    defaultValue="08/29"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                    readOnly
                  />
                  <input
                    type="password"
                    defaultValue="•••"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                    readOnly
                  />
                </div>
              </div>
            )}

            {selectedMethod === 'NETBANKING' && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 mb-5">
                <select className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white">
                  <option>State Bank of India (SBI Retail)</option>
                  <option>HDFC Bank NetBanking</option>
                  <option>ICICI Bank Retail</option>
                  <option>Axis Bank Internet Banking</option>
                </select>
              </div>
            )}

            {/* Fee Breakdown List */}
            <div className="border-t border-slate-100 pt-3 mb-5">
              <span className="text-[11px] font-semibold text-slate-700 block mb-2">Itemized Fee Summary</span>
              <div className="space-y-1.5 text-xs">
                {invoice.breakdown.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-slate-600">
                    <span>{item.name}</span>
                    <span className="font-mono text-slate-900">₹{item.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-Bit SSL Encrypted</span>
              </div>
              <button
                type="button"
                onClick={handlePayNow}
                disabled={processing}
                className="py-3 px-6 rounded-xl bg-blue-700 hover:bg-blue-800 active:scale-[0.98] disabled:opacity-50 text-white font-medium text-xs flex items-center gap-2 shadow-md shadow-blue-700/20 transition-all"
              >
                {processing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing with Gateway...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Pay ₹{invoice.totalAmount.toLocaleString('en-IN')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
