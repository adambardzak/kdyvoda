import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
  try {
    await prisma.$connect();
    
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error("Error parsing request body:", e);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    console.log("Received request body:", body);
    const { title, description, dates } = body;

    if (!title || !description || !dates || !Array.isArray(dates)) {
      console.error("Missing required fields:", { title, description, dates });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Creating event with dates:", dates);

    // Create management token
    const managementToken = nanoid();

    try {
      // Create the event
      const event = await prisma.event.create({
        data: {
          title,
          description,
          managementToken,
        },
      });

      // Create all dates at once
      await prisma.eventDate.createMany({
        data: dates.map(date => ({
          id: nanoid(),
          date: new Date(date),
          eventId: event.id,
        })),
      });

      // Fetch the complete event
      const completeEvent = await prisma.event.findUnique({
        where: { id: event.id },
        include: {
          eventDates: true,
        },
      });

      if (!completeEvent) {
        throw new Error("Failed to fetch created event");
      }

      console.log("Event created successfully:", completeEvent);

      return NextResponse.json({
        event: completeEvent,
        managementToken,
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Database error: " + (dbError instanceof Error ? dbError.message : String(dbError)) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: Request) {
  try {
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
  }
}
