import { notFound } from 'next/navigation';
import getPrismaClient from '@/lib/prisma';
import Link from 'next/link';
import ParticipantForm from '@/app/components/ParticipantForm';

interface EventDate {
  id: string;
  date: Date;
}

interface ParticipantDate {
  id: string;
  eventDateId: string;
  participantId: string;
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
  managementToken: string;
  createdAt: Date;
  updatedAt: Date;
  eventDates: EventDate[];
  participants: Participant[];
}

export default async function Page({
  params,
}: {
  params: { id: string };
}) {
  const prisma = getPrismaClient();
  let event: Event | null = null;

  try {
    await prisma.$connect();
    event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        eventDates: true,
        participants: {
          include: {
            participantDates: {
              include: {
                eventDate: true
              }
            }
          }
        }
      },
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }

  if (!event) {
    notFound();
  }

  const availableDates = event.eventDates.map(ed => ed.date);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
          <p className="text-gray-600 mb-6">{event.description}</p>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Dostupné termíny</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {event.eventDates.map((date) => (
                <div key={date.id} className="bg-blue-50 rounded-lg p-4">
                  <p className="text-blue-900 font-medium">
                    {new Date(date.date).toLocaleDateString('cs-CZ', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <ParticipantForm eventId={event.id} availableDates={availableDates} />
        </div>

        {event.participants.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Aktuální účastníci</h2>
            <div className="space-y-4">
              {event.participants.map((participant) => (
                <div key={participant.id} className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-medium text-gray-900">{participant.name}</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Vybrané termíny:</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {participant.participantDates.map((pd) => (
                        <span
                          key={pd.id}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {new Date(pd.eventDate.date).toLocaleDateString('cs-CZ', {
                            day: 'numeric',
                            month: 'numeric'
                          })}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Zpět na vytvoření nové události
          </Link>
        </div>
      </div>
    </div>
  );
}
