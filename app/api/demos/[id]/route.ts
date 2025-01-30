import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Replace with actual database fetch
    // This is a mock implementation
    const mockDemo = {
      customerName: "Test Company",
      introScript: "Welcome to eMed's GLP-1 program demo. Our program is designed to be fast, easy, and affordable.",
      outroScript: "Thank you for your interest in eMed's GLP-1 program. Would you like to proceed with enrollment?",
      password: "demo123" // In reality, this would be hashed
    };

    return NextResponse.json(mockDemo);

  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch demo data' },
      { status: 500 }
    );
  }
}
