import React, { useState } from 'react';
import { useHostel } from './context/HostelContext';
import { ResidentDashboard } from './components/ResidentDashboard';
import { GatePassManager } from './components/GatePassManager';
import { MessMenuPlanner } from './components/MessMenuPlanner';
import { ComplaintsDesk } from './components/ComplaintsDesk';
import { FeesKycNoc } from './components/FeesKycNoc';
import { ResidentProfileView } from './components/ResidentProfileView';
import { WelcomeSetup } from './components/WelcomeSetup';
import { QrPassModal } from './components/QrPassModal';
import { SosModal } from './components/SosModal';
import { PaymentCheckoutModal } from './components/PaymentCheckoutModal';
import { FeeInvoice } from './types/hostel';

type ActiveTab = 'HOME' | 'GATE_PASS' | 'MESS' | 'COMPLAINTS' | 'FEES_NOC' | 'PROFILE';

// Solid native app icons matching the bottom tab bar in the screenshot
const HomeTabIcon: React.FC<{ active: boolean }> = ({ active }) => (
  <svg
    viewBox="0 0 24 24"
    className={`w-[25px] h-[25px] ${active ? 'text-[#EA6C2F]' : 'text-[#94A3B8]'}`}
    fill="currentColor"
  >
    <path d="M4 3.5C4 2.67 4.67 2 5.5 2H13.5C14.33 2 15 2.67 15 3.5V21H4V3.5ZM6.5 5.5V7.5H8.5V5.5H6.5ZM10.5 5.5V7.5H12.5V5.5H10.5ZM6.5 9.5V11.5H8.5V9.5H6.5ZM10.5 9.5V11.5H12.5V9.5H10.5ZM6.5 13.5V15.5H8.5V13.5H6.5ZM10.5 13.5V15.5H12.5V13.5H10.5ZM16.5 10H19.5C20.33 10 21 10.67 21 11.5V21H16.5V10ZM17.8 12.5V14.5H19.5V12.5H17.8ZM17.8 16V18H19.5V16H17.8Z" />
  </svg>
);

const BookTabIcon: React.FC<{ active: boolean }> = ({ active }) => (
  <svg
    viewBox="0 0 24 24"
    className={`w-[26px] h-[25px] ${active ? 'text-[#EA6C2F]' : 'text-[#94A3B8]'}`}
    fill="currentColor"
  >
    <path d="M3 6.5C3 5.95 3.45 5.5 4 5.5C4.55 5.5 5 5.95 5 6.5V13.5H21V11.5C21 9.84 19.66 8.5 18 8.5H11.5V12.5H5V6.5ZM7.5 10.5C6.4 10.5 5.5 9.6 5.5 8.5C5.5 7.4 6.4 6.5 7.5 6.5C8.6 6.5 9.5 7.4 9.5 8.5C9.5 9.6 8.6 10.5 7.5 10.5ZM3 15H21V18.5C21 19.05 20.55 19.5 20 19.5C19.45 19.5 19 19.05 19 18.5V17H5V18.5C5 19.05 4.55 19.5 4 19.5C3.45 19.5 3 19.05 3 18.5V15Z" />
  </svg>
);

const PaymentsTabIcon: React.FC<{ active: boolean }> = ({ active }) => (
  <svg
    viewBox="0 0 24 24"
    className={`w-[25px] h-[25px] ${active ? 'text-[#EA6C2F]' : 'text-[#94A3B8]'}`}
    fill="currentColor"
  >
    <path d="M4 5C2.9 5 2 5.9 2 7V8.5H22V7C22 5.9 21.1 5 20 5H4ZM22 10.5H2V17C2 18.1 2.9 19 4 19H20C21.1 19 22 18.1 22 17V10.5ZM5.5 14.5H10.5C11.05 14.5 11.5 14.95 11.5 15.5C11.5 16.05 11.05 16.5 10.5 16.5H5.5C4.95 16.5 4.5 16.05 4.5 15.5C4.5 14.95 4.95 14.5 5.5 14.5Z" />
  </svg>
);

const ProfileTabIcon: React.FC<{ active: boolean }> = ({ active }) => (
  <svg
    viewBox="0 0 24 24"
    className={`w-[25px] h-[25px] ${active ? 'text-[#EA6C2F]' : 'text-[#94A3B8]'}`}
    fill="currentColor"
  >
    <path d="M12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4ZM12 14C7.58 14 4 16.24 4 19V20H20V19C20 16.24 16.42 14 12 14Z" />
  </svg>
);

