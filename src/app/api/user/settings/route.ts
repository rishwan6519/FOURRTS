import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  await dbConnect();
  const userId = (await cookies()).get('user_id')?.value;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  await dbConnect();
  const userId = (await cookies()).get('user_id')?.value;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { username, currentPassword, newPassword } = await req.json();
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to change password' }, { status: 400 });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json({ error: 'Incorrect current password' }, { status: 401 });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    if (username) {
        // Check if username is already taken by another user
        const existingUser = await User.findOne({ username, _id: { $ne: userId } });
        if (existingUser) {
            return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
        }
        user.username = username;
    }

    await user.save();

    return NextResponse.json({ message: 'Settings updated successfully' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
