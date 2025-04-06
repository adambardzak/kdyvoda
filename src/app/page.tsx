"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EventForm from "./components/EventForm";

export default function Home() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: {
    title: string;
    description: string;
    dates: Date[];
  }) => {
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create event");
      }

      const result = await response.json();

      // Store management token in localStorage
      localStorage.setItem(`event_${result.event.id}`, result.managementToken);

      // Redirect to the event page
      router.push(`/event/${result.event.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Create a New Event</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <EventForm onSubmit={handleSubmit} />
      </div>
    </main>
  );
}
