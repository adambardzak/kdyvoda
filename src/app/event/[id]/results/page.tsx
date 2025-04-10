import { notFound } from 'next/navigation';
import getPrismaClient from '@/lib/prisma';
import ResultsPage from '@/app/components/ResultsPage';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const prisma = getPrismaClient();
  
  if (!prisma) {
    throw new Error("Database connection failed");
  }

  try {
    const event = await prisma.event.findUnique({
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

    if (!event) {
      notFound();
    }

    return <ResultsPage event={event} />;
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  } finally {
    if (process.env.NODE_ENV === 'production') {
      await prisma.$disconnect();
    }
  }
} 