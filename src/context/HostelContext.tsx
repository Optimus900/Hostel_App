import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ResidentProfile,
  GatePass,
  GatePassStatus,
  ComplaintTicket,
  DayMessMenu,
  FeeInvoice,
  KycDocument,
  AdmissionMilestone,
  NocApplication,
  HostelNotice,
  GateLogEntry,
  CheckInStatus,
} from '../types/hostel';
import {
  INITIAL_RESIDENT_PROFILE,
  INITIAL_GATE_PASSES,
  INITIAL_COMPLAINTS,
  INITIAL_MESS_MENU,
  INITIAL_INVOICES,
  INITIAL_KYC_DOCUMENTS,
  INITIAL_ADMISSION_MILESTONES,
  INITIAL_NOC_APPLICATION,
  INITIAL_NOTICES,
  INITIAL_GATE_LOGS,
} from '../data/mockData';

export interface SetupProfileInput {
  fullName: string;
  usn: string;
  courseAndYear: string;
  phone: string;
  email: string;
  tower: string;
  roomNumber: string;
  bedNumber: string;
  avatarUrl?: string;
  gender?: string;
  bloodGroup?: string;
  dateOfBirth?: string;
  parentName?: string;
  parentMobile?: string;
  parentEmail?: string;
  localGuardian?: string;
  emergencyContactName?: string;
  permanentAddress?: string;
  agreementPeriod?: string;
  moveInDate?: string;
  moveOutDate?: string;
}

interface HostelContextType {
  profile: ResidentProfile;
  isOnboarded: boolean;
  gatePasses: GatePass[];
  complaints: ComplaintTicket[];
  messMenu: DayMessMenu[];
  invoices: FeeInvoice[];
  kycDocuments: KycDocument[];
  admissionMilestones: AdmissionMilestone[];
  nocApplication: NocApplication;
  notices: HostelNotice[];
  gateLogs: GateLogEntry[];
  sosTriggered: boolean;
  sosAlertDetails: { time: string; location: string } | null;
  // Actions
  completeOnboardingSetup: (data: SetupProfileInput) => void;
  updateProfileDetails: (data: SetupProfileInput) => void;
  reopenOnboardingSetup: () => void;
  toggleCheckInStatus: () => void;
  createGatePass: (
    data: Omit<GatePass, 'id' | 'passNumber' | 'status' | 'appliedAt' | 'qrToken'> & {
      status?: GatePassStatus;
    }
  ) => GatePass;
  updateGatePassStatus: (passId: string, status: GatePassStatus) => void;
  deleteGatePass: (passId: string) => void;
  simulateWardenApproval: (passId: string) => void;
  simulatePassCheckOut: (passId: string) => void;
  simulatePassReturn: (passId: string) => void;
  createComplaint: (data: Omit<ComplaintTicket, 'id' | 'ticketNumber' | 'status' | 'createdAt'>) => ComplaintTicket;
  deleteComplaint: (ticketId: string) => void;
  simulateResolveComplaint: (ticketId: string, notes?: string) => void;
  rateComplaint: (ticketId: string, rating: number, comment?: string) => void;
  toggleMealOptOut: (dayIndex: number, mealType: 'breakfast' | 'lunch' | 'snacks' | 'dinner') => void;
  rateDailyMeal: (dayIndex: number, rating: number) => void;
  payInvoice: (invoiceId: string, paymentMethod: string) => void;
  triggerSos: () => void;
  cancelSos: () => void;
  submitNocRequest: (departureDate: string, timeSlot: string, reason: string, destination: string) => void;
  simulateNocDepartmentClearance: (depId: string) => void;
  resetAllData: () => void;
}

const STORAGE_KEYS = {
  ONBOARDED: 'poshtell_onboarded_v3',
  PROFILE: 'poshtell_profile_v4',
  PASSES: 'poshtell_passes_v3',
  COMPLAINTS: 'poshtell_complaints_v3',
  MESS: 'poshtell_mess_v2',
  INVOICES: 'poshtell_invoices_v1',
  NOC: 'poshtell_noc_v1',
  LOGS: 'poshtell_logs_v1',
  KYC: 'poshtell_kyc_v1',
};

