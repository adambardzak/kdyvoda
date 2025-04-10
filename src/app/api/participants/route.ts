import { NextResponse } from 'next/server';
import getPrismaClient from '@/lib/prisma';
import { EventDate } from '@prisma/client';

export async function POST(request: Request) {
  const prisma = getPrismaClient();
  if (!prisma) {
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 }
    );
  }

  try {
    const { name, eventId, dates } = await request.json();

    if (!name || !eventId || !dates || !Array.isArray(dates)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // First, verify that all the dates exist for this event
    const eventDates = await prisma.eventDate.findMany({
      where: {
        eventId: eventId,
        date: {
          in: dates.map((date: string) => new Date(date))
        }
      }
    });

    if (eventDates.length !== dates.length) {
      return NextResponse.json(
        { error: "Some selected dates are not available for this event" },
        { status: 400 }
      );
    }

    // Create the participant with the verified dates in a transaction
    const participant = await prisma.$transaction(async (tx) => {
      const newParticipant = await tx.participant.create({
        data: {
          name,
          event: {
            connect: {
              id: eventId
            }
          }
        }
      });

      await tx.participantDate.createMany({
        data: eventDates.map((eventDate: EventDate) => ({
          date: eventDate.date,
          eventDateId: eventDate.id,
          participantId: newParticipant.id
        }))
      });

      return tx.participant.findUnique({
        where: { id: newParticipant.id },
        include: {
          participantDates: {
            include: {
              eventDate: true
            }
          }
        }
      });
    });

    if (!participant) {
      throw new Error("Failed to create participant");
    }

    return NextResponse.json(participant);
  } catch (error) {
    console.error("Error creating participant:", error);
    return NextResponse.json(
      { error: "Failed to create participant" },
      { status: 500 }
    );
  } finally {
    if (process.env.NODE_ENV === 'production') {
      await prisma.$disconnect();
    }
  }
}

export async function PUT(request: Request) {
  const prisma = getPrismaClient();
  if (!prisma) {
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 }
    );
  }

  try {
    const { id, availableDates } = await request.json();

    if (!id || !availableDates || !Array.isArray(availableDates)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update participant dates in a transaction
    const participant = await prisma.$transaction(async (tx) => {
      // Delete existing participant dates
      await tx.participantDate.deleteMany({
        where: {
          participantId: id,
        },
      });

      // Create new participant dates
      return tx.participant.update({
        where: {
          id,
        },
        data: {
          participantDates: {
            create: availableDates.map((date: string) => ({
              date: new Date(date),
              eventDate: {
                connect: {
                  id: date,
                },
              },
            })),
          },
        },
        include: {
          participantDates: true,
        },
      });
    });

    return NextResponse.json(participant);
  } catch (error) {
    console.error("Error updating participant:", error);
    return NextResponse.json(
      { error: "Failed to update participant" },
      { status: 500 }
    );
  } finally {
    if (process.env.NODE_ENV === 'production') {
      await prisma.$disconnect();
    }
  }
} 