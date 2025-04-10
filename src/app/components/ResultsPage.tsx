import Link from 'next/link';
import Calendar from './Calendar';

interface EventDate {
  id: string;
  date: Date;
}

interface ParticipantDate {
  id: string;
  eventDate: EventDate;
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

export default function ResultsPage({ event }: { event: Event }) {
  // Process participant availability
  const dateAvailability = new Map<string, number>();
  const participantAvailability = new Map<string, Set<string>>();

  event.participants.forEach((participant) => {
    const availableDates = new Set<string>();
    participant.participantDates.forEach((pd) => {
      const dateStr = pd.eventDate.date.toISOString().split("T")[0];
      availableDates.add(dateStr);
      dateAvailability.set(
        dateStr,
        (dateAvailability.get(dateStr) || 0) + 1
      );
    });
    participantAvailability.set(participant.name, availableDates);
  });

  const availableDates = event.eventDates.map((ed) => ed.date);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
            {event.title} - Results
          </h1>
          <Link
            href={`/event/${event.id}`}
            className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            Back to Event
          </Link>
        </div>
        <p className="text-slate-600">{event.description}</p>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-lg p-4 sm:p-6">
        <h2 className="text-lg font-medium text-slate-900 mb-4">Availability Calendar</h2>
        <Calendar
          availableDates={availableDates}
          dateAvailability={dateAvailability}
          readOnly={true}
        />
      </div>

      <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-lg p-4 sm:p-6">
        <h2 className="text-lg font-medium text-slate-900 mb-4">Participant Availability</h2>
        <div className="space-y-4">
          {Array.from(participantAvailability.entries()).map(([name, dates]) => (
            <div key={name} className="border-b border-slate-200 pb-4 last:border-0 last:pb-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-sm font-medium text-slate-900">{name}</div>
                <div className="text-sm text-slate-500">
                  {dates.size} date{dates.size !== 1 ? "s" : ""} available
                </div>
              </div>
              <div className="mt-2">
                <div className="flex flex-wrap gap-2">
                  {Array.from(dates).map((date) => (
                    <span
                      key={date}
                      className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-sm rounded-md"
                    >
                      {new Date(date).toLocaleDateString()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 