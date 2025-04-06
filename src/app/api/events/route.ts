import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { nanoid } from "nanoid";
import { Prisma } from "@prisma/client";

export async function POST(request: Request) {
  try {
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
      // Create event with dates in a single query
      const eventData = Prisma.validator<Prisma.EventCreateInput>()({
        title,
        description,
        managementToken,
        eventDates: {
          create: dates.map((date: string) => ({
            date: new Date(date),
          })),
        },
      });

      const event = await prisma.$transaction(async (tx) => {
        return tx.event.create({
          data: eventData,
          include: {
            eventDates: true,
          },
        });
      });

      console.log("Event created successfully:", event);

      return NextResponse.json({
        event,
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
