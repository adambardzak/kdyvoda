import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { EventDate } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const { name, eventId, dates } = await request.json();

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
        { error: 'Some selected dates are not available for this event' },
        { status: 400 }
      );
    }

    // Create the participant with the verified dates
    const participant = await prisma.participant.create({
      data: {
        name,
        event: {
          connect: {
            id: eventId
          }
        },
        participantDates: {
          create: eventDates.map((eventDate: EventDate) => ({
            date: eventDate.date,
            eventDateId: eventDate.id
          }))
        }
      },
      include: {
        participantDates: {
          include: {
            eventDate: true
          }
        }
      }
    });

    return NextResponse.json(participant);
  } catch (error) {
    console.error('Error creating participant:', error);
    return NextResponse.json(
      { error: 'Failed to create participant' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, availableDates } = await request.json();

    // Delete existing participant dates
    await prisma.participantDate.deleteMany({
      where: {
        participantId: id,
      },
    });

    // Create new participant dates
    const participant = await prisma.participant.update({
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

    return NextResponse.json(participant);
  } catch (error) {
    console.error('Error updating participant:', error);
    return NextResponse.json(
      { error: 'Failed to update participant' },
      { status: 500 }
    );
  }
} 