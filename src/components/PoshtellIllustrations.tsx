import React from 'react';

export const MyPoshtellLogo: React.FC<{ className?: string }> = ({ className = 'w-[54px] h-[46px]' }) => (
  <div className="flex flex-col items-center">
    <svg
      viewBox="0 0 64 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Pentagon House Roof & Walls */}
      <path
        d="M32 4L8 22V50H56V22L32 4Z"
        stroke="#1C1917"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner Roof Peak */}
      <path
        d="M32 14L18 25"
        stroke="#1C1917"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M32 14L46 25"
        stroke="#1C1917"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Vertical Pillars */}
      <line x1="32" y1="14" x2="32" y2="50" stroke="#1C1917" strokeWidth="3" />
      <line x1="20" y1="24" x2="20" y2="50" stroke="#1C1917" strokeWidth="2.8" />
      <line x1="44" y1="24" x2="44" y2="50" stroke="#1C1917" strokeWidth="2.8" />
      {/* Horizontal Mid Bar */}
      <line x1="8" y1="34" x2="24" y2="34" stroke="#1C1917" strokeWidth="2.8" />
      <line x1="40" y1="34" x2="56" y2="34" stroke="#1C1917" strokeWidth="2.8" />
    </svg>
    <span className="text-[9.5px] font-semibold tracking-[0.2em] text-[#1C1917] mt-1 uppercase whitespace-nowrap">
      MY POSHTELL
    </span>
  </div>
);

