import { NextResponse } from 'next/server';
import { authService } from '@/lib/admin/AuthService';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const hash = await bcrypt.hash(password, 10);
    const user = await authService.signup(email, hash);
    return NextResponse.json({ success: true, user });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
