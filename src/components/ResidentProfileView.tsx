import React, { useState, useRef } from 'react';
import {
  User,
  Camera,
  Check,
  Pencil,
  ShieldCheck,
  Building2,
  CreditCard,
  FileText,
  ChevronRight,
  DoorClosed,
  LogOut,
  X,
  Save,
  CheckCircle2,
  RotateCcw,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { useHostel } from '../context/HostelContext';

interface ResidentProfileViewProps {
  onOpenQr: () => void;
  onNavigateTab?: (tab: 'HOME' | 'GATE_PASS' | 'MESS' | 'COMPLAINTS' | 'FEES_NOC' | 'PROFILE') => void;
}

const TOWER_OPTIONS = [
  { value: 'Tower - 1', label: 'Tower 1' },
  { value: 'Tower - 2', label: 'Tower 2' },
  { value: 'Tower - 3', label: 'Tower 3' },
];

const getBedOptionsForTower = (selectedTower: string) => {
  if (selectedTower === 'Tower - 1' || selectedTower === 'Tower - 2') {
    return [
      { value: 'Bed A', label: 'Bed A' },
      { value: 'Bed B', label: 'Bed B' },
      { value: 'Bed C', label: 'Bed C' },
      { value: 'Bed D', label: 'Bed D' },
    ];
  }
  return [
    { value: 'Bed A', label: 'Bed A' },
    { value: 'Bed B', label: 'Bed B' },
  ];
};

// Default realistic student avatar SVG data URI when no custom photo is uploaded
const DEFAULT_STUDENT_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#E2E8F0"/>
          <stop offset="100%" stop-color="#CBD5E1"/>
        </linearGradient>
      </defs>
      <rect width="160" height="160" fill="url(#bg)"/>
      <!-- Subtle wall background lines -->
      <rect x="0" y="0" width="45" height="160" fill="#94A3B8" opacity="0.25"/>
      <!-- Shoulders / Black Collar Shirt -->
      <path d="M26 160 C30 122 52 112 80 112 C108 112 130 122 134 160 Z" fill="#1E293B"/>
      <path d="M64 112 L80 134 L96 112 Z" fill="#D9A17C"/>
      <!-- Neck -->
      <rect x="68" y="94" width="24" height="24" rx="8" fill="#D9A17C"/>
      <!-- Face -->
      <ellipse cx="80" cy="70" rx="26" ry="32" fill="#E4B08E"/>
      <!-- Beard / Facial Hair -->
      <path d="M55 74 C55 94 67 103 80 103 C93 103 105 94 105 74 C103 86 94 94 80 94 C66 94 57 86 55 74 Z" fill="#1E1B18" opacity="0.85"/>
      <!-- Mustache -->
      <path d="M69 83 Q80 80 91 83" stroke="#1E1B18" stroke-width="3.2" stroke-linecap="round" fill="none"/>
      <!-- Eyes & Brows -->
      <path d="M63 62 Q69 59 75 62" stroke="#1E1B18" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <path d="M85 62 Q91 59 97 62" stroke="#1E1B18" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <circle cx="69" cy="67" r="2.6" fill="#1E1B18"/>
      <circle cx="91" cy="67" r="2.6" fill="#1E1B18"/>
      <!-- Hair -->
      <path d="M52 66 C50 42 64 28 82 28 C100 28 110 42 108 66 C106 50 96 42 80 42 C64 42 54 50 52 66 Z" fill="#181512"/>
    </svg>
  `);

export const ResidentProfileView: React.FC<ResidentProfileViewProps> = ({
  onOpenQr,
  onNavigateTab,
}) => {
  const { profile, updateProfileDetails, reopenOnboardingSetup, resetAllData } = useHostel();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [savedBanner, setSavedBanner] = useState<string | null>(null);
  const [activeDocModal, setActiveDocModal] = useState<
    null | 'AADHAAR' | 'STUDENT_ID' | 'PHOTO' | 'MEDICAL'
  >(null);
  const [activeActionModal, setActiveActionModal] = useState<
    null | 'LAUNDRY' | 'LEGAL' | 'ROOM_CHANGE' | 'MOVE_OUT' | 'AGREEMENT'
  >(null);

  const normalizeTowerOption = (val: string) => {
    if (val.includes('1')) return 'Tower - 1';
    if (val.includes('2')) return 'Tower - 2';
    return 'Tower - 3';
  };

  const normalizeBedOption = (val: string, selectedTower: string) => {
    const upper = val.toUpperCase();
    const validBeds = getBedOptionsForTower(selectedTower);
    if (upper.includes('D') && validBeds.some((b) => b.value === 'Bed D')) return 'Bed D';
    if (upper.includes('C') && validBeds.some((b) => b.value === 'Bed C')) return 'Bed C';
    if (upper.includes('A')) return 'Bed A';
    return 'Bed B';
  };

  // Edit Form State
  const initialTower = normalizeTowerOption(profile.hostelBuilding);
  const [editName, setEditName] = useState<string>(profile.fullName);
  const [editUsn, setEditUsn] = useState<string>(profile.usn);
  const [editCourse, setEditCourse] = useState<string>(profile.courseAndYear);
  const [editTower, setEditTower] = useState<string>(initialTower);
  const [editRoom, setEditRoom] = useState<string>(profile.roomNumber);
  const [editBed, setEditBed] = useState<string>(normalizeBedOption(profile.bedNumber, initialTower));
  const [editPhone, setEditPhone] = useState<string>(profile.phone);
  const [editEmail, setEditEmail] = useState<string>(profile.email);
  const [editGender, setEditGender] = useState<string>(
    profile.gender && profile.gender !== '—' ? profile.gender : ''
  );
  const [editBloodGroup, setEditBloodGroup] = useState<string>(
    profile.bloodGroup && profile.bloodGroup !== '—' ? profile.bloodGroup : ''
  );
  const [editDob, setEditDob] = useState<string>(
    profile.dateOfBirth && profile.dateOfBirth !== '—' ? profile.dateOfBirth : ''
  );
  const [editParentName, setEditParentName] = useState<string>(
    profile.parentName && profile.parentName !== '—' ? profile.parentName : ''
  );
  const [editParentMobile, setEditParentMobile] = useState<string>(
    profile.parentMobile && profile.parentMobile !== '—' ? profile.parentMobile : ''
  );
  const [editParentEmail, setEditParentEmail] = useState<string>(
    profile.parentEmail && profile.parentEmail !== '—' ? profile.parentEmail : ''
  );
  const [editLocalGuardian, setEditLocalGuardian] = useState<string>(
    profile.localGuardian && profile.localGuardian !== '—' ? profile.localGuardian : ''
  );
  const [editEmergencyContact, setEditEmergencyContact] = useState<string>(
    profile.emergencyContactName && profile.emergencyContactName !== '—'
      ? profile.emergencyContactName
      : ''
  );
  const [editAddress, setEditAddress] = useState<string>(
    profile.permanentAddress && profile.permanentAddress !== '—' ? profile.permanentAddress : ''
  );
  const [editMoveInDate, setEditMoveInDate] = useState<string>(
    profile.moveInDate && profile.moveInDate !== '—' ? profile.moveInDate : ''
  );

  // Room Change Modal State
  const [reqTower, setReqTower] = useState<string>(initialTower);
  const [reqRoom, setReqRoom] = useState<string>(profile.roomNumber);
  const [reqBed, setReqBed] = useState<string>(normalizeBedOption(profile.bedNumber, initialTower));
  const [reqReason, setReqReason] = useState<string>('');

  const editBedOptions = getBedOptionsForTower(editTower);
  const reqBedOptions = getBedOptionsForTower(reqTower);

  const handleEditTowerChange = (newTower: string) => {
    setEditTower(newTower);
    const validBeds = getBedOptionsForTower(newTower);
    if (!validBeds.some((b) => b.value === editBed)) {
      setEditBed(validBeds[0].value);
    }
  };

  const handleReqTowerChange = (newTower: string) => {
    setReqTower(newTower);
    const validBeds = getBedOptionsForTower(newTower);
    if (!validBeds.some((b) => b.value === reqBed)) {
      setReqBed(validBeds[0].value);
    }
  };

  const startEditing = () => {
    const currentTower = normalizeTowerOption(profile.hostelBuilding);
    setEditName(profile.fullName);
    setEditUsn(profile.usn);
    setEditCourse(profile.courseAndYear);
    setEditTower(currentTower);
    setEditRoom(profile.roomNumber);
    setEditBed(normalizeBedOption(profile.bedNumber, currentTower));
    setEditPhone(profile.phone);
    setEditEmail(profile.email);
    setEditGender(profile.gender && profile.gender !== '—' ? profile.gender : '');
    setEditBloodGroup(profile.bloodGroup && profile.bloodGroup !== '—' ? profile.bloodGroup : '');
    setEditDob(profile.dateOfBirth && profile.dateOfBirth !== '—' ? profile.dateOfBirth : '');
    setEditParentName(profile.parentName && profile.parentName !== '—' ? profile.parentName : '');
    setEditParentMobile(
      profile.parentMobile && profile.parentMobile !== '—' ? profile.parentMobile : ''
    );
    setEditParentEmail(
      profile.parentEmail && profile.parentEmail !== '—' ? profile.parentEmail : ''
    );
    setEditLocalGuardian(
      profile.localGuardian && profile.localGuardian !== '—' ? profile.localGuardian : ''
    );
    setEditEmergencyContact(
      profile.emergencyContactName && profile.emergencyContactName !== '—'
        ? profile.emergencyContactName
        : ''
    );
    setEditAddress(
      profile.permanentAddress && profile.permanentAddress !== '—' ? profile.permanentAddress : ''
    );
    setEditMoveInDate(
      profile.moveInDate && profile.moveInDate !== '—' ? profile.moveInDate : ''
    );
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !editName.trim() ||
      !editUsn.trim() ||
      !editCourse.trim() ||
      !editTower.trim() ||
      !editRoom.trim() ||
      !editBed.trim() ||
      !editPhone.trim() ||
      !editEmail.trim()
    ) {
      return;
    }
    updateProfileDetails({
      fullName: editName,
      usn: editUsn,
      courseAndYear: editCourse,
      tower: editTower,
      roomNumber: editRoom,
      bedNumber: editBed,
      phone: editPhone,
      email: editEmail,
      gender: editGender.trim() || '—',
      bloodGroup: editBloodGroup.trim() || '—',
      dateOfBirth: editDob.trim() || '—',
      parentName: editParentName.trim() || '—',
      parentMobile: editParentMobile.trim() || '—',
      parentEmail: editParentEmail.trim() || '—',
      localGuardian: editLocalGuardian.trim() || '—',
      emergencyContactName: editEmergencyContact.trim() || '—',
      permanentAddress: editAddress.trim() || '—',
      agreementPeriod: 'Jul 26, 27',
      moveInDate: editMoveInDate.trim() || '—',
      moveOutDate: 'Jul 26, 27',
    });
    setIsEditing(false);
    setSavedBanner('Student Profile updated and saved locally.');
    setTimeout(() => setSavedBanner(null), 3500);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 280;
          let width = img.width;
          let height = img.height;
          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          const compressedDataUrl = ctx
            ? (ctx.drawImage(img, 0, 0, width, height), canvas.toDataURL('image/jpeg', 0.82))
            : (reader.result as string);

          updateProfileDetails({
            fullName: profile.fullName,
            usn: profile.usn,
            courseAndYear: profile.courseAndYear,
            tower: profile.hostelBuilding,
            roomNumber: profile.roomNumber,
            bedNumber: profile.bedNumber,
            phone: profile.phone,
            email: profile.email,
            avatarUrl: compressedDataUrl,
          });
          setSavedBanner('Profile photograph updated.');
          setTimeout(() => setSavedBanner(null), 3000);
        };
        img.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRoomChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileDetails({
      fullName: profile.fullName,
      usn: profile.usn,
      courseAndYear: profile.courseAndYear,
      tower: reqTower,
      roomNumber: reqRoom,
      bedNumber: reqBed,
      phone: profile.phone,
      email: profile.email,
    });
    setActiveActionModal(null);
    setReqReason('');
    setSavedBanner(`Room allocation updated to ${reqTower} / ${reqRoom} / ${reqBed}.`);
    setTimeout(() => setSavedBanner(null), 3500);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-8">
      {/* =========================================================================
          1. TOP HEADER BAR ("Student Profile" + Peach Edit Button)
          ========================================================================= */}
      <div className="flex items-center justify-between pt-2 pb-1">
        <div className="w-10" aria-hidden="true" />
        <h1 className="text-lg sm:text-xl font-bold text-[#1E293B] tracking-tight">
          Student Profile
        </h1>
        <button
          type="button"
          onClick={startEditing}
          className="w-10 h-10 rounded-xl bg-[#FDF2EA] hover:bg-[#F7E3D4] active:scale-95 flex items-center justify-center text-[#EA580C] transition-all"
          title="Edit Student Profile"
          aria-label="Edit Student Profile"
        >
          <Pencil className="w-4 h-4 stroke-[2.2]" />
        </button>
      </div>

      {savedBanner && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{savedBanner}</span>
        </div>
      )}

      {/* =========================================================================
          2. STUDENT HERO CARD (Photo + Camera/Verified Badges + Uppercase Name + USN + Course + Phone + Email)
          ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Avatar with Camera & Verified Overlays */}
          <div className="relative shrink-0">
            <img
              src={profile.avatarUrl || DEFAULT_STUDENT_AVATAR}
              alt={profile.fullName}
              className="w-[88px] h-[88px] sm:w-24 sm:h-24 rounded-full object-cover border border-slate-200"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            {/* Bottom-Left Camera Badge */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0.5 left-0.5 w-6 h-6 rounded-full bg-[#EA580C] hover:bg-[#D9460F] border-2 border-white flex items-center justify-center text-white shadow-xs transition-transform active:scale-95"
              title="Change Profile Photo"
            >
              <Camera className="w-3 h-3" />
            </button>
            {/* Bottom-Right Green Check Badge */}
            <div
              className="absolute bottom-0.5 right-0.5 w-6 h-6 rounded-full bg-[#10B981] border-2 border-white flex items-center justify-center text-white shadow-xs"
              title="Verified Resident"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.8]" />
            </div>
          </div>

          {/* Right Student Identity Details */}
          <div className="min-w-0 flex-1 space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-[#1E293B] uppercase tracking-wide leading-snug break-words">
              {profile.fullName}
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] break-words">USN: {profile.usn}</p>
            <p className="text-xs sm:text-sm text-[#475569] leading-snug break-words">
              {profile.courseAndYear}
            </p>
            <p className="text-xs sm:text-sm text-[#475569] break-words">{profile.phone}</p>
            <p className="text-xs sm:text-sm text-[#475569] truncate">{profile.email}</p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. PERSONAL INFORMATION (Gender | Blood Group | Date of Birth)
          ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-0.5">
          <User className="w-4 h-4 text-[#EA580C]" strokeWidth={2} />
          <h3 className="text-sm sm:text-base font-semibold text-[#1E293B]">
            Personal Information
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5">
            <span className="text-[11px] text-[#64748B] block">Gender</span>
            <p className="text-xs sm:text-sm font-medium text-[#1E293B] mt-1">
              {profile.gender || '—'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5">
            <span className="text-[11px] text-[#64748B] block">Blood Group</span>
            <p className="text-xs sm:text-sm font-medium text-[#1E293B] mt-1">
              {profile.bloodGroup || '—'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5">
            <span className="text-[11px] text-[#64748B] block">Date of Birth</span>
            <p className="text-xs sm:text-sm font-medium text-[#1E293B] mt-1">
              {profile.dateOfBirth || '—'}
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. FAMILY DETAILS
          (Parent Name, Parent Mobile, Parent Email, Local Guardian, Emergency Contact)
          ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-0.5">
          <User className="w-4 h-4 text-[#EA580C]" strokeWidth={2} />
          <h3 className="text-sm sm:text-base font-semibold text-[#1E293B]">
            Family Details
          </h3>
        </div>

        <div className="space-y-2.5">
          <div className="bg-white rounded-2xl border border-slate-200/80 px-4 py-3.5">
            <span className="text-[11px] text-[#64748B] block">Parent Name</span>
            <p className="text-sm sm:text-base font-normal text-[#1E293B] mt-0.5">
              {profile.parentName || '—'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 px-4 py-3.5">
            <span className="text-[11px] text-[#64748B] block">Parent Mobile</span>
            <p className="text-sm sm:text-base font-normal text-[#1E293B] mt-0.5">
              {profile.parentMobile || '—'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 px-4 py-3.5">
            <span className="text-[11px] text-[#64748B] block">Parent Email</span>
            <p className="text-sm sm:text-base font-normal text-[#1E293B] mt-0.5">
              {profile.parentEmail || '—'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 px-4 py-3.5">
            <span className="text-[11px] text-[#64748B] block">Local Guardian</span>
            <p className="text-sm sm:text-base font-normal text-[#1E293B] mt-0.5">
              {profile.localGuardian || '—'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 px-4 py-3.5">
            <span className="text-[11px] text-[#64748B] block">Emergency Contact</span>
            <p className="text-sm sm:text-base font-normal text-[#1E293B] mt-0.5">
              {profile.emergencyContactName || '—'}
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          5. ADDRESS (Permanent Address)
          ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-0.5">
          <span className="text-[10px] font-bold text-[#EA580C] tracking-tight">Home</span>
          <h3 className="text-sm sm:text-base font-semibold text-[#1E293B]">Address</h3>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 px-4 py-3.5">
          <span className="text-[11px] text-[#64748B] block">Permanent Address</span>
          <p className="text-sm sm:text-base font-normal text-[#1E293B] mt-1 whitespace-pre-line leading-snug">
            {profile.permanentAddress || '—'}
          </p>
        </div>
      </div>

      {/* =========================================================================
          6. KYC & DOCUMENTS (2x2 Pastel Grid: Aadhaar ID, Student ID Card, Photograph, Medical Info)
          ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-0.5">
          <ShieldCheck className="w-4 h-4 text-[#EA580C]" strokeWidth={2.2} />
          <h3 className="text-sm sm:text-base font-semibold text-[#1E293B]">
            KYC &amp; Documents
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          {/* Card 1: Aadhaar ID */}
          <div
            onClick={() => setActiveDocModal('AADHAAR')}
            className="bg-[#FFFBEB] hover:bg-[#FEF3C7]/70 rounded-2xl border border-[#FDE68A]/50 p-4 min-h-[112px] flex flex-col justify-between cursor-pointer transition-colors"
          >
            <div className="w-8 h-6 rounded-md bg-[#F97316] flex items-center justify-center text-white">
              <svg viewBox="0 0 20 16" className="w-4 h-3.5" fill="none">
                <circle cx="6.5" cy="6" r="2" fill="white" />
                <path d="M3.5 12C3.5 10 5 9 6.5 9C8 9 9.5 10 9.5 12" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                <line x1="12" y1="5.5" x2="16.5" y2="5.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                <line x1="12" y1="9.5" x2="16.5" y2="9.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs sm:text-sm font-medium text-[#1E293B]">Aadhaar ID</span>
              <span className="text-xs font-semibold text-[#EA580C]">View</span>
            </div>
          </div>

          {/* Card 2: Student ID Card */}
          <div
            onClick={() => setActiveDocModal('STUDENT_ID')}
            className="bg-[#F0F9FF] hover:bg-[#E0F2FE]/70 rounded-2xl border border-[#BAE6FD]/50 p-4 min-h-[112px] flex flex-col justify-between cursor-pointer transition-colors"
          >
            <div className="w-8 h-6 rounded-md bg-[#15803D] flex items-center justify-center text-white">
              <svg viewBox="0 0 20 16" className="w-4 h-3.5" fill="none">
                <circle cx="6.5" cy="6" r="2" stroke="white" strokeWidth="1.4" />
                <path d="M3.5 12C3.5 10.2 5 9.2 6.5 9.2C8 9.2 9.5 10.2 9.5 12" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M11.5 8L13.2 9.8L16.8 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs sm:text-sm font-medium text-[#1E293B]">
                Student ID Card
              </span>
              <span className="text-xs font-semibold text-[#EA580C]">View</span>
            </div>
          </div>

          {/* Card 3: Photograph */}
          <div
            onClick={() => setActiveDocModal('PHOTO')}
            className="bg-[#FAF5FF] hover:bg-[#F3E8FF]/70 rounded-2xl border border-[#E9D5FF]/50 p-4 min-h-[112px] flex flex-col justify-between cursor-pointer transition-colors"
          >
            <div className="w-8 h-8 flex items-center justify-start text-[#EA580C]">
              <User className="w-6 h-6 fill-[#EA580C]" />
            </div>
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs sm:text-sm font-medium text-[#1E293B]">Photograph</span>
              <span className="text-xs font-semibold text-[#EA580C]">View</span>
            </div>
          </div>

          {/* Card 4: Medical Info */}
          <div
            onClick={() => setActiveDocModal('MEDICAL')}
            className="bg-[#F0FDF4] hover:bg-[#DCFCE7]/70 rounded-2xl border border-[#BBF7D0]/50 p-4 min-h-[112px] flex flex-col justify-between cursor-pointer transition-colors"
          >
            <div className="w-8 h-8 flex items-center justify-start text-[#EA580C]">
              <ShieldCheck className="w-6 h-6" strokeWidth={2.2} />
            </div>
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs sm:text-sm font-medium text-[#1E293B]">Medical Info</span>
              <span className="text-xs font-semibold text-[#EA580C]">View</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          7. STAY DETAILS
          (Tower / Room / Bed, Agreement Period, Move-In Date, Move-Out Date)
          ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-0.5">
          <Building2 className="w-4 h-4 text-[#EA580C]" strokeWidth={2} />
          <h3 className="text-sm sm:text-base font-semibold text-[#1E293B]">Stay Details</h3>
        </div>

        <div className="space-y-2.5">
          <div className="bg-white rounded-2xl border border-slate-200/80 px-4 py-3.5">
            <span className="text-[11px] text-[#64748B] block">Tower / Room / Bed</span>
            <p className="text-sm sm:text-base font-normal text-[#1E293B] mt-0.5">
              {profile.hostelBuilding} / {profile.roomNumber} / {profile.bedNumber}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 px-4 py-3.5">
            <span className="text-[11px] text-[#64748B] block">Agreement Period</span>
            <p className="text-sm sm:text-base font-normal text-[#1E293B] mt-0.5">
              Jul 26, 27
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 px-4 py-3.5">
            <span className="text-[11px] text-[#64748B] block">Move-In Date</span>
            <p className="text-sm sm:text-base font-normal text-[#1E293B] mt-0.5">
              {profile.moveInDate || '—'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 px-4 py-3.5">
            <span className="text-[11px] text-[#64748B] block">Move-Out Date</span>
            <p className="text-sm sm:text-base font-normal text-[#1E293B] mt-0.5">
              Jul 26, 27
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          8. MENU LINKS LIST (Financials, Laundry, Settings, Legal)
          ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden">
        {/* Financials */}
        <button
          type="button"
          onClick={() => onNavigateTab?.('FEES_NOC')}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center text-[#0284C7]">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-sm sm:text-base font-medium text-[#1E293B]">Financials</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Laundry */}
        <button
          type="button"
          onClick={() => setActiveActionModal('LAUNDRY')}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-center text-[#EC4899]">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-sm sm:text-base font-medium text-[#1E293B]">Laundry</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Settings */}
        <button
          type="button"
          onClick={startEditing}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-center text-[#EC4899]">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-sm sm:text-base font-medium text-[#1E293B]">Settings</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Legal */}
        <button
          type="button"
          onClick={() => setActiveActionModal('LEGAL')}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center text-[#2563EB]">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-sm sm:text-base font-medium text-[#1E293B]">Legal</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* =========================================================================
          9. QUICK ACTIONS (Request Room Change, Request Move-Out, Download Agreement)
          ========================================================================= */}
      <div className="space-y-3">
        <h3 className="text-sm sm:text-base font-semibold text-[#1E293B] px-0.5">
          Quick Actions
        </h3>

        <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden">
          {/* Request Room Change */}
          <button
            type="button"
            onClick={() => {
              const currentTower = normalizeTowerOption(profile.hostelBuilding);
              setReqTower(currentTower);
              setReqRoom(profile.roomNumber);
              setReqBed(normalizeBedOption(profile.bedNumber, currentTower));
              setActiveActionModal('ROOM_CHANGE');
            }}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-center text-[#DC2626]">
                <DoorClosed className="w-5 h-5" />
              </div>
              <span className="text-sm sm:text-base font-medium text-[#1E293B]">
                Request Room Change
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Request Move-Out */}
          <button
            type="button"
            onClick={() => onNavigateTab?.('FEES_NOC')}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-center text-[#E11D48]">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="text-sm sm:text-base font-medium text-[#1E293B]">
                Request Move-Out
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Download Agreement */}
          <button
            type="button"
            onClick={() => setActiveActionModal('AGREEMENT')}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-center text-[#EA580C]">
                <span className="text-base" aria-hidden="true">
                  🤝
                </span>
              </div>
              <span className="text-sm sm:text-base font-medium text-[#1E293B]">
                Download Agreement
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          10. FULL-WIDTH ORANGE LOGOUT BUTTON & VERSION 1.0.6
          ========================================================================= */}
      <div className="pt-2 space-y-4">
        <button
          type="button"
          onClick={reopenOnboardingSetup}
          className="w-full py-4 rounded-2xl bg-[#EE6C2A] hover:bg-[#DC5B19] active:scale-[0.99] text-white font-semibold text-base flex items-center justify-center gap-2.5 shadow-sm transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>

        <p className="text-center text-xs text-slate-400 font-medium">Version 1.0.6</p>
      </div>

      {/* =========================================================================
          EDIT PROFILE & SETTINGS MODAL (Triggered by top-right Pencil icon or "Settings")
          ========================================================================= */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-3xl border border-slate-200 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#1E293B]">
                  Edit Student Profile &amp; Stay Settings
                </h3>
                <p className="text-xs text-slate-500">
                  Changes are saved locally and reflected on Home &amp; Profile.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">USN</label>
                  <input
                    type="text"
                    value={editUsn}
                    onChange={(e) => setEditUsn(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Course &amp; Branch</label>
                  <input
                    type="text"
                    value={editCourse}
                    onChange={(e) => setEditCourse(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
                    required
                  />
                </div>

                {/* Tower (1, 2, 3), Room Number, and Bed (A, B, C, D for Tower 1 & 2; A, B for Tower 3) */}
                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Hostel Tower (1, 2, 3)
                    </label>
                    <select
                      value={editTower}
                      onChange={(e) => handleEditTowerChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
                      required
                    >
                      {TOWER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Room Number</label>
                    <input
                      type="text"
                      value={editRoom}
                      onChange={(e) => setEditRoom(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Bed ({editTower === 'Tower - 3' ? 'A or B' : 'A, B, C, D'})
                    </label>
                    <select
                      value={editBed}
                      onChange={(e) => setEditBed(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
                      required
                    >
                      {editBedOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
                    required
                  />
                </div>

                {/* Personal Information fields */}
                <div className="sm:col-span-2 grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                    <select
                      value={editGender}
                      onChange={(e) => setEditGender(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                    <input
                      type="text"
                      value={editBloodGroup}
                      onChange={(e) => setEditBloodGroup(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      type="text"
                      value={editDob}
                      onChange={(e) => setEditDob(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                    />
                  </div>
                </div>

                {/* Family & Address */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parent Name</label>
                  <input
                    type="text"
                    value={editParentName}
                    onChange={(e) => setEditParentName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parent Mobile</label>
                  <input
                    type="text"
                    value={editParentMobile}
                    onChange={(e) => setEditParentMobile(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Parent Email</label>
                  <input
                    type="email"
                    value={editParentEmail}
                    onChange={(e) => setEditParentEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Local Guardian</label>
                  <input
                    type="text"
                    value={editLocalGuardian}
                    onChange={(e) => setEditLocalGuardian(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    value={editEmergencyContact}
                    onChange={(e) => setEditEmergencyContact(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Permanent Address</label>
                  <textarea
                    rows={2}
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                  />
                </div>

                {/* Move-In Date */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Move-In Date</label>
                  <input
                    type="text"
                    value={editMoveInDate}
                    onChange={(e) => setEditMoveInDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    resetAllData();
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#EA580C] hover:bg-[#D9460F] text-white font-semibold flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Profile</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          KYC DOCUMENT VIEW MODAL (Aadhaar ID, Student ID Card, Photograph, Medical Info)
          ========================================================================= */}
      {activeDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#EA580C]" />
                <h3 className="text-base font-bold text-[#1E293B]">
                  {activeDocModal === 'AADHAAR' && 'Aadhaar ID Verification'}
                  {activeDocModal === 'STUDENT_ID' && 'University Student ID Card'}
                  {activeDocModal === 'PHOTO' && 'Resident Photograph'}
                  {activeDocModal === 'MEDICAL' && 'Resident Medical Information'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveDocModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2.5">
              {activeDocModal === 'AADHAAR' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Resident Name</span>
                    <span className="font-bold text-slate-900">{profile.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Aadhaar Number</span>
                    <span className="font-mono font-bold text-slate-900">XXXX-XXXX-8419</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">KYC Status</span>
                    <span className="font-bold text-emerald-700">Verified via DigiLocker</span>
                  </div>
                </>
              )}

              {activeDocModal === 'STUDENT_ID' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-500">University Seat Number (USN)</span>
                    <span className="font-mono font-bold text-[#EA580C]">{profile.usn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Course</span>
                    <span className="font-bold text-slate-900">{profile.courseAndYear}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Allocation</span>
                    <span className="font-bold text-slate-900">
                      {profile.hostelBuilding} / {profile.roomNumber} / {profile.bedNumber}
                    </span>
                  </div>
                </>
              )}

              {activeDocModal === 'PHOTO' && (
                <div className="flex flex-col items-center py-2 space-y-3">
                  <img
                    src={profile.avatarUrl || DEFAULT_STUDENT_AVATAR}
                    alt={profile.fullName}
                    className="w-28 h-28 rounded-full object-cover border-2 border-[#EA580C]"
                  />
                  <p className="font-bold text-slate-900">{profile.fullName}</p>
                </div>
              )}

              {activeDocModal === 'MEDICAL' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Blood Group</span>
                    <span className="font-bold text-slate-900">{profile.bloodGroup || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Emergency Parent Contact</span>
                    <span className="font-mono font-bold text-slate-900">
                      {profile.parentMobile || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Medical Fitness Certificate</span>
                    <span className="font-bold text-emerald-700">Cleared on Admission</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          REQUEST ROOM CHANGE / LAUNDRY / LEGAL / AGREEMENT MODAL
          ========================================================================= */}
      {activeActionModal === 'ROOM_CHANGE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#1E293B]">Request Room / Bed Change</h3>
              <button
                type="button"
                onClick={() => setActiveActionModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRoomChangeSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Tower (1, 2, 3)
                </label>
                <select
                  value={reqTower}
                  onChange={(e) => handleReqTowerChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900"
                >
                  {TOWER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Room Number</label>
                <input
                  type="text"
                  value={reqRoom}
                  onChange={(e) => setReqRoom(e.target.value)}
                  placeholder="e.g. Room 322"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Bed ({reqTower === 'Tower - 3' ? 'A or B' : 'A, B, C, D'})
                </label>
                <select
                  value={reqBed}
                  onChange={(e) => setReqBed(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900"
                >
                  {reqBedOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Change</label>
                <input
                  type="text"
                  value={reqReason}
                  onChange={(e) => setReqReason(e.target.value)}
                  placeholder="e.g. Moving with study partner"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#EE6C2A] hover:bg-[#DC5B19] text-white font-semibold text-xs"
              >
                Update Tower, Room &amp; Bed
              </button>
            </form>
          </div>
        </div>
      )}

      {(activeActionModal === 'LAUNDRY' ||
        activeActionModal === 'LEGAL' ||
        activeActionModal === 'AGREEMENT') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#1E293B]">
                {activeActionModal === 'LAUNDRY' && 'Hostel Laundry Quota'}
                {activeActionModal === 'LEGAL' && 'Hostel Policies & Legal Terms'}
                {activeActionModal === 'AGREEMENT' && 'Resident Stay Agreement (Jul 2026 – Jul 2027)'}
              </h3>
              <button
                type="button"
                onClick={() => setActiveActionModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
              {activeActionModal === 'LAUNDRY' && (
                <>
                  <p>
                    <strong>Assigned Residence:</strong> {profile.hostelBuilding} /{' '}
                    {profile.roomNumber} / {profile.bedNumber}
                  </p>
                  <p>
                    <strong>Monthly Laundry Allowance:</strong> 14 kg used of 25 kg monthly quota.
                  </p>
                  <p>
                    <strong>Collection Schedule:</strong> Every Monday &amp; Thursday morning.
                  </p>
                </>
              )}

              {activeActionModal === 'LEGAL' && (
                <>
                  <p>
                    <strong>My Poshtell Digital Resident Terms:</strong> Governed by Memedeo
                    Communications Private Limited and Campus Hostel Administration.
                  </p>
                  <p>
                    <strong>Gate Curfew &amp; Pass Compliance:</strong> Residents must scan their
                    personal Gate QR at turnstiles upon entry and exit.
                  </p>
                </>
              )}

              {activeActionModal === 'AGREEMENT' && (
                <>
                  <p>
                    <strong>Resident:</strong> {profile.fullName} (USN: {profile.usn})
                  </p>
                  <p>
                    <strong>Allocated Unit:</strong> {profile.hostelBuilding} / {profile.roomNumber}{' '}
                    / {profile.bedNumber}
                  </p>
                  <p>
                    <strong>Agreement Period:</strong> {profile.agreementPeriod || 'Jul 2026 – Jul 2027'}
                  </p>
                  <p className="text-emerald-700 font-semibold">
                    ✓ Digitally Signed &amp; Active Resident Agreement
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
