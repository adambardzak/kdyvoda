"use client";

import { useState } from "react";

interface CalendarProps {
  availableDates: Date[];
  selectedDates?: Date[];
  onDateSelect?: (date: Date) => void;
  dateAvailability?: Map<string, number>;
  readOnly?: boolean;
}

export default function Calendar({
  availableDates,
  selectedDates = [],
  onDateSelect,
  dateAvailability,
  readOnly = false,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dragStart, setDragStart] = useState<Date | null>(null);
  const [dragEnd, setDragEnd] = useState<Date | null>(null);

  // Helper functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isDateAvailable = (date: Date) => {
    if (availableDates.length === 0) return true;
    return availableDates.some((availableDate) =>
      isSameDay(availableDate, date)
    );
  };

  const isDateSelected = (date: Date) => {
    return selectedDates.some((selectedDate) =>
      isSameDay(selectedDate, date)
    );
  };

  const createDate = (year: number, month: number, day: number) => {
    // Create date at UTC midnight to match parent component
    const date = new Date(Date.UTC(year, month, day));
    return date;
  };

  const isDateInRange = (date: Date) => {
    if (!dragStart || !dragEnd) return false;
    const dateTime = date.getTime();
    const start = Math.min(dragStart.getTime(), dragEnd.getTime());
    const end = Math.max(dragStart.getTime(), dragEnd.getTime());
    return dateTime >= start && dateTime <= end;
  };

  // Click handler
  const handleDateClick = (date: Date) => {
    if (readOnly || !isDateAvailable(date)) return;

    const normalizedDate = createDate(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    if (onDateSelect) {
      onDateSelect(normalizedDate);
    }
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, date: Date) => {
    // Only prevent the default drag image
    e.dataTransfer.setDragImage(new Image(), 0, 0);
    if (readOnly || !isDateAvailable(date)) return;

    const normalizedDate = createDate(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    setDragStart(normalizedDate);
    setDragEnd(normalizedDate);
  };

  const handleDragEnter = (e: React.DragEvent, date: Date) => {
    if (!dragStart || !isDateAvailable(date)) return;
    const normalizedDate = createDate(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    setDragEnd(normalizedDate);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (dragStart && dragEnd) {
      const dates: Date[] = [];
      const start = Math.min(dragStart.getTime(), dragEnd.getTime());
      const end = Math.max(dragStart.getTime(), dragEnd.getTime());
      
      const current = new Date(start);
      while (current.getTime() <= end) {
        if (isDateAvailable(current)) {
          dates.push(new Date(current.getTime()));
        }
        current.setDate(current.getDate() + 1);
      }

      if (onDateSelect) {
        dates.forEach(date => onDateSelect(date));
      }
    }
    setDragStart(null);
    setDragEnd(null);
  };

  // Month navigation
  const prevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Render calendar grid
  const renderDays = () => {
    const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
    const today = new Date();
    const days = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    // Add cells for each day of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = createDate(currentDate.getFullYear(), currentDate.getMonth(), i);
      const isAvailable = isDateAvailable(date);
      const isSelected = isDateSelected(date);
      const isInRange = isDateInRange(date);
      const isToday = isSameDay(date, today);

      const dateStr = date.toISOString().split("T")[0];
      const availability = dateAvailability?.get(dateStr);

      days.push(
        <div
          key={i}
          className={`h-10 flex items-center justify-center relative select-none ${
            isAvailable
              ? "cursor-pointer hover:bg-slate-100"
              : "cursor-not-allowed opacity-50"
          } ${
            isSelected || isInRange
              ? "bg-green-100 hover:bg-green-200"
              : isToday
              ? "bg-blue-50"
              : ""
          }`}
          onClick={() => handleDateClick(date)}
          draggable={isAvailable && !readOnly}
          onDragStart={(e) => handleDragStart(e, date)}
          onDragEnter={(e) => handleDragEnter(e, date)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => e.preventDefault()} // Still need this to allow drop
        >
          <span
            className={`text-sm ${
              isSelected || isInRange
                ? "font-semibold text-green-700"
                : isToday
                ? "font-semibold text-blue-700"
                : "text-slate-700"
            }`}
          >
            {i}
          </span>
          {availability !== undefined && (
            <div className="absolute bottom-0 left-0 right-0 text-center">
              <div
                className={`text-xs font-medium ${
                  availability > 0
                    ? availability > 3
                      ? "text-green-700"
                      : "text-blue-700"
                    : "text-slate-500"
                }`}
              >
                {availability}
              </div>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm ring-1 ring-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-md hover:bg-slate-100"
          disabled={readOnly}
        >
          <svg
            className="w-5 h-5 text-slate-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-slate-900">
          {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 rounded-md hover:bg-slate-100"
          disabled={readOnly}
        >
          <svg
            className="w-5 h-5 text-slate-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {["Ne", "Po", "Út", "St", "Čt", "Pá", "So"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-slate-500"
          >
            {day}
          </div>
        ))}
        {renderDays()}
      </div>
    </div>
  );
}
