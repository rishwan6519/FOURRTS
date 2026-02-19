import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  await dbConnect();
  console.log("Login API called");
  try {
    const { username, password } = await req.json();
    console.log("Login API called", username, password);
    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    console.log("Login API called", user);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const response = NextResponse.json({ 
      id: user._id, 
      username: user.username, 
      role: user.role 
    });

    // Set cookies for session management
    const cookieOptions = {
        httpOnly: true,
      secure: false,           // 👈 KEY FIX
      sameSite: 'lax' as const,
        maxAge: 60 * 60 * 24 * 7 // 1 week
    };

    response.cookies.set('user_id', user._id.toString(), cookieOptions);
    response.cookies.set('user_role', user.role || 'user', cookieOptions);

    return response;
  } catch (err) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