export default function App() {
  const { isOnboarded } = useHostel();
  const [activeTab, setActiveTab] = useState<ActiveTab>('HOME');
  const [requestsSubTab, setRequestsSubTab] = useState<'GATE_PASS' | 'COMPLAINTS' | 'VISITORS'>('GATE_PASS');
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState<boolean>(false);
  const [selectedPassQr, setSelectedPassQr] = useState<string | undefined>(undefined);
  const [activeInvoiceToPay, setActiveInvoiceToPay] = useState<FeeInvoice | null>(null);

  if (!isOnboarded) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex justify-center">
        <div className="w-full max-w-[430px] min-h-screen bg-white shadow-[0_0_50px_rgba(15,23,42,0.08)]">
          <WelcomeSetup />
        </div>
      </div>
    );
  }

  const handleOpenQr = (passNumber?: string) => {
    setSelectedPassQr(passNumber);
    setIsQrModalOpen(true);
  };

  const handlePayInvoice = (inv: FeeInvoice) => {
    setActiveInvoiceToPay(inv);
  };

  const handleNavigateTab = (tab: ActiveTab) => {
    if (tab === 'COMPLAINTS') {
      setRequestsSubTab('COMPLAINTS');
      setActiveTab('GATE_PASS');
    } else if (tab === 'GATE_PASS') {
      setRequestsSubTab('GATE_PASS');
      setActiveTab('GATE_PASS');
    } else {
      setActiveTab(tab);
    }
  };

  // Bottom 4 tabs matching Screenshot: Home | Book | Payments | Profile
  const mobileBottomTabs = [
    {
      id: 'HOME' as const,
      label: 'Home',
      renderIcon: (isActive: boolean) => <HomeTabIcon active={isActive} />,
    },
    {
      id: 'GATE_PASS' as const,
      label: 'Book',
      renderIcon: (isActive: boolean) => <BookTabIcon active={isActive} />,
    },
    {
      id: 'FEES_NOC' as const,
      label: 'Payments',
      renderIcon: (isActive: boolean) => <PaymentsTabIcon active={isActive} />,
    },
    {
      id: 'PROFILE' as const,
      label: 'Profile',
      renderIcon: (isActive: boolean) => <ProfileTabIcon active={isActive} />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 flex justify-center antialiased select-none">
      {/* Native Mobile App Shell (430px Smartphone Viewport Scale) */}
      <div className="w-full max-w-[430px] min-h-screen bg-[#FFFFFF] flex flex-col relative shadow-[0_0_50px_rgba(15,23,42,0.08)] overflow-x-hidden">
        {/* =====================================================================
            MAIN APP CONTENT VIEWPORT
            ===================================================================== */}
        <main className="flex-1 w-full px-4 pt-0 pb-24">
          {activeTab === 'HOME' && (
            <ResidentDashboard
              onOpenQr={() => handleOpenQr()}
              onNavigateTab={handleNavigateTab}
              onPayInvoice={handlePayInvoice}
              onTriggerSos={() => setIsSosModalOpen(true)}
            />
          )}

          {(activeTab === 'GATE_PASS' || activeTab === 'COMPLAINTS') && (
            <div className="pt-3">
              <GatePassManager
                onOpenQr={(passNum) => handleOpenQr(passNum)}
                initialCategoryTab={activeTab === 'COMPLAINTS' ? 'COMPLAINTS' : requestsSubTab}
              />
            </div>
          )}

          {activeTab === 'MESS' && (
            <MessMenuPlanner onBack={() => setActiveTab('HOME')} />
          )}

          {activeTab === 'FEES_NOC' && (
            <div className="pt-3">
              <FeesKycNoc onPayInvoice={handlePayInvoice} />
            </div>
          )}

          {activeTab === 'PROFILE' && (
            <div className="pt-3">
              <ResidentProfileView
                onOpenQr={() => handleOpenQr()}
                onNavigateTab={handleNavigateTab}
              />
            </div>
          )}
        </main>

        {/* =====================================================================
            PERSISTENT NATIVE APP BOTTOM TAB BAR
            Matches Screenshot: Home | Book | Payments | Profile + Home Indicator
            ===================================================================== */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-white border-t border-[#E2E8F0]/90 shadow-[0_-2px_12px_rgba(0,0,0,0.03)] pt-1.5 pb-1.5">
          <div className="grid grid-cols-4 items-center h-[52px]">
            {mobileBottomTabs.map((item) => {
              const isActive =
                activeTab === item.id ||
                (item.id === 'HOME' && activeTab === 'MESS') ||
                (item.id === 'GATE_PASS' && activeTab === 'COMPLAINTS');
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigateTab(item.id)}
                  className={`min-h-[44px] flex flex-col items-center justify-center transition-colors focus:outline-none ${
                    isActive ? 'text-[#EA6C2F]' : 'text-[#94A3B8] hover:text-slate-600'
                  }`}
                >
                  {item.renderIcon(isActive)}
                  <span
                    className={`text-[11.5px] tracking-tight mt-0.5 ${
                      isActive ? 'font-medium text-[#EA6C2F]' : 'font-normal text-[#94A3B8]'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Native System Gesture Home Indicator Pill */}
          <div className="w-[128px] h-[4px] rounded-full bg-[#94A3B8]/55 mx-auto mt-1 mb-0.5" />
        </nav>

        {/* =====================================================================
            MODALS & DRAWERS
            ===================================================================== */}
        <QrPassModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          specificPassNumber={selectedPassQr}
        />

        <SosModal
          isOpen={isSosModalOpen}
          onClose={() => setIsSosModalOpen(false)}
        />

        <PaymentCheckoutModal
          isOpen={!!activeInvoiceToPay}
          invoice={activeInvoiceToPay}
          onClose={() => setActiveInvoiceToPay(null)}
        />
      </div>
    </div>
  );
}
