"use client";

import { useState } from "react";
import Calendar from "./Calendar";

interface ParticipantFormProps {
  eventId: string;
  availableDates: Date[];
  onSubmit?: (data: { name: string; availableDates: Date[] }) => Promise<void>;
}

export default function ParticipantForm({
  eventId,
  availableDates,
  onSubmit,
}: ParticipantFormProps) {
  const [name, setName] = useState("");
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      if (onSubmit) {
        await onSubmit({ name, availableDates: selectedDates });
      } else {
        const response = await fetch("/api/participants", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            eventId,
            dates: selectedDates.map((date) => {
              // Create a new date at midnight UTC
              const d = new Date(date);
              d.setUTCHours(0, 0, 0, 0);
              return d.toISOString();
            }),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to submit response");
        }

        setSuccess(true);
        setName("");
        setSelectedDates([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    // Normalize the clicked date
    const clickedDate = new Date(date);
    clickedDate.setUTCHours(0, 0, 0, 0);

    // Check if the date is available
    const isAvailable = availableDates.some((d) => {
      const availableDate = new Date(d);
      availableDate.setUTCHours(0, 0, 0, 0);
      return availableDate.getTime() === clickedDate.getTime();
    });

    if (!isAvailable) {
      setError("Selected date is not available");
      return;
    }

    setError(""); // Clear any previous errors
    setSelectedDates((prev) => {
      // Check if the date is already selected
      const exists = prev.some((d) => {
        const selectedDate = new Date(d);
        selectedDate.setUTCHours(0, 0, 0, 0);
        return selectedDate.getTime() === clickedDate.getTime();
      });

      if (exists) {
        // Remove the date if it's already selected
        return prev.filter((d) => {
          const selectedDate = new Date(d);
          selectedDate.setUTCHours(0, 0, 0, 0);
          return selectedDate.getTime() !== clickedDate.getTime();
        });
      }

      // Add the new date
      return [...prev, clickedDate];
    });
  };

  return (
    <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-lg p-4 sm:p-6">
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-green-700 font-medium">
              Response submitted successfully!
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-500 mr-2 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-slate-900 mb-2"
          >
            Your Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full rounded-md border-0 px-3 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 text-base sm:text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Select Available Dates
          </label>
          <div className="rounded-lg border border-slate-200 bg-white p-3 sm:p-6">
            <div className="mb-4 flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-100 rounded-sm border border-blue-200"></div>
                <span className="text-sm text-slate-600">
                  Available Event Dates
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-100 rounded-sm border border-green-200"></div>
                <span className="text-sm text-slate-600">
                  Your Selected Dates
                </span>
              </div>
            </div>
            <Calendar
              availableDates={availableDates}
              selectedDates={selectedDates}
              onDateSelect={handleDateSelect}
            />
          </div>
          {selectedDates.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-slate-700 mb-3">
                Your Selected Dates:
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedDates.map((date, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-1.5 rounded-md text-sm font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                  >
                    {date.toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !name || selectedDates.length === 0}
          className="w-full flex justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
        >
          {isLoading ? "Submitting..." : "Submit Response"}
        </button>
      </form>
    </div>
  );
}
