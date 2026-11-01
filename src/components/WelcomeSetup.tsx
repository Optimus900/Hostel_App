import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  User,
  GraduationCap,
  Phone,
  Mail,
  Hash,
  ArrowRight,
  Building2,
  DoorOpen,
  Bed,
  Camera,
  Calendar,
  MapPin,
  Heart,
  Users,
  AlertCircle,
} from 'lucide-react';
import { useHostel } from '../context/HostelContext';
import { MyPoshtellLogo } from './PoshtellIllustrations';

const TOWER_OPTIONS = [
  { value: 'Tower - 1', label: 'Tower 1' },
  { value: 'Tower - 2', label: 'Tower 2' },
  { value: 'Tower - 3', label: 'Tower 3' },
];

const BLOOD_GROUP_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const getBedOptionsForTower = (selectedTower: string) => {
  if (selectedTower === 'Tower - 1' || selectedTower === 'Tower - 2') {
    return [
      { value: 'Bed A', label: 'Bed A' },
      { value: 'Bed B', label: 'Bed B' },
      { value: 'Bed C', label: 'Bed C' },
      { value: 'Bed D', label: 'Bed D' },
    ];
  }
  if (selectedTower === 'Tower - 3') {
    return [
      { value: 'Bed A', label: 'Bed A' },
      { value: 'Bed B', label: 'Bed B' },
    ];
  }
  return [];
};

