import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { eventSchema } from './dto';
import { ZodError } from 'zod';


//list endpoint
export async function GET() {
  const events = await prisma.event.findMany();
  return NextResponse.json(events);
}

//create endpoint
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const parsedData = eventSchema.parse(data);

    const event = await prisma.event.create({
      data: {
        ...parsedData,
        date: new Date(parsedData.date),
      },
    });

    return NextResponse.json(event, { status: 201 });
  }  catch (error: unknown) {
  if (error instanceof ZodError) {
    // error.errors is available here with the correct type
    return NextResponse.json({ errors: error.issues }, { status: 400 });
  }
  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}
}