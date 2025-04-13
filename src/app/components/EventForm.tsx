"use client";

import { useState } from "react";
import Calendar from "./Calendar";

interface EventFormProps {
  onSubmit?: (data: { title: string; description: string; dates: Date[] }) => Promise<void>;
}

export default function EventForm({ onSubmit }: EventFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [eventId, setEventId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      if (!title.trim() || !description.trim() || selectedDates.length === 0) {
        throw new Error("Please fill in all fields and select at least one date");
      }

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          dates: selectedDates.map((date) => date.toISOString()),
        }),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If we can't parse the error JSON, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setEventId(data.event.id);
      setSuccess(true);
      setTitle("");
      setDescription("");
      setSelectedDates([]);

      if (onSubmit) {
        await onSubmit({
          title: title.trim(),
          description: description.trim(),
          dates: selectedDates,
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create event");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDates((prev) => {
      const dateStr = date.toISOString();
      const isSelected = prev.some((d) => d.toISOString() === dateStr);
      if (isSelected) {
        return prev.filter((d) => d.toISOString() !== dateStr);
      }
      return [...prev, date].sort((a, b) => a.getTime() - b.getTime());
    });
  };

  // Generate available dates for the next 12 months
  const generateAvailableDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    const endDate = new Date();
    endDate.setMonth(today.getMonth() + 12);

    for (let date = new Date(today); date <= endDate; date.setDate(date.getDate() + 1)) {
      dates.push(new Date(date));
    }

    return dates;
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Název události
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Např. Vodácký výlet na Berounce"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Popis události
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Např. Plánujeme výlet na Berounce s přespáním v kempu..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vyberte dostupné termíny
          </label>
          <Calendar
            availableDates={generateAvailableDates()}
            selectedDates={selectedDates}
            onDateSelect={handleDateSelect}
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <div className="mt-2 text-sm text-green-700">
                  Event created successfully!{" "}
                  <a
                    href={`/event/${eventId}`}
                    className="font-medium text-green-700 underline hover:text-green-600"
                  >
                    View event
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating..." : "Create Event"}
        </button>
      </form>
    </div>
  );
}
