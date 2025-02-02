import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { password } = await request.json();
    console.log('[API] Verifying password for demo ID:', params.id);
    
    if (store.verifyPassword(params.id, password)) {
      return NextResponse.json({ 
        success: true,
        message: 'Password verified successfully'
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid password' },
      { status: 401 }
    );

  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to verify password' },
      { status: 500 }
    );
  }
}
