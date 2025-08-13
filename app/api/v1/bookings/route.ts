import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventId, tickets, guestEmail } = body;

    if (!eventId || !tickets) {
      return NextResponse.json({ error: 'Event ID and tickets are required' }, { status: 400 });
    }

    // Optional auth check
    const user = null;

    // If no user, guestEmail must be provided
    if (!user && !guestEmail) {
      return NextResponse.json({ error: 'Guest email is required if not logged in' }, { status: 400 });
    }

    // Get event info
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Calculate total
    const total = event.price * tickets;

    const booking = await prisma.booking.create({
      data: {
        eventId,
        tickets,
        total,
        userId: null,
        guestEmail: user ? null : guestEmail,
        status: 'pending',
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
