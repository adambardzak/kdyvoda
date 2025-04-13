import { notFound } from 'next/navigation';
import getPrismaClient from '@/lib/prisma';
import Link from 'next/link';
import ParticipantForm from '@/app/components/ParticipantForm';

interface EventDate {
  id: string;
  date: Date;
  eventId: string;
}

interface ParticipantDate {
  id: string;
  date: Date;
  participantId: string;
}

interface Participant {
  id: string;
  name: string;
  dates: ParticipantDate[];
}

interface Event {
  id: string;
  title: string;
  description: string;
  dates: EventDate[];
  participants: Participant[];
  managementToken: string;
}

// Prisma response types
interface PrismaEvent {
  id: string;
  title: string;
  description: string;
  eventDates: EventDate[];
  participants: PrismaParticipant[];
  managementToken: string;
}

interface PrismaParticipant {
  id: string;
  name: string;
  participantDates: ParticipantDate[];
}

interface PageProps {
  params: {
    id: string;
  };
}

export default async function Page({ params }: PageProps) {
  const prisma = getPrismaClient();

  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        eventDates: true,
        participants: {
          include: {
            participantDates: true,
          },
        },
      },
    }) as PrismaEvent | null;

    if (!event) {
      notFound();
    }

    // Transform the data to match our interface
    const transformedEvent: Event = {
      ...event,
      dates: event.eventDates,
      participants: event.participants.map(p => ({
        ...p,
        dates: p.participantDates
      }))
    };

    return (
      <div className="max-w-2xl mx-auto p-4 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{transformedEvent.title}</h1>
          <p className="mt-2 text-gray-600">{transformedEvent.description}</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Přidat odpověď</h2>
          <ParticipantForm 
            eventId={transformedEvent.id} 
            availableDates={transformedEvent.dates.map((d: EventDate) => new Date(d.date))} 
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Aktuální odpovědi</h2>
          {transformedEvent.participants.length > 0 ? (
            <div className="space-y-4">
              {transformedEvent.participants.map((participant: Participant) => (
                <div key={participant.id} className="bg-white shadow rounded-lg p-4">
                  <h3 className="font-medium text-gray-900">{participant.name}</h3>
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-700">Vybrané termíny:</h4>
                    <ul className="mt-1 space-y-1">
                      {participant.dates.map((date: ParticipantDate) => (
                        <li key={date.id} className="text-sm text-gray-600">
                          {new Date(date.date).toLocaleDateString("cs")}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Zatím nikdo neodpověděl.</p>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Zpět na hlavní stránku
          </Link>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching event:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
