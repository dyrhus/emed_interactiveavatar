import { NextResponse } from 'next/server';
import { logger } from '@/app/lib/logger';
import { store } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    logger.log('[API] Generating demo with body:', body);
    const { customerName, introScript, outroScript, includeQA, password } = body;
    
    const demo = store.createDemo({
      customerName,
      introScript,
      outroScript,
      includeQA,
      password
    });

    return NextResponse.json({ 
      success: true,
      demoId: demo.id,
      message: 'Demo generated successfully' 
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to generate demo' },
      { status: 500 }
    );
  }
}
