import Link from "next/link";
import ParticipantForm from "@/app/components/ParticipantForm";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { cache } from "react";

// interface EventDate {
//   id: string;
//   date: Date;
//   eventId: string;
// }

// interface ParticipantDate {
//   id: string;
//   date: Date;
//   participantId: string;
//   eventDateId: string;
//   eventDate: EventDate;
// }

// interface Participant {
//   id: string;
//   name: string;
//   createdAt: Date;
//   updatedAt: Date;
//   eventId: string;
//   participantDates: ParticipantDate[];
// }

// interface Event {
//   id: string;
//   title: string;
//   description: string;
//   createdAt: Date;
//   updatedAt: Date;
//   eventDates: EventDate[];
//   participants: Participant[];
// }

const getEvent = cache(async (id: string) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        eventDates: true,
        participants: {
          include: {
            participantDates: {
              include: {
                eventDate: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      return null;
    }

    return event;
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
});

export default async function EventPage({ params }: { params: { id: string } }) {
  const event = await getEvent(params.id);

  if (!event) {
    notFound();
  }

  const availableDates = event.eventDates.map((ed) => ed.date);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
            {event.title}
          </h1>
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
        <h2 className="text-lg font-medium text-slate-900 mb-4">
          Current Participants
        </h2>
        <div className="space-y-4">
          {event.participants.length === 0 ? (
            <p className="text-sm text-slate-600">
              No participants yet. Be the first to join!
            </p>
          ) : (
            event.participants.map((participant) => (
              <div
                key={participant.id}
                className="border-b border-slate-200 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-sm font-medium text-slate-900">
                    {participant.name}
                  </div>
                  <div className="text-sm text-slate-500">
                    {participant.participantDates.length} date
                    {participant.participantDates.length !== 1 ? "s" : ""}{" "}
                    selected
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex flex-wrap gap-2">
                    {participant.participantDates.map((pd) => (
                      <span
                        key={pd.eventDate.id}
                        className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-sm rounded-md"
                      >
                        {pd.eventDate.date.toLocaleDateString()}
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
