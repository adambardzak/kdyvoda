import { NextResponse } from "next/server";
import getPrismaClient from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
  const prisma = getPrismaClient();
  try {
    await prisma.$connect();
    
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { title, description, dates } = body;

    if (!title || !description || !dates || !Array.isArray(dates)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the event with a management token
    const event = await prisma.event.create({
      data: {
        title,
        description,
        managementToken: nanoid(20),
        eventDates: {
          create: dates.map((date: string) => ({
            date: new Date(date)
          }))
        }
      },
      include: {
        eventDates: true
      }
    });

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: Request) {
  const prisma = getPrismaClient();
  try {
    await prisma.$connect();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const managementToken = searchParams.get("managementToken");

    if (!id) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id },
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
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Only include managementToken if it matches
    if (managementToken && event.managementToken === managementToken) {
      return NextResponse.json(event);
    }

    // Remove managementToken from response if not authorized
    const eventWithoutToken = {
      id: event.id,
      title: event.title,
      description: event.description,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      eventDates: event.eventDates,
      participants: event.participants
    };
    return NextResponse.json(eventWithoutToken);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