const SAMPLE_MOCK_PASS_IDS = new Set(['gp-101', 'gp-102', 'gp-103']);
const SAMPLE_MOCK_COMPLAINT_IDS = new Set(['cmp-201', 'cmp-202', 'cmp-203']);
const SAMPLE_MOCK_TICKET_NUMBERS = new Set([
  '#REQ-62A025',
  'CMP-2025-881',
  'CMP-2025-714',
  'CMP-2025-602',
]);

const safeSetLocalStorage = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

const normalizeRealComplaints = (items: ComplaintTicket[]): ComplaintTicket[] => {
  return items.filter(
    (c) =>
      c &&
      c.id &&
      !SAMPLE_MOCK_COMPLAINT_IDS.has(c.id) &&
      !SAMPLE_MOCK_TICKET_NUMBERS.has(c.ticketNumber)
  );
};

const loadSavedComplaints = (): ComplaintTicket[] => {
  try {
    const savedV3 = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
    if (savedV3) {
      const parsed = JSON.parse(savedV3);
      if (Array.isArray(parsed)) {
        const cleaned = normalizeRealComplaints(parsed);
        safeSetLocalStorage(STORAGE_KEYS.COMPLAINTS, JSON.stringify(cleaned));
        return cleaned;
      }
    }
    for (const legacyKey of ['poshtell_complaints_v2', 'poshtell_complaints_v1']) {
      const legacyRaw = localStorage.getItem(legacyKey);
      if (legacyRaw) {
        const parsed = JSON.parse(legacyRaw);
        if (Array.isArray(parsed)) {
          const realOnly = normalizeRealComplaints(parsed);
          safeSetLocalStorage(STORAGE_KEYS.COMPLAINTS, JSON.stringify(realOnly));
          return realOnly;
        }
      }
    }
  } catch {
    // ignore storage errors
  }
  return INITIAL_COMPLAINTS;
};

const normalizeRealGatePasses = (passes: GatePass[]): GatePass[] => {
  const now = Date.now();
  return passes
    .filter((p) => p && p.id && !SAMPLE_MOCK_PASS_IDS.has(p.id))
    .map((pass) => {
      const returnTs = new Date(pass.expectedReturnTime).getTime();
      if (
        !isNaN(returnTs) &&
        returnTs < now &&
        pass.status !== 'Rejected' &&
        pass.status !== 'Expired' &&
        pass.status !== 'Returned'
      ) {
        return { ...pass, status: 'Expired' as GatePassStatus };
      }
      return pass;
    });
};

const loadSavedGatePasses = (): GatePass[] => {
  try {
    const savedV3 = localStorage.getItem(STORAGE_KEYS.PASSES);
    if (savedV3) {
      const parsed = JSON.parse(savedV3);
      if (Array.isArray(parsed)) {
        const normalized = normalizeRealGatePasses(parsed);
        safeSetLocalStorage(STORAGE_KEYS.PASSES, JSON.stringify(normalized));
        return normalized;
      }
    }
    // Migrate any real user-created passes from earlier keys while stripping sample mock passes
    for (const legacyKey of ['poshtell_passes_v2', 'poshtell_passes_v1']) {
      const legacyRaw = localStorage.getItem(legacyKey);
      if (legacyRaw) {
        const parsed = JSON.parse(legacyRaw);
        if (Array.isArray(parsed)) {
          const realOnly = normalizeRealGatePasses(parsed);
          safeSetLocalStorage(STORAGE_KEYS.PASSES, JSON.stringify(realOnly));
          return realOnly;
        }
      }
    }
  } catch {
    // ignore storage errors
  }
  return INITIAL_GATE_PASSES;
};

const saveProfileSafely = (prof: ResidentProfile) => {
  const savedOk = safeSetLocalStorage(STORAGE_KEYS.PROFILE, JSON.stringify(prof));
  if (!savedOk && prof.avatarUrl) {
    // Fallback if an uncompressed photo exceeded browser storage quota: still persist all profile fields
    const { avatarUrl: _omit, ...rest } = prof;
    safeSetLocalStorage(STORAGE_KEYS.PROFILE, JSON.stringify(rest));
  }
};