export const WavingHandSvg: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Motion wave lines */}
    <path
      d="M7 11C5.5 13 5.5 16 7 18"
      stroke="#DF8624"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path
      d="M27 7C29 8.5 30 11 29.5 13.5"
      stroke="#DF8624"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    {/* Warm Golden Hand Outline */}
    <path
      d="M18.5 7.5C18.5 6.1 19.6 5 21 5C22.4 5 23.5 6.1 23.5 7.5V16M14 9.5C14 8.1 15.1 7 16.5 7C17.9 7 19 8.1 19 9.5V16M10.5 13.5C10.5 12.1 11.6 11 13 11C14.4 11 15.5 12.1 15.5 13.5V18M23.5 11.5C23.5 10.1 24.6 9 26 9C27.4 9 28.5 10.1 28.5 11.5V21C28.5 26.5 24 31 18.5 31C13.8 31 10.2 27.8 9.2 23.5L7.5 18.5C7.1 17.2 7.8 15.8 9.1 15.4C10.2 15 11.4 15.6 11.9 16.7L12.5 18.5"
      fill="#F5A623"
       fillOpacity="0.22"
      stroke="#DF8624"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const HostelBuildingIllustration: React.FC<{ className?: string }> = ({
  className = 'w-44 h-40',
}) => (
  <svg
    viewBox="0 0 220 190"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="bldgMain" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FAD6BE" />
        <stop offset="55%" stopColor="#F0A57B" />
        <stop offset="100%" stopColor="#E17F4A" />
      </linearGradient>
      <linearGradient id="bldgSide" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F5BFA0" />
        <stop offset="100%" stopColor="#D9733C" />
      </linearGradient>
      <linearGradient id="waterTank" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFF2E8" />
        <stop offset="50%" stopColor="#F3A77C" />
        <stop offset="100%" stopColor="#D66F37" />
      </linearGradient>
      <linearGradient id="windowGlow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFF9F5" />
        <stop offset="100%" stopColor="#F5C7A8" />
      </linearGradient>
    </defs>

    {/* Rooftop Water Tank */}
    <rect x="86" y="10" width="66" height="22" rx="7" fill="url(#waterTank)" />
    <line x1="98" y1="32" x2="98" y2="39" stroke="#C86A32" strokeWidth="3" />
    <line x1="140" y1="32" x2="140" y2="39" stroke="#C86A32" strokeWidth="3" />

    {/* Main Tower Roof Rim */}
    <rect x="64" y="38" width="110" height="5" rx="2" fill="#D46F38" />
    {/* Main Central Hostel Tower */}
    <rect x="67" y="43" width="104" height="145" fill="url(#bldgMain)" />

    {/* Left Lower Wing */}
    <rect x="24" y="102" width="45" height="5" rx="2" fill="#D46F38" />
    <rect x="26" y="107" width="43" height="81" fill="url(#bldgSide)" />

    {/* Right Lower Wing */}
    <rect x="169" y="102" width="45" height="5" rx="2" fill="#D46F38" />
    <rect x="171" y="107" width="41" height="81" fill="url(#bldgSide)" />

    {/* Main Tower Windows (4 cols x 4 rows) */}
    {[54, 78, 102, 126].map((y, rIdx) =>
      [78, 101, 124, 147].map((x, cIdx) => (
        <g key={`m-${rIdx}-${cIdx}`}>
          <rect x={x} y={y} width="14" height="15" rx="2" fill="url(#windowGlow)" />
          <rect x={x - 1} y={y + 14} width="16" height="2.5" rx="1" fill="#C7642E" />
        </g>
      ))
    )}

    {/* Left Wing Windows (2 cols x 2 rows) */}
    {[118, 142].map((y, rIdx) =>
      [34, 51].map((x, cIdx) => (
        <g key={`l-${rIdx}-${cIdx}`}>
          <rect x={x} y={y} width="11" height="14" rx="1.5" fill="url(#windowGlow)" />
          <rect x={x - 1} y={y + 13} width="13" height="2" rx="1" fill="#BF5B25" />
        </g>
      ))
    )}

    {/* Right Wing Windows (2 cols x 2 rows) */}
    {[118, 142].map((y, rIdx) =>
      [178, 195].map((x, cIdx) => (
        <g key={`r-${rIdx}-${cIdx}`}>
          <rect x={x} y={y} width="11" height="14" rx="1.5" fill="url(#windowGlow)" />
          <rect x={x - 1} y={y + 13} width="13" height="2" rx="1" fill="#BF5B25" />
        </g>
      ))
    )}

    {/* Ground Floor Entrance Band */}
    <rect x="24" y="156" width="190" height="4" fill="#FDF2E9" opacity="0.85" />
    <rect x="98" y="162" width="42" height="26" rx="2" fill="#E89D6E" stroke="#FDF2E9" strokeWidth="1.5" />
    <line x1="119" y1="162" x2="119" y2="188" stroke="#FDF2E9" strokeWidth="1.5" />

    {/* Ground Floor Side Doors */}
    <rect x="38" y="165" width="18" height="23" rx="1.5" fill="#E59563" />
    <rect x="184" y="165" width="18" height="23" rx="1.5" fill="#E59563" />
  </svg>
);

export const BreakfastThumbnailSvg: React.FC = () => (
  <div className="w-12 h-12 rounded-2xl bg-[#EEF3F8] flex items-center justify-center shrink-0">
    <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none">
      {/* Toast slices at top */}
      <rect x="18" y="6" width="12" height="10" rx="2" fill="#FDE68A" stroke="#D97706" strokeWidth="1.5" />
      {/* Frying Pan */}
      <line x1="29" y1="21" x2="40" y2="13" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="22" cy="27" r="12" fill="#9A3412" stroke="#431407" strokeWidth="1.8" />
      <circle cx="22" cy="27" r="9" fill="#EA580C" />
      {/* Sunny side egg / dosa inside */}
      <circle cx="22" cy="27" r="6" fill="#FEF3C7" />
      <circle cx="22" cy="27" r="2.5" fill="#F59E0B" />
    </svg>
  </div>
);

