"use client";

import { useState, useEffect } from "react";

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
  const [isSelecting, setIsSelecting] = useState(false);
  const [localSelectedDates, setLocalSelectedDates] = useState<Date[]>(selectedDates);

  useEffect(() => {
    setLocalSelectedDates(selectedDates);
  }, [selectedDates]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    return { daysInMonth, startingDay };
  };

  const isDateAvailable = (date: Date) => {
    return availableDates.some(
      (availableDate) =>
        availableDate.getFullYear() === date.getFullYear() &&
        availableDate.getMonth() === date.getMonth() &&
        availableDate.getDate() === date.getDate()
    );
  };

  const isDateSelected = (date: Date) => {
    return localSelectedDates.some(
      (selectedDate) =>
        selectedDate.getFullYear() === date.getFullYear() &&
        selectedDate.getMonth() === date.getMonth() &&
        selectedDate.getDate() === date.getDate()
    );
  };

  const handleDateClick = (date: Date) => {
    if (readOnly || !isDateAvailable(date)) return;

    if (onDateSelect) {
      onDateSelect(date);
    } else {
      setLocalSelectedDates((prev) => {
        const isSelected = prev.some(
          (d) =>
            d.getFullYear() === date.getFullYear() &&
            d.getMonth() === date.getMonth() &&
            d.getDate() === date.getDate()
        );

        if (isSelected) {
          return prev.filter(
            (d) =>
              d.getFullYear() !== date.getFullYear() ||
              d.getMonth() !== date.getMonth() ||
              d.getDate() !== date.getDate()
          );
        } else {
          return [...prev, date];
        }
      });
    }
  };

  const handleMouseDown = (date: Date) => {
    if (readOnly || !isDateAvailable(date)) return;
    setIsSelecting(true);
    handleDateClick(date);
  };

  const handleMouseEnter = (date: Date) => {
    if (readOnly || !isSelecting || !isDateAvailable(date)) return;
    handleDateClick(date);
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();

  const prevMonth = () => {
    setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));
  };

  const renderDays = () => {
    const days = [];
    const today = new Date();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    // Add cells for each day of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, currentDate.getMonth(), i);
      const isAvailable = isDateAvailable(date);
      const isSelected = isDateSelected(date);
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      const dateStr = date.toISOString().split("T")[0];
      const availability = dateAvailability?.get(dateStr);

      days.push(
        <div
          key={i}
          className={`h-10 flex items-center justify-center relative ${
            isAvailable
              ? "cursor-pointer hover:bg-slate-100"
              : "cursor-not-allowed opacity-50"
          } ${
            isSelected
              ? "bg-green-100 hover:bg-green-200"
              : isToday
              ? "bg-blue-50"
              : ""
          }`}
          onMouseDown={() => handleMouseDown(date)}
          onMouseEnter={() => handleMouseEnter(date)}
        >
          <span
            className={`text-sm ${
              isSelected
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
          {monthName} {year}
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
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
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
