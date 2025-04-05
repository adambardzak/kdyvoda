import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Calendar from "@/app/components/Calendar";
import Link from "next/link";

interface DateContent {
  count: number;
  participants: string[];
}

export default async function EventResultsPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      participants: {
        include: {
          participantDates: {
            include: {
              eventDate: true
            }
          }
        }
      },
      eventDates: true
    },
  });

  if (!event) {
    notFound();
  }

  // Process participant data for the calendar
  const dateAvailability = new Map<string, DateContent>();
  
  event.participants.forEach((participant) => {
    participant.participantDates.forEach((pd) => {
      const dateStr = pd.eventDate.date.toISOString().split('T')[0];
      const current = dateAvailability.get(dateStr) || { count: 0, participants: [] };
      dateAvailability.set(dateStr, {
        count: current.count + 1,
        participants: [...current.participants, participant.name],
      });
    });
  });

  // Convert dates to Date objects for the calendar
  const availableDates = event.eventDates.map(ed => ed.date);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">{event.title} - Results</h1>
        <Link
          href={`/event/${event.id}`}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          Back to Event
        </Link>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-lg p-6">
        <Calendar
          availableDates={availableDates}
          selectedDates={[]}
          onDateSelect={() => {}}
          dateContent={(date: Date) => {
            const dateStr = date.toISOString().split('T')[0];
            const availability = dateAvailability.get(dateStr);
            if (!availability) return null;
            
            return (
              <div className="text-center">
                <div className={`text-sm font-medium ${
                  availability.count > event.participants.length / 2
                    ? "text-green-700"
                    : "text-blue-700"
                }`}>
                  {availability.count}
                </div>
              </div>
            );
          }}
        />
      </div>

      <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-medium text-slate-900 mb-4">Participant Availability</h2>
        <div className="space-y-4">
          {Array.from(dateAvailability.entries()).map(([dateStr, data]) => (
            <div key={dateStr} className="border-b border-slate-200 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-slate-900">
                  {new Date(dateStr).toLocaleDateString()}
                </div>
                <div className="text-sm text-slate-500">
                  {data.count} participant{data.count !== 1 ? "s" : ""}
                </div>
              </div>
              <div className="mt-2 text-sm text-slate-600">
                {data.participants.join(", ")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 