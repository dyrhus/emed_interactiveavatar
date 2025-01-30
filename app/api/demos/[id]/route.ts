import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const prisma = new PrismaClient();
    const demo = await prisma.demo.findUnique({
      where: { id: params.id }
    });

    if (!demo) {
      return NextResponse.json(
        { success: false, message: 'Demo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(demo);

  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch demo data' },
      { status: 500 }
    );
  }
}
