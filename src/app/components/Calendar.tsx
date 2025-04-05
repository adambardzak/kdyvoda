"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { EventSourceInput } from "@fullcalendar/core";

interface CalendarProps {
  availableDates?: Date[];
  selectedDates?: Date[];
  onDateSelect?: (date: Date) => void;
  selectable?: boolean;
  dateContent?: (date: Date) => React.ReactNode;
}

export default function Calendar({
  availableDates = [],
  selectedDates = [],
  onDateSelect,
  selectable = false,
  dateContent,
}: CalendarProps) {
  const [events, setEvents] = useState<EventSourceInput>([]);

  useEffect(() => {
    // If there are available dates, show them in blue
    // If not, we're in event creation mode and don't need to show available dates
    const normalizedAvailableDates =
      availableDates.length > 0
        ? availableDates.map((date) => {
            const d = new Date(date);
            d.setUTCHours(0, 0, 0, 0);
            return d;
          })
        : [];

    const normalizedSelectedDates = selectedDates.map((date) => {
      const d = new Date(date);
      d.setUTCHours(0, 0, 0, 0);
      return d;
    });

    const newEvents = [
      ...normalizedAvailableDates.map((date) => ({
        start: date,
        allDay: true,
        display: "background",
        backgroundColor: "#dbeafe", // blue-100 for available dates
      })),
      ...normalizedSelectedDates.map((date) => ({
        start: date,
        allDay: true,
        display: "background",
        backgroundColor: "#dcfce7", // green-100 for selected dates
        classNames: ["selected-date"],
      })),
    ];
    setEvents(newEvents);
  }, [availableDates, selectedDates]);

  const handleDateClick = (info: DateClickArg) => {
    if (onDateSelect && selectable) {
      const clickedDate = new Date(info.date);
      clickedDate.setUTCHours(0, 0, 0, 0);

      // If there are available dates, check if the clicked date is available
      // If there are no available dates, we're in event creation mode and all dates are selectable
      if (
        availableDates.length === 0 ||
        availableDates.some((date) => {
          const availableDate = new Date(date);
          availableDate.setUTCHours(0, 0, 0, 0);
          return availableDate.getTime() === clickedDate.getTime();
        })
      ) {
        onDateSelect(clickedDate);
      }
    }
  };

  return (
    <div className="calendar-wrapper">
      <style jsx global>{`
        .calendar-wrapper .fc {
          --fc-border-color: #e2e8f0;
          --fc-button-bg-color: #1e293b;
          --fc-button-border-color: #1e293b;
          --fc-button-hover-bg-color: #334155;
          --fc-button-hover-border-color: #334155;
          --fc-button-active-bg-color: #334155;
          --fc-button-active-border-color: #334155;
          --fc-today-bg-color: #f8fafc;
          --fc-neutral-bg-color: #ffffff;
          --fc-page-bg-color: #ffffff;
        }

        .calendar-wrapper .fc-theme-standard td,
        .calendar-wrapper .fc-theme-standard th {
          border-color: var(--fc-border-color);
        }

        .calendar-wrapper .fc-day-today {
          background: var(--fc-today-bg-color) !important;
        }

        .calendar-wrapper .fc-button {
          font-weight: 500;
          text-transform: capitalize;
          padding: 0.5rem 0.75rem;
          border-radius: 0.375rem;
          transition: all 0.2s ease;
        }

        .calendar-wrapper .fc-button:hover {
          transform: translateY(-1px);
        }

        .calendar-wrapper .fc-button:active {
          transform: translateY(0);
        }

        .calendar-wrapper .fc-toolbar-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
        }

        .calendar-wrapper .fc-col-header-cell {
          padding: 0.75rem 0;
          font-weight: 600;
          color: #1e293b;
          background-color: #f8fafc;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
        }

        .calendar-wrapper .fc-daygrid-day {
          transition: background-color 0.2s ease;
          cursor: pointer;
        }

        .calendar-wrapper .fc-daygrid-day:hover {
          background-color: #f1f5f9;
        }

        .calendar-wrapper .fc-daygrid-day.selected-date {
          position: relative;
        }

        .calendar-wrapper .fc-daygrid-day.selected-date::after {
          content: "✓";
          position: absolute;
          top: 4px;
          right: 4px;
          color: #15803d;
          font-size: 0.875rem;
          font-weight: bold;
        }

        .calendar-wrapper .fc-daygrid-day-number {
          color: #1e293b;
          font-weight: 400;
          padding: 0.5rem;
          font-size: 0.875rem;
        }

        .calendar-wrapper .fc-day-other .fc-daygrid-day-number {
          color: #94a3b8;
        }

        .calendar-wrapper .fc-day-today .fc-daygrid-day-number {
          font-weight: 600;
          color: #2563eb;
        }

        .calendar-wrapper .fc-toolbar.fc-header-toolbar {
          margin-bottom: 1.5rem;
        }

        .calendar-wrapper .fc-toolbar.fc-header-toolbar .fc-button {
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        }

        .calendar-wrapper .fc-view-harness {
          background-color: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1),
            0 1px 2px -1px rgb(0 0 0 / 0.1);
        }

        .calendar-wrapper .fc-day-disabled {
          background-color: #f1f5f9;
          cursor: not-allowed;
        }

        .calendar-wrapper .fc-bg-event {
          opacity: 0.3 !important;
        }

        .calendar-wrapper .fc-bg-event.selected-date {
          opacity: 0.5 !important;
        }

        .calendar-wrapper .fc-day:not(.fc-day-other) {
          cursor: pointer;
        }

        .calendar-wrapper .fc-day.fc-day-other {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .calendar-wrapper .fc-daygrid-day-top {
          justify-content: center;
          padding-top: 0.5rem;
        }

        .calendar-wrapper .fc-daygrid-day-number {
          float: none;
          padding: 0;
        }
      `}</style>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth",
        }}
        events={events}
        dateClick={handleDateClick}
        dayMaxEvents={true}
        weekends={true}
        height="auto"
        fixedWeekCount={false}
        dayCellContent={
          dateContent ? (arg) => dateContent(arg.date) : undefined
        }
      />
    </div>
  );
}
