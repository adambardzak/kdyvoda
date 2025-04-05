'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Calendar from '../../../components/Calendar';

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

interface DateAvailability {
  date: Date;
  participants: Array<{
    id: string;
    name: string;
  }>;
}

export default function EventResultsPage() {
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dateAvailability, setDateAvailability] = useState<DateAvailability[]>([]);

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

        // Process date availability
        const availability: { [key: string]: DateAvailability } = {};
        
        data.eventDates.forEach((eventDate: { date: string }) => {
          const date = new Date(eventDate.date);
          date.setUTCHours(0, 0, 0, 0);
          availability[date.toISOString()] = {
            date,
            participants: [],
          };
        });

        data.participants.forEach((participant: {
          id: string;
          name: string;
          participantDates: Array<{ date: string }>;
        }) => {
          participant.participantDates.forEach((pd) => {
            const date = new Date(pd.date);
            date.setUTCHours(0, 0, 0, 0);
            const key = date.toISOString();
            if (availability[key]) {
              availability[key].participants.push({
                id: participant.id,
                name: participant.name,
              });
            }
          });
        });

        setDateAvailability(Object.values(availability));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    if (params.id) {
      fetchEvent();
    }
  }, [params.id]);

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

  return (
    <div className="space-y-8">
      <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-lg">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-slate-900">{event.title} - Results</h1>
            <a
              href={`/event/${event.id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
            >
              Back to Event
            </a>
          </div>
          
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="mb-4 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-100 rounded-sm border border-green-200"></div>
                <span className="text-sm text-slate-600">1-3 people</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-100 rounded-sm border border-blue-200"></div>
                <span className="text-sm text-slate-600">4-6 people</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-purple-100 rounded-sm border border-purple-200"></div>
                <span className="text-sm text-slate-600">7+ people</span>
              </div>
            </div>
            
            <Calendar
              availableDates={dateAvailability.map(da => da.date)}
              selectedDates={[]}
              selectable={false}
              dateContent={(date) => {
                const availability = dateAvailability.find(
                  da => da.date.toISOString().split('T')[0] === date.toISOString().split('T')[0]
                );
                if (!availability) return null;
                
                const count = availability.participants.length;
                return count > 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`
                      text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center
                      ${count <= 3 ? 'bg-green-100 text-green-800' : 
                        count <= 6 ? 'bg-blue-100 text-blue-800' : 
                        'bg-purple-100 text-purple-800'}
                    `}>
                      {count}
                    </div>
                  </div>
                ) : null;
              }}
            />
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-medium text-slate-900 mb-4">Date Details</h2>
            <div className="space-y-4">
              {dateAvailability
                .filter(da => da.participants.length > 0)
                .sort((a, b) => b.participants.length - a.participants.length)
                .map(da => (
                  <div key={da.date.toISOString()} className="rounded-lg bg-slate-50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-slate-900">
                        {da.date.toLocaleDateString(undefined, {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="text-sm font-medium text-slate-600">
                        {da.participants.length} {da.participants.length === 1 ? 'person' : 'people'} available
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {da.participants.map(participant => (
                        <span
                          key={participant.id}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-white text-slate-700 ring-1 ring-inset ring-slate-200"
                        >
                          {participant.name}
                        </span>
                      ))}
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 