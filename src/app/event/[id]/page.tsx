"use client";

import { notFound } from "next/navigation";
import ParticipantForm from "@/app/components/ParticipantForm";
import Link from "next/link";
import prisma from "@/lib/prisma";

// interface Event {
//   id: string;
//   title: string;
//   description: string;
//   eventDates: Array<{
//     id: string;
//     date: string;
//   }>;
//   participants: Array<{
//     id: string;
//     name: string;
//     participantDates: Array<{
//       date: string;
//     }>;
//   }>;
// }

export default async function EventPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
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
    notFound();
  }

  const availableDates = event.eventDates.map((ed) => ed.date);

  return (
    <div className="space-y-8">
      <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-slate-900">
            {event.title}
          </h1>
          <Link
            href={`/event/${event.id}/results`}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            View Results
          </Link>
        </div>
        <p className="text-slate-600">{event.description}</p>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-medium text-slate-900 mb-4">Join Event</h2>
        <ParticipantForm eventId={event.id} availableDates={availableDates} />
      </div>

      <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-medium text-slate-900 mb-4">
          Current Participants
        </h2>
        <div className="space-y-4">
          {event.participants.map((participant) => (
            <div
              key={participant.id}
              className="border-b border-slate-200 pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-slate-900">
                  {participant.name}
                </div>
                <div className="text-sm text-slate-500">
                  {participant.participantDates.length} date
                  {participant.participantDates.length !== 1 ? "s" : ""}{" "}
                  selected
                </div>
              </div>
              <div className="mt-2 text-sm text-slate-600">
                {participant.participantDates.map((pd) => (
                  <span
                    key={pd.eventDate.date.toISOString()}
                    className="inline-block mr-2 mb-2 px-2 py-1 bg-slate-100 rounded-md"
                  >
                    {pd.eventDate.date.toLocaleDateString()}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
