import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventId, tickets, guestEmail } = body;

    if (!eventId || !tickets) {
      return NextResponse.json({ error: 'Event ID and tickets are required' }, { status: 400 });
    }

    // Optional auth check (currently disabled)
    const user = null;

    if (!user && !guestEmail) {
      return NextResponse.json({ error: 'Email is required if not logged in' }, { status: 400 });
    }

    // Fetch event
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check availability
    const availableTickets = event.maxTickets - event.ticketsCounts;
    if (tickets > availableTickets) {
      return NextResponse.json(
        { error: `Only ${availableTickets} tickets available` },
        { status: 400 }
      );
    }

    // Use salesPrice if available, else fallback to price
    const pricePerTicket = event.salesPrice ?? event.price;
    const total = pricePerTicket * tickets;

    // Create booking & update event ticket count in a transaction
    const [booking] = await prisma.$transaction([
      prisma.booking.create({
        data: {
          eventId,
          tickets,
          total,
          userId: null,
          guestEmail: user ? null : guestEmail,
          status: 'pending',
        },
      }),
      prisma.event.update({
        where: { id: eventId },
        data: {
          ticketsCounts: { increment: tickets },
        },
      }),
    ]);

    return NextResponse.json(booking, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
