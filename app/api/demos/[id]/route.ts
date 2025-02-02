import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('[API] Fetching demo with ID:', params.id);
  try {
    const demo = store.getDemo(params.id);

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
