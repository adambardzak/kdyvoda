"use client";

import Link from "next/link";
import ParticipantForm from "@/app/components/ParticipantForm";
import { useState, useEffect } from "react";

interface EventDate {
  id: string;
  date: string;
}

interface ParticipantDate {
  eventDate: {
    date: string;
  };
}

interface Participant {
  id: string;
  name: string;
  participantDates: ParticipantDate[];
}

interface Event {
  id: string;
  title: string;
  description: string;
  eventDates: EventDate[];
  participants: Participant[];
}

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function EventPage({ params }: Props) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const response = await fetch(`/api/events/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to load event');
        }
        const data = await response.json();
        setEvent(data);
        // Convert dates after setting the event
        setAvailableDates(data.eventDates.map((ed: EventDate) => new Date(ed.date)));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-slate-600">Loading event...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center text-red-700">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p>{error || 'Failed to load event'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">{event.title}</h1>
          <Link
            href={`/event/${event.id}/results`}
            className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            View Results
          </Link>
        </div>
        <p className="text-slate-600">{event.description}</p>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-lg p-4 sm:p-6">
        <h2 className="text-lg font-medium text-slate-900 mb-4">Join Event</h2>
        <ParticipantForm eventId={event.id} availableDates={availableDates} />
      </div>

      <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-lg p-4 sm:p-6">
        <h2 className="text-lg font-medium text-slate-900 mb-4">Current Participants</h2>
        <div className="space-y-4">
          {event.participants.length === 0 ? (
            <p className="text-sm text-slate-600">No participants yet. Be the first to join!</p>
          ) : (
            event.participants.map((participant: Participant) => (
              <div key={participant.id} className="border-b border-slate-200 pb-4 last:border-0 last:pb-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-sm font-medium text-slate-900">
                    {participant.name}
                  </div>
                  <div className="text-sm text-slate-500">
                    {participant.participantDates.length} date{participant.participantDates.length !== 1 ? "s" : ""} selected
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex flex-wrap gap-2">
                    {participant.participantDates.map((pd: ParticipantDate) => (
                      <span key={pd.eventDate.date} className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-sm rounded-md">
                        {new Date(pd.eventDate.date).toLocaleDateString()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
