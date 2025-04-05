import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { title, description, dates } = await request.json();

    // Create management token
    const managementToken = nanoid();

    // Create the event
    const event = await prisma.event.create({
      data: {
        title,
        description,
        managementToken,
        eventDates: {
          create: dates.map((date: string) => ({
            date: new Date(date),
          })),
        },
      },
      include: {
        eventDates: true,
      },
    });

    return NextResponse.json({
      event,
      managementToken,
    });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const managementToken = searchParams.get('managementToken');

    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        eventDates: true,
        participants: {
          include: {
            participantDates: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Only include managementToken if it matches
    if (managementToken && event.managementToken === managementToken) {
      return NextResponse.json(event);
    }

    // Remove managementToken from response if not authorized
    const { managementToken: _, ...eventWithoutToken } = event;
    return NextResponse.json(eventWithoutToken);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
} 