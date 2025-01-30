import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, introScript, outroScript, password } = body;
    
    const demo = store.createDemo({
      customerName,
      introScript,
      outroScript,
      password
    });

    const demoUrl = `/demo/${demo.id}`;

    return NextResponse.json({ 
      success: true, 
      demoUrl,
      message: 'Demo generated successfully' 
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to generate demo' },
      { status: 500 }
    );
  }
}
