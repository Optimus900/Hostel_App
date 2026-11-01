import React, { useState, useEffect } from 'react';
import { AlertTriangle, PhoneCall, X, ShieldAlert, CheckCircle } from 'lucide-react';
import { useHostel } from '../context/HostelContext';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SosModal: React.FC<SosModalProps> = ({ isOpen, onClose }) => {
  const { profile, triggerSos, cancelSos, sosTriggered, sosAlertDetails } = useHostel();
  const [countdown, setCountdown] = useState<number>(3);
  const [isCounting, setIsCounting] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(3);
      setIsCounting(true);
      return;
    }

    if (sosTriggered) {
      setIsCounting(false);
      return;
    }

    setCountdown(3);
    setIsCounting(true);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsCounting(false);
          triggerSos();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, sosTriggered, triggerSos]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-red-500 overflow-hidden">
        {/* Red Alert Header */}
        <div className="bg-red-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-red-100 animate-pulse" />
            <div>
              <h3 className="font-bold text-lg leading-tight">Emergency SOS Dispatch</h3>
              <p className="text-xs text-red-100">Memedeo Poshtell 24/7 Rapid Response</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (sosTriggered) cancelSos();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          {isCounting && (
            <div className="py-4 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-red-100 border-4 border-red-500 flex items-center justify-center text-3xl font-extrabold text-red-600 mb-4 animate-bounce">
                {countdown}
              </div>
              <h4 className="text-lg font-bold text-slate-900">Broadcasting Emergency Alert...</h4>
              <p className="text-xs text-slate-600 mt-1 max-w-xs">
                Sending your exact room coordinates to Warden Office, Campus Gate Security, and Medical Desk.
              </p>
              <button
                onClick={() => {
                  setIsCounting(false);
                  onClose();
                }}
                className="mt-6 py-2.5 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
              >
                Cancel Immediate Dispatch
              </button>
            </div>
          )}

          {!isCounting && (
            <div className="py-2 flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mb-3">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold mb-2">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                ACTIVE RESIDENT DISTRESS ALERT
              </div>
              <h4 className="text-lg font-bold text-slate-900">Alert Dispatched to Campus Authorities</h4>

              <div className="w-full mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student:</span>
                  <span className="font-semibold text-slate-900">{profile.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hostel Location:</span>
                  <span className="font-semibold text-slate-900">
                    {profile.roomNumber} ({profile.hostelBuilding})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dispatched At:</span>
                  <span className="font-mono text-slate-700">{sosAlertDetails?.time || 'Just now'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Emergency Contact:</span>
                  <span className="font-semibold text-slate-900">
                    {profile.emergencyContactName} ({profile.emergencyContactPhone})
                  </span>
                </div>
              </div>

              {/* Direct Call Quick Buttons */}
              <div className="w-full grid grid-cols-2 gap-3 mt-4">
                <a
                  href={`tel:${profile.wardenPhone}`}
                  className="py-2.5 px-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs flex items-center justify-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Warden</span>
                </a>
                <a
                  href="tel:112"
                  className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-xs flex items-center justify-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call 112 Help</span>
                </a>
              </div>

              <button
                onClick={() => {
                  cancelSos();
                  onClose();
                }}
                className="w-full mt-3 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors"
              >
                Resolve & Clear SOS Alert
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
