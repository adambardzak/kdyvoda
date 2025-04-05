'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ParticipantForm from '../../components/ParticipantForm';

interface Event {
  id: string;
  title: string;
  description: string;
  eventDates: Array<{
    id: string;
    date: string;
  }>;
  participants: Array<{
    id: string;
    name: string;
    participantDates: Array<{
      date: string;
    }>;
  }>;
}

export default function EventPage() {
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showParticipantForm, setShowParticipantForm] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const managementToken = localStorage.getItem(`event_${params.id}`);
        const response = await fetch(
          `/api/events?id=${params.id}${managementToken ? `&managementToken=${managementToken}` : ''}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch event');
        }

        const data = await response.json();
        setEvent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    if (params.id) {
      fetchEvent();
    }
  }, [params.id]);

  const handleParticipantSubmit = async (data: {
    name: string;
    availableDates: Date[];
  }) => {
    try {
      const response = await fetch('/api/participants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          eventId: params.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit availability');
      }

      // Refresh event data
      const eventResponse = await fetch(`/api/events?id=${params.id}`);
      if (eventResponse.ok) {
        const updatedEvent = await eventResponse.json();
        setEvent(updatedEvent);
        setShowParticipantForm(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-full max-w-lg">
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Event</h3>
                <p className="mt-2 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-full max-w-lg">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded-md w-3/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-200 rounded-md w-5/6"></div>
              <div className="h-4 bg-slate-200 rounded-md w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const availableDates = event.eventDates.map(date => {
    const d = new Date(date.date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  });

  return (
    <div className="space-y-8">
      <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-lg">
        <div className="p-8">
          <h1 className="text-2xl font-semibold text-slate-900">{event.title}</h1>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">{event.description}</p>
          
          <div className="mt-6">
            <h2 className="text-sm font-medium text-slate-700 mb-3">Available Dates:</h2>
            <div className="flex flex-wrap gap-2">
              {availableDates.map((date, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-1.5 rounded-md text-sm font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10"
                >
                  {date.toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-lg">
        <div className="p-8">
          {showParticipantForm ? (
            <>
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Submit Your Availability</h2>
              <ParticipantForm
                eventId={event.id}
                availableDates={availableDates}
              />
            </>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">Thanks for submitting!</h2>
              <p className="mt-2 text-sm text-slate-600">Your availability has been recorded.</p>
              <button
                onClick={() => setShowParticipantForm(true)}
                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Update your availability
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-lg">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Current Participants</h2>
            <a
              href={`/event/${event.id}/results`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
            >
              View Calendar Results
            </a>
          </div>
          <div className="space-y-6">
            {event.participants.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-slate-600">No participants yet. Be the first to join!</p>
              </div>
            ) : (
              <>
                {/* Summary of most popular dates */}
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-slate-900 mb-4">Most Popular Dates</h3>
                  <div className="space-y-2">
                    {event.eventDates.map(eventDate => {
                      const participantsForDate = event.participants.filter(participant =>
                        participant.participantDates.some(pd => 
                          new Date(pd.date).toISOString().split('T')[0] === new Date(eventDate.date).toISOString().split('T')[0]
                        )
                      );
                      
                      return (
                        <div key={eventDate.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-slate-900">
                              {new Date(eventDate.date).toLocaleDateString(undefined, {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            <div className="flex -space-x-1">
                              {participantsForDate.slice(0, 3).map((participant, index) => (
                                <div
                                  key={participant.id}
                                  className="h-6 w-6 rounded-full bg-blue-100 border border-white flex items-center justify-center"
                                  title={participant.name}
                                >
                                  <span className="text-xs font-medium text-blue-700">
                                    {participant.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              ))}
                              {participantsForDate.length > 3 && (
                                <div className="h-6 w-6 rounded-full bg-slate-100 border border-white flex items-center justify-center">
                                  <span className="text-xs font-medium text-slate-600">
                                    +{participantsForDate.length - 3}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="text-sm font-medium text-slate-600">
                            {participantsForDate.length} {participantsForDate.length === 1 ? 'person' : 'people'} available
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* List of participants */}
                <div>
                  <h3 className="text-sm font-medium text-slate-900 mb-4">All Participants</h3>
                  <div className="space-y-4">
                    {event.participants.map(participant => (
                      <div key={participant.id} className="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200">
                        <h3 className="text-sm font-medium text-slate-900">{participant.name}</h3>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {participant.participantDates.map((date, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                            >
                              {new Date(date.date).toLocaleDateString(undefined, {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 