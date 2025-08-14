import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { eventUpdateSchema } from '../dto';
import { ZodError } from 'zod';

interface Params {
  params: { id: string };
}

//Retreive endpoint
export async function GET(req: Request, { params }: Params) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const event = await prisma.event.findUnique({ where: { id }, include: {
    bookings: {
      select: {
        id: true,
        tickets: true,
        total: true,
        status: true,
        guestEmail: true,
        user: {
          select: { id: true, email: true }
        }
      }
    }
  }
 });
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  return NextResponse.json(event);
}


//Delete endpoint
export async function DELETE(req: Request, { params }: Params) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ message: 'Event deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 400 });
  }
}


//Update Endpoint
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await req.json();

    // ✅ Validate only provided fields
    const parsedData = eventUpdateSchema.parse(body);

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...parsedData,
        date: parsedData.date ? new Date(parsedData.date) : undefined,
      },
    });

    return NextResponse.json(event);

  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json({ errors: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}