import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  Star,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useHostel } from '../context/HostelContext';
import { MealSchedule } from '../types/hostel';
import {
  BreakfastThumbnailSvg,
  LunchThumbnailSvg,
  SnacksThumbnailSvg,
  DinnerThumbnailSvg,
  CookieBiteSvg,
} from './PoshtellIllustrations';

interface MessMenuPlannerProps {
  onBack?: () => void;
}

export const MessMenuPlanner: React.FC<MessMenuPlannerProps> = ({ onBack }) => {
  const { messMenu, profile, toggleMealOptOut, rateDailyMeal } = useHostel();
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const currentDay = messMenu[selectedDayIdx] || messMenu[0];

  const handleRating = (stars: number) => {
    rateDailyMeal(selectedDayIdx, stars);
    setFeedbackSuccess(`Rated ${stars} stars for ${currentDay.dayOfWeek}'s food menu`);
    setTimeout(() => setFeedbackSuccess(null), 3000);
  };

  const handlePrevDay = () => {
    setSelectedDayIdx((prev) => (prev === 0 ? messMenu.length - 1 : prev - 1));
  };

  const handleNextDay = () => {
    setSelectedDayIdx((prev) => (prev === messMenu.length - 1 ? 0 : prev + 1));
  };

  const renderMealSection = (
    title: string,
    key: 'breakfast' | 'lunch' | 'snacks' | 'dinner',
    schedule: MealSchedule,
    thumbnail: React.ReactNode
  ) => {
    const bulletSummary = schedule.items.map((item) => item.name).join(' • ');

    return (
      <div
        key={key}
        className={`bg-[#FFFDF9] rounded-3xl border transition-all p-4 sm:p-5 ${
          schedule.optedOut
            ? 'border-dashed border-stone-300 bg-stone-50/70 opacity-75'
            : 'border-[#F3E9D8] shadow-2xs'
        }`}
      >
        {/* Top Row: Thumbnail + Meal Name + Timing + Opt-Out Toggle */}
        <div className="flex items-start gap-3.5">
          {thumbnail}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <h3 className="text-base font-bold text-[#1E293B]">{title}</h3>
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#D97736]" />
                  {schedule.timing}
                </span>
              </div>

              <button
                type="button"
                onClick={() => toggleMealOptOut(selectedDayIdx, key)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                  schedule.optedOut
                    ? 'bg-[#D97736] text-white'
                    : 'bg-[#FBF0E4] text-[#D97736] hover:bg-[#F5DEC9]'
                }`}
              >
                {schedule.optedOut ? 'Opted Out (Re-join)' : 'Skip Meal'}
              </button>
            </div>

            {/* Full Bullet-Separated Dish Summary (matches My Poshtell style, untruncated when opened) */}
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed font-medium">
              {bulletSummary}
            </p>
          </div>
        </div>

        {/* Individual Dish Pills with Veg / Egg-Non-Veg Dots */}
        <div className="mt-4 pt-3.5 border-t border-[#F3E9D8]/80 flex flex-wrap gap-2">
          {schedule.items.map((item) => (
            <div
              key={item.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#F0E4DC] text-xs font-medium text-[#334155]"
            >
              {item.isVeg ? (
                <span
                  className="w-3 h-3 border border-[#15803D] rounded-[3px] flex items-center justify-center shrink-0"
                  title="Vegetarian"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
                </span>
              ) : (
                <span
                  className="w-3 h-3 border border-[#DC2626] rounded-[3px] flex items-center justify-center shrink-0"
                  title="Egg / Non-Vegetarian"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                </span>
              )}
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 pb-6">
      {/* =========================================================================
          1. MY POSHTELL FOOD MENU HEADER BANNER
          Warm peach gradient header matching the Home Screen with Back arrow,
          Cookie icon, "Food Menu" title, and active day pill
          ========================================================================= */}
      <div className="relative -mx-4 sm:mx-0 sm:rounded-[28px] bg-gradient-to-b from-[#FBEBDF] via-[#FDF2EA] to-[#FFF9F5] border-b sm:border border-[#F1DEC9] pt-4 pb-5 px-5 sm:px-7">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="w-10 h-10 rounded-2xl bg-white shadow-2xs border border-stone-200/80 flex items-center justify-center text-[#1E293B] hover:bg-stone-50 active:scale-95 transition-all"
                aria-label="Back to Home"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <CookieBiteSvg className="w-5 h-5" />
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#1E293B] tracking-tight">
                  Food Menu
                </h1>
              </div>
              <p className="text-xs text-[#64748B] font-medium mt-0.5">
                {profile.hostelBuilding} • Weekly Mess Schedule
              </p>
            </div>
          </div>

          <span className="px-3.5 py-1.5 rounded-full bg-[#FBF0E4] border border-[#EED5C1] text-[#D97736] text-xs font-bold">
            {currentDay.dayOfWeek}
          </span>
        </div>

        {/* =========================================================================
            2. 7-DAY OF WEEK SELECTOR PILLS (Sun, Mon, Tue, Wed, Thu, Fri, Sat)
            ========================================================================= */}
        <div className="mt-5 grid grid-cols-7 gap-1.5 sm:gap-2">
          {messMenu.map((day, idx) => {
            const isSelected = selectedDayIdx === idx;
            const shortDay = day.dayOfWeek.slice(0, 3);
            return (
              <button
                key={day.dayOfWeek}
                type="button"
                onClick={() => setSelectedDayIdx(idx)}
                className={`py-2.5 px-1 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-[#D97736] text-white border-[#D97736] shadow-sm shadow-[#D97736]/25'
                    : 'bg-white/90 text-[#475569] border-[#EED5C1] hover:border-[#D97736]/50'
                }`}
              >
                <span
                  className={`text-[11px] sm:text-xs font-bold tracking-tight ${
                    isSelected ? 'text-white' : 'text-[#1E293B]'
                  }`}
                >
                  {shortDay}
                </span>
                {day.isToday ? (
                  <span
                    className={`mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-white/25 text-white'
                        : 'bg-[#FBF0E4] text-[#D97736]'
                    }`}
                  >
                    Today
                  </span>
                ) : (
                  <span
                    className={`mt-1 w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-stone-300'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          3. SELECTED DAY BAR WITH PREV / NEXT DAY SWITCHER
          ========================================================================= */}
      <div className="flex items-center justify-between bg-[#FCFAF9] rounded-2xl border border-[#F1E8E2] px-4 py-3">
        <button
          type="button"
          onClick={handlePrevDay}
          className="p-1.5 rounded-xl bg-white border border-[#F0E4DC] text-slate-600 hover:text-[#D97736] transition-colors"
          aria-label="Previous day"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[#1E293B]">
              {currentDay.dayOfWeek}&apos;s Mess Menu
            </h2>
            {currentDay.isToday && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#FBF0E4] text-[#D97736] text-[11px] font-bold">
                Today
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            Breakfast • Lunch • Snacks • Dinner
          </p>
        </div>

        <button
          type="button"
          onClick={handleNextDay}
          className="p-1.5 rounded-xl bg-white border border-[#F0E4DC] text-slate-600 hover:text-[#D97736] transition-colors"
          aria-label="Next day"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Feedback Toast */}
      {feedbackSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{feedbackSuccess}</span>
        </div>
      )}

      {/* =========================================================================
          4. MEAL CARDS FOR THE SELECTED DAY OF THE WEEK
          (Breakfast, Lunch, Snacks, Dinner)
          ========================================================================= */}
      <div className="space-y-4">
        {renderMealSection(
          'Breakfast',
          'breakfast',
          currentDay.meals.breakfast,
          <BreakfastThumbnailSvg />
        )}
        {renderMealSection(
          'Lunch',
          'lunch',
          currentDay.meals.lunch,
          <LunchThumbnailSvg />
        )}
        {renderMealSection(
          'Snacks',
          'snacks',
          currentDay.meals.snacks,
          <SnacksThumbnailSvg />
        )}
        {renderMealSection(
          'Dinner',
          'dinner',
          currentDay.meals.dinner,
          <DinnerThumbnailSvg />
        )}
      </div>

      {/* =========================================================================
          5. DAILY FOOD QUALITY RATING CARD
          ========================================================================= */}
      <div className="p-5 rounded-3xl bg-[#FCFAF9] border border-[#F1E8E2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#D97736]">
            MESS FEEDBACK
          </span>
          <h3 className="text-sm font-bold text-[#1E293B] mt-0.5">
            Rate {currentDay.dayOfWeek}&apos;s Mess Food Quality
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Your rating is shared with the Hostel Warden &amp; Mess Committee.
          </p>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-white px-3 py-2 rounded-2xl border border-[#F0E4DC]">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRating(star)}
              className="p-1 text-stone-300 hover:text-amber-400 focus:outline-none transition-colors"
              title={`Rate ${star} out of 5 stars`}
            >
              <Star
                className={`w-5 h-5 ${
                  (currentDay.residentRating || 0) >= star
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-stone-300'
                }`}
              />
            </button>
          ))}
          <span className="text-xs font-mono font-bold text-slate-700 ml-1.5">
            {currentDay.residentRating ? `${currentDay.residentRating}.0` : 'Rate'}
          </span>
        </div>
      </div>
    </div>
  );
};
