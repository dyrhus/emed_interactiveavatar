import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, introScript, outroScript, password } = body;

    // Here you would typically:
    // 1. Validate the input
    // 2. Save to database
    // 3. Generate unique URL
    // 4. Handle password hashing if provided

    const demoId = Date.now().toString();
    const demoUrl = `/demo/${demoId}`;

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