export const WelcomeSetup: React.FC = () => {
  const { completeOnboardingSetup } = useHostel();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 1. Student Identity & Academic Info
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [usn, setUsn] = useState<string>('');
  const [courseAndYear, setCourseAndYear] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  // 2. Personal Information
  const [gender, setGender] = useState<string>('');
  const [bloodGroup, setBloodGroup] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');

  // 3. Family Details
  const [parentName, setParentName] = useState<string>('');
  const [parentMobile, setParentMobile] = useState<string>('');
  const [parentEmail, setParentEmail] = useState<string>('');
  const [localGuardian, setLocalGuardian] = useState<string>('');
  const [emergencyContactName, setEmergencyContactName] = useState<string>('');

  // 4. Address
  const [permanentAddress, setPermanentAddress] = useState<string>('');

  // 5. Stay Details
  const [tower, setTower] = useState<string>('');
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [bedNumber, setBedNumber] = useState<string>('');
  const [moveInDate, setMoveInDate] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const bedOptions = getBedOptionsForTower(tower);

  const handleTowerChange = (newTower: string) => {
    setTower(newTower);
    const validBeds = getBedOptionsForTower(newTower);
    if (bedNumber && !validBeds.some((b) => b.value === bedNumber)) {
      setBedNumber('');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            setAvatarUrl(canvas.toDataURL('image/jpeg', 0.82));
          } else {
            setAvatarUrl(reader.result as string);
          }
        };
        img.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !fullName.trim() ||
      !usn.trim() ||
      !courseAndYear.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !gender.trim() ||
      !bloodGroup.trim() ||
      !dateOfBirth.trim() ||
      !parentName.trim() ||
      !parentMobile.trim() ||
      !parentEmail.trim() ||
      !permanentAddress.trim() ||
      !tower.trim() ||
      !roomNumber.trim() ||
      !bedNumber.trim() ||
      !moveInDate.trim()
    ) {
      setErrorMsg('Please fill in all required profile and stay details to complete your registration.');
      return;
    }

    completeOnboardingSetup({
      fullName: fullName.trim(),
      usn: usn.trim().toUpperCase(),
      courseAndYear: courseAndYear.trim(),
      phone: phone.trim(),
      email: email.trim(),
      avatarUrl: avatarUrl || undefined,
      gender: gender.trim(),
      bloodGroup: bloodGroup.trim(),
      dateOfBirth: dateOfBirth.trim(),
      parentName: parentName.trim(),
      parentMobile: parentMobile.trim(),
      parentEmail: parentEmail.trim(),
      localGuardian: localGuardian.trim() || '—',
      emergencyContactName: emergencyContactName.trim() || '—',
      permanentAddress: permanentAddress.trim(),
      tower: tower.trim(),
      roomNumber: roomNumber.trim(),
      bedNumber: bedNumber.trim(),
      agreementPeriod: 'Jul 26, 27',
      moveInDate: moveInDate.trim(),
      moveOutDate: 'Jul 26, 27',
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F6] flex flex-col justify-between">
      {/* Top Minimal Brand Header */}
      <header className="w-full bg-white border-b border-stone-200 px-6 py-3.5 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <MyPoshtellLogo className="w-9 h-8" />
          <span className="text-xs text-stone-500 font-medium">
            First-Time Student Profile Registration
          </span>
        </div>
      </header>

      {/* Main Onboarding Form Container */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="max-w-3xl w-full bg-white rounded-3xl border border-stone-200 shadow-xl shadow-stone-900/5 overflow-hidden">
          {/* Top Peach Banner */}
          <div className="bg-gradient-to-b from-[#FBEBDF] via-[#FDF2EA] to-[#FFF9F5] border-b border-[#F1DEC9] p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-[#D97736]">
              <ShieldCheck className="w-4 h-4 text-[#D97736]" />
              <span>WELCOME TO MY POSHTELL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 mt-1">
              Student Profile Setup
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed">
              Complete all your student profile, personal, family, address, and stay details below. These details will be saved locally on your device and displayed across your Home Screen and Student Profile tab.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* =================================================================
                SECTION 1: STUDENT IDENTITY & ACADEMIC DETAILS
                ================================================================= */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                <User className="w-4 h-4 text-[#EA580C]" />
                <h2 className="text-sm sm:text-base font-bold text-[#1E293B]">
                  1. Student Identity &amp; Academic Details
                </h2>
              </div>

              {/* Optional Profile Photo Upload */}
              <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70">
                <div className="relative shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile Preview"
                      className="w-16 h-16 rounded-full object-cover border border-stone-300"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#FDF2EA] border border-[#EED5C1] flex items-center justify-center text-[#EA580C]">
                      <User className="w-7 h-7" />
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-xs font-semibold text-stone-800 flex items-center gap-1.5 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#EA580C]" />
                    <span>{avatarUrl ? 'Change Profile Photo' : 'Upload Profile Photo'}</span>
                  </button>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Shown on your Student Profile card and KYC Photograph section.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Student Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#D97736]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    USN (University Seat Number) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={usn}
                      onChange={(e) => setUsn(e.target.value.toUpperCase())}
                      placeholder="Enter your USN"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm font-mono uppercase text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#D97736]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Course &amp; Branch <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={courseAndYear}
                      onChange={(e) => setCourseAndYear(e.target.value)}
                      placeholder="e.g. B.Tech - Computer Science & Engineering"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#D97736]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your mobile number"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#D97736]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#D97736]"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================================
                SECTION 2: PERSONAL INFORMATION (Gender, Blood Group, Date of Birth)
                ================================================================= */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                <Heart className="w-4 h-4 text-[#EA580C]" />
                <h2 className="text-sm sm:text-base font-bold text-[#1E293B]">
                  2. Personal Information
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#D97736]"
                    required
                  >
                    <option value="" disabled>
                      Select Gender
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Blood Group <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#D97736]"
                    required
                  >
                    <option value="" disabled>
                      Select Blood Group
                    </option>
                    {BLOOD_GROUP_OPTIONS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      placeholder="e.g. 21 Apr 2006"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#D97736]"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================================
                SECTION 3: FAMILY DETAILS
                (Parent Name, Parent Mobile, Parent Email, Local Guardian, Emergency Contact)
                ================================================================= */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                <Users className="w-4 h-4 text-[#EA580C]" />
                <h2 className="text-sm sm:text-base font-bold text-[#1E293B]">
                  3. Family Details
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Parent Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="Enter parent full name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#D97736]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Parent Mobile <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={parentMobile}
                    onChange={(e) => setParentMobile(e.target.value)}
                    placeholder="Enter parent mobile number"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#D97736]"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Parent Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    placeholder="Enter parent email address"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#D97736]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Local Guardian <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={localGuardian}
                    onChange={(e) => setLocalGuardian(e.target.value)}
                    placeholder="Enter local guardian name or leave blank"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#D97736]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Emergency Contact <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="Enter emergency contact or leave blank"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#D97736]"
                  />
                </div>
              </div>
            </div>

            {/* =================================================================
                SECTION 4: ADDRESS (Permanent Address)
                ================================================================= */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                <MapPin className="w-4 h-4 text-[#EA580C]" />
                <h2 className="text-sm sm:text-base font-bold text-[#1E293B]">
                  4. Address
                </h2>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Permanent Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={permanentAddress}
                  onChange={(e) => setPermanentAddress(e.target.value)}
                  placeholder="Enter your full permanent address & PIN code"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#D97736]"
                  required
                />
              </div>
            </div>

            {/* =================================================================
                SECTION 5: STAY DETAILS
                (Tower 1/2/3, Room Number, Bed A/B/C/D, Agreement Period, Move-In Date, Move-Out Date)
                ================================================================= */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                <Building2 className="w-4 h-4 text-[#EA580C]" />
                <h2 className="text-sm sm:text-base font-bold text-[#1E293B]">
                  5. Stay Details
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Hostel Tower: Only options 1, 2, 3 */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Hostel Tower (1, 2, 3) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={tower}
                      onChange={(e) => handleTowerChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#D97736]"
                      required
                    >
                      <option value="" disabled>
                        Select Tower
                      </option>
                      {TOWER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Room Number */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Room Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DoorOpen className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      placeholder="Enter room no."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#D97736]"
                      required
                    />
                  </div>
                </div>

                {/* Bed Selection: A, B, C, D for Tower 1 & 2; A or B for Tower 3 */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Bed ({tower === 'Tower - 3' ? 'A or B' : 'A, B, C, D'}) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Bed className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={bedNumber}
                      onChange={(e) => setBedNumber(e.target.value)}
                      disabled={!tower}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#D97736] disabled:bg-stone-100 disabled:text-stone-400"
                      required
                    >
                      <option value="" disabled>
                        {tower ? 'Select Bed' : 'Select Tower first'}
                      </option>
                      {bedOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Move-In Date */}
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Move-In Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      placeholder="e.g. 07 Aug 2026"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#D97736]"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 px-6 rounded-2xl bg-[#EE6C2A] hover:bg-[#DC5B19] active:scale-[0.99] text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-[#EE6C2A]/20 transition-all"
              >
                <span>Save Student Profile &amp; Open Home Screen</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-stone-400">
        Myposhtell by Memedeo Communications Private Limited · Version 1.0.6
      </footer>
    </div>
  );
};
