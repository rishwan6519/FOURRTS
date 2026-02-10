import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  await dbConnect();
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (adminExists) {
      return NextResponse.json({ message: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    });

    return NextResponse.json({ message: 'Admin created successfully', credentials: 'admin / admin123' });
  } catch (err) {
    return NextResponse.json({ error: 'Seeding failed' }, { status: 500 });
  }
}
