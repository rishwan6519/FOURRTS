import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  await dbConnect();
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    return NextResponse.json(users);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const { username, password } = await req.json();
    
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashedPassword,
      role: 'user'
    });

    const { password: _, ...userWithoutPassword } = user.toObject();
    return NextResponse.json(userWithoutPassword);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