const loadSavedProfile = (): ResidentProfile => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...INITIAL_RESIDENT_PROFILE,
        ...parsed,
        agreementPeriod: 'Jul 26, 27',
        moveOutDate: 'Jul 26, 27',
      };
    }
  } catch {
    // ignore parse errors
  }
  return INITIAL_RESIDENT_PROFILE;
};

const HostelContext = createContext<HostelContextType | undefined>(undefined);

export const HostelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<ResidentProfile>(() => loadSavedProfile());

  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    try {
      if (localStorage.getItem(STORAGE_KEYS.ONBOARDED) === 'true') {
        return true;
      }
      const initialProf = loadSavedProfile();
      if (initialProf.fullName.trim() !== '' && initialProf.usn.trim() !== '') {
        safeSetLocalStorage(STORAGE_KEYS.ONBOARDED, 'true');
        return true;
      }
    } catch {
      // ignore storage errors
    }
    return false;
  });

  const [gatePasses, setGatePasses] = useState<GatePass[]>(() => loadSavedGatePasses());

  const [complaints, setComplaints] = useState<ComplaintTicket[]>(() => loadSavedComplaints());

  const [messMenu, setMessMenu] = useState<DayMessMenu[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MESS);
      return saved ? JSON.parse(saved) : INITIAL_MESS_MENU;
    } catch {
      return INITIAL_MESS_MENU;
    }
  });

  const [invoices, setInvoices] = useState<FeeInvoice[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
      return saved ? JSON.parse(saved) : INITIAL_INVOICES;
    } catch {
      return INITIAL_INVOICES;
    }
  });

  const [kycDocuments, setKycDocuments] = useState<KycDocument[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.KYC);
      return saved ? JSON.parse(saved) : INITIAL_KYC_DOCUMENTS;
    } catch {
      return INITIAL_KYC_DOCUMENTS;
    }
  });

  const [admissionMilestones] = useState<AdmissionMilestone[]>(INITIAL_ADMISSION_MILESTONES);

  const [nocApplication, setNocApplication] = useState<NocApplication>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOC);
      return saved ? JSON.parse(saved) : INITIAL_NOC_APPLICATION;
    } catch {
      return INITIAL_NOC_APPLICATION;
    }
  });

  const [notices] = useState<HostelNotice[]>(INITIAL_NOTICES);

  const [gateLogs, setGateLogs] = useState<GateLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
      return saved ? JSON.parse(saved) : INITIAL_GATE_LOGS;
    } catch {
      return INITIAL_GATE_LOGS;
    }
  });

  const [sosTriggered, setSosTriggered] = useState<boolean>(false);
  const [sosAlertDetails, setSosAlertDetails] = useState<{ time: string; location: string } | null>(null);

  // Sync to local storage safely
  useEffect(() => {
    safeSetLocalStorage(STORAGE_KEYS.ONBOARDED, isOnboarded ? 'true' : 'false');
  }, [isOnboarded]);

  useEffect(() => {
    saveProfileSafely(profile);
  }, [profile]);

  useEffect(() => {
    safeSetLocalStorage(STORAGE_KEYS.PASSES, JSON.stringify(gatePasses));
  }, [gatePasses]);

  // Automatically expire gate passes once their Return Date & Time is over
  useEffect(() => {
    const checkExpiredPasses = () => {
      const now = Date.now();
      setGatePasses((prev) => {
        let changed = false;
        const updated = prev.map((pass) => {
          const returnTs = new Date(pass.expectedReturnTime).getTime();
          if (
            !isNaN(returnTs) &&
            returnTs <= now &&
            pass.status !== 'Expired' &&
            pass.status !== 'Rejected'
          ) {
            changed = true;
            return {
              ...pass,
              status: 'Expired' as GatePassStatus,
              actualReturnTime: pass.actualReturnTime || pass.expectedReturnTime,
            };
          }
          return pass;
        });
        if (changed) {
          safeSetLocalStorage(STORAGE_KEYS.PASSES, JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
    };

    checkExpiredPasses();
    const interval = setInterval(checkExpiredPasses, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    safeSetLocalStorage(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    safeSetLocalStorage(STORAGE_KEYS.MESS, JSON.stringify(messMenu));
  }, [messMenu]);

  useEffect(() => {
    safeSetLocalStorage(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    safeSetLocalStorage(STORAGE_KEYS.NOC, JSON.stringify(nocApplication));
  }, [nocApplication]);

  useEffect(() => {
    safeSetLocalStorage(STORAGE_KEYS.LOGS, JSON.stringify(gateLogs));
  }, [gateLogs]);

  useEffect(() => {
    safeSetLocalStorage(STORAGE_KEYS.KYC, JSON.stringify(kycDocuments));
  }, [kycDocuments]);

  const completeOnboardingSetup = (data: SetupProfileInput) => {
    const cleanUsn = data.usn.trim().toUpperCase();
    const rawTower = data.tower.trim();
    const formattedTower = rawTower.toLowerCase().startsWith('tower') ? rawTower : `Tower - ${rawTower}`;
    const rawRoom = data.roomNumber.trim();
    const formattedRoom = rawRoom.toLowerCase().startsWith('room') ? rawRoom : `Room ${rawRoom}`;
    const rawBed = data.bedNumber.trim().toUpperCase();
    const formattedBed = rawBed.toLowerCase().startsWith('bed') ? `Bed ${rawBed.replace(/^bed\s*/i, '')}` : `Bed ${rawBed}`;

    setProfile((prev) => {
      const updatedProfile: ResidentProfile = {
        ...prev,
        fullName: data.fullName.trim(),
        usn: cleanUsn,
        courseAndYear: data.courseAndYear.trim(),
        phone: data.phone.trim(),
        email: data.email.trim(),
        hostelBuilding: formattedTower,
        roomNumber: formattedRoom,
        bedNumber: formattedBed,
        ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
        ...(data.gender !== undefined ? { gender: data.gender } : {}),
        ...(data.bloodGroup !== undefined ? { bloodGroup: data.bloodGroup } : {}),
        ...(data.dateOfBirth !== undefined ? { dateOfBirth: data.dateOfBirth } : {}),
        ...(data.parentName !== undefined ? { parentName: data.parentName } : {}),
        ...(data.parentMobile !== undefined ? { parentMobile: data.parentMobile } : {}),
        ...(data.parentEmail !== undefined ? { parentEmail: data.parentEmail } : {}),
        ...(data.localGuardian !== undefined ? { localGuardian: data.localGuardian } : {}),
        ...(data.emergencyContactName !== undefined ? { emergencyContactName: data.emergencyContactName } : {}),
        ...(data.permanentAddress !== undefined ? { permanentAddress: data.permanentAddress } : {}),
        agreementPeriod: 'Jul 26, 27',
        ...(data.moveInDate !== undefined ? { moveInDate: data.moveInDate } : {}),
        moveOutDate: 'Jul 26, 27',
      };
      // Save immediately to device localStorage so it never asks for welcome/login again
      saveProfileSafely(updatedProfile);
      safeSetLocalStorage(STORAGE_KEYS.ONBOARDED, 'true');
      return updatedProfile;
    });

    // Also sync University Student ID Card KYC document number with USN
    setKycDocuments((prev) =>
      prev.map((doc) =>
        doc.id === 'kyc-2'
          ? { ...doc, documentNumberMasked: cleanUsn }
          : doc
      )
    );

    safeSetLocalStorage(STORAGE_KEYS.ONBOARDED, 'true');
    setIsOnboarded(true);
  };

  const updateProfileDetails = (data: SetupProfileInput) => {
    const cleanUsn = data.usn.trim().toUpperCase();
    const rawTower = data.tower.trim();
    const formattedTower = rawTower.toLowerCase().startsWith('tower') ? rawTower : `Tower - ${rawTower}`;
    const rawRoom = data.roomNumber.trim();
    const formattedRoom = rawRoom.toLowerCase().startsWith('room') ? rawRoom : `Room ${rawRoom}`;
    const rawBed = data.bedNumber.trim().toUpperCase();
    const formattedBed = rawBed.toLowerCase().startsWith('bed') ? `Bed ${rawBed.replace(/^bed\s*/i, '')}` : `Bed ${rawBed}`;

    setProfile((prev) => {
      const updatedProfile: ResidentProfile = {
        ...prev,
        fullName: data.fullName.trim(),
        usn: cleanUsn,
        courseAndYear: data.courseAndYear.trim(),
        phone: data.phone.trim(),
        email: data.email.trim(),
        hostelBuilding: formattedTower,
        roomNumber: formattedRoom,
        bedNumber: formattedBed,
        ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
        ...(data.gender !== undefined ? { gender: data.gender } : {}),
        ...(data.bloodGroup !== undefined ? { bloodGroup: data.bloodGroup } : {}),
        ...(data.dateOfBirth !== undefined ? { dateOfBirth: data.dateOfBirth } : {}),
        ...(data.parentName !== undefined ? { parentName: data.parentName } : {}),
        ...(data.parentMobile !== undefined ? { parentMobile: data.parentMobile } : {}),
        ...(data.parentEmail !== undefined ? { parentEmail: data.parentEmail } : {}),
        ...(data.localGuardian !== undefined ? { localGuardian: data.localGuardian } : {}),
        ...(data.emergencyContactName !== undefined ? { emergencyContactName: data.emergencyContactName } : {}),
        ...(data.permanentAddress !== undefined ? { permanentAddress: data.permanentAddress } : {}),
        agreementPeriod: 'Jul 26, 27',
        ...(data.moveInDate !== undefined ? { moveInDate: data.moveInDate } : {}),
        moveOutDate: 'Jul 26, 27',
      };
      saveProfileSafely(updatedProfile);
      safeSetLocalStorage(STORAGE_KEYS.ONBOARDED, 'true');
      return updatedProfile;
    });

    setKycDocuments((prev) =>
      prev.map((doc) =>
        doc.id === 'kyc-2'
          ? { ...doc, documentNumberMasked: cleanUsn }
          : doc
      )
    );
  };

  const reopenOnboardingSetup = () => {
    safeSetLocalStorage(STORAGE_KEYS.ONBOARDED, 'false');
    setIsOnboarded(false);
  };

  const toggleCheckInStatus = () => {
    const nextStatus: CheckInStatus = profile.checkInStatus === 'IN_HOSTEL' ? 'OUT_ON_PASS' : 'IN_HOSTEL';
    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const logType = nextStatus === 'IN_HOSTEL' ? 'CHECK_IN' : 'CHECK_OUT';

    const newLog: GateLogEntry = {
      id: `gl-${Date.now()}`,
      timestamp: `Today, ${nowTime}`,
      type: logType,
      gateName: 'Main Campus North Gate',
      verifier: 'Instant Smart QR Reader',
      passReference: nextStatus === 'IN_HOSTEL' ? 'Resident Hostel QR Check-In' : 'Resident Gate Pass Check-Out',
    };

    setGateLogs((prev) => [newLog, ...prev]);

    setProfile((prev) => ({
      ...prev,
      checkInStatus: nextStatus,
      lastGateActivity: {
        type: logType,
        timestamp: `Today, ${nowTime}`,
        gateName: 'Main Campus North Gate',
      },
    }));
  };

  const createGatePass = (
    data: Omit<GatePass, 'id' | 'passNumber' | 'status' | 'appliedAt' | 'qrToken'> & {
      status?: GatePassStatus;
    }
  ): GatePass => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const nowMs = Date.now();
    const returnTs = new Date(data.expectedReturnTime).getTime();
    const isPastReturn = !isNaN(returnTs) && returnTs <= nowMs;
    const initialStatus: GatePassStatus = isPastReturn
      ? 'Expired'
      : data.status || 'Approved';

    // Warden approval time between 1 and 10 minutes after request submitted
    const wardenApprovalDelayMinutes = Math.floor(Math.random() * 10) + 1;
    const appliedAtIso = new Date(nowMs).toISOString();
    const approvedAtIso = new Date(
      nowMs + wardenApprovalDelayMinutes * 60 * 1000
    ).toISOString();

    const newPass: GatePass = {
      ...data,
      id: `gp-${nowMs}`,
      passNumber: `GP-${randomNum}`,
      status: initialStatus,
      appliedAt: appliedAtIso,
      approvedAt: approvedAtIso,
      approvedBy: 'Hostel Warden',
      ...(isPastReturn ? { actualReturnTime: data.expectedReturnTime } : {}),
      qrToken: `POSH-QR-PASS-APPROVED-${randomNum}`,
    };
    setGatePasses((prev) => {
      const updated = [newPass, ...prev];
      safeSetLocalStorage(STORAGE_KEYS.PASSES, JSON.stringify(updated));
      return updated;
    });
    return newPass;
  };

  const updateGatePassStatus = (passId: string, status: GatePassStatus) => {
    setGatePasses((prev) => {
      const updated = prev.map((pass) => {
        if (pass.id !== passId) return pass;
        return {
          ...pass,
          status,
          ...(status === 'Approved'
            ? {
                approvedAt: new Date().toISOString(),
                approvedBy: pass.approvedBy || 'Hostel Warden',
                qrToken: `POSH-QR-PASS-APPROVED-${pass.passNumber}`,
              }
            : {}),
          ...(status === 'Expired' || status === 'Returned'
            ? {
                actualReturnTime: pass.actualReturnTime || pass.expectedReturnTime,
              }
            : {}),
        };
      });
      safeSetLocalStorage(STORAGE_KEYS.PASSES, JSON.stringify(updated));
      return updated;
    });
  };

  const deleteGatePass = (passId: string) => {
    setGatePasses((prev) => {
      const updated = prev.filter((pass) => pass.id !== passId);
      safeSetLocalStorage(STORAGE_KEYS.PASSES, JSON.stringify(updated));
      return updated;
    });
  };

  const simulateWardenApproval = (passId: string) => {
    updateGatePassStatus(passId, 'Approved');
  };

  const simulatePassCheckOut = (passId: string) => {
    setGatePasses((prev) => {
      const updated = prev.map((pass) =>
        pass.id === passId ? { ...pass, status: 'Checked Out' as GatePassStatus } : pass
      );
      safeSetLocalStorage(STORAGE_KEYS.PASSES, JSON.stringify(updated));
      return updated;
    });
    toggleCheckInStatus();
  };

  const simulatePassReturn = (passId: string) => {
    setGatePasses((prev) => {
      const updated = prev.map((pass) =>
        pass.id === passId
          ? {
              ...pass,
              status: 'Expired' as GatePassStatus,
              actualReturnTime: new Date().toISOString(),
            }
          : pass
      );
      safeSetLocalStorage(STORAGE_KEYS.PASSES, JSON.stringify(updated));
      return updated;
    });
    if (profile.checkInStatus === 'OUT_ON_PASS') {
      toggleCheckInStatus();
    }
  };

  const createComplaint = (data: Omit<ComplaintTicket, 'id' | 'ticketNumber' | 'status' | 'createdAt'>): ComplaintTicket => {
    const hexSuffix = Math.floor(0x100000 + Math.random() * 0xef0000)
      .toString(16)
      .toUpperCase()
      .slice(0, 6);
    const newTicket: ComplaintTicket = {
      ...data,
      id: `cmp-${Date.now()}`,
      ticketNumber: `#REQ-${hexSuffix}`,
      status: 'Open',
      createdAt: new Date().toISOString(),
      residentUsn: profile.usn,
      residentName: profile.fullName,
    };
    setComplaints((prev) => {
      const updated = [newTicket, ...prev];
      safeSetLocalStorage(STORAGE_KEYS.COMPLAINTS, JSON.stringify(updated));
      return updated;
    });
    return newTicket;
  };

  const deleteComplaint = (ticketId: string) => {
    setComplaints((prev) => {
      const updated = prev.filter((item) => item.id !== ticketId);
      safeSetLocalStorage(STORAGE_KEYS.COMPLAINTS, JSON.stringify(updated));
      return updated;
    });
  };

  const simulateResolveComplaint = (ticketId: string, notes = 'Issue verified and repaired by maintenance technician.') => {
    setComplaints((prev) =>
      prev.map((item) =>
        item.id === ticketId
          ? {
              ...item,
              status: 'Resolved',
              resolvedAt: new Date().toISOString(),
              resolutionNotes: notes,
              assignedTo: item.assignedTo || 'Maintenance Desk Supervisor',
            }
          : item
      )
    );
  };

  const rateComplaint = (ticketId: string, rating: number, comment?: string) => {
    setComplaints((prev) =>
      prev.map((item) => (item.id === ticketId ? { ...item, rating, ratingComment: comment } : item))
    );
  };

  const toggleMealOptOut = (dayIndex: number, mealType: 'breakfast' | 'lunch' | 'snacks' | 'dinner') => {
    setMessMenu((prev) => {
      const copy = [...prev];
      const targetDay = { ...copy[dayIndex] };
      const currentVal = targetDay.meals[mealType].optedOut;
      targetDay.meals = {
        ...targetDay.meals,
        [mealType]: {
          ...targetDay.meals[mealType],
          optedOut: !currentVal,
        },
      };
      copy[dayIndex] = targetDay;
      return copy;
    });
  };

  const rateDailyMeal = (dayIndex: number, rating: number) => {
    setMessMenu((prev) => {
      const copy = [...prev];
      copy[dayIndex] = {
        ...copy[dayIndex],
        residentRating: rating,
      };
      return copy;
    });
  };

  const payInvoice = (invoiceId: string, paymentMethod: string) => {
    const txId = `RZP_PAY_${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const nowTime = new Date().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              status: 'Paid',
              paidAt: nowTime,
              transactionRef: txId,
              paymentMethod,
            }
          : inv
      )
    );
  };

  const triggerSos = () => {
    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setSosTriggered(true);
    setSosAlertDetails({
      time: nowTime,
      location: `${profile.hostelBuilding}, ${profile.roomNumber} (${profile.floor})`,
    });
  };

  const cancelSos = () => {
    setSosTriggered(false);
    setSosAlertDetails(null);
  };

  const submitNocRequest = (departureDate: string, timeSlot: string, reason: string, destination: string) => {
    setNocApplication((prev) => ({
      ...prev,
      isSubmitted: true,
      requestedDepartureDate: departureDate,
      departureTimeSlot: timeSlot,
      reasonForMoveOut: reason,
      destinationCity: destination,
      overallStatus: 'In Progress',
      bankAccountMasked: 'HDFC Bank •••• 4192 (IFSC: HDFC000124)',
    }));
  };

  const simulateNocDepartmentClearance = (depId: string) => {
    setNocApplication((prev) => {
      const updatedDeps = prev.departments.map((d) =>
        d.id === depId
          ? {
              ...d,
              status: 'Cleared' as const,
              clearedAt: 'Just Now',
              clearanceNote: 'Inspected and certified clean by department lead.',
            }
          : d
      );
      const allCleared = updatedDeps.every((d) => d.status === 'Cleared');
      return {
        ...prev,
        departments: updatedDeps,
        overallStatus: allCleared ? 'Final NOC Issued' : 'In Progress',
        nocCertificateId: allCleared ? `NOC-2026-POSH-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
      };
    });
  };

  const resetAllData = () => {
    localStorage.clear();
    setProfile(INITIAL_RESIDENT_PROFILE);
    setGatePasses(INITIAL_GATE_PASSES);
    setComplaints(INITIAL_COMPLAINTS);
    setMessMenu(INITIAL_MESS_MENU);
    setInvoices(INITIAL_INVOICES);
    setKycDocuments(INITIAL_KYC_DOCUMENTS);
    setNocApplication(INITIAL_NOC_APPLICATION);
    setGateLogs(INITIAL_GATE_LOGS);
    setSosTriggered(false);
    setSosAlertDetails(null);
    setIsOnboarded(false);
  };

  return (
    <HostelContext.Provider
      value={{
        profile,
        isOnboarded,
        gatePasses,
        complaints,
        messMenu,
        invoices,
        kycDocuments,
        admissionMilestones,
        nocApplication,
        notices,
        gateLogs,
        sosTriggered,
        sosAlertDetails,
        completeOnboardingSetup,
        updateProfileDetails,
        reopenOnboardingSetup,
        toggleCheckInStatus,
        createGatePass,
        updateGatePassStatus,
        deleteGatePass,
        simulateWardenApproval,
        simulatePassCheckOut,
        simulatePassReturn,
        createComplaint,
        deleteComplaint,
        simulateResolveComplaint,
        rateComplaint,
        toggleMealOptOut,
        rateDailyMeal,
        payInvoice,
        triggerSos,
        cancelSos,
        submitNocRequest,
        simulateNocDepartmentClearance,
        resetAllData,
      }}
    >
      {children}
    </HostelContext.Provider>
  );
};

export const useHostel = () => {
  const context = useContext(HostelContext);
  if (!context) {
    throw new Error('useHostel must be used within a HostelProvider');
  }
  return context;
};