export const LunchThumbnailSvg: React.FC = () => (
  <div className="w-12 h-12 rounded-2xl bg-[#F4F5F7] flex items-center justify-center shrink-0">
    <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none">
      {/* Plate rim */}
      <ellipse cx="24" cy="27" rx="16" ry="10" fill="#DC2626" />
      <ellipse cx="24" cy="26" rx="14" ry="8.5" fill="#FDE047" />
      {/* Curry & Rice mounds */}
      <ellipse cx="20" cy="25" rx="7" ry="4.5" fill="#EA580C" />
      <ellipse cx="28" cy="26" rx="6" ry="4" fill="#FEF9C3" />
      {/* Garnish greens */}
      <circle cx="22" cy="24" r="1.5" fill="#16A34A" />
      <circle cx="26" cy="25" r="1.5" fill="#16A34A" />
      <circle cx="17" cy="26" r="1.2" fill="#15803D" />
    </svg>
  </div>
);

export const DinnerThumbnailSvg: React.FC = () => (
  <div className="w-12 h-12 rounded-2xl bg-[#ECFAF5] flex items-center justify-center shrink-0">
    <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none">
      {/* Thali Plate */}
      <ellipse cx="24" cy="27" rx="16" ry="10" fill="#94A3B8" />
      <ellipse cx="24" cy="26" rx="14.5" ry="8.5" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
      {/* Katori bowls */}
      <circle cx="16" cy="24" r="3.5" fill="#16A34A" />
      <circle cx="23" cy="22" r="3.5" fill="#EA580C" />
      <circle cx="30" cy="24" r="3.5" fill="#F59E0B" />
      {/* Rice / Roti at bottom */}
      <ellipse cx="24" cy="29.5" rx="7" ry="3" fill="#FDE68A" />
    </svg>
  </div>
);

export const SnacksThumbnailSvg: React.FC = () => (
  <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7]/70 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none">
      {/* Saucer & Hot Chai Cup */}
      <ellipse cx="20" cy="34" rx="12" ry="3.5" fill="#D97736" opacity="0.25" />
      <path
        d="M12 20H28V27C28 31.4 24.4 34 20 34C15.6 34 12 31.4 12 27V20Z"
        fill="#EA580C"
      />
      <path
        d="M28 22H31C32.7 22 34 23.3 34 25C34 26.7 32.7 28 31 28H28"
        stroke="#EA580C"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Samosa triangle beside cup */}
      <path
        d="M27 33L34 19L41 33H27Z"
        fill="#F59E0B"
        stroke="#B45309"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Steam lines */}
      <path d="M17 16C17 14 18.5 13 18.5 11" stroke="#D97736" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M22 16C22 14 23.5 13 23.5 11" stroke="#D97736" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  </div>
);

export const HousekeepingCleanSvg: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 28 28" fill="none" className={className}>
    {/* Person outline */}
    <circle cx="10.5" cy="7.5" r="3" stroke="#0E7490" strokeWidth="1.6" />
    <path
      d="M5.5 22L7 14C7.3 12.8 8.3 12 9.5 12H11.5C12.7 12 13.7 12.8 14 14L15.5 22H5.5Z"
      stroke="#0E7490"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    {/* Broom stick & brush */}
    <line x1="19.5" y1="6" x2="19.5" y2="17" stroke="#0E7490" strokeWidth="1.6" strokeLinecap="round" />
    <path
      d="M17 17H22L23 22H16L17 17Z"
      stroke="#0E7490"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

export const CookieBiteSvg: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M21 12.5C19.2 12.5 17.8 11.1 17.8 9.3C16.2 9.3 14.8 7.9 14.8 6.2C14.8 5.1 15.3 4.2 16.1 3.6C14.9 3.2 13.5 3 12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12.5Z"
      stroke="#1C1917"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="8.5" cy="10.5" r="1" fill="#1C1917" />
    <circle cx="11.5" cy="15" r="1.1" fill="#1C1917" />
    <circle cx="8" cy="15.5" r="0.9" fill="#1C1917" />
    <circle cx="13" cy="11" r="0.9" fill="#1C1917" />
    <circle cx="15.5" cy="15.5" r="1" fill="#1C1917" />
  </svg>
);
