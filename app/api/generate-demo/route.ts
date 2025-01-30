import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, introScript, outroScript, password } = body;

    const prisma = new PrismaClient();
    
    // Hash password if provided
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    
    const demo = await prisma.demo.create({
      data: {
        customerName,
        introScript,
        outroScript,
        password: hashedPassword,
      },
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
